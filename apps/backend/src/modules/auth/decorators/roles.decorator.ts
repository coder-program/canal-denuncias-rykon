import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorator para especificar roles permitidas em um endpoint
 * Uso: @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
