import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { EmailService } from '@shared/email/email.service';
import { LoggerService } from '@shared/logger/logger.service';
import { NotificationType, NotificationChannel, UserRole } from '@prisma/client';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  channels: NotificationChannel[];
  title: string;
  message: string;
  data?: any;
  relatedId?: string;
  relatedType?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Cria e envia notificação em múltiplos canais
   */
  async create(dto: CreateNotificationDto): Promise<void> {
    try {
      // Verificar preferências do usuário
      const preferences = await this.prisma.userPreferences.findUnique({
        where: { userId: dto.userId },
      });

      // Criar notificação in-app se habilitada
      if (dto.channels.includes(NotificationChannel.IN_APP)) {
        if (this.shouldSendInApp(dto.type, preferences)) {
          await this.prisma.notification.create({
            data: {
              userId: dto.userId,
              type: dto.type,
              channel: NotificationChannel.IN_APP,
              title: dto.title,
              message: dto.message,
              data: dto.data || {},
              relatedId: dto.relatedId,
              relatedType: dto.relatedType,
            },
          });
        }
      }

      // Enviar email se habilitado
      if (dto.channels.includes(NotificationChannel.EMAIL)) {
        if (this.shouldSendEmail(dto.type, preferences)) {
          await this.sendEmailNotification(dto);
        }
      }

      this.logger.log(`Notificação criada: ${dto.type} para usuário ${dto.userId}`);
    } catch (error) {
      this.logger.error(`Erro ao criar notificação: ${error.message}`);
      throw error;
    }
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(id: string, userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Marca todas como lidas
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Lista notificações do usuário
   */
  async findAll(userId: string, isRead?: boolean) {
    const where: any = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Conta notificações não lidas
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Envia notificação por email
   */
  private async sendEmailNotification(dto: CreateNotificationDto): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId },
      });

      if (!user || !user.email) return;

      const notificationRecord = await this.prisma.notification.create({
        data: {
          userId: dto.userId,
          type: dto.type,
          channel: NotificationChannel.EMAIL,
          title: dto.title,
          message: dto.message,
          data: dto.data || {},
          relatedId: dto.relatedId,
          relatedType: dto.relatedType,
        },
      });

      let emailSent = false;
      let emailError = null;

      try {
        // Enviar email baseado no tipo
        switch (dto.type) {
          case NotificationType.COMPLAINT_CREATED:
            emailSent = await this.emailService.sendComplaintCreated(user.email, dto.data);
            break;
          case NotificationType.COMPLAINT_ASSIGNED:
            emailSent = await this.emailService.sendComplaintAssigned(user.email, dto.data);
            break;
          case NotificationType.COMPLAINT_STATUS_CHANGED:
            emailSent = await this.emailService.sendComplaintStatusChanged(user.email, dto.data);
            break;
          case NotificationType.COMPLAINT_COMMENT:
            emailSent = await this.emailService.sendComplaintComment(user.email, dto.data);
            break;
          case NotificationType.ATTACHMENT_UPLOADED:
            emailSent = await this.emailService.sendAttachmentUploaded(user.email, dto.data);
            break;
          case NotificationType.DOSSIER_GENERATED:
            emailSent = await this.emailService.sendDossierGenerated(user.email, dto.data);
            break;
          case NotificationType.DEADLINE_REMINDER:
            emailSent = await this.emailService.sendDeadlineReminder(user.email, dto.data);
            break;
          case NotificationType.SYSTEM_ALERT:
            emailSent = await this.emailService.sendSystemAlert(user.email, dto.data);
            break;
          default:
            this.logger.warn(`Tipo de notificação não suportado para email: ${dto.type}`);
        }
      } catch (error) {
        emailError = error.message;
        this.logger.error(`Erro ao enviar email para ${user.email}:`, error);
      }

      // Atualizar status do email
      await this.prisma.notification.update({
        where: { id: notificationRecord.id },
        data: {
          emailSent,
          emailSentAt: emailSent ? new Date() : null,
          emailError: emailSent ? null : emailError,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Erro ao processar envio de email: ${error.message}`);
    }
  }

  /**
   * Verifica se deve enviar notificação in-app
   */
  private shouldSendInApp(type: NotificationType, preferences: any): boolean {
    if (!preferences || !preferences.inAppNotifications) return true;

    const map: Record<NotificationType, string> = {
      COMPLAINT_CREATED: 'inAppComplaintCreated',
      COMPLAINT_ASSIGNED: 'inAppComplaintAssigned',
      COMPLAINT_STATUS_CHANGED: 'inAppComplaintStatusChanged',
      COMPLAINT_COMMENT: 'inAppComplaintComment',
      ATTACHMENT_UPLOADED: 'inAppAttachmentUploaded',
      DOSSIER_GENERATED: 'inAppDossierGenerated',
      SYSTEM_ALERT: 'inAppSystemAlert',
      DEADLINE_REMINDER: 'inAppDeadlineReminder',
    };

    const key = map[type];
    return key ? preferences[key] !== false : true;
  }

  /**
   * Verifica se deve enviar email
   */
  private shouldSendEmail(type: NotificationType, preferences: any): boolean {
    if (!preferences || !preferences.emailNotifications) return true;

    const map: Record<NotificationType, string> = {
      COMPLAINT_CREATED: 'emailComplaintCreated',
      COMPLAINT_ASSIGNED: 'emailComplaintAssigned',
      COMPLAINT_STATUS_CHANGED: 'emailComplaintStatusChanged',
      COMPLAINT_COMMENT: 'emailComplaintComment',
      ATTACHMENT_UPLOADED: 'emailAttachmentUploaded',
      DOSSIER_GENERATED: 'emailDossierGenerated',
      SYSTEM_ALERT: 'emailSystemAlert',
      DEADLINE_REMINDER: 'emailDeadlineReminder',
    };

    const key = map[type];
    return key ? preferences[key] !== false : true;
  }

  /**
   * Notifica criação de denúncia
   */
  async notifyComplaintCreated(complaint: any): Promise<void> {
    // Notificar admins e auditores
    const users = await this.prisma.user.findMany({
      where: {
        role: { in: [UserRole.ADMIN, UserRole.AUDITOR] },
        isActive: true,
      },
    });

    for (const user of users) {
      await this.create({
        userId: user.id,
        type: NotificationType.COMPLAINT_CREATED,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        title: 'Nova Denúncia Criada',
        message: `Denúncia ${complaint.protocol} foi criada`,
        data: {
          protocol: complaint.protocol,
          title: complaint.title,
          type: complaint.type,
          priority: complaint.priority,
          createdAt: complaint.createdAt.toISOString(),
          url: `/complaints/${complaint.id}`,
        },
        relatedId: complaint.id,
        relatedType: 'complaint',
      });
    }
  }

  /**
   * Notifica atribuição de denúncia
   */
  async notifyComplaintAssigned(complaint: any, investigator: any): Promise<void> {
    await this.create({
      userId: investigator.id,
      type: NotificationType.COMPLAINT_ASSIGNED,
      channels: [
        NotificationChannel.IN_APP,
        NotificationChannel.EMAIL,
        NotificationChannel.WEBSOCKET,
      ],
      title: 'Denúncia Atribuída',
      message: `Denúncia ${complaint.protocol} foi atribuída a você`,
      data: {
        protocol: complaint.protocol,
        title: complaint.title,
        investigatorName: investigator.fullName || investigator.email,
        assignedAt: new Date().toISOString(),
        url: `/complaints/${complaint.id}`,
      },
      relatedId: complaint.id,
      relatedType: 'complaint',
    });
  }

  /**
   * Notifica mudança de status
   */
  async notifyComplaintStatusChanged(
    complaint: any,
    oldStatus: string,
    reason?: string,
  ): Promise<void> {
    const userIds = [complaint.createdBy];
    if (complaint.investigatorId) userIds.push(complaint.investigatorId);

    for (const userId of userIds) {
      await this.create({
        userId,
        type: NotificationType.COMPLAINT_STATUS_CHANGED,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        title: 'Status Alterado',
        message: `Status da denúncia ${complaint.protocol} foi alterado`,
        data: {
          protocol: complaint.protocol,
          title: complaint.title,
          oldStatus,
          newStatus: complaint.status,
          reason,
          changedAt: new Date().toISOString(),
          url: `/complaints/${complaint.id}`,
        },
        relatedId: complaint.id,
        relatedType: 'complaint',
      });
    }
  }

  /**
   * Notifica novo comentário
   */
  async notifyComplaintComment(complaint: any, comment: any, author: any): Promise<void> {
    // Notificar criador da denúncia (se não for anônimo) e investigador
    const userIds: string[] = [];
    if (complaint.createdBy && complaint.createdBy !== author.id) {
      userIds.push(complaint.createdBy);
    }
    if (complaint.investigatorId && complaint.investigatorId !== author.id) {
      userIds.push(complaint.investigatorId);
    }

    for (const userId of userIds) {
      await this.create({
        userId,
        type: NotificationType.COMPLAINT_COMMENT,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        title: 'Novo Comentário',
        message: `${author.fullName || author.email} comentou na denúncia ${complaint.protocol}`,
        data: {
          protocol: complaint.protocol,
          title: complaint.title,
          authorName: author.fullName || author.email,
          comment: comment.content,
          commentedAt: comment.createdAt.toISOString(),
          url: `/complaints/${complaint.id}`,
        },
        relatedId: complaint.id,
        relatedType: 'complaint',
      });
    }
  }
}
