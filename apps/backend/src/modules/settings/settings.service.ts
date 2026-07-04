import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Busca todas as configurações do sistema
   */
  async findAll(): Promise<Record<string, any>> {
    const settings = await this.prisma.systemSetting.findMany();
    
    // Converter array de key-value para objeto
    const settingsObj: Record<string, any> = {};
    settings.forEach((setting) => {
      try {
        // Tentar fazer parse de valores JSON
        settingsObj[setting.key] = JSON.parse(setting.value);
      } catch {
        // Se não for JSON, manter como string
        settingsObj[setting.key] = setting.value;
      }
    });

    return settingsObj;
  }

  /**
   * Busca uma configuração específica por chave
   */
  async findByKey(key: string): Promise<any> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      return null;
    }

    try {
      return JSON.parse(setting.value);
    } catch {
      return setting.value;
    }
  }

  /**
   * Atualiza múltiplas configurações de uma vez
   */
  async updateSettings(
    dto: UpdateSettingsDto,
    userId?: string,
  ): Promise<Record<string, any>> {
    const updates: Array<Promise<any>> = [];

    // Iterar sobre cada propriedade do DTO e criar/atualizar no banco
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        
        updates.push(
          this.prisma.systemSetting.upsert({
            where: { key },
            create: {
              key,
              value: stringValue,
              updatedBy: userId,
            },
            update: {
              value: stringValue,
              updatedBy: userId,
            },
          }),
        );
      }
    }

    await Promise.all(updates);

    this.logger.log(`Settings updated by user ${userId || 'system'}`);

    // Retornar todas as configurações atualizadas
    return this.findAll();
  }

  /**
   * Define uma configuração individual
   */
  async setSetting(key: string, value: any, userId?: string): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    await this.prisma.systemSetting.upsert({
      where: { key },
      create: {
        key,
        value: stringValue,
        updatedBy: userId,
      },
      update: {
        value: stringValue,
        updatedBy: userId,
      },
    });

    this.logger.log(`Setting '${key}' updated by user ${userId || 'system'}`);
  }

  /**
   * Remove uma configuração
   */
  async deleteSetting(key: string): Promise<void> {
    await this.prisma.systemSetting.delete({
      where: { key },
    });

    this.logger.log(`Setting '${key}' deleted`);
  }
}
