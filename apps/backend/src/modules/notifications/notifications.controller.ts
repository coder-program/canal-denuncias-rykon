import { Controller, Get, Patch, Param, Request, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /notifications
   * Listar notificações do usuário
   */
  @Get()
  @ApiOperation({ summary: 'Listar notificações do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de notificações' })
  async findAll(@Request() req: any, @Query('isRead') isRead?: string) {
    const isReadFilter = isRead === 'true' ? true : isRead === 'false' ? false : undefined;
    return this.notificationsService.findAll(req.user.userId, isReadFilter);
  }

  /**
   * GET /notifications/unread-count
   * Contar notificações não lidas
   */
  @Get('unread-count')
  @ApiOperation({ summary: 'Contar notificações não lidas' })
  @ApiResponse({ status: 200, description: 'Número de notificações não lidas' })
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.userId);
    return { count };
  }

  /**
   * PATCH /notifications/:id/read
   * Marcar notificação como lida
   */
  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiResponse({ status: 200, description: 'Notificação marcada como lida' })
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    await this.notificationsService.markAsRead(id, req.user.userId);
    return { message: 'Notificação marcada como lida' };
  }

  /**
   * PATCH /notifications/read-all
   * Marcar todas as notificações como lidas
   */
  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  @ApiResponse({ status: 200, description: 'Todas as notificações marcadas como lidas' })
  async markAllAsRead(@Request() req: any) {
    await this.notificationsService.markAllAsRead(req.user.userId);
    return { message: 'Todas as notificações marcadas como lidas' };
  }
}
