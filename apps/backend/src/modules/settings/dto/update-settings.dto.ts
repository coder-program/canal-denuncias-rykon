import { IsString, IsOptional, IsBoolean, IsObject, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiProperty({ description: 'Nome da empresa', required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ description: 'Logo da empresa (base64 ou URL)', required: false })
  @IsOptional()
  @IsString()
  companyLogo?: string;

  @ApiProperty({ description: 'Logo do rodapé (base64 ou URL)', required: false })
  @IsOptional()
  @IsString()
  footerLogo?: string;

  @ApiProperty({ description: 'Telefone da empresa', required: false })
  @IsOptional()
  @IsString()
  companyPhone?: string;

  @ApiProperty({ description: 'E-mail da empresa', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido' })
  companyEmail?: string;

  @ApiProperty({ description: 'Cor primária (hex)', required: false })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiProperty({ description: 'Cor secundária (hex)', required: false })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiProperty({ description: 'Política de privacidade', required: false })
  @IsOptional()
  @IsString()
  privacyPolicy?: string;

  @ApiProperty({ description: 'Termos de uso', required: false })
  @IsOptional()
  @IsString()
  termsOfService?: string;

  @ApiProperty({ description: 'URL do documento: Código de Ética', required: false })
  @IsOptional()
  @IsString()
  docCodigoEtica?: string;

  @ApiProperty({ description: 'URL do documento: Política de Relacionamento com Fornecedores', required: false })
  @IsOptional()
  @IsString()
  docPoliticaFornecedores?: string;

  @ApiProperty({ description: 'URL do documento: Política Anticorrupção e Antissuborno', required: false })
  @IsOptional()
  @IsString()
  docPoliticaAnticorrupcao?: string;

  @ApiProperty({ description: 'URL do documento: Política de Participação em Licitações', required: false })
  @IsOptional()
  @IsString()
  docPoliticaLicitacoes?: string;

  @ApiProperty({ description: 'URL do documento: Política PLD/FTP', required: false })
  @IsOptional()
  @IsString()
  docPoliticaPldFtp?: string;

  @ApiProperty({ description: 'URL do documento: Política de Combate ao Assédio', required: false })
  @IsOptional()
  @IsString()
  docPoliticaAssedio?: string;

  @ApiProperty({ description: 'Permitir denúncias anônimas', required: false })
  @IsOptional()
  @IsBoolean()
  allowAnonymousComplaints?: boolean;

  @ApiProperty({ description: 'Modo de manutenção', required: false })
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @ApiProperty({ description: 'Notificações por email habilitadas', required: false })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiProperty({ description: 'Alertas do sistema habilitados', required: false })
  @IsOptional()
  @IsBoolean()
  systemAlerts?: boolean;
}
