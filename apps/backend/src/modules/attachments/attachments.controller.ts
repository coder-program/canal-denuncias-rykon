import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Attachments')
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  /**
   * Upload de anexo para uma denúncia
   */
  @Post('complaint/:complaintId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.REPORTER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload de anexo para denúncia',
    description: 'Faz upload de um arquivo (evidência) para uma denúncia específica',
  })
  @ApiParam({
    name: 'complaintId',
    description: 'ID da denúncia',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo a ser enviado (max 25MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Anexo enviado com sucesso',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        complaintId: '987e6543-e21b-34d5-a678-426614174000',
        filename: 'evidencia.pdf',
        mimeType: 'application/pdf',
        size: 245678,
        s3Key: 'complaints/987e6543/1697284800000-abc123def456.pdf',
        sha256Hash: 'abc123...',
        uploadedAt: '2024-10-14T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @ApiResponse({ status: 404, description: 'Denúncia não encontrada' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @HttpCode(HttpStatus.CREATED)
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('complaintId') complaintId: string,
    @Request() req: any,
  ) {
    console.log('=== UPLOAD ENDPOINT CALLED ===');
    console.log('File received:', file ? `${file.originalname} (${file.size} bytes)` : 'NO FILE');
    console.log('ComplaintId:', complaintId);
    console.log('Request User:', JSON.stringify(req.user));
    console.log('User ID:', req.user?.id);
    console.log('User Role:', req.user?.role);
    
    if (!file) {
      console.error('No file in request');
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }
    
    // O JwtStrategy retorna o objeto user completo, não o payload
    // Então acessamos req.user.id, não req.user.sub
    return this.attachmentsService.uploadAttachment(
      file,
      complaintId,
      req.user.id,
      req.user.role,
    );
  }

  /**
   * Listar anexos de uma denúncia
   */
  @Get('complaint/:complaintId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.REPORTER, UserRole.AUDITOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar anexos de denúncia',
    description: 'Lista todos os anexos de uma denúncia específica',
  })
  @ApiParam({
    name: 'complaintId',
    description: 'ID da denúncia',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de anexos',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          filename: 'evidencia.pdf',
          mimeType: 'application/pdf',
          size: 245678,
          uploadedAt: '2024-10-14T10:30:00Z',
          uploader: {
            id: 'user-123',
            email: 'user@example.com',
            fullName: 'João Silva',
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Denúncia não encontrada' })
  async findAllByComplaint(@Param('complaintId') complaintId: string, @Request() req: any) {
    return this.attachmentsService.findAllByComplaint(
      complaintId,
      req.user.id,
      req.user.role,
    );
  }

  /**
   * Estatísticas de anexos
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Estatísticas de anexos',
    description: 'Retorna estatísticas agregadas sobre anexos',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas de anexos',
    schema: {
      example: {
        total: 150,
        totalSize: 125829120,
        totalSizeMB: '120.00',
        byMimeType: [
          {
            mimeType: 'application/pdf',
            count: 80,
            size: 80000000,
            sizeMB: '76.29',
          },
          {
            mimeType: 'image/jpeg',
            count: 50,
            size: 30000000,
            sizeMB: '28.61',
          },
        ],
      },
    },
  })
  async getStats() {
    return this.attachmentsService.getStats();
  }

  /**
   * Ver detalhes de um anexo
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.REPORTER, UserRole.AUDITOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ver detalhes de anexo',
    description: 'Retorna informações completas sobre um anexo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do anexo',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do anexo',
  })
  @ApiResponse({ status: 404, description: 'Anexo não encontrado' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.attachmentsService.findOne(id, req.user.id, req.user.role);
  }

  /**
   * Gerar URL de download
   */
  @Get(':id/download')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.REPORTER, UserRole.AUDITOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Gerar URL de download',
    description: 'Gera URL pré-assinada para download seguro do anexo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do anexo',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'expiresIn',
    description: 'Tempo de expiração em segundos (padrão: 3600 = 1 hora)',
    required: false,
    example: 3600,
  })
  @ApiResponse({
    status: 200,
    description: 'URL de download gerada',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        filename: 'evidencia.pdf',
        downloadUrl: 'https://s3.amazonaws.com/bucket/...',
        expiresIn: 3600,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Anexo não encontrado' })
  async getDownloadUrl(
    @Param('id') id: string,
    @Query('expiresIn', new ParseIntPipe({ optional: true })) expiresIn: number = 3600,
    @Request() req: any,
  ) {
    return this.attachmentsService.getDownloadUrl(id, req.user.id, req.user.role, expiresIn);
  }

  /**
   * Verificar integridade do anexo
   */
  @Get(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verificar integridade',
    description: 'Verifica se o arquivo não foi adulterado comparando hashes SHA-256',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do anexo',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado da verificação',
    schema: {
      example: {
        attachmentId: '123e4567-e89b-12d3-a456-426614174000',
        filename: 'evidencia.pdf',
        isValid: true,
        storedHash: 'abc123...',
        currentHash: 'abc123...',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Anexo não encontrado' })
  async verifyIntegrity(@Param('id') id: string, @Request() req: any) {
    return this.attachmentsService.verifyIntegrity(id, req.user.id, req.user.role);
  }

  /**
   * Deletar anexo
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.REPORTER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deletar anexo',
    description: 'Remove um anexo (soft delete). Apenas ADMIN ou o próprio uploader podem deletar',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do anexo',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Anexo deletado',
    schema: {
      example: {
        message: 'Anexo deletado com sucesso',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Anexo não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.attachmentsService.remove(id, req.user.id, req.user.role);
  }
}
