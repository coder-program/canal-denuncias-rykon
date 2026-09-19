import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { S3Service } from '@shared/s3/s3.service';
import { LoggerService } from '@shared/logger/logger.service';
import { UserRole } from '@prisma/client';
import PDFDocument from 'pdfkit';
import archiver from 'archiver';

interface DossierGenerationOptions {
  includeSummary: boolean;
  includeTimeline: boolean;
  includeAttachments: boolean;
  includeAuditLog: boolean;
  format: 'pdf' | 'zip' | 'both';
}

@Injectable()
export class DossiersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Gera dossiê completo de uma denúncia
   */
  async generateDossier(
    complaintId: string,
    userId: string,
    userRole: UserRole,
    options: Partial<DossierGenerationOptions> = {},
  ) {
    // Log para debug
    this.logger.log(
      `[generateDossier] complaintId: ${complaintId}, userId: ${userId}, userRole: ${userRole}`,
    );

    // Opções padrão
    const opts: DossierGenerationOptions = {
      includeSummary: true,
      includeTimeline: true,
      includeAttachments: true,
      includeAuditLog: false,
      format: 'both',
      ...options,
    };

    // Validar acesso à denúncia
    const complaint = await this.validateComplaintAccess(complaintId, userId, userRole);

    // Buscar dados completos
    const complaintData = await this.getComplaintFullData(complaintId);

    // Gerar PDF se necessário
    let pdfKey: string | null = null;
    if (opts.format === 'pdf' || opts.format === 'both') {
      pdfKey = await this.generatePDF(complaint, complaintData, opts);
    }

    // Gerar ZIP se necessário
    let zipKey: string | null = null;
    if (opts.format === 'zip' || opts.format === 'both') {
      zipKey = await this.generateZIP(complaint, complaintData, pdfKey, opts);
    }

    // Salvar registro do dossiê
    const dossier = await this.prisma.dossier.create({
      data: {
        title: `Dossiê - ${complaint.protocol}`,
        summary: this.generateSummaryText(complaint, complaintData),
        s3PdfKey: pdfKey,
        s3ZipKey: zipKey,
        complaint: {
          connect: {
            id: complaintId,
          },
        },
        generator: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        complaint: {
          select: {
            id: true,
            protocol: true,
            title: true,
            status: true,
          },
        },
        generator: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    // Log de auditoria
    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        resource: 'dossier',
        resourceId: dossier.id,
        userId,
        details: {
          complaintId,
          format: opts.format,
          pdfGenerated: !!pdfKey,
          zipGenerated: !!zipKey,
        },
      },
    });

    return dossier;
  }

  /**
   * Lista dossiês de uma denúncia
   */
  async findAllByComplaint(complaintId: string, userId: string, userRole: UserRole) {
    await this.validateComplaintAccess(complaintId, userId, userRole);

    return this.prisma.dossier.findMany({
      where: { complaintId },
      orderBy: { generatedAt: 'desc' },
      include: {
        generator: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });
  }

  /**
   * Obtém detalhes de um dossiê
   */
  async findOne(id: string, userId: string, userRole: UserRole) {
    const dossier = await this.prisma.dossier.findUnique({
      where: { id },
      include: {
        complaint: true,
        generator: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    if (!dossier) {
      throw new NotFoundException('Dossiê não encontrado');
    }

    await this.validateComplaintAccess(dossier.complaintId, userId, userRole);

    return dossier;
  }

  /**
   * Gera URL de download para PDF do dossiê
   */
  async getDownloadUrlPDF(id: string, userId: string, userRole: UserRole, expiresIn = 3600) {
    const dossier = await this.findOne(id, userId, userRole);

    if (!dossier.s3PdfKey) {
      throw new BadRequestException('Este dossiê não possui PDF gerado');
    }

    const { url: downloadUrl } = await this.s3Service.getPresignedDownloadUrl(
      dossier.s3PdfKey,
      expiresIn,
    );

    // Log de auditoria
    await this.prisma.auditLog.create({
      data: {
        action: 'DOWNLOAD',
        resource: 'dossier',
        resourceId: id,
        userId,
        details: {
          format: 'pdf',
          expiresIn,
        },
      },
    });

    return {
      downloadUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      filename: `dossier-${dossier.complaint.protocol}.pdf`,
    };
  }

  /**
   * Gera URL de download para ZIP do dossiê
   */
  async getDownloadUrlZIP(id: string, userId: string, userRole: UserRole, expiresIn = 3600) {
    const dossier = await this.findOne(id, userId, userRole);

    if (!dossier.s3ZipKey) {
      throw new BadRequestException('Este dossiê não possui ZIP gerado');
    }

    const { url: downloadUrl } = await this.s3Service.getPresignedDownloadUrl(
      dossier.s3ZipKey,
      expiresIn,
    );

    // Log de auditoria
    await this.prisma.auditLog.create({
      data: {
        action: 'DOWNLOAD',
        resource: 'dossier',
        resourceId: id,
        userId,
        details: {
          format: 'zip',
          expiresIn,
        },
      },
    });

    return {
      downloadUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      filename: `dossier-${dossier.complaint.protocol}.zip`,
    };
  }

  /**
   * Remove dossiê (soft delete não aplicável - apenas ADMIN)
   */
  async remove(id: string, userId: string, userRole: UserRole) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem deletar dossiês');
    }

    const dossier = await this.findOne(id, userId, userRole);

    // Deletar arquivos do S3
    if (dossier.s3PdfKey) {
      await this.s3Service.deleteFile(dossier.s3PdfKey);
    }
    if (dossier.s3ZipKey) {
      await this.s3Service.deleteFile(dossier.s3ZipKey);
    }

    // Deletar registro
    await this.prisma.dossier.delete({
      where: { id },
    });

    // Log de auditoria
    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE',
        resource: 'dossier',
        resourceId: id,
        userId,
        details: {
          complaintId: dossier.complaintId,
          pdfDeleted: !!dossier.s3PdfKey,
          zipDeleted: !!dossier.s3ZipKey,
        },
      },
    });
  }

  /**
   * Estatísticas de dossiês
   */
  async getStats() {
    const [totalDossiers, byFormat, recentDossiers] = await Promise.all([
      this.prisma.dossier.count(),
      this.prisma.dossier.groupBy({
        by: ['generatedBy'],
        _count: { id: true },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 10,
      }),
      this.prisma.dossier.findMany({
        take: 5,
        orderBy: { generatedAt: 'desc' },
        include: {
          complaint: {
            select: {
              protocol: true,
              title: true,
            },
          },
          generator: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
      }),
    ]);

    return {
      totalDossiers,
      topGenerators: byFormat,
      recentDossiers,
    };
  }

  // ============================================
  // MÉTODOS PRIVADOS - VALIDAÇÃO
  // ============================================

  private async validateComplaintAccess(complaintId: string, userId: string, userRole: UserRole) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      throw new NotFoundException('Denúncia não encontrada');
    }

    // RBAC: REPORTER só acessa próprias denúncias
    if (userRole === UserRole.REPORTER && complaint.createdBy !== userId) {
      throw new ForbiddenException('Você não tem permissão para acessar esta denúncia');
    }

    return complaint;
  }

  // ============================================
  // MÉTODOS PRIVADOS - GERAÇÃO DE PDF
  // ============================================

  private async generatePDF(
    complaint: any,
    data: any,
    options: DossierGenerationOptions,
  ): Promise<string> {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Dossiê - ${complaint.protocol}`,
        Author: 'Canal de Denúncias Corporativo',
        Subject: complaint.title,
        CreationDate: new Date(),
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // Header
    this.addPDFHeader(doc, complaint);

    // Sumário Executivo
    if (options.includeSummary) {
      this.addPDFSummary(doc, complaint, data);
    }

    // Timeline de Eventos
    if (options.includeTimeline) {
      this.addPDFTimeline(doc, data.statusHistory);
    }

    // Lista de Anexos
    if (options.includeAttachments && data.attachments.length > 0) {
      this.addPDFAttachmentsList(doc, data.attachments);
    }

    // Log de Auditoria (apenas ADMIN/AUDITOR)
    if (options.includeAuditLog && data.auditLogs) {
      this.addPDFAuditLog(doc, data.auditLogs);
    }

    // Footer
    this.addPDFFooter(doc);

    doc.end();

    // Aguardar conclusão
    await new Promise<void>((resolve) => {
      doc.on('end', () => resolve());
    });

    const pdfBuffer = Buffer.concat(chunks);

    // Upload para S3
    const uploadResult = await this.s3Service.uploadFile(
      {
        buffer: pdfBuffer,
        originalname: `dossier-${complaint.protocol}.pdf`,
        mimetype: 'application/pdf',
        size: pdfBuffer.length,
      } as any,
      'dossiers',
    );

    return uploadResult.key;
  }

  private addPDFHeader(doc: PDFKit.PDFDocument, complaint: any) {
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('DOSSIÊ DE INVESTIGAÇÃO', { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(14)
      .font('Helvetica')
      .text(`Protocolo: ${complaint.protocol}`, { align: 'center' })
      .moveDown(2);

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('INFORMAÇÕES GERAIS', { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Título: ${complaint.title}`)
      .text(`Tipo: ${this.translateComplaintType(complaint.type)}`)
      .text(`Prioridade: ${this.translatePriority(complaint.priority)}`)
      .text(`Status: ${this.translateStatus(complaint.status)}`)
      .text(`Data da Denúncia: ${new Date(complaint.createdAt).toLocaleString('pt-BR')}`)
      .text(`Anônima: ${complaint.isAnonymous ? 'Sim' : 'Não'}`)
      .moveDown(1.5);
  }

  private addPDFSummary(doc: PDFKit.PDFDocument, complaint: any, data: any) {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('DESCRIÇÃO DA DENÚNCIA', { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(complaint.description, { align: 'justify' })
      .moveDown(1);

    if (complaint.location) {
      doc.text(`Local do Incidente: ${complaint.location}`).moveDown(0.5);
    }

    if (complaint.incidentDate) {
      doc
        .text(`Data do Incidente: ${new Date(complaint.incidentDate).toLocaleDateString('pt-BR')}`)
        .moveDown(0.5);
    }

    if (data.investigator) {
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('INVESTIGADOR RESPONSÁVEL', { underline: true })
        .moveDown(0.5);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Nome: ${data.investigator.fullName || 'N/A'}`)
        .text(`Email: ${data.investigator.email}`)
        .moveDown(1.5);
    }
  }

  private addPDFTimeline(doc: PDFKit.PDFDocument, statusHistory: any[]) {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('LINHA DO TEMPO', { underline: true })
      .moveDown(0.5);

    statusHistory.forEach((item, index) => {
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(
          `${new Date(item.createdAt).toLocaleString('pt-BR')} - ${this.translateStatus(item.newStatus)}`,
        );

      if (item.reason) {
        doc.font('Helvetica').text(`Motivo: ${item.reason}`);
      }

      if (index < statusHistory.length - 1) {
        doc.moveDown(0.5);
      }
    });

    doc.moveDown(1.5);
  }

  private addPDFAttachmentsList(doc: PDFKit.PDFDocument, attachments: any[]) {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('ANEXOS E EVIDÊNCIAS', { underline: true })
      .moveDown(0.5);

    doc.fontSize(10).font('Helvetica').text(`Total de anexos: ${attachments.length}`).moveDown(0.5);

    attachments.forEach((attachment, index) => {
      doc
        .text(`${index + 1}. ${attachment.filename}`)
        .fontSize(9)
        .text(`   Tipo: ${attachment.mimeType}`)
        .text(`   Tamanho: ${(attachment.size / 1024).toFixed(2)} KB`)
        .text(`   Upload: ${new Date(attachment.uploadedAt).toLocaleString('pt-BR')}`)
        .fontSize(10)
        .moveDown(0.3);
    });

    doc.moveDown(1);
  }

  private addPDFAuditLog(doc: PDFKit.PDFDocument, auditLogs: any[]) {
    doc.addPage();

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('LOG DE AUDITORIA', { underline: true })
      .moveDown(0.5);

    auditLogs.slice(0, 20).forEach((log) => {
      doc
        .fontSize(9)
        .font('Helvetica')
        .text(`${new Date(log.timestamp).toLocaleString('pt-BR')} - ${log.action}`)
        .text(`Usuário: ${log.user?.email || 'Sistema'}`)
        .moveDown(0.3);
    });
  }

  private addPDFFooter(doc: PDFKit.PDFDocument) {
    const pages = doc.bufferedPageRange();

    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(pages.start + i);

      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          `Canal de Denúncias Corporativo - Gerado em ${new Date().toLocaleString('pt-BR')}`,
          50,
          doc.page.height - 50,
          { align: 'center' },
        );

      doc.text(`Página ${i + 1} de ${pages.count}`, 50, doc.page.height - 35, {
        align: 'center',
      });
    }
  }

  // ============================================
  // MÉTODOS PRIVADOS - GERAÇÃO DE ZIP
  // ============================================

  private async generateZIP(
    complaint: any,
    data: any,
    pdfKey: string | null,
    options: DossierGenerationOptions,
  ): Promise<string> {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    const chunks: Buffer[] = [];
    archive.on('data', (chunk) => chunks.push(chunk));

    // Adicionar PDF se existe
    if (pdfKey) {
      const pdfBuffer = await this.s3Service.downloadFile(pdfKey);
      archive.append(pdfBuffer, { name: `dossier-${complaint.protocol}.pdf` });
    }

    // Adicionar README
    const readme = this.generateReadmeContent(complaint, data);
    archive.append(readme, { name: 'README.txt' });

    // Adicionar anexos
    if (options.includeAttachments && data.attachments.length > 0) {
      for (const attachment of data.attachments) {
        try {
          const fileBuffer = await this.s3Service.downloadFile(attachment.s3Key);
          archive.append(fileBuffer, { name: `anexos/${attachment.filename}` });
        } catch (error) {
          this.logger.error('Erro ao baixar anexo para ZIP', error.stack, 'DossiersService', {
            attachmentId: attachment.id,
            error: error.message,
          });
        }
      }
    }

    archive.finalize();

    // Aguardar conclusão
    await new Promise<void>((resolve, reject) => {
      archive.on('end', () => resolve());
      archive.on('error', (err) => reject(err));
    });

    const zipBuffer = Buffer.concat(chunks);

    // Upload para S3
    const uploadResult = await this.s3Service.uploadFile(
      {
        buffer: zipBuffer,
        originalname: `dossier-${complaint.protocol}.zip`,
        mimetype: 'application/zip',
        size: zipBuffer.length,
      } as any,
      'dossiers',
    );

    return uploadResult.key;
  }

  private generateReadmeContent(complaint: any, data: any): string {
    return `
╔════════════════════════════════════════════════════════════════╗
║           DOSSIÊ DE INVESTIGAÇÃO - CANAL DE DENÚNCIAS         ║
╚════════════════════════════════════════════════════════════════╝

PROTOCOLO: ${complaint.protocol}
TÍTULO: ${complaint.title}
TIPO: ${this.translateComplaintType(complaint.type)}
STATUS: ${this.translateStatus(complaint.status)}
DATA: ${new Date(complaint.createdAt).toLocaleString('pt-BR')}

────────────────────────────────────────────────────────────────

CONTEÚDO DESTE ARQUIVO:

1. dossier-${complaint.protocol}.pdf
   → Relatório completo em PDF

2. anexos/
   → Todas as evidências e documentos anexados
   → Total: ${data.attachments.length} arquivo(s)

────────────────────────────────────────────────────────────────

DESCRIÇÃO:
${complaint.description}

────────────────────────────────────────────────────────────────

⚠️ AVISO DE CONFIDENCIALIDADE:

Este dossiê contém informações confidenciais e sensíveis.
A divulgação, cópia ou uso não autorizado é estritamente proibido.

Gerado em: ${new Date().toLocaleString('pt-BR')}
Sistema: Canal de Denúncias Corporativo v1.2.0

════════════════════════════════════════════════════════════════
`.trim();
  }

  // ============================================
  // MÉTODOS PRIVADOS - HELPERS
  // ============================================

  private async getComplaintFullData(complaintId: string) {
    const [complaint, attachments, statusHistory, auditLogs] = await Promise.all([
      this.prisma.complaint.findUnique({
        where: { id: complaintId },
        include: {
          investigator: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      }),
      this.prisma.attachment.findMany({
        where: {
          complaintId,
          deletedAt: null,
        },
        orderBy: { uploadedAt: 'asc' },
      }),
      this.prisma.complaintStatusHistory.findMany({
        where: { complaintId },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.auditLog.findMany({
        where: {
          resource: 'complaint',
          resourceId: complaintId,
        },
        include: {
          user: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: 50,
      }),
    ]);

    return {
      complaint,
      attachments,
      statusHistory,
      auditLogs,
      investigator: complaint?.investigator,
    };
  }

  private generateSummaryText(complaint: any, data: any): string {
    return `
Dossiê gerado para denúncia ${complaint.protocol}.
Tipo: ${this.translateComplaintType(complaint.type)}.
Status atual: ${this.translateStatus(complaint.status)}.
Total de anexos: ${data.attachments.length}.
Total de alterações de status: ${data.statusHistory.length}.
    `.trim();
  }

  private translateComplaintType(type: string): string {
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
  }

  private translateStatus(status: string): string {
    const translations: Record<string, string> = {
      PENDING: 'Pendente',
      IN_PROGRESS: 'Em Progresso',
      UNDER_REVIEW: 'Em Análise',
      RESOLVED: 'Resolvida',
      DISMISSED: 'Arquivada',
      ESCALATED: 'Escalada',
    };
    return translations[status] || status;
  }

  private translatePriority(priority: string): string {
    const translations: Record<string, string> = {
      LOW: 'Baixa',
      MEDIUM: 'Média',
      HIGH: 'Alta',
      CRITICAL: 'Crítica',
    };
    return translations[priority] || priority;
  }
}
