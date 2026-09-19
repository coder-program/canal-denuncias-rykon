import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@shared/prisma/prisma.service';
import { LoggerService } from '@shared/logger/logger.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { QueryComplaintsDto } from './dto/query-complaints.dto';
import { ComplaintStatus, ComplaintType, UserRole, Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import * as crypto from 'crypto';

@Injectable()
export class ComplaintsService {
  private readonly logger = new Logger(ComplaintsService.name);
  private readonly encryptionKey: Buffer;
  private readonly algorithm = 'aes-256-cbc';

  constructor(
    private readonly prisma: PrismaService,
    private readonly loggerService: LoggerService,
    private readonly configService: ConfigService,
  ) {
    // Obter chave de criptografia do .env (deve ter exatamente 32 bytes)
    const key = this.configService.get<string>('ENCRYPTION_KEY');
    if (!key || key.length < 32) {
      throw new Error('ENCRYPTION_KEY deve ter no mínimo 32 caracteres');
    }
    this.encryptionKey = Buffer.from(key.slice(0, 32));
  }

  /**
   * Criar nova denúncia (anônima ou identificada)
   */
  async create(createComplaintDto: CreateComplaintDto, userId?: string) {
    try {
      console.log('[ComplaintsService] Creating complaint...');
      console.log('[ComplaintsService] DTO:', JSON.stringify(createComplaintDto, null, 2));
      console.log('[ComplaintsService] UserId:', userId);

      const protocol = this.generateProtocol();
      console.log('[ComplaintsService] Generated protocol:', protocol);

      // Normalizar involvedPeople para array se necessário
      let involvedPeople = createComplaintDto.involvedPeople;
      if (involvedPeople && !Array.isArray(involvedPeople)) {
        involvedPeople = [involvedPeople] as any;
      }

      // Criptografar dados sensíveis se necessário
      // Nota: involvedPeople não é criptografado pois o campo Prisma é String[]
      const encryptedData = this.encryptSensitiveData({
        reporterEmail: createComplaintDto.reporterEmail || null,
        reporterPhone: createComplaintDto.reporterPhone || null,
      });
      console.log('[ComplaintsService] Data encrypted');

      // Calcular hash de integridade
      const integrityHash = this.calculateIntegrityHash({
        title: createComplaintDto.title,
        description: createComplaintDto.description,
        type: createComplaintDto.type,
      });
      console.log('[ComplaintsService] Integrity hash calculated');

      const complaint = await this.prisma.complaint.create({
        data: {
          protocol,
          isAnonymous: createComplaintDto.isAnonymous,
          reporterEmail: encryptedData.reporterEmail,
          reporterPhone: encryptedData.reporterPhone,
          type: createComplaintDto.type,
          priority: createComplaintDto.priority || 'MEDIUM',
          status: 'PENDING',
          title: createComplaintDto.title,
          description: createComplaintDto.description,
          department: createComplaintDto.department,
          location: createComplaintDto.location,
          incidentDate: createComplaintDto.incidentDate,
          involvedPeople: involvedPeople || [],
          witnesses: createComplaintDto.witnesses || [],
          metadata: createComplaintDto.metadata,
          createdBy: createComplaintDto.isAnonymous ? null : userId,
          integrityHash,
        },
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
            },
          },
        },
      });
      console.log('[ComplaintsService] Complaint created:', complaint.id);

      // Criar histórico de status inicial
      await this.prisma.complaintStatusHistory.create({
        data: {
          complaintId: complaint.id,
          previousStatus: null,
          newStatus: 'PENDING',
          reason: 'Denúncia criada',
        },
      });
      console.log('[ComplaintsService] Status history created');

      // Log de auditoria
      await this.prisma.auditLog.create({
        data: {
          userId: userId || null,
          action: 'CREATE',
          resource: 'complaint',
          resourceId: complaint.id,
          details: {
            protocol: complaint.protocol,
            type: complaint.type,
            isAnonymous: complaint.isAnonymous,
          },
        },
      });
      console.log('[ComplaintsService] Audit log created');

      // Criar notificação para admins/investigadores
      try {
        await this.notifyNewComplaint(complaint);
        console.log('[ComplaintsService] Notifications sent');
      } catch (error) {
        console.warn(
          '[ComplaintsService] Failed to send notifications (non-critical):',
          error.message,
        );
      }

      // Bloquear automaticamente usuários citados (se configurado)
      if (involvedPeople && involvedPeople.length > 0) {
        try {
          await this.autoBlockInvolvedUsers(involvedPeople, complaint.id, userId);
          console.log('[ComplaintsService] Involved users processed');
        } catch (error) {
          console.warn(
            '[ComplaintsService] Failed to process involved users (non-critical):',
            error.message,
          );
        }
      }

      this.loggerService.log(`Nova denúncia criada: ${protocol}`, 'ComplaintsService', {
        complaintId: complaint.id,
        isAnonymous: complaint.isAnonymous,
      });

      // Não retornar dados sensíveis descriptografados
      const result = this.sanitizeComplaint(complaint);
      console.log('[ComplaintsService] ✅ Complaint created successfully:', protocol);
      return result;
    } catch (error) {
      console.error('[ComplaintsService] ❌ Error creating complaint:', error);
      console.error('[ComplaintsService] Error stack:', error.stack);
      console.error(
        '[ComplaintsService] DTO received:',
        JSON.stringify(createComplaintDto, null, 2),
      );
      throw error;
    }
  }

  /**
   * Listar denúncias com filtros e paginação
   */
  async findAll(query: QueryComplaintsDto, userRole: UserRole, userId?: string) {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.ComplaintWhereInput = {};

    // Filtros
    if (status) {
      where.status = status as ComplaintStatus;
    }

    if (type) {
      where.type = type as ComplaintType;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { protocol: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // RBAC: REPORTER só vê suas próprias denúncias
    if (userRole === UserRole.REPORTER) {
      where.createdBy = userId;
    }

    // Paginação
    const skip = (page - 1) * limit;

    const [complaints, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
            },
          },
          investigator: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          _count: {
            select: {
              attachments: true,
              statusHistory: true,
            },
          },
        },
      }),
      this.prisma.complaint.count({ where }),
    ]);

    return {
      data: complaints.map((c) => this.sanitizeComplaint(c)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Buscar denúncia por ID
   */
  async findOne(id: string, userRole: UserRole, userId?: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
        investigator: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        attachments: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        dossiers: true,
      },
    });

    if (!complaint) {
      throw new NotFoundException('Denúncia não encontrada');
    }

    // RBAC: REPORTER só pode ver suas próprias denúncias
    if (userRole === UserRole.REPORTER && complaint.createdBy !== userId) {
      throw new ForbiddenException('Você não tem permissão para visualizar esta denúncia');
    }

    // Log de auditoria
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'READ',
        resource: 'complaint',
        resourceId: complaint.id,
      },
    });

    return this.sanitizeComplaint(complaint);
  }

  /**
   * Buscar denúncia por protocolo (público)
   */
  async findByProtocol(protocol: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { protocol },
      select: {
        id: true,
        protocol: true,
        status: true,
        type: true,
        priority: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        resolvedAt: true,
        isAnonymous: true,
        // Não expor dados sensíveis
      },
    });

    if (!complaint) {
      throw new NotFoundException('Protocolo não encontrado');
    }

    return complaint;
  }

  /**
   * Atualizar denúncia
   */
  async update(
    id: string,
    updateComplaintDto: UpdateComplaintDto,
    userId: string,
    userRole: UserRole,
  ) {
    const complaint = await this.findOne(id, userRole, userId);

    // REPORTER não pode atualizar após criação
    if (userRole === UserRole.REPORTER) {
      throw new ForbiddenException('Denunciantes não podem editar denúncias');
    }

    const updated = await this.prisma.complaint.update({
      where: { id },
      data: {
        ...updateComplaintDto,
        updatedAt: new Date(),
      },
      include: {
        creator: true,
        investigator: true,
      },
    });

    // Log de auditoria
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        resource: 'complaint',
        resourceId: id,
        details: JSON.parse(
          JSON.stringify({
            changes: updateComplaintDto,
          }),
        ),
      },
    });

    this.loggerService.log(`Denúncia atualizada: ${complaint.protocol}`, 'ComplaintsService', {
      complaintId: id,
      updatedBy: userId,
    });

    return this.sanitizeComplaint(updated);
  }

  /**
   * Atribuir investigador
   */
  async assignInvestigator(complaintId: string, investigatorId: string, assignedBy: string) {
    const complaint = await this.prisma.complaint.update({
      where: { id: complaintId },
      data: {
        investigatorId,
        status: 'IN_PROGRESS',
      },
    });

    // Criar histórico
    await this.prisma.complaintStatusHistory.create({
      data: {
        complaintId,
        previousStatus: 'PENDING',
        newStatus: 'IN_PROGRESS',
        changedBy: assignedBy,
        reason: `Atribuída ao investigador ${investigatorId}`,
      },
    });

    // Notificar investigador
    await this.prisma.notification.create({
      data: {
        userId: investigatorId,
        relatedId: complaintId,
        relatedType: 'complaint',
        type: 'COMPLAINT_ASSIGNED' as any,
        channel: 'IN_APP' as any,
        title: 'Nova denúncia atribuída',
        message: `Você foi atribuído à denúncia ${complaint.protocol}`,
      },
    });

    // Log de auditoria
    await this.prisma.auditLog.create({
      data: {
        userId: assignedBy,
        action: 'UPDATE',
        resource: 'complaint',
        resourceId: complaintId,
        details: {
          action: 'assign_investigator',
          investigatorId,
        },
      },
    });

    return complaint;
  }

  /**
   * Alterar status da denúncia
   */
  async changeStatus(
    complaintId: string,
    newStatus: ComplaintStatus,
    reason: string,
    userId: string,
  ) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      throw new NotFoundException('Denúncia não encontrada');
    }

    const previousStatus = complaint.status;

    const updated = await this.prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status: newStatus,
        resolvedAt: newStatus === 'RESOLVED' || newStatus === 'DISMISSED' ? new Date() : null,
      },
    });

    // Criar histórico
    await this.prisma.complaintStatusHistory.create({
      data: {
        complaintId,
        previousStatus,
        newStatus,
        changedBy: userId,
        reason,
      },
    });

    // Notificar denunciante (se não anônimo)
    if (!complaint.isAnonymous && complaint.createdBy) {
      await this.prisma.notification.create({
        data: {
          userId: complaint.createdBy,
          relatedId: complaintId,
          relatedType: 'complaint',
          type: 'COMPLAINT_STATUS_CHANGED' as any,
          channel: 'IN_APP' as any,
          title: 'Status da denúncia atualizado',
          message: `Sua denúncia ${complaint.protocol} teve o status alterado para ${newStatus}`,
        },
      });
    }

    // Log de auditoria
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        resource: 'complaint',
        resourceId: complaintId,
        details: {
          action: 'change_status',
          previousStatus,
          newStatus,
          reason,
        },
      },
    });

    this.loggerService.log(
      `Status da denúncia ${complaint.protocol} alterado: ${previousStatus} → ${newStatus}`,
      'ComplaintsService',
    );

    return updated;
  }

  /**
   * Deletar denúncia (soft delete)
   */
  async remove(id: string, userId: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      throw new NotFoundException('Denúncia não encontrada');
    }

    // Não deletar fisicamente, apenas marcar como DISMISSED
    await this.changeStatus(id, 'DISMISSED', 'Denúncia removida', userId);

    this.loggerService.warn(`Denúncia removida: ${complaint.protocol}`, 'ComplaintsService', {
      complaintId: id,
      removedBy: userId,
    });

    return { message: 'Denúncia arquivada com sucesso' };
  }

  /**
   * Gerar protocolo único alfanumérico
   */
  private generateProtocol(): string {
    const year = new Date().getFullYear();
    const randomId = nanoid(6).toUpperCase();
    return `DEN-${year}-${randomId}`;
  }

  /**
   * Criptografar dados sensíveis (PII) usando AES-256-CBC
   */
  private encryptSensitiveData(data: any): any {
    const encrypted: any = {};

    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        encrypted[key] = value;
        continue;
      }

      try {
        // Converter para string
        const text = Array.isArray(value) ? JSON.stringify(value) : String(value);

        // Gerar IV aleatório (16 bytes)
        const iv = crypto.randomBytes(16);

        // Criar cipher
        const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);

        // Criptografar
        let encryptedData = cipher.update(text, 'utf8', 'hex');
        encryptedData += cipher.final('hex');

        // Retornar IV + dados criptografados (separados por :)
        encrypted[key] = `${iv.toString('hex')}:${encryptedData}`;
      } catch (error) {
        this.logger.error(`Erro ao criptografar campo ${key}:`, error);
        encrypted[key] = null;
      }
    }

    return encrypted;
  }

  /**
   * Descriptografar dados sensíveis (PII) usando AES-256-CBC
   */
  private decryptSensitiveData(encryptedData: string): string | null {
    if (!encryptedData || typeof encryptedData !== 'string') {
      return null;
    }

    try {
      // Separar IV e dados criptografados
      const parts = encryptedData.split(':');
      if (parts.length !== 2) {
        return null;
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      // Criar decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);

      // Descriptografar
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error('Erro ao descriptografar dados:', error);
      return null;
    }
  }

  /**
   * Calcular hash de integridade
   */
  private calculateIntegrityHash(data: any): string {
    const content = JSON.stringify(data);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Sanitizar dados sensíveis antes de retornar
   */
  private sanitizeComplaint(complaint: any): any {
    // Se for anônima, não expor dados do criador
    if (complaint.isAnonymous) {
      delete complaint.createdBy;
      delete complaint.creator;
      delete complaint.reporterEmail;
      delete complaint.reporterPhone;
    }

    return complaint;
  }

  /**
   * Notificar novos admins/investigadores sobre nova denúncia
   */
  private async notifyNewComplaint(complaint: any) {
    // Buscar todos os ADMIN e INVESTIGATOR
    const usersToNotify = await this.prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'INVESTIGATOR'],
        },
        isActive: true,
        isBlocked: false,
      },
    });

    // Criar notificações
    const notifications = usersToNotify.map((user: any) => ({
      userId: user.id,
      relatedId: complaint.id,
      relatedType: 'complaint',
      type: 'COMPLAINT_CREATED' as any,
      channel: 'IN_APP' as any,
      title: 'Nova denúncia recebida',
      message: `Denúncia ${complaint.protocol} (${complaint.type}) aguardando triagem`,
    }));

    await this.prisma.notification.createMany({
      data: notifications,
    });
  }

  /**
   * Bloquear automaticamente usuários citados
   */
  private async autoBlockInvolvedUsers(
    involvedPeople: string[],
    complaintId: string,
    blockedBy?: string,
  ) {
    // Buscar configuração
    const autoBlockSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'auto_block_involved_users' },
    });

    if (autoBlockSetting?.value !== 'true') {
      return; // Recurso desabilitado
    }

    // Buscar usuários por email ou nome
    const users = await this.prisma.user.findMany({
      where: {
        OR: [{ email: { in: involvedPeople } }, { fullName: { in: involvedPeople } }],
        isBlocked: false,
      },
    });

    // Bloquear cada usuário encontrado
    for (const user of users) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isBlocked: true,
          blockedReason: `Citado em denúncia ${complaintId}`,
          blockedAt: new Date(),
          blockedBy: blockedBy || 'SYSTEM',
        },
      });

      // Log de auditoria
      await this.prisma.auditLog.create({
        data: {
          userId: blockedBy || null,
          action: 'BLOCK',
          resource: 'user',
          resourceId: user.id,
          details: {
            reason: `Auto-bloqueio por citação em denúncia ${complaintId}`,
          },
        },
      });

      this.loggerService.warn(
        `Usuário bloqueado automaticamente: ${user.email}`,
        'ComplaintsService',
        { userId: user.id, complaintId },
      );
    }
  }

  /**
   * Estatísticas de denúncias
   */
  async getStats() {
    const [total, pending, inProgress, resolved, byType, byPriority] = await Promise.all([
      this.prisma.complaint.count(),
      this.prisma.complaint.count({ where: { status: 'PENDING' } }),
      this.prisma.complaint.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.complaint.count({ where: { status: 'RESOLVED' } }),
      this.prisma.complaint.groupBy({
        by: ['type'],
        _count: true,
      }),
      this.prisma.complaint.groupBy({
        by: ['priority'],
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: {
        pending,
        inProgress,
        resolved,
      },
      byType: byType.reduce(
        (acc: any, item: any) => {
          acc[item.type] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byPriority: byPriority.reduce(
        (acc: any, item: any) => {
          acc[item.priority] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  /**
   * Adicionar comentário a uma denúncia
   */
  async addComment(complaintId: string, content: string, userId: string) {
    // Verificar se denúncia existe
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      throw new NotFoundException('Denúncia não encontrada');
    }

    // Criar comentário
    const comment = await this.prisma.complaintComment.create({
      data: {
        complaintId,
        authorId: userId,
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Registrar log de auditoria
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        resource: 'complaint_comment',
        resourceId: comment.id,
        details: { complaintId, content: content.substring(0, 100) },
      },
    });

    this.logger.log(`Comment added to complaint ${complaintId} by user ${userId}`);

    return comment;
  }

  /**
   * Listar comentários de uma denúncia
   */
  async getComments(complaintId: string) {
    // Verificar se denúncia existe
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      throw new NotFoundException('Denúncia não encontrada');
    }

    // Buscar comentários
    const comments = await this.prisma.complaintComment.findMany({
      where: { complaintId },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return comments;
  }
}
