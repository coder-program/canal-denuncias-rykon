import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Conteúdo do comentário',
    example: 'Investigação em andamento. Evidências coletadas e testemunhas ouvidas.',
    minLength: 1,
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty({ message: 'O conteúdo do comentário é obrigatório' })
  @MinLength(1, { message: 'O comentário deve ter no mínimo 1 caractere' })
  @MaxLength(5000, { message: 'O comentário não pode exceder 5000 caracteres' })
  content: string;
}
