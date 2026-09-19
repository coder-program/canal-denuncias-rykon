import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { S3Service } from '@shared/s3/s3.service';
import { LoggerService } from '@shared/logger/logger.service';
import { UserRole } from '@prisma/client';
import { createHash } from 'crypto';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly loggerService: LoggerService,
  ) {}

  /**
   * Upload de anexo para uma denúncia
   */
  async uploadAttachment(
    file: Express.Multer.File,
    complaintId: string,
    userId: string,
    userRole: UserRole,
  ) {
    // Validar userId
    if (!userId) {
      throw new BadRequestException('Usuário não identificado');
    }

    // Verificar se denúncia existe
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      select: {
        id: true,
        createdBy: true,
        isAnonymous: true,
      },
    });

    if (!complaint) {
      throw new NotFoundException('Denúncia não encontrada');
    }

    // RBAC: REPORTER só pode anexar em suas próprias denúncias
    if (userRole === UserRole.REPORTER && complaint.createdBy !== userId) {
      throw new ForbiddenException('Você não tem permissão para anexar arquivos nesta denúncia');
    }

    // Validar arquivo
    const validation = this.s3Service.validateFile(file);
    if (!validation.valid) {
      throw new BadRequestException(validation.reason);
    }

    // Upload para S3
    const uploadResult = await this.s3Service.uploadFile(file, `complaints/${complaintId}`);

    // Salvar metadata no banco
    const attachment = await this.prisma.attachment.create({
      data: {
        complaintId,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        s3Key: uploadResult.key,
        s3Bucket: uploadResult.bucket,
        sha256Hash: uploadResult.sha256,
        uploadedBy: userId,
      },
    });

    // Log de auditoria
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        resource: 'attachment',
        resourceId: attachment.id,
        details: {
          complaintId,
          filename: file.originalname,
          size: file.size,
          s3Key: uploadResult.key,
        },
      },
    });

    this.loggerService.log(
      `Attachment uploaded: ${file.originalname} for complaint ${complaintId}`,
      'AttachmentsService',
      { attachmentId: attachment.id, size: file.size },
    );

    return attachment;
  }

  /**
   * Listar anexos de uma denúncia
   */
  async findAllByComplaint(complaintId: string, userId: string, userRole: UserRole) {
    this.logger.log(`Finding attachments for complaint ${complaintId}`, 'AttachmentsService');

    // Verificar se denúncia existe e se usuário tem acesso
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      select: {
        id: true,
        createdBy: true,
      },
    });

    if (!complaint) {
      this.logger.warn(`Complaint ${complaintId} not found`, 'AttachmentsService');
      throw new NotFoundException('Denúncia não encontrada');
    }

    // RBAC: REPORTER só vê anexos de suas próprias denúncias
    if (userRole === UserRole.REPORTER && complaint.createdBy !== userId) {
      this.logger.warn(
        `User ${userId} (REPORTER) tried to access complaint ${complaintId}`,
        'AttachmentsService',
      );
      throw new ForbiddenException('Você não tem permissão para ver anexos desta denúncia');
    }

    const attachments = await this.prisma.attachment.findMany({
      where: { complaintId },
      include: {
        uploaderUser: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    this.logger.log(
      `Found ${attachments.length} attachments for complaint ${complaintId}`,
      'AttachmentsService',
    );
    return attachments;
  }

  /**
   * Obter detalhes de um anexo
   */
  async findOne(id: string, userId: string, userRole: UserRole) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
      include: {
        complaint: {
          select: {
            id: true,
            createdBy: true,
            protocol: true,
          },
        },
        uploaderUser: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    if (!attachment) {
      throw new NotFoundException('Anexo não encontrado');
    }

    // RBAC: REPORTER só vê anexos de suas próprias denúncias
    if (userRole === UserRole.REPORTER && attachment.complaint.createdBy !== userId) {
      throw new ForbiddenException('Você não tem permissão para visualizar este anexo');
    }

    return attachment;
  }

  /**
   * Gerar URL pré-assinada para download
   */
  async getDownloadUrl(id: string, userId: string, userRole: UserRole, expiresIn: number = 3600) {
    const attachment = await this.findOne(id, userId, userRole);

    // Gerar URL pré-assinada
    const presignedUrl = await this.s3Service.getPresignedDownloadUrl(attachment.s3Key, expiresIn);

    // Log de auditoria
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'READ',
        resource: 'attachment',
        resourceId: attachment.id,
        details: {
          action: 'download_url_generated',
          complaintId: attachment.complaintId,
          filename: attachment.filename,
          expiresIn,
        },
      },
    });

    this.loggerService.log(
      `Download URL generated for attachment: ${attachment.filename}`,
      'AttachmentsService',
      { attachmentId: attachment.id, userId },
    );

    return {
      ...attachment,
      downloadUrl: presignedUrl.url,
      expiresIn: presignedUrl.expiresIn,
    };
  }

  /**
   * Deletar anexo
   */
  async remove(id: string, userId: string, userRole: UserRole) {
    const attachment = await this.findOne(id, userId, userRole);

    // Apenas ADMIN ou o próprio uploader pode deletar
    if (userRole !== UserRole.ADMIN && attachment.uploadedBy !== userId) {
      throw new ForbiddenException('Você não tem permissão para deletar este anexo');
    }

    // Deletar do S3
    try {
      await this.s3Service.deleteFile(attachment.s3Key);
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${error.message}`);
      // Continuar mesmo se falhar no S3 (soft delete)
    }

    // Marcar como deletado no banco (soft delete)
    await this.prisma.attachment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    // Log de auditoria
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        resource: 'attachment',
        resourceId: attachment.id,
        details: {
          complaintId: attachment.complaintId,
          filename: attachment.filename,
          s3Key: attachment.s3Key,
        },
      },
    });

    this.loggerService.log(`Attachment deleted: ${attachment.filename}`, 'AttachmentsService', {
      attachmentId: attachment.id,
      userId,
    });

    return { message: 'Anexo deletado com sucesso' };
  }

  /**
   * Verificar integridade do arquivo (comparar hash)
   */
  async verifyIntegrity(id: string, userId: string, userRole: UserRole) {
    const attachment = await this.findOne(id, userId, userRole);

    // Baixar arquivo do S3
    const fileBuffer = await this.s3Service.downloadFile(attachment.s3Key);

    // Calcular hash atual
    const currentHash = createHash('sha256').update(fileBuffer).digest('hex');

    // Comparar com hash armazenado
    const isValid = currentHash === attachment.sha256Hash;

    // Log de auditoria
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'READ',
        resource: 'attachment',
        resourceId: attachment.id,
        details: {
          action: 'integrity_check',
          complaintId: attachment.complaintId,
          filename: attachment.filename,
          isValid,
          storedHash: attachment.sha256Hash,
          currentHash,
        },
      },
    });

    if (!isValid) {
      this.loggerService.error(
        `Integrity check failed for attachment: ${attachment.filename}. AttachmentId: ${attachment.id}, StoredHash: ${attachment.sha256Hash}, CurrentHash: ${currentHash}`,
        'AttachmentsService',
      );
    }

    return {
      attachmentId: attachment.id,
      filename: attachment.filename,
      isValid,
      storedHash: attachment.sha256Hash,
      currentHash,
    };
  }

  /**
   * Estatísticas de anexos
   */
  async getStats() {
    const [total, totalSize, byMimeType] = await Promise.all([
      this.prisma.attachment.count({ where: { deletedAt: null } }),
      this.prisma.attachment.aggregate({
        where: { deletedAt: null },
        _sum: { size: true },
      }),
      this.prisma.attachment.groupBy({
        by: ['mimeType'],
        where: { deletedAt: null },
        _count: true,
        _sum: { size: true },
      }),
    ]);

    return {
      total,
      totalSize: totalSize._sum.size || 0,
      totalSizeMB: ((totalSize._sum.size || 0) / 1024 / 1024).toFixed(2),
      byMimeType: byMimeType.map((item) => ({
        mimeType: item.mimeType,
        count: item._count,
        size: item._sum.size || 0,
        sizeMB: ((item._sum.size || 0) / 1024 / 1024).toFixed(2),
      })),
    };
  }
}
