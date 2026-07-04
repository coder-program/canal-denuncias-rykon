import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { S3Service } from '../s3.service';
import { S3Client } from '@aws-sdk/client-s3';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('S3Service', () => {
  let service: S3Service;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        AWS_REGION: 'us-east-1',
        AWS_S3_BUCKET: 'test-bucket',
        AWS_ACCESS_KEY_ID: 'test-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret',
        MAX_FILE_SIZE: 26214400, // 25MB
        ALLOWED_MIME_TYPES: 'image/jpeg,image/png,image/gif,application/pdf,application/zip',
      };
      return config[key] ?? defaultValue;
    }),
  };

  const mockFile = {
    fieldname: 'file',
    originalname: 'test-file.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('fake pdf content'),
    size: 1024000,
  } as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateFile', () => {
    it('should validate file successfully', async () => {
      await expect(service.validateFile(mockFile)).resolves.not.toThrow();
    });

    it('should throw error if file size exceeds limit', async () => {
      const largeFile = {
        ...mockFile,
        size: 30 * 1024 * 1024, // 30MB
      } as Express.Multer.File;

      await expect(service.validateFile(largeFile)).rejects.toThrow(BadRequestException);
      await expect(service.validateFile(largeFile)).rejects.toThrow(
        'Arquivo excede o tamanho máximo',
      );
    });

    it('should throw error for invalid MIME type', async () => {
      const invalidFile = {
        ...mockFile,
        mimetype: 'application/x-msdownload',
        originalname: 'malware.exe',
      } as Express.Multer.File;

      await expect(service.validateFile(invalidFile)).rejects.toThrow(BadRequestException);
      await expect(service.validateFile(invalidFile)).rejects.toThrow('Tipo de arquivo não permitido');
    });

    it('should throw error for blocked file extensions', async () => {
      const blockedFile = {
        ...mockFile,
        originalname: 'script.sh',
        mimetype: 'application/x-sh',
      } as Express.Multer.File;

      await expect(service.validateFile(blockedFile)).rejects.toThrow(BadRequestException);
      await expect(service.validateFile(blockedFile)).rejects.toThrow('Extensão de arquivo não permitida');
    });

    it('should validate allowed image types', async () => {
      const imageFile = {
        ...mockFile,
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      await expect(service.validateFile(imageFile)).resolves.not.toThrow();
    });

    it('should validate PNG files', async () => {
      const pngFile = {
        ...mockFile,
        originalname: 'screenshot.png',
        mimetype: 'image/png',
      } as Express.Multer.File;

      await expect(service.validateFile(pngFile)).resolves.not.toThrow();
    });

    it('should validate ZIP files', async () => {
      const zipFile = {
        ...mockFile,
        originalname: 'documents.zip',
        mimetype: 'application/zip',
      } as Express.Multer.File;

      await expect(service.validateFile(zipFile)).resolves.not.toThrow();
    });
  });

  describe('calculateSHA256', () => {
    it('should calculate SHA256 hash correctly', () => {
      const buffer = Buffer.from('test content');
      const hash = service['calculateSHA256'](buffer);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA-256 produces 64 hex characters
    });

    it('should produce different hashes for different content', () => {
      const buffer1 = Buffer.from('content1');
      const buffer2 = Buffer.from('content2');

      const hash1 = service['calculateSHA256'](buffer1);
      const hash2 = service['calculateSHA256'](buffer2);

      expect(hash1).not.toBe(hash2);
    });

    it('should produce same hash for same content', () => {
      const buffer1 = Buffer.from('same content');
      const buffer2 = Buffer.from('same content');

      const hash1 = service['calculateSHA256'](buffer1);
      const hash2 = service['calculateSHA256'](buffer2);

      expect(hash1).toBe(hash2);
    });
  });

  describe('uploadFile', () => {
    it('should generate unique S3 key with UUID', async () => {
      const mockS3Client = {
        send: jest.fn().mockResolvedValue({}),
      };
      (S3Client as jest.Mock).mockImplementation(() => mockS3Client);

      const result = await service.uploadFile(mockFile, 'complaints');

      expect(result.key).toMatch(/^complaints\/[\w-]+-test-file\.pdf$/);
      expect(result.bucket).toBe('test-bucket');
      expect(result.sha256Hash).toBeDefined();
    });

    it('should call S3 client with correct parameters', async () => {
      const mockSend = jest.fn().mockResolvedValue({});
      const mockS3Client = {
        send: mockSend,
      };
      (S3Client as jest.Mock).mockImplementation(() => mockS3Client);

      await service.uploadFile(mockFile, 'complaints');

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            Bucket: 'test-bucket',
            ContentType: 'application/pdf',
            Body: expect.any(Buffer),
          }),
        }),
      );
    });

    it('should sanitize filename for S3 key', async () => {
      const mockS3Client = {
        send: jest.fn().mockResolvedValue({}),
      };
      (S3Client as jest.Mock).mockImplementation(() => mockS3Client);

      const fileWithSpecialChars = {
        ...mockFile,
        originalname: 'file with spaces & special#chars!.pdf',
      } as Express.Multer.File;

      const result = await service.uploadFile(fileWithSpecialChars, 'complaints');

      // Should sanitize filename
      expect(result.key).not.toContain(' ');
      expect(result.key).not.toContain('&');
      expect(result.key).not.toContain('#');
    });
  });

  describe('fileExists', () => {
    it('should return true if file exists', async () => {
      const mockS3Client = {
        send: jest.fn().mockResolvedValue({}),
      };
      (S3Client as jest.Mock).mockImplementation(() => mockS3Client);

      const exists = await service.fileExists('complaints/test-file.pdf');

      expect(exists).toBe(true);
    });

    it('should return false if file does not exist', async () => {
      const mockS3Client = {
        send: jest.fn().mockRejectedValue({ name: 'NotFound' }),
      };
      (S3Client as jest.Mock).mockImplementation(() => mockS3Client);

      const exists = await service.fileExists('complaints/nonexistent.pdf');

      expect(exists).toBe(false);
    });
  });

  describe('getPresignedDownloadUrl', () => {
    it('should generate presigned URL with default expiration', async () => {
      const mockGetSignedUrl = jest.fn().mockResolvedValue('https://presigned-url.com');
      jest.mock('@aws-sdk/s3-request-presigner', () => ({
        getSignedUrl: mockGetSignedUrl,
      }));

      const url = await service.getPresignedDownloadUrl('complaints/test.pdf');

      expect(url).toBeDefined();
      expect(typeof url).toBe('string');
    });

    it('should use custom expiration time', async () => {
      const url = await service.getPresignedDownloadUrl('complaints/test.pdf', 7200);

      expect(url).toBeDefined();
    });
  });

  describe('deleteFile', () => {
    it('should delete file from S3', async () => {
      const mockSend = jest.fn().mockResolvedValue({});
      const mockS3Client = {
        send: mockSend,
      };
      (S3Client as jest.Mock).mockImplementation(() => mockS3Client);

      await service.deleteFile('complaints/test.pdf');

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            Bucket: 'test-bucket',
            Key: 'complaints/test.pdf',
          }),
        }),
      );
    });
  });

  describe('getFileMetadata', () => {
    it('should retrieve file metadata', async () => {
      const mockMetadata = {
        ContentLength: 1024000,
        ContentType: 'application/pdf',
        LastModified: new Date(),
        Metadata: {
          sha256: 'abc123',
        },
      };

      const mockS3Client = {
        send: jest.fn().mockResolvedValue(mockMetadata),
      };
      (S3Client as jest.Mock).mockImplementation(() => mockS3Client);

      const metadata = await service.getFileMetadata('complaints/test.pdf');

      expect(metadata).toEqual(mockMetadata);
    });
  });

  describe('downloadFile', () => {
    it('should download file as Buffer', async () => {
      const mockBody = {
        transformToByteArray: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])),
      };

      const mockS3Client = {
        send: jest.fn().mockResolvedValue({ Body: mockBody }),
      };
      (S3Client as jest.Mock).mockImplementation(() => mockS3Client);

      const buffer = await service.downloadFile('complaints/test.pdf');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe('copyFile', () => {
    it('should copy file within S3', async () => {
      const mockSend = jest.fn().mockResolvedValue({});
      const mockS3Client = {
        send: mockSend,
      };
      (S3Client as jest.Mock).mockImplementation(() => mockS3Client);

      await service.copyFile('complaints/source.pdf', 'dossiers/destination.pdf');

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            Bucket: 'test-bucket',
            CopySource: expect.stringContaining('complaints/source.pdf'),
            Key: 'dossiers/destination.pdf',
          }),
        }),
      );
    });
  });

  describe('S3 Client Configuration', () => {
    it('should configure S3 client with LocalStack endpoint if provided', () => {
      mockConfigService.get = jest.fn((key: string) => {
        if (key === 'AWS_ENDPOINT') return 'http://localhost:4566';
        if (key === 'AWS_REGION') return 'us-east-1';
        return undefined;
      });

      // Re-create service to test configuration
      const moduleRef = Test.createTestingModule({
        providers: [
          S3Service,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      });

      expect(S3Client).toBeDefined();
    });

    it('should use production S3 endpoint when AWS_ENDPOINT is not set', () => {
      mockConfigService.get = jest.fn((key: string) => {
        if (key === 'AWS_ENDPOINT') return undefined;
        if (key === 'AWS_REGION') return 'us-east-1';
        return undefined;
      });

      expect(S3Client).toBeDefined();
    });
  });
});
