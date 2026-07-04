import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DossiersService } from './dossiers.service';
import { GenerateDossierDto } from './dto/generate-dossier.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

@ApiTags('Dossiers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dossiers')
export class DossiersController {
  constructor(private readonly dossiersService: DossiersService) {}

  @Post('complaint/:complaintId/generate')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR, UserRole.INVESTIGATOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Gera dossiê completo de uma denúncia',
    description:
      'Gera um dossiê em PDF e/ou ZIP contendo todas as informações e evidências da denúncia. Apenas ADMIN, COMMITTEE e INVESTIGATOR podem gerar dossiês.',
  })
  @ApiParam({
    name: 'complaintId',
    description: 'ID da denúncia',
    example: 'cm1a2b3c4d5e6f7g8h9i0j1k',
  })
  @ApiResponse({
    status: 201,
    description: 'Dossiê gerado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'cm1a2b3c4d5e6f7g8h9i0j1k' },
        complaintId: { type: 'string' },
        title: { type: 'string', example: 'Dossiê - DEN-2024-001' },
        summary: { type: 'string' },
        generatedBy: { type: 'string' },
        s3PdfKey: { type: 'string', nullable: true },
        s3ZipKey: { type: 'string', nullable: true },
        generatedAt: { type: 'string', format: 'date-time' },
        complaint: { type: 'object' },
        createdBy: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Denúncia não encontrada' })
  async generate(
    @Param('complaintId') complaintId: string,
    @Body() generateDossierDto: GenerateDossierDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.dossiersService.generateDossier(
      complaintId,
      user.id,
      user.role,
      generateDossierDto,
    );
  }

  @Get('complaint/:complaintId')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR, UserRole.INVESTIGATOR, UserRole.REPORTER)
  @ApiOperation({
    summary: 'Lista todos os dossiês de uma denúncia',
    description: 'Retorna todos os dossiês gerados para uma denúncia específica.',
  })
  @ApiParam({
    name: 'complaintId',
    description: 'ID da denúncia',
    example: 'cm1a2b3c4d5e6f7g8h9i0j1k',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de dossiês retornada com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          complaintId: { type: 'string' },
          title: { type: 'string' },
          generatedAt: { type: 'string', format: 'date-time' },
          createdBy: { type: 'object' },
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Denúncia não encontrada' })
  async findAllByComplaint(
    @Param('complaintId') complaintId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.dossiersService.findAllByComplaint(complaintId, user.id, user.role);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR, UserRole.INVESTIGATOR, UserRole.REPORTER)
  @ApiOperation({
    summary: 'Obtém detalhes de um dossiê',
    description: 'Retorna informações completas sobre um dossiê específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do dossiê',
    example: 'cm1a2b3c4d5e6f7g8h9i0j1k',
  })
  @ApiResponse({
    status: 200,
    description: 'Dossiê encontrado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        complaintId: { type: 'string' },
        title: { type: 'string' },
        summary: { type: 'string' },
        s3PdfKey: { type: 'string', nullable: true },
        s3ZipKey: { type: 'string', nullable: true },
        generatedAt: { type: 'string', format: 'date-time' },
        complaint: { type: 'object' },
        createdBy: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Dossiê não encontrado' })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.dossiersService.findOne(id, user.id, user.role);
  }

  @Get(':id/download/pdf')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR, UserRole.INVESTIGATOR, UserRole.REPORTER)
  @ApiOperation({
    summary: 'Gera URL de download para PDF do dossiê',
    description:
      'Retorna uma URL pré-assinada para download do PDF do dossiê. A URL expira após o tempo especificado.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do dossiê',
    example: 'cm1a2b3c4d5e6f7g8h9i0j1k',
  })
  @ApiQuery({
    name: 'expiresIn',
    description: 'Tempo de expiração da URL em segundos',
    example: 3600,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'URL de download gerada',
    schema: {
      type: 'object',
      properties: {
        downloadUrl: { type: 'string' },
        expiresAt: { type: 'string', format: 'date-time' },
        filename: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'PDF não disponível' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Dossiê não encontrado' })
  async getDownloadUrlPDF(
    @Param('id') id: string,
    @Query('expiresIn') expiresIn: number = 3600,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.dossiersService.getDownloadUrlPDF(id, user.id, user.role, expiresIn);
  }

  @Get(':id/download/zip')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR, UserRole.INVESTIGATOR, UserRole.REPORTER)
  @ApiOperation({
    summary: 'Gera URL de download para ZIP do dossiê',
    description:
      'Retorna uma URL pré-assinada para download do ZIP do dossiê contendo PDF e anexos. A URL expira após o tempo especificado.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do dossiê',
    example: 'cm1a2b3c4d5e6f7g8h9i0j1k',
  })
  @ApiQuery({
    name: 'expiresIn',
    description: 'Tempo de expiração da URL em segundos',
    example: 3600,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'URL de download gerada',
    schema: {
      type: 'object',
      properties: {
        downloadUrl: { type: 'string' },
        expiresAt: { type: 'string', format: 'date-time' },
        filename: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'ZIP não disponível' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Dossiê não encontrado' })
  async getDownloadUrlZIP(
    @Param('id') id: string,
    @Query('expiresIn') expiresIn: number = 3600,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.dossiersService.getDownloadUrlZIP(id, user.id, user.role, expiresIn);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove um dossiê',
    description:
      'Deleta permanentemente um dossiê e seus arquivos do S3. Apenas ADMIN pode executar esta ação.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do dossiê',
    example: 'cm1a2b3c4d5e6f7g8h9i0j1k',
  })
  @ApiResponse({ status: 204, description: 'Dossiê removido com sucesso' })
  @ApiResponse({ status: 403, description: 'Apenas ADMIN pode deletar dossiês' })
  @ApiResponse({ status: 404, description: 'Dossiê não encontrado' })
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.dossiersService.remove(id, user.id, user.role);
  }

  @Get('stats/overview')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  @ApiOperation({
    summary: 'Obtém estatísticas de dossiês',
    description: 'Retorna métricas e estatísticas sobre a geração de dossiês no sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas',
    schema: {
      type: 'object',
      properties: {
        totalDossiers: { type: 'number' },
        topGenerators: { type: 'array' },
        recentDossiers: { type: 'array' },
      },
    },
  })
  async getStats() {
    return this.dossiersService.getStats();
  }
}
