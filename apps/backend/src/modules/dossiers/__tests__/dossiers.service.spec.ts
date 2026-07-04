import { Test, TestingModule } from '@nestjs/testing';
import { DossiersService } from '../dossiers.service';
import { PrismaService } from '@shared/prisma/prisma.service';
import { S3Service } from '@shared/s3/s3.service';
import { LoggerService } from '@shared/logger/logger.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('DossiersService', () => {
  let service: DossiersService;
  let prismaService: jest.Mocked<PrismaService>;
  let s3Service: jest.Mocked<S3Service>;
  let loggerService: jest.Mocked<LoggerService>;

  const mockComplaint = {
    id: 'complaint-123',
    protocol: 'DEN-2024-001',
    title: 'Assédio Moral',
    description: 'Descrição detalhada da denúncia',
    type: 'HARASSMENT',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    location: 'Departamento de TI',
    incidentDate: new Date('2024-01-15'),
    isAnonymous: false,
    createdBy: 'user-reporter-123',
    createdAt: new Date('2024-01-20'),
  };

  const mockDossier = {
    id: 'dossier-123',
    complaintId: 'complaint-123',
    title: 'Dossiê - DEN-2024-001',
    summary: 'Dossiê completo da denúncia',
    generatedBy: 'user-admin-123',
    s3PdfKey: 'dossiers/dossier-123.pdf',
    s3ZipKey: 'dossiers/dossier-123.zip',
    generatedAt: new Date(),
    complaint: mockComplaint,
    createdBy: {
      id: 'user-admin-123',
      email: 'admin@example.com',
      fullName: 'Admin User',
      role: UserRole.ADMIN,
    },
  };

  const mockAttachments = [
    {
      id: 'attachment-1',
      filename: 'evidence1.pdf',
      mimeType: 'application/pdf',
      size: 102400,
      s3Key: 'attachments/evidence1.pdf',
      uploadedAt: new Date(),
      deletedAt: null,
    },
    {
      id: 'attachment-2',
      filename: 'photo.jpg',
      mimeType: 'image/jpeg',
      size: 204800,
      s3Key: 'attachments/photo.jpg',
      uploadedAt: new Date(),
      deletedAt: null,
    },
  ];

  const mockStatusHistory = [
    {
      id: 'history-1',
      complaintId: 'complaint-123',
      oldStatus: 'PENDING',
      newStatus: 'IN_PROGRESS',
      reason: 'Investigação iniciada',
      createdAt: new Date('2024-01-21'),
    },
  ];

  beforeEach(async () => {
    const mockPrismaService = {
      complaint: {
        findUnique: jest.fn(),
      },
      dossier: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      attachment: {
        findMany: jest.fn(),
      },
      complaintStatusHistory: {
        findMany: jest.fn(),
      },
      auditLog: {
        findMany: jest.fn(),
      },
    };

    const mockS3Service = {
      uploadFile: jest.fn(),
      downloadFile: jest.fn(),
      deleteFile: jest.fn(),
      getPresignedDownloadUrl: jest.fn(),
    };

    const mockLoggerService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DossiersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<DossiersService>(DossiersService);
    prismaService = module.get(PrismaService);
    s3Service = module.get(S3Service);
    loggerService = module.get(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateDossier()', () => {
    const userId = 'user-admin-123';
    const userRole = UserRole.ADMIN;

    beforeEach(() => {
      prismaService.complaint.findUnique.mockResolvedValue(mockComplaint as any);
      prismaService.attachment.findMany.mockResolvedValue(mockAttachments as any);
      prismaService.complaintStatusHistory.findMany.mockResolvedValue(mockStatusHistory as any);
      prismaService.auditLog.findMany.mockResolvedValue([]);
      prismaService.dossier.create.mockResolvedValue(mockDossier as any);

      s3Service.uploadFile.mockResolvedValue({
        key: 'dossiers/test.pdf',
        bucket: 'test-bucket',
        location: 'https://s3.amazonaws.com/test',
        etag: 'abc123',
        size: 1024,
      });

      s3Service.downloadFile.mockResolvedValue(Buffer.from('PDF content'));
    });

    it('deve gerar dossiê completo com PDF e ZIP', async () => {
      const result = await service.generateDossier('complaint-123', userId, userRole, {
        format: 'both',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('dossier-123');
      expect(result.s3PdfKey).toBe('dossiers/dossier-123.pdf');
      expect(result.s3ZipKey).toBe('dossiers/dossier-123.zip');
      expect(prismaService.complaint.findUnique).toHaveBeenCalledWith({
        where: { id: 'complaint-123' },
      });
      expect(prismaService.dossier.create).toHaveBeenCalled();
    });

    it('deve gerar apenas PDF quando format=pdf', async () => {
      const result = await service.generateDossier('complaint-123', userId, userRole, {
        format: 'pdf',
      });

      expect(result.s3PdfKey).toBe('dossiers/dossier-123.pdf');
      expect(s3Service.uploadFile).toHaveBeenCalledTimes(1);
    });

    it('deve gerar apenas ZIP quando format=zip', async () => {
      const result = await service.generateDossier('complaint-123', userId, userRole, {
        format: 'zip',
      });

      expect(result.s3ZipKey).toBe('dossiers/dossier-123.zip');
      expect(s3Service.uploadFile).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException se denúncia não existe', async () => {
      prismaService.complaint.findUnique.mockResolvedValue(null);

      await expect(
        service.generateDossier('invalid-id', userId, userRole),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se REPORTER tentar acessar denúncia de outro', async () => {
      const reporterComplaint = { ...mockComplaint, createdBy: 'other-user' };
      prismaService.complaint.findUnique.mockResolvedValue(reporterComplaint as any);

      await expect(
        service.generateDossier('complaint-123', 'user-reporter', UserRole.REPORTER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve criar log de auditoria após gerar dossiê', async () => {
      await service.generateDossier('complaint-123', userId, userRole);

      expect(loggerService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CREATE',
          resource: 'dossier',
          userId,
        }),
      );
    });
  });

  describe('findAllByComplaint()', () => {
    it('deve retornar lista de dossiês da denúncia', async () => {
      prismaService.complaint.findUnique.mockResolvedValue(mockComplaint as any);
      prismaService.dossier.findMany.mockResolvedValue([mockDossier] as any);

      const result = await service.findAllByComplaint('complaint-123', 'user-admin-123', UserRole.ADMIN);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('dossier-123');
      expect(prismaService.dossier.findMany).toHaveBeenCalledWith({
        where: { complaintId: 'complaint-123' },
        orderBy: { generatedAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('deve lançar NotFoundException se denúncia não existe', async () => {
      prismaService.complaint.findUnique.mockResolvedValue(null);

      await expect(
        service.findAllByComplaint('invalid-id', 'user-123', UserRole.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se REPORTER tentar acessar denúncia de outro', async () => {
      const reporterComplaint = { ...mockComplaint, createdBy: 'other-user' };
      prismaService.complaint.findUnique.mockResolvedValue(reporterComplaint as any);

      await expect(
        service.findAllByComplaint('complaint-123', 'user-reporter', UserRole.REPORTER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOne()', () => {
    it('deve retornar dossiê com detalhes completos', async () => {
      prismaService.dossier.findUnique.mockResolvedValue(mockDossier as any);
      prismaService.complaint.findUnique.mockResolvedValue(mockComplaint as any);

      const result = await service.findOne('dossier-123', 'user-admin-123', UserRole.ADMIN);

      expect(result).toBeDefined();
      expect(result.id).toBe('dossier-123');
      expect(result.complaint).toBeDefined();
      expect(prismaService.dossier.findUnique).toHaveBeenCalledWith({
        where: { id: 'dossier-123' },
        include: expect.any(Object),
      });
    });

    it('deve lançar NotFoundException se dossiê não existe', async () => {
      prismaService.dossier.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('invalid-id', 'user-123', UserRole.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se REPORTER tentar acessar dossiê de outro', async () => {
      const reporterComplaint = { ...mockComplaint, createdBy: 'other-user' };
      const dossier = { ...mockDossier, complaint: reporterComplaint };
      prismaService.dossier.findUnique.mockResolvedValue(dossier as any);
      prismaService.complaint.findUnique.mockResolvedValue(reporterComplaint as any);

      await expect(
        service.findOne('dossier-123', 'user-reporter', UserRole.REPORTER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getDownloadUrlPDF()', () => {
    it('deve retornar URL de download do PDF', async () => {
      prismaService.dossier.findUnique.mockResolvedValue(mockDossier as any);
      prismaService.complaint.findUnique.mockResolvedValue(mockComplaint as any);
      s3Service.getPresignedDownloadUrl.mockResolvedValue('https://s3.amazonaws.com/presigned-url');

      const result = await service.getDownloadUrlPDF('dossier-123', 'user-admin-123', UserRole.ADMIN, 3600);

      expect(result.downloadUrl).toBe('https://s3.amazonaws.com/presigned-url');
      expect(result.filename).toBe('dossier-DEN-2024-001.pdf');
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(s3Service.getPresignedDownloadUrl).toHaveBeenCalledWith(
        'dossiers/dossier-123.pdf',
        3600,
      );
    });

    it('deve lançar BadRequestException se dossiê não tem PDF', async () => {
      const dossierWithoutPDF = { ...mockDossier, s3PdfKey: null };
      prismaService.dossier.findUnique.mockResolvedValue(dossierWithoutPDF as any);
      prismaService.complaint.findUnique.mockResolvedValue(mockComplaint as any);

      await expect(
        service.getDownloadUrlPDF('dossier-123', 'user-admin-123', UserRole.ADMIN),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve criar log de auditoria ao gerar URL de download', async () => {
      prismaService.dossier.findUnique.mockResolvedValue(mockDossier as any);
      prismaService.complaint.findUnique.mockResolvedValue(mockComplaint as any);
      s3Service.getPresignedDownloadUrl.mockResolvedValue('https://s3.amazonaws.com/presigned-url');

      await service.getDownloadUrlPDF('dossier-123', 'user-admin-123', UserRole.ADMIN);

      expect(loggerService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DOWNLOAD',
          resource: 'dossier',
          resourceId: 'dossier-123',
        }),
      );
    });
  });

  describe('getDownloadUrlZIP()', () => {
    it('deve retornar URL de download do ZIP', async () => {
      prismaService.dossier.findUnique.mockResolvedValue(mockDossier as any);
      prismaService.complaint.findUnique.mockResolvedValue(mockComplaint as any);
      s3Service.getPresignedDownloadUrl.mockResolvedValue('https://s3.amazonaws.com/presigned-zip');

      const result = await service.getDownloadUrlZIP('dossier-123', 'user-admin-123', UserRole.ADMIN, 3600);

      expect(result.downloadUrl).toBe('https://s3.amazonaws.com/presigned-zip');
      expect(result.filename).toBe('dossier-DEN-2024-001.zip');
      expect(s3Service.getPresignedDownloadUrl).toHaveBeenCalledWith(
        'dossiers/dossier-123.zip',
        3600,
      );
    });

    it('deve lançar BadRequestException se dossiê não tem ZIP', async () => {
      const dossierWithoutZIP = { ...mockDossier, s3ZipKey: null };
      prismaService.dossier.findUnique.mockResolvedValue(dossierWithoutZIP as any);
      prismaService.complaint.findUnique.mockResolvedValue(mockComplaint as any);

      await expect(
        service.getDownloadUrlZIP('dossier-123', 'user-admin-123', UserRole.ADMIN),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove()', () => {
    it('deve remover dossiê e arquivos do S3 (ADMIN)', async () => {
      prismaService.dossier.findUnique.mockResolvedValue(mockDossier as any);
      prismaService.complaint.findUnique.mockResolvedValue(mockComplaint as any);

      await service.remove('dossier-123', 'user-admin-123', UserRole.ADMIN);

      expect(s3Service.deleteFile).toHaveBeenCalledTimes(2);
      expect(s3Service.deleteFile).toHaveBeenCalledWith('dossiers/dossier-123.pdf');
      expect(s3Service.deleteFile).toHaveBeenCalledWith('dossiers/dossier-123.zip');
      expect(prismaService.dossier.delete).toHaveBeenCalledWith({
        where: { id: 'dossier-123' },
      });
    });

    it('deve lançar ForbiddenException se não for ADMIN', async () => {
      await expect(
        service.remove('dossier-123', 'user-auditor', UserRole.AUDITOR),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve criar log de auditoria após remover dossiê', async () => {
      prismaService.dossier.findUnique.mockResolvedValue(mockDossier as any);
      prismaService.complaint.findUnique.mockResolvedValue(mockComplaint as any);

      await service.remove('dossier-123', 'user-admin-123', UserRole.ADMIN);

      expect(loggerService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DELETE',
          resource: 'dossier',
          resourceId: 'dossier-123',
        }),
      );
    });
  });

  describe('getStats()', () => {
    it('deve retornar estatísticas de dossiês', async () => {
      prismaService.dossier.count.mockResolvedValue(42);
      prismaService.dossier.groupBy.mockResolvedValue([
        { generatedBy: 'user-1', _count: { id: 10 } },
        { generatedBy: 'user-2', _count: { id: 8 } },
      ] as any);
      prismaService.dossier.findMany.mockResolvedValue([mockDossier] as any);

      const result = await service.getStats();

      expect(result.totalDossiers).toBe(42);
      expect(result.topGenerators).toHaveLength(2);
      expect(result.recentDossiers).toHaveLength(1);
      expect(prismaService.dossier.count).toHaveBeenCalled();
      expect(prismaService.dossier.groupBy).toHaveBeenCalled();
    });
  });
});
