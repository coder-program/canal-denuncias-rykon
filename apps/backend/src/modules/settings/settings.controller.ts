import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar todas as configurações do sistema' })
  async findAll() {
    return this.settingsService.findAll();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar configurações do sistema (apenas ADMIN)' })
  async update(@Body() updateSettingsDto: UpdateSettingsDto, @Request() req: any) {
    console.log('📥 Dados recebidos no controller:', updateSettingsDto);
    console.log(
      '📥 Tipo de cada campo:',
      Object.entries(updateSettingsDto).map(([k, v]) => `${k}: ${typeof v}`),
    );
    return this.settingsService.updateSettings(updateSettingsDto, req.user?.userId);
  }
}
