import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ComplaintStatus, ComplaintType, ComplaintPriority } from '@prisma/client';

export class QueryComplaintsDto {
  @ApiPropertyOptional({
    description: 'Número da página',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Quantidade de itens por página',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filtrar por status',
    enum: ComplaintStatus,
    example: ComplaintStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ComplaintStatus)
  status?: ComplaintStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo',
    enum: ComplaintType,
    example: ComplaintType.HARASSMENT,
  })
  @IsOptional()
  @IsEnum(ComplaintType)
  type?: ComplaintType;

  @ApiPropertyOptional({
    description: 'Filtrar por prioridade',
    enum: ComplaintPriority,
    example: ComplaintPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(ComplaintPriority)
  priority?: ComplaintPriority;

  @ApiPropertyOptional({
    description: 'Buscar por protocolo, título ou descrição',
    example: 'assédio',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Campo para ordenação',
    enum: ['createdAt', 'updatedAt', 'priority', 'status', 'protocol'],
    default: 'createdAt',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'updatedAt', 'priority', 'status', 'protocol'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Ordem de classificação',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
