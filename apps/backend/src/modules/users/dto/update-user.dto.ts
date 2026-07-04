import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty({ description: 'Email do usuário', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @ApiProperty({ description: 'Nome completo do usuário', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ description: 'Nova senha (mínimo 6 caracteres)', required: false })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password?: string;

  @ApiProperty({ description: 'Role do usuário', enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role inválida' })
  role?: UserRole;

  @ApiProperty({ description: 'Se o usuário está ativo', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Se o usuário está bloqueado', required: false })
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @ApiProperty({ description: 'Razão do bloqueio', required: false })
  @IsOptional()
  @IsString()
  blockedReason?: string;

  @ApiProperty({ description: 'Observações sobre o usuário', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
