import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ description: 'Email do usuário', example: 'usuario@empresa.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ description: 'Nome completo do usuário', example: 'João Silva' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Senha do usuário (mínimo 6 caracteres)', example: 'senha123' })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;

  @ApiProperty({
    description: 'Role do usuário',
    enum: UserRole,
    example: 'INVESTIGATOR',
  })
  @IsEnum(UserRole, { message: 'Role inválida' })
  role: UserRole;

  @ApiProperty({ description: 'Se o usuário está ativo', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Observações sobre o usuário', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
