import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { QueryComplaintsDto } from './dto/query-complaints.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { RequestWithUser, OptionalAuthRequest } from '@shared/types/express-request.interface';

@ApiTags('Complaints')
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  /**
   * Criar nova denúncia (pública - não requer autenticação)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar nova denúncia',
    description: 'Endpoint público para criar denúncia anônima ou identificada',
  })
  @ApiResponse({
    status: 201,
    description: 'Denúncia criada com sucesso',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        protocol: 'DEN-2024-A1B2C3',
        status: 'PENDING',
        isAnonymous: false,
        type: 'HARASSMENT',
        priority: 'MEDIUM',
        title: 'Assédio moral no departamento',
        createdAt: '2024-10-14T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(
    @Body() createComplaintDto: CreateComplaintDto,
    @Request() req?: OptionalAuthRequest,
  ) {
    console.log('[ComplaintsController] POST /complaints called');
    console.log(
      '[ComplaintsController] Request body:',
      JSON.stringify(createComplaintDto, null, 2),
    );
    console.log('[ComplaintsController] User authenticated:', !!req?.user);
    console.log('[ComplaintsController] User ID:', req?.user?.id);

    // Aceita requisições autenticadas e não autenticadas
    // Se autenticado, passa o userId. Se não, passa undefined
    const userId = req?.user?.id;
    return this.complaintsService.create(createComplaintDto, userId);
  }

  /**
   * Listar denúncias com filtros
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.REPORTER, UserRole.AUDITOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar denúncias',
    description: 'Listar denúncias com paginação e filtros. REPORTER vê apenas suas denúncias.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de denúncias',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            protocol: 'DEN-2024-A1B2C3',
            status: 'PENDING',
            type: 'HARASSMENT',
            priority: 'MEDIUM',
            title: 'Assédio moral no departamento',
            createdAt: '2024-10-14T10:30:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 45,
          totalPages: 3,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async findAll(@Query() query: QueryComplaintsDto, @Request() req: RequestWithUser) {
    return this.complaintsService.findAll(query, req.user.role, req.user.id);
  }

  /**
   * Buscar denúncia por protocolo (público)
   */
  @Get('protocol/:protocol')
  @ApiOperation({
    summary: 'Buscar denúncia por protocolo',
    description: 'Endpoint público para acompanhamento de denúncia via protocolo',
  })
  @ApiParam({
    name: 'protocol',
    description: 'Protocolo da denúncia',
    example: 'DEN-2024-A1B2C3',
  })
  @ApiResponse({
    status: 200,
    description: 'Status da denúncia',
    schema: {
      example: {
        protocol: 'DEN-2024-A1B2C3',
        status: 'IN_PROGRESS',
        type: 'HARASSMENT',
        priority: 'MEDIUM',
        createdAt: '2024-10-14T10:30:00Z',
        updatedAt: '2024-10-15T14:20:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Protocolo não encontrado' })
  async findByProtocol(@Param('protocol') protocol: string) {
    return this.complaintsService.findByProtocol(protocol);
  }

  /**
   * Estatísticas de denúncias
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Estatísticas de denúncias',
    description: 'Dashboard com métricas agregadas',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas',
    schema: {
      example: {
        total: 150,
        byStatus: {
          pending: 25,
          inProgress: 40,
          resolved: 85,
        },
        byType: {
          HARASSMENT: 35,
          DISCRIMINATION: 20,
          FRAUD: 15,
        },
        byPriority: {
          LOW: 40,
          MEDIUM: 70,
          HIGH: 30,
          CRITICAL: 10,
        },
      },
    },
  })
  async getStats() {
    return this.complaintsService.getStats();
  }

  /**
   * Buscar denúncia por ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.REPORTER, UserRole.AUDITOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar denúncia por ID',
    description: 'Visualizar detalhes completos de uma denúncia',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da denúncia',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da denúncia',
  })
  @ApiResponse({ status: 404, description: 'Denúncia não encontrada' })
  @ApiResponse({ status: 403, description: 'Sem permissão para visualizar' })
  async findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.complaintsService.findOne(id, req.user.role, req.user.id);
  }

  /**
   * Atualizar denúncia (apenas ADMIN/INVESTIGATOR)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar denúncia',
    description: 'Atualizar dados de uma denúncia (apenas ADMIN/INVESTIGATOR)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da denúncia',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Denúncia atualizada' })
  @ApiResponse({ status: 404, description: 'Denúncia não encontrada' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async update(
    @Param('id') id: string,
    @Body() updateComplaintDto: UpdateComplaintDto,
    @Request() req: RequestWithUser,
  ) {
    return this.complaintsService.update(id, updateComplaintDto, req.user.id, req.user.role);
  }

  /**
   * Atribuir investigador
   */
  @Patch(':id/assign/:investigatorId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atribuir investigador',
    description: 'Atribuir um investigador a uma denúncia (apenas ADMIN)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da denúncia',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'investigatorId',
    description: 'ID do investigador',
    example: '987e6543-e21b-34d5-a678-123456789000',
  })
  @ApiResponse({ status: 200, description: 'Investigador atribuído' })
  @ApiResponse({ status: 404, description: 'Denúncia ou investigador não encontrado' })
  async assignInvestigator(
    @Param('id') id: string,
    @Param('investigatorId') investigatorId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.complaintsService.assignInvestigator(id, investigatorId, req.user.id);
  }

  /**
   * Alterar status da denúncia
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Alterar status da denúncia',
    description: 'Atualizar o status de uma denúncia com auditoria',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da denúncia',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Status atualizado' })
  @ApiResponse({ status: 404, description: 'Denúncia não encontrada' })
  async changeStatus(
    @Param('id') id: string,
    @Body() changeStatusDto: ChangeStatusDto,
    @Request() req: RequestWithUser,
  ) {
    return this.complaintsService.changeStatus(
      id,
      changeStatusDto.status,
      changeStatusDto.reason,
      req.user.id,
    );
  }

  /**
   * Deletar denúncia (soft delete - apenas ADMIN)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deletar denúncia',
    description: 'Arquivar uma denúncia (soft delete - apenas ADMIN)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da denúncia',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Denúncia arquivada' })
  @ApiResponse({ status: 404, description: 'Denúncia não encontrada' })
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.complaintsService.remove(id, req.user.id);
  }

  /**
   * Adicionar comentário a uma denúncia
   */
  @Post(':id/comments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Adicionar comentário',
    description: 'Adicionar comentário de investigação a uma denúncia',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da denúncia',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 201, description: 'Comentário adicionado' })
  @ApiResponse({ status: 404, description: 'Denúncia não encontrada' })
  async addComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: RequestWithUser,
  ) {
    return this.complaintsService.addComment(id, createCommentDto.content, req.user.id);
  }

  /**
   * Listar comentários de uma denúncia
   */
  @Get(':id/comments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.REPORTER, UserRole.AUDITOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar comentários',
    description: 'Obter todos os comentários de uma denúncia',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da denúncia',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Lista de comentários' })
  @ApiResponse({ status: 404, description: 'Denúncia não encontrada' })
  async getComments(@Param('id') id: string) {
    return this.complaintsService.getComments(id);
  }
}
