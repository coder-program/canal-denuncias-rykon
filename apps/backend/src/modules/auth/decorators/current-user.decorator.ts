import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator para extrair usuário autenticado do request
 * Uso: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Se data for especificado, retorna apenas aquela propriedade
    return data ? user?.[data] : user;
  },
);
