import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ComplaintStatus } from '@prisma/client';

export class ChangeStatusDto {
  @ApiProperty({
    description: 'Novo status da denúncia',
    enum: ComplaintStatus,
    example: ComplaintStatus.IN_PROGRESS,
  })
  @IsEnum(ComplaintStatus)
  status: ComplaintStatus;

  @ApiProperty({
    description: 'Motivo da alteração de status',
    example: 'Iniciada investigação após análise preliminar',
    minLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Motivo deve ter no mínimo 10 caracteres' })
  reason: string;
}
