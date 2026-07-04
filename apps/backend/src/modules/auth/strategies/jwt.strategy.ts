import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '@shared/prisma/prisma.service';
import { JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    console.log('[JwtStrategy] Validating payload:', JSON.stringify(payload));
    
    // Verificar se usuário ainda existe e está ativo
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive || user.isBlocked) {
      console.error('[JwtStrategy] User invalid, inactive or blocked:', payload.sub);
      throw new UnauthorizedException('Usuário inválido ou inativo');
    }

    // Retornar dados do usuário (sem senha)
    const { passwordHash, ...userWithoutPassword } = user;
    console.log('[JwtStrategy] User validated:', userWithoutPassword.id, userWithoutPassword.email);
    return userWithoutPassword;
  }
}
