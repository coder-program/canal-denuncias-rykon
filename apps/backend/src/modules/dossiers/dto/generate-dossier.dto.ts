import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DossierFormat {
  PDF = 'pdf',
  ZIP = 'zip',
  BOTH = 'both',
}

export class GenerateDossierDto {
  @ApiProperty({
    description: 'Incluir sumário executivo',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeSummary?: boolean = true;

  @ApiProperty({
    description: 'Incluir linha do tempo de eventos',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeTimeline?: boolean = true;

  @ApiProperty({
    description: 'Incluir anexos no dossiê',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeAttachments?: boolean = true;

  @ApiProperty({
    description: 'Incluir log de auditoria (apenas ADMIN/AUDITOR)',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  includeAuditLog?: boolean = false;

  @ApiProperty({
    description: 'Formato do dossiê',
    enum: DossierFormat,
    example: DossierFormat.BOTH,
    required: false,
    default: DossierFormat.BOTH,
  })
  @IsOptional()
  @IsEnum(DossierFormat)
  format?: DossierFormat = DossierFormat.BOTH;
}
