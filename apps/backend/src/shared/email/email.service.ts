import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { LoggerService } from '@shared/logger/logger.service';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, any>;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
  }>;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly templatesPath: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    // Configurar transporter Nodemailer
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.ethereal.email'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });

    this.templatesPath = path.join(process.cwd(), 'src', 'shared', 'email', 'templates');

    // Registrar helpers do Handlebars
    this.registerHelpers();
  }

  /**
   * Envia email usando template Handlebars
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const html = await this.renderTemplate(options.template, options.context);

      const mailOptions = {
        from: this.configService.get<string>('SMTP_FROM', '"Canal de Denúncias" <noreply@canaldenuncia.com>'),
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log('Email enviado com sucesso', 'EmailService', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
        template: options.template,
      });

      // Log preview URL (apenas para desenvolvimento com Ethereal)
      if (process.env.NODE_ENV === 'development') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          this.logger.debug(`Preview URL: ${previewUrl}`);
        }
      }

      return true;
    } catch (error) {
      this.logger.error('Erro ao enviar email', error.stack, 'EmailService', {
        error: error.message,
        stack: error.stack,
        to: options.to,
        subject: options.subject,
        template: options.template,
      });
      return false;
    }
  }

  /**
   * Envia email de nova denúncia criada
   */
  async sendComplaintCreated(to: string, data: {
    protocol: string;
    title: string;
    type: string;
    priority: string;
    createdAt: string;
    url: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Nova Denúncia Criada - ${data.protocol}`,
      template: 'complaint-created',
      context: data,
    });
  }

  /**
   * Envia email de denúncia atribuída
   */
  async sendComplaintAssigned(to: string, data: {
    protocol: string;
    title: string;
    investigatorName: string;
    assignedAt: string;
    url: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Denúncia Atribuída - ${data.protocol}`,
      template: 'complaint-assigned',
      context: data,
    });
  }

  /**
   * Envia email de status alterado
   */
  async sendComplaintStatusChanged(to: string, data: {
    protocol: string;
    title: string;
    oldStatus: string;
    newStatus: string;
    reason?: string;
    changedAt: string;
    url: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Status Alterado - ${data.protocol}`,
      template: 'complaint-status-changed',
      context: data,
    });
  }

  /**
   * Envia email de novo comentário
   */
  async sendComplaintComment(to: string, data: {
    protocol: string;
    title: string;
    authorName: string;
    comment: string;
    commentedAt: string;
    url: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Novo Comentário - ${data.protocol}`,
      template: 'complaint-comment',
      context: data,
    });
  }

  /**
   * Envia email de novo anexo
   */
  async sendAttachmentUploaded(to: string, data: {
    protocol: string;
    title: string;
    filename: string;
    uploadedBy: string;
    uploadedAt: string;
    url: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Novo Anexo Adicionado - ${data.protocol}`,
      template: 'attachment-uploaded',
      context: data,
    });
  }

  /**
   * Envia email de dossiê gerado
   */
  async sendDossierGenerated(to: string, data: {
    protocol: string;
    title: string;
    generatedBy: string;
    generatedAt: string;
    downloadUrl: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Dossiê Gerado - ${data.protocol}`,
      template: 'dossier-generated',
      context: data,
    });
  }

  /**
   * Envia email de lembrete de prazo
   */
  async sendDeadlineReminder(to: string, data: {
    protocol: string;
    title: string;
    deadline: string;
    daysRemaining: number;
    url: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Lembrete de Prazo - ${data.protocol}`,
      template: 'deadline-reminder',
      context: data,
    });
  }

  /**
   * Envia email de alerta do sistema
   */
  async sendSystemAlert(to: string, data: {
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
    timestamp: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Alerta do Sistema - ${data.title}`,
      template: 'system-alert',
      context: data,
    });
  }

  /**
   * Envia email de resumo diário
   */
  async sendDailyDigest(to: string, data: {
    userName: string;
    date: string;
    newComplaints: number;
    updatedComplaints: number;
    pendingActions: number;
    complaints: Array<{
      protocol: string;
      title: string;
      status: string;
      url: string;
    }>;
  }): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Resumo Diário - ${data.date}`,
      template: 'daily-digest',
      context: data,
    });
  }

  /**
   * Renderiza template Handlebars
   */
  private async renderTemplate(templateName: string, context: Record<string, any>): Promise<string> {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      const template = handlebars.compile(templateContent);
      
      // Adicionar variáveis globais ao contexto
      const fullContext = {
        ...context,
        appName: 'Canal de Denúncias Corporativo',
        appUrl: this.configService.get<string>('APP_URL', 'http://localhost:3000'),
        supportEmail: this.configService.get<string>('SUPPORT_EMAIL', 'suporte@canaldenuncia.com'),
        year: new Date().getFullYear(),
      };

      return template(fullContext);
    } catch (error) {
      this.logger.error('Erro ao renderizar template', error.stack, 'EmailService', {
        template: templateName,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Registra helpers customizados do Handlebars
   */
  private registerHelpers(): void {
    // Helper para formatar datas
    handlebars.registerHelper('formatDate', (date: string | Date) => {
      if (!date) return '';
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    });

    // Helper para status de denúncia
    handlebars.registerHelper('statusColor', (status: string) => {
      const colors: Record<string, string> = {
        PENDING: '#FFA500',
        IN_PROGRESS: '#0066CC',
        UNDER_REVIEW: '#9900CC',
        RESOLVED: '#008000',
        DISMISSED: '#808080',
        ESCALATED: '#FF0000',
      };
      return colors[status] || '#000000';
    });

    // Helper para traduzir status
    handlebars.registerHelper('translateStatus', (status: string) => {
      const translations: Record<string, string> = {
        PENDING: 'Pendente',
        IN_PROGRESS: 'Em Progresso',
        UNDER_REVIEW: 'Em Análise',
        RESOLVED: 'Resolvida',
        DISMISSED: 'Arquivada',
        ESCALATED: 'Escalada',
      };
      return translations[status] || status;
    });

    // Helper para traduzir tipo
    handlebars.registerHelper('translateType', (type: string) => {
      const translations: Record<string, string> = {
        HARASSMENT: 'Assédio',
        DISCRIMINATION: 'Discriminação',
        FRAUD: 'Fraude',
        CORRUPTION: 'Corrupção',
        SAFETY: 'Segurança',
        ETHICS: 'Ética',
        OTHER: 'Outros',
      };
      return translations[type] || type;
    });

    // Helper para traduzir prioridade
    handlebars.registerHelper('translatePriority', (priority: string) => {
      const translations: Record<string, string> = {
        LOW: 'Baixa',
        MEDIUM: 'Média',
        HIGH: 'Alta',
        CRITICAL: 'Crítica',
      };
      return translations[priority] || priority;
    });

    // Helper para severidade de alerta
    handlebars.registerHelper('severityColor', (severity: string) => {
      const colors: Record<string, string> = {
        info: '#0066CC',
        warning: '#FFA500',
        error: '#FF0000',
      };
      return colors[severity] || '#000000';
    });

    // Helper condicional
    handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
      switch (operator) {
        case '==':
          return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
          return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
          return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
          return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
          return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
          return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
          return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
          return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
          return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
          return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    });
  }

  /**
   * Verifica se o serviço de email está funcionando
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Conexão SMTP verificada com sucesso');
      return true;
    } catch (error) {
      this.logger.error('Erro ao verificar conexão SMTP', error.stack, 'EmailService', {
        error: error.message,
      });
      return false;
    }
  }
}
