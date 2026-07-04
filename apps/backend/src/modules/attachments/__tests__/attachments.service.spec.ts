import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentsService } from '../attachments.service';
import { PrismaService } from '@shared/prisma/prisma.service';
import { S3Service } from '@shared/s3/s3.service';
import { LoggerService } from '@shared/logger/logger.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('AttachmentsService', () => {
  let service: AttachmentsService;
  let prismaService: PrismaService;
  let s3Service: S3Service;
  let loggerService: LoggerService;

  const mockPrismaService = {
    complaint: {
      findUnique: jest.fn(),
    },
    attachment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  const mockS3Service = {
    uploadFile: jest.fn(),
    getPresignedDownloadUrl: jest.fn(),
    deleteFile: jest.fn(),
    validateFile: jest.fn(),
    downloadFile: jest.fn(),
    calculateSHA256: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  const mockComplaint = {
    id: 'complaint-123',
    protocol: 'DEN-2024-001234',
    title: 'Test Complaint',
    createdBy: 'user-123',
    investigatorId: 'investigator-456',
  };

  const mockAttachment = {
    id: 'attachment-123',
    complaintId: 'complaint-123',
    filename: 'evidence.pdf',
    mimeType: 'application/pdf',
    size: 1024000,
    s3Key: 'complaints/attachment-123-evidence.pdf',
    s3Bucket: 'canal-denuncia-attachments',
    sha256Hash: 'abc123def456',
    uploadedBy: 'user-123',
    uploadedAt: new Date(),
    deletedAt: null,
    deletedBy: null,
  };

  const mockFile = {
    fieldname: 'file',
    originalname: 'evidence.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('fake pdf content'),
    size: 1024000,
  } as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentsService,
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

    service = module.get<AttachmentsService>(AttachmentsService);
    prismaService = module.get<PrismaService>(PrismaService);
    s3Service = module.get<S3Service>(S3Service);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadAttachment', () => {
    it('should upload attachment successfully as ADMIN', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(mockComplaint);
      mockS3Service.validateFile.mockResolvedValue(undefined);
      mockS3Service.uploadFile.mockResolvedValue({
        key: 'complaints/attachment-123-evidence.pdf',
        bucket: 'canal-denuncia-attachments',
        sha256Hash: 'abc123def456',
      });
      mockPrismaService.attachment.create.mockResolvedValue({
        ...mockAttachment,
        complaint: mockComplaint,
        uploader: { id: 'admin-789', email: 'admin@test.com', fullName: 'Admin User' },
      });

      const result = await service.uploadAttachment(
        mockFile,
        'complaint-123',
        'admin-789',
        UserRole.ADMIN,
      );

      expect(result).toBeDefined();
      expect(result.filename).toBe('evidence.pdf');
      expect(mockS3Service.validateFile).toHaveBeenCalledWith(mockFile);
      expect(mockS3Service.uploadFile).toHaveBeenCalledWith(mockFile, 'complaints');
      expect(mockPrismaService.attachment.create).toHaveBeenCalled();
      expect(mockLoggerService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if complaint does not exist', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(null);

      await expect(
        service.uploadAttachment(mockFile, 'invalid-id', 'user-123', UserRole.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if REPORTER tries to upload to other complaint', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue({
        ...mockComplaint,
        createdBy: 'other-user',
      });

      await expect(
        service.uploadAttachment(mockFile, 'complaint-123', 'user-123', UserRole.REPORTER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow REPORTER to upload to own complaint', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue({
        ...mockComplaint,
        createdBy: 'user-123',
      });
      mockS3Service.validateFile.mockResolvedValue(undefined);
      mockS3Service.uploadFile.mockResolvedValue({
        key: 'complaints/attachment-123-evidence.pdf',
        bucket: 'canal-denuncia-attachments',
        sha256Hash: 'abc123def456',
      });
      mockPrismaService.attachment.create.mockResolvedValue({
        ...mockAttachment,
        complaint: mockComplaint,
        uploader: { id: 'user-123', email: 'user@test.com', fullName: 'User' },
      });

      const result = await service.uploadAttachment(
        mockFile,
        'complaint-123',
        'user-123',
        UserRole.REPORTER,
      );

      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if file validation fails', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(mockComplaint);
      mockS3Service.validateFile.mockRejectedValue(
        new BadRequestException('Tipo de arquivo não permitido'),
      );

      await expect(
        service.uploadAttachment(mockFile, 'complaint-123', 'user-123', UserRole.ADMIN),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllByComplaint', () => {
    it('should list attachments for ADMIN', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(mockComplaint);
      mockPrismaService.attachment.findMany.mockResolvedValue([mockAttachment]);

      const result = await service.findAllByComplaint(
        'complaint-123',
        'admin-789',
        UserRole.ADMIN,
      );

      expect(result).toHaveLength(1);
      expect(result[0].filename).toBe('evidence.pdf');
    });

    it('should throw ForbiddenException if REPORTER tries to access other complaint', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue({
        ...mockComplaint,
        createdBy: 'other-user',
      });

      await expect(
        service.findAllByComplaint('complaint-123', 'user-123', UserRole.REPORTER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should filter out deleted attachments', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(mockComplaint);
      mockPrismaService.attachment.findMany.mockResolvedValue([
        mockAttachment,
        { ...mockAttachment, id: 'attachment-456', deletedAt: new Date() },
      ]);

      const result = await service.findAllByComplaint(
        'complaint-123',
        'admin-789',
        UserRole.ADMIN,
      );

      expect(mockPrismaService.attachment.findMany).toHaveBeenCalledWith({
        where: {
          complaintId: 'complaint-123',
          deletedAt: null,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return attachment details for ADMIN', async () => {
      mockPrismaService.attachment.findUnique.mockResolvedValue({
        ...mockAttachment,
        complaint: mockComplaint,
        uploader: { id: 'user-123', email: 'user@test.com', fullName: 'User' },
      });

      const result = await service.findOne('attachment-123', 'admin-789', UserRole.ADMIN);

      expect(result).toBeDefined();
      expect(result.filename).toBe('evidence.pdf');
      expect(result.complaint).toBeDefined();
    });

    it('should throw NotFoundException if attachment not found', async () => {
      mockPrismaService.attachment.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', 'admin-789', UserRole.ADMIN)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if REPORTER tries to access other attachment', async () => {
      mockPrismaService.attachment.findUnique.mockResolvedValue({
        ...mockAttachment,
        complaint: { ...mockComplaint, createdBy: 'other-user' },
      });

      await expect(service.findOne('attachment-123', 'user-123', UserRole.REPORTER)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getDownloadUrl', () => {
    it('should generate presigned URL successfully', async () => {
      mockPrismaService.attachment.findUnique.mockResolvedValue({
        ...mockAttachment,
        complaint: mockComplaint,
      });
      mockS3Service.getPresignedDownloadUrl.mockResolvedValue('https://s3.aws.com/presigned-url');

      const result = await service.getDownloadUrl('attachment-123', 'admin-789', UserRole.ADMIN);

      expect(result.downloadUrl).toBe('https://s3.aws.com/presigned-url');
      expect(result.expiresAt).toBeDefined();
      expect(mockS3Service.getPresignedDownloadUrl).toHaveBeenCalledWith(
        'complaints/attachment-123-evidence.pdf',
        3600,
      );
      expect(mockLoggerService.log).toHaveBeenCalled();
    });

    it('should use custom expiration time', async () => {
      mockPrismaService.attachment.findUnique.mockResolvedValue({
        ...mockAttachment,
        complaint: mockComplaint,
      });
      mockS3Service.getPresignedDownloadUrl.mockResolvedValue('https://s3.aws.com/presigned-url');

      await service.getDownloadUrl('attachment-123', 'admin-789', UserRole.ADMIN, 7200);

      expect(mockS3Service.getPresignedDownloadUrl).toHaveBeenCalledWith(
        'complaints/attachment-123-evidence.pdf',
        7200,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete attachment as ADMIN', async () => {
      mockPrismaService.attachment.findUnique.mockResolvedValue({
        ...mockAttachment,
        complaint: mockComplaint,
      });
      mockPrismaService.attachment.update.mockResolvedValue({
        ...mockAttachment,
        deletedAt: new Date(),
        deletedBy: 'admin-789',
      });
      mockS3Service.deleteFile.mockResolvedValue(undefined);

      await service.remove('attachment-123', 'admin-789', UserRole.ADMIN);

      expect(mockPrismaService.attachment.update).toHaveBeenCalledWith({
        where: { id: 'attachment-123' },
        data: {
          deletedAt: expect.any(Date),
          deletedBy: 'admin-789',
        },
      });
      expect(mockS3Service.deleteFile).toHaveBeenCalledWith(
        'complaints/attachment-123-evidence.pdf',
      );
      expect(mockLoggerService.log).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if REPORTER tries to delete other attachment', async () => {
      mockPrismaService.attachment.findUnique.mockResolvedValue({
        ...mockAttachment,
        uploadedBy: 'other-user',
        complaint: mockComplaint,
      });

      await expect(
        service.remove('attachment-123', 'user-123', UserRole.REPORTER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow REPORTER to delete own attachment', async () => {
      mockPrismaService.attachment.findUnique.mockResolvedValue({
        ...mockAttachment,
        uploadedBy: 'user-123',
        complaint: { ...mockComplaint, createdBy: 'user-123' },
      });
      mockPrismaService.attachment.update.mockResolvedValue({
        ...mockAttachment,
        deletedAt: new Date(),
        deletedBy: 'user-123',
      });
      mockS3Service.deleteFile.mockResolvedValue(undefined);

      await service.remove('attachment-123', 'user-123', UserRole.REPORTER);

      expect(mockPrismaService.attachment.update).toHaveBeenCalled();
    });
  });

  describe('verifyIntegrity', () => {
    it('should verify integrity successfully when hashes match', async () => {
      mockPrismaService.attachment.findUnique.mockResolvedValue({
        ...mockAttachment,
        complaint: mockComplaint,
        sha256Hash: 'abc123def456',
      });
      mockS3Service.downloadFile.mockResolvedValue(Buffer.from('file content'));
      mockS3Service.calculateSHA256.mockReturnValue('abc123def456');

      const result = await service.verifyIntegrity('attachment-123', 'admin-789', UserRole.ADMIN);

      expect(result.isValid).toBe(true);
      expect(result.storedHash).toBe('abc123def456');
      expect(result.calculatedHash).toBe('abc123def456');
    });

    it('should detect integrity violation when hashes do not match', async () => {
      mockPrismaService.attachment.findUnique.mockResolvedValue({
        ...mockAttachment,
        complaint: mockComplaint,
        sha256Hash: 'abc123def456',
      });
      mockS3Service.downloadFile.mockResolvedValue(Buffer.from('tampered content'));
      mockS3Service.calculateSHA256.mockReturnValue('different-hash');

      const result = await service.verifyIntegrity('attachment-123', 'admin-789', UserRole.ADMIN);

      expect(result.isValid).toBe(false);
      expect(result.storedHash).toBe('abc123def456');
      expect(result.calculatedHash).toBe('different-hash');
    });

    it('should throw ForbiddenException if non-ADMIN/AUDITOR tries to verify', async () => {
      await expect(
        service.verifyIntegrity('attachment-123', 'user-123', UserRole.REPORTER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getStats', () => {
    it('should return attachment statistics', async () => {
      mockPrismaService.attachment.count.mockResolvedValue(100);
      mockPrismaService.attachment.aggregate.mockResolvedValue({
        _sum: { size: 1024000000 },
      });
      mockPrismaService.attachment.groupBy.mockResolvedValue([
        { mimeType: 'application/pdf', _count: { id: 50 }, _sum: { size: 512000000 } },
        { mimeType: 'image/jpeg', _count: { id: 30 }, _sum: { size: 307200000 } },
        { mimeType: 'image/png', _count: { id: 20 }, _sum: { size: 204800000 } },
      ]);

      const result = await service.getStats();

      expect(result.totalAttachments).toBe(100);
      expect(result.totalSizeBytes).toBe(1024000000);
      expect(result.totalSizeMB).toBeCloseTo(976.56);
      expect(result.totalSizeGB).toBeCloseTo(0.95);
      expect(result.byMimeType).toHaveLength(3);
      expect(result.byMimeType[0].mimeType).toBe('application/pdf');
      expect(result.byMimeType[0].count).toBe(50);
    });

    it('should handle zero attachments', async () => {
      mockPrismaService.attachment.count.mockResolvedValue(0);
      mockPrismaService.attachment.aggregate.mockResolvedValue({
        _sum: { size: null },
      });
      mockPrismaService.attachment.groupBy.mockResolvedValue([]);

      const result = await service.getStats();

      expect(result.totalAttachments).toBe(0);
      expect(result.totalSizeBytes).toBe(0);
      expect(result.byMimeType).toHaveLength(0);
    });
  });
});
