import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { RequestWithUser } from '@shared/types/express-request.interface';

@ApiTags('Comments')
@Controller('complaints/:complaintId/comments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * Criar novo comentário em uma denúncia
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.REPORTER)
  @ApiOperation({
    summary: 'Adicionar comentário',
    description:
      'Adiciona um novo comentário à denúncia. REPORTER só pode comentar nas próprias denúncias. AUDITOR não pode adicionar comentários.',
  })
  @ApiParam({ name: 'complaintId', description: 'ID da denúncia' })
  @ApiResponse({ status: 201, description: 'Comentário criado com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para comentar nesta denúncia' })
  @ApiResponse({ status: 404, description: 'Denúncia não encontrada' })
  async create(
    @Param('complaintId') complaintId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: RequestWithUser,
  ) {
    return this.commentsService.create(complaintId, createCommentDto, req.user.id, req.user.role);
  }

  /**
   * Listar todos os comentários de uma denúncia
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.AUDITOR, UserRole.REPORTER)
  @ApiOperation({
    summary: 'Listar comentários',
    description:
      'Lista todos os comentários de uma denúncia. REPORTER só vê comentários de suas próprias denúncias.',
  })
  @ApiParam({ name: 'complaintId', description: 'ID da denúncia' })
  @ApiResponse({ status: 200, description: 'Lista de comentários retornada com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para ver comentários desta denúncia' })
  @ApiResponse({ status: 404, description: 'Denúncia não encontrada' })
  async findAll(@Param('complaintId') complaintId: string, @Request() req: RequestWithUser) {
    return this.commentsService.findAllByComplaint(complaintId, req.user.id, req.user.role);
  }

  /**
   * Obter um comentário específico
   */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.AUDITOR, UserRole.REPORTER)
  @ApiOperation({ summary: 'Obter comentário por ID' })
  @ApiParam({ name: 'complaintId', description: 'ID da denúncia' })
  @ApiParam({ name: 'id', description: 'ID do comentário' })
  @ApiResponse({ status: 200, description: 'Comentário retornado com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para ver este comentário' })
  @ApiResponse({ status: 404, description: 'Comentário não encontrado' })
  async findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.commentsService.findOne(id, req.user.id, req.user.role);
  }

  /**
   * Atualizar comentário (apenas autor ou ADMIN)
   */
  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.REPORTER)
  @ApiOperation({
    summary: 'Atualizar comentário',
    description:
      'Atualiza um comentário. Apenas o autor ou ADMIN podem editar. AUDITOR não pode editar.',
  })
  @ApiParam({ name: 'complaintId', description: 'ID da denúncia' })
  @ApiParam({ name: 'id', description: 'ID do comentário' })
  @ApiResponse({ status: 200, description: 'Comentário atualizado com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para editar este comentário' })
  @ApiResponse({ status: 404, description: 'Comentário não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: RequestWithUser,
  ) {
    return this.commentsService.update(id, updateCommentDto, req.user.id, req.user.role);
  }

  /**
   * Deletar comentário (apenas autor ou ADMIN)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.REPORTER)
  @ApiOperation({
    summary: 'Deletar comentário',
    description:
      'Deleta um comentário. Apenas o autor ou ADMIN podem deletar. AUDITOR não pode deletar.',
  })
  @ApiParam({ name: 'complaintId', description: 'ID da denúncia' })
  @ApiParam({ name: 'id', description: 'ID do comentário' })
  @ApiResponse({ status: 204, description: 'Comentário deletado com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para deletar este comentário' })
  @ApiResponse({ status: 404, description: 'Comentário não encontrado' })
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.commentsService.remove(id, req.user.id, req.user.role);
  }
}
