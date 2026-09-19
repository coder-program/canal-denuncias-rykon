import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsObject,
  IsPhoneNumber,
} from 'class-validator';
import { ComplaintType, ComplaintPriority } from '@prisma/client';

export class CreateComplaintDto {
  @ApiProperty({
    description: 'Se a denúncia é anônima',
    example: false,
  })
  @IsBoolean()
  isAnonymous: boolean;

  @ApiPropertyOptional({
    description: 'Email do denunciante (se não anônimo)',
    example: 'denunciante@example.com',
  })
  @IsOptional()
  @IsEmail()
  reporterEmail?: string;

  @ApiPropertyOptional({
    description: 'Telefone do denunciante (se não anônimo)',
    example: '+5511999999999',
  })
  @IsOptional()
  @IsPhoneNumber('BR')
  reporterPhone?: string;

  @ApiProperty({
    description: 'Tipo da denúncia',
    enum: ComplaintType,
    example: ComplaintType.HARASSMENT,
  })
  @IsEnum(ComplaintType)
  type: ComplaintType;

  @ApiPropertyOptional({
    description: 'Prioridade da denúncia',
    enum: ComplaintPriority,
    default: ComplaintPriority.MEDIUM,
    example: ComplaintPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(ComplaintPriority)
  priority?: ComplaintPriority;

  @ApiProperty({
    description: 'Título/resumo da denúncia',
    example: 'Assédio moral no departamento de vendas',
    minLength: 10,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Título deve ter no mínimo 10 caracteres' })
  @MaxLength(200, { message: 'Título deve ter no máximo 200 caracteres' })
  title: string;

  @ApiProperty({
    description: 'Descrição detalhada do ocorrido',
    example: 'Durante o mês de outubro, presenciei repetidas situações...',
    minLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(50, { message: 'Descrição deve ter no mínimo 50 caracteres' })
  description: string;

  @ApiPropertyOptional({
    description: 'Departamento envolvido',
    example: 'Vendas',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    description: 'Local onde ocorreu o incidente',
    example: 'Escritório - 3º andar, sala 305',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Data do incidente (ISO 8601)',
    example: '2024-10-01T14:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  incidentDate?: string;

  @ApiPropertyOptional({
    description: 'Pessoas envolvidas (nomes, emails ou identificadores)',
    example: ['João Silva', 'maria@empresa.com'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  involvedPeople?: string[];

  @ApiPropertyOptional({
    description: 'Testemunhas (nomes ou identificadores)',
    example: ['Pedro Santos', 'Ana Costa'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  witnesses?: string[];

  @ApiPropertyOptional({
    description: 'Metadados adicionais (JSON)',
    example: { department: 'Vendas', shift: 'Manhã' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
