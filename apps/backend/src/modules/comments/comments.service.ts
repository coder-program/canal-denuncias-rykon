import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { LoggerService } from '@shared/logger/logger.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Criar novo comentário
   */
  async create(complaintId: string, dto: CreateCommentDto, userId: string, userRole: UserRole) {
    // Verificar se a denúncia existe
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      select: { id: true, createdBy: true, investigatorId: true, protocol: true, title: true },
    });

    if (!complaint) {
      throw new NotFoundException('Denúncia não encontrada');
    }

    // RBAC: REPORTER só pode comentar nas próprias denúncias
    if (userRole === UserRole.REPORTER && complaint.createdBy !== userId) {
      throw new ForbiddenException('Você não tem permissão para comentar nesta denúncia');
    }

    // Criar comentário
    const comment = await this.prisma.complaintComment.create({
      data: {
        complaintId,
        authorId: userId,
        content: dto.content,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Criar log de auditoria
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        resource: 'comment',
        resourceId: comment.id,
        details: {
          complaintId,
          protocol: complaint.protocol,
        },
      },
    });

    this.logger.log(`Comentário criado na denúncia ${complaint.protocol}`, 'CommentsService', {
      commentId: comment.id,
      complaintId,
    });

    // Criar notificações para criador e investigador
    await this.notifyNewComment(complaint, comment, userId);

    return comment;
  }

  /**
   * Listar comentários de uma denúncia
   */
  async findAllByComplaint(complaintId: string, userId: string, userRole: UserRole) {
    // Verificar se a denúncia existe
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      select: { id: true, createdBy: true, investigatorId: true },
    });

    if (!complaint) {
      throw new NotFoundException('Denúncia não encontrada');
    }

    // RBAC: REPORTER só vê comentários de suas próprias denúncias
    if (userRole === UserRole.REPORTER && complaint.createdBy !== userId) {
      throw new ForbiddenException('Você não tem permissão para ver comentários desta denúncia');
    }

    const comments = await this.prisma.complaintComment.findMany({
      where: { complaintId },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return comments;
  }

  /**
   * Obter um comentário por ID
   */
  async findOne(id: string, userId: string, userRole: UserRole) {
    const comment = await this.prisma.complaintComment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        complaint: {
          select: {
            id: true,
            createdBy: true,
            investigatorId: true,
            protocol: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comentário não encontrado');
    }

    // RBAC: REPORTER só vê comentários de suas próprias denúncias
    if (userRole === UserRole.REPORTER && comment.complaint.createdBy !== userId) {
      throw new ForbiddenException('Você não tem permissão para ver este comentário');
    }

    return comment;
  }

  /**
   * Atualizar comentário (apenas autor ou ADMIN)
   */
  async update(id: string, dto: UpdateCommentDto, userId: string, userRole: UserRole) {
    const comment = await this.prisma.complaintComment.findUnique({
      where: { id },
      include: {
        complaint: {
          select: { protocol: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comentário não encontrado');
    }

    // Apenas o autor ou ADMIN podem editar
    if (comment.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Você não tem permissão para editar este comentário');
    }

    const updated = await this.prisma.complaintComment.update({
      where: { id },
      data: dto,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Log de auditoria
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        resource: 'comment',
        resourceId: id,
        details: {
          protocol: comment.complaint.protocol,
          changes: JSON.parse(JSON.stringify(dto)),
        },
      },
    });

    this.logger.log(`Comentário ${id} atualizado`, 'CommentsService', { commentId: id });

    return updated;
  }

  /**
   * Deletar comentário (apenas autor ou ADMIN)
   */
  async remove(id: string, userId: string, userRole: UserRole) {
    const comment = await this.prisma.complaintComment.findUnique({
      where: { id },
      include: {
        complaint: {
          select: { protocol: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comentário não encontrado');
    }

    // Apenas o autor ou ADMIN podem deletar
    if (comment.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Você não tem permissão para deletar este comentário');
    }

    await this.prisma.complaintComment.delete({
      where: { id },
    });

    // Log de auditoria
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        resource: 'comment',
        resourceId: id,
        details: {
          protocol: comment.complaint.protocol,
          content: comment.content,
        },
      },
    });

    this.logger.log(`Comentário ${id} deletado`, 'CommentsService', { commentId: id });

    return { message: 'Comentário deletado com sucesso' };
  }

  /**
   * Enviar notificações sobre novo comentário
   */
  private async notifyNewComment(complaint: any, comment: any, authorId: string) {
    // Notificar criador da denúncia (se não for anônimo e não for o autor do comentário)
    const notifications: any[] = [];

    if (complaint.createdBy && complaint.createdBy !== authorId) {
      notifications.push({
        userId: complaint.createdBy,
        relatedId: complaint.id,
        relatedType: 'complaint',
        type: 'COMPLAINT_COMMENT',
        channel: 'IN_APP',
        title: 'Novo comentário',
        message: `Novo comentário na denúncia ${complaint.protocol}`,
      });
    }

    // Notificar investigador (se houver e não for o autor do comentário)
    if (complaint.investigatorId && complaint.investigatorId !== authorId) {
      notifications.push({
        userId: complaint.investigatorId,
        relatedId: complaint.id,
        relatedType: 'complaint',
        type: 'COMPLAINT_COMMENT',
        channel: 'IN_APP',
        title: 'Novo comentário',
        message: `Novo comentário na denúncia ${complaint.protocol}`,
      });
    }

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({
        data: notifications,
      });
    }
  }
}
