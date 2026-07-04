import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
  size: number;
  sha256: string;
  contentType: string;
}

export interface PresignedUrlResult {
  url: string;
  expiresIn: number;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly localStoragePath: string;
  private readonly useLocalStorage: boolean;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET', 'canal-denuncia-attachments');
    this.localStoragePath = path.join(process.cwd(), 'uploads');
    
    // Verificar se deve usar armazenamento local (desenvolvimento)
    const awsAccessKey = this.configService.get<string>('AWS_ACCESS_KEY_ID', '');
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    this.useLocalStorage = nodeEnv === 'development' && 
      (awsAccessKey === 'test' || awsAccessKey === 'your-aws-access-key' || !awsAccessKey);

    if (this.useLocalStorage) {
      this.logger.warn('Using LOCAL STORAGE for file uploads (development mode)');
      // Criar diretório de uploads se não existir
      if (!fs.existsSync(this.localStoragePath)) {
        fs.mkdirSync(this.localStoragePath, { recursive: true });
        this.logger.log(`Created local storage directory: ${this.localStoragePath}`);
      }
    } else {
      // Configurar cliente S3
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: awsAccessKey,
          secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
        },
        // Para desenvolvimento local com LocalStack
        ...(this.configService.get<string>('AWS_ENDPOINT') && {
          endpoint: this.configService.get<string>('AWS_ENDPOINT'),
          forcePathStyle: true,
        }),
      });
      this.logger.log(`S3Service initialized - Bucket: ${this.bucket}, Region: ${this.region}`);
    }
  }

  /**
   * Upload de arquivo para S3 ou armazenamento local
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'attachments',
  ): Promise<UploadResult> {
    try {
      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(8).toString('hex');
      const extension = file.originalname.split('.').pop();
      const key = `${folder}/${timestamp}-${randomString}.${extension}`;

      // Calcular hash SHA-256
      const sha256 = this.calculateSHA256(file.buffer);

      // Usar armazenamento local em desenvolvimento
      if (this.useLocalStorage) {
        const filePath = path.join(this.localStoragePath, key);
        const fileDir = path.dirname(filePath);
        
        // Criar diretório se não existir
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }
        
        // Salvar arquivo localmente
        fs.writeFileSync(filePath, file.buffer);
        
        this.logger.log(`File saved locally: ${key}`);
        
        return {
          key,
          url: `/uploads/${key}`,
          bucket: 'local-storage',
          size: file.size,
          sha256,
          contentType: file.mimetype,
        };
      }

      // Fazer upload para S3
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          sha256,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      this.logger.log(`File uploaded successfully: ${key}`);

      return {
        key,
        url: this.getPublicUrl(key),
        bucket: this.bucket,
        size: file.size,
        sha256,
        contentType: file.mimetype,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  /**
   * Gerar URL pré-assinada para download ou retornar caminho local
   */
  async getPresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<PresignedUrlResult> {
    try {
      // Se usar armazenamento local, retornar caminho local
      if (this.useLocalStorage) {
        return {
          url: `/api/v1/attachments/local/${key}`,
          expiresIn: 0, // Sem expiração para arquivos locais
        };
      }

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });

      this.logger.log(`Generated presigned URL for: ${key} (expires in ${expiresIn}s)`);

      return {
        url,
        expiresIn,
      };
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate download URL');
    }
  }

  /**
   * Obter arquivo como buffer (para armazenamento local)
   */
  async getFileBuffer(key: string): Promise<Buffer> {
    try {
      if (this.useLocalStorage) {
        const filePath = path.join(this.localStoragePath, key);
        if (!fs.existsSync(filePath)) {
          throw new NotFoundException('File not found in local storage');
        }
        return fs.readFileSync(filePath);
      }

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const stream = response.Body as Readable;
      
      return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    } catch (error) {
      this.logger.error(`Failed to get file buffer: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve file');
    }
  }

  /**
   * Gerar URL pré-assinada para upload direto
   */
  async getPresignedUploadUrl(
    filename: string,
    contentType: string,
    folder: string = 'attachments',
    expiresIn: number = 3600,
  ): Promise<PresignedUrlResult> {
    try {
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(8).toString('hex');
      const extension = filename.split('.').pop();
      const key = `${folder}/${timestamp}-${randomString}.${extension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });

      this.logger.log(`Generated presigned upload URL for: ${key} (expires in ${expiresIn}s)`);

      return {
        url,
        expiresIn,
      };
    } catch (error) {
      this.logger.error(`Failed to generate presigned upload URL: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate upload URL');
    }
  }

  /**
   * Deletar arquivo do S3 ou armazenamento local
   */
  async deleteFile(key: string): Promise<void> {
    try {
      // Deletar de armazenamento local
      if (this.useLocalStorage) {
        const filePath = path.join(this.localStoragePath, key);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          this.logger.log(`File deleted from local storage: ${key}`);
        }
        return;
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  /**
   * Verificar se arquivo existe
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Obter metadados do arquivo
   */
  async getFileMetadata(key: string): Promise<any> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        metadata: response.Metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to get file metadata: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get file metadata');
    }
  }

  /**
   * Calcular hash SHA-256
   */
  private calculateSHA256(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Gerar URL pública (apenas para referência, não funcional sem configuração)
   */
  private getPublicUrl(key: string): string {
    // Se usar CloudFront ou bucket público, retornar URL real
    const endpoint = this.configService.get<string>('AWS_ENDPOINT');
    if (endpoint) {
      // LocalStack ou MinIO
      return `${endpoint}/${this.bucket}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Baixar arquivo do S3 (útil para processar localmente)
   */
  async downloadFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      // Converter stream para buffer
      const stream = response.Body as Readable;
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    } catch (error) {
      this.logger.error(`Failed to download file: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to download file from S3');
    }
  }

  /**
   * Copiar arquivo dentro do S3
   */
  async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      const copySource = `${this.bucket}/${sourceKey}`;

      const command = new CopyObjectCommand({
        Bucket: this.bucket,
        Key: destinationKey,
        CopySource: copySource,
      });

      await this.s3Client.send(command);

      this.logger.log(`File copied from ${sourceKey} to ${destinationKey}`);
    } catch (error) {
      this.logger.error(`Failed to copy file: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to copy file');
    }
  }

  /**
   * Validar se arquivo é seguro (scan básico)
   */
  validateFile(file: Express.Multer.File): { valid: boolean; reason?: string } {
    const maxSize = this.configService.get<number>('MAX_FILE_SIZE', 25 * 1024 * 1024); // 25MB
    const allowedMimeTypes = this.configService.get<string>(
      'ALLOWED_MIME_TYPES',
      'image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip',
    ).split(',');

    // Validar tamanho
    if (file.size > maxSize) {
      return {
        valid: false,
        reason: `File size exceeds maximum allowed (${maxSize / 1024 / 1024}MB)`,
      };
    }

    // Validar tipo MIME
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        valid: false,
        reason: `File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
      };
    }

    // Validar extensão
    const extension = file.originalname.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'zip'];

    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        reason: `File extension not allowed. Allowed: ${allowedExtensions.join(', ')}`,
      };
    }

    return { valid: true };
  }
}
