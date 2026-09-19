import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { PrismaService } from '@shared/prisma/prisma.service';
import { LoggerService } from '@shared/logger/logger.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User, UserRole } from '@prisma/client';

export type AuthenticatedUser = Omit<User, 'passwordHash'>;

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResponse extends AuthTokens {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    tenantId?: string | null;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {}

  /**
   * Validar credenciais do usuário (usado pelo LocalStrategy)
   */
  async validateUser(email: string, password: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      this.loggerService.warn(`Login attempt with non-existent email: ${email}`, 'AuthService');
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.isActive) {
      this.loggerService.warn(`Login attempt for inactive user: ${email}`, 'AuthService');
      throw new UnauthorizedException('Usuário inativo. Contate o administrador.');
    }

    if (user.isBlocked) {
      this.loggerService.warn(`Login attempt for blocked user: ${email}`, 'AuthService', {
        reason: user.blockedReason,
      });
      throw new UnauthorizedException(
        `Usuário bloqueado. Motivo: ${user.blockedReason || 'Não especificado'}`,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      this.loggerService.warn(`Failed login attempt for user: ${email}`, 'AuthService');
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Atualizar último login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { passwordHash: _passwordHash, ...result } = user;
    return result;
  }

  /**
   * Login e geração de tokens
   */
  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthTokens> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const tokens = await this.generateTokens(user, ipAddress, userAgent);

    this.loggerService.log(`User logged in successfully: ${user.email}`, 'AuthService', {
      userId: user.id,
      role: user.role,
    });

    // Criar log de auditoria
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        resource: 'auth',
        ipAddress,
        userAgent,
        details: { email: user.email },
      },
    });

    return tokens;
  }

  /**
   * Login Admin - Apenas para SUPER_ADMIN
   */
  async loginAdmin(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // Validar se é ADMIN
    if (user.role !== UserRole.ADMIN) {
      this.loggerService.warn(
        `Unauthorized admin login attempt by non-SUPER_ADMIN user: ${user.email}`,
        'AuthService',
        { role: user.role },
      );
      throw new UnauthorizedException('Acesso restrito a Super Administradores');
    }

    const tokens = await this.generateTokens(user, ipAddress, userAgent);

    this.loggerService.log(`Super Admin logged in successfully: ${user.email}`, 'AuthService', {
      userId: user.id,
      role: user.role,
    });

    // Criar log de auditoria
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        resource: 'auth',
        ipAddress,
        userAgent,
        details: { email: user.email, loginType: 'SUPER_ADMIN' },
      },
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  /**
   * Registro de novo usuário (público para denunciantes)
   */
  async register(registerDto: RegisterDto): Promise<AuthTokens> {
    // Verificar se email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email já cadastrado');
    }

    // Hash da senha
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    // Criar usuário
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        fullName: registerDto.fullName,
        role: UserRole.REPORTER, // Por padrão, usuário público é REPORTER
        isActive: true,
      },
    });

    this.loggerService.log(`New user registered: ${user.email}`, 'AuthService', {
      userId: user.id,
    });

    // Criar log de auditoria
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        resource: 'user',
        details: { email: user.email, role: user.role },
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return this.generateTokens(userWithoutPassword);
  }

  /**
   * Refresh token - gerar novos tokens usando refresh token
   */
  async refreshTokens(refreshTokenDto: RefreshTokenDto, ipAddress?: string): Promise<AuthTokens> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshTokenDto.refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    if (storedToken.isRevoked) {
      this.loggerService.warn(`Attempt to use revoked refresh token`, 'AuthService', {
        userId: storedToken.userId,
      });
      throw new UnauthorizedException('Refresh token foi revogado');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('Refresh token expirado');
    }

    if (!storedToken.user.isActive || storedToken.user.isBlocked) {
      throw new UnauthorizedException('Usuário inativo ou bloqueado');
    }

    // Revogar o refresh token antigo
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Gerar novos tokens
    const { passwordHash: _passwordHash, ...user } = storedToken.user;
    return this.generateTokens(user, ipAddress);
  }

  /**
   * Logout - revogar refresh token
   */
  async logout(refreshToken: string, userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        token: refreshToken,
        userId,
      },
      data: {
        isRevoked: true,
      },
    });

    this.loggerService.log(`User logged out: ${userId}`, 'AuthService');

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        resource: 'auth',
      },
    });
  }

  /**
   * Revogar todos os refresh tokens de um usuário
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    this.loggerService.log(`All refresh tokens revoked for user: ${userId}`, 'AuthService');
  }

  /**
   * Gerar access token e refresh token
   */
  private async generateTokens(
    user: AuthenticatedUser,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Access Token (curto prazo)
    const accessToken = this.jwtService.sign(payload);

    // Refresh Token (longo prazo)
    const refreshTokenSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const refreshTokenExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshTokenSecret,
      expiresIn: refreshTokenExpiration,
    });

    // Calcular data de expiração
    const expiresInMs = this.parseExpiration(refreshTokenExpiration);
    const expiresAt = new Date(Date.now() + expiresInMs);

    // Armazenar refresh token no banco
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m'),
    };
  }

  /**
   * Parse expiration string para milissegundos
   */
  private parseExpiration(expiration: string): number {
    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 15 * 60 * 1000; // Default 15 minutos
    }

    const [, value, unit] = match;
    return parseInt(value, 10) * units[unit];
  }

  /**
   * Verificar se usuário tem permissão (helper RBAC)
   */
  hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(userRole);
  }
}
