import { Request } from 'express';
import { AuthenticatedUser } from '@modules/auth/auth.service';

/**
 * Requisição Express autenticada, com o usuário anexado pelo JwtStrategy
 * (formato: registro completo do Prisma `User`, sem o `passwordHash`).
 */
export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

/**
 * Requisição Express de endpoint público que aceita autenticação opcional
 * (usuário pode ou não estar presente, dependendo se um JWT válido foi enviado).
 */
export interface OptionalAuthRequest extends Request {
  user?: AuthenticatedUser;
}
