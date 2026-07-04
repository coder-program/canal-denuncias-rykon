import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'novousuario@empresa.com',
  })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário (mínimo 8 caracteres, recomendado caracteres especiais)',
    example: 'SenhaSegura123!@',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @MaxLength(100)
  password: string;

  @ApiPropertyOptional({
    description: 'Nome completo do usuário (opcional)',
    example: 'João da Silva',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;
}
