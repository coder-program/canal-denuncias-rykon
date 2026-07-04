import { PartialType } from '@nestjs/swagger';
import { CreateComplaintDto } from './create-complaint.dto';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ComplaintStatus, ComplaintPriority } from '@prisma/client';

export class UpdateComplaintDto extends PartialType(CreateComplaintDto) {
  @ApiPropertyOptional({
    description: 'Status da denúncia',
    enum: ComplaintStatus,
  })
  @IsOptional()
  @IsEnum(ComplaintStatus)
  status?: ComplaintStatus;

  @ApiPropertyOptional({
    description: 'Prioridade da denúncia',
    enum: ComplaintPriority,
  })
  @IsOptional()
  @IsEnum(ComplaintPriority)
  priority?: ComplaintPriority;

  @ApiPropertyOptional({
    description: 'ID do investigador atribuído',
  })
  @IsOptional()
  @IsString()
  investigatorId?: string;
}
