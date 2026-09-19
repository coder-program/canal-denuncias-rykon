import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '@shared/prisma/prisma.service';
import { LoggerService } from '@shared/logger/logger.service';
import { UserRole } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let _prisma: PrismaService;
  let _jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: unknown) => {
      const config: Record<string, unknown> = {
        JWT_SECRET: 'test-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_EXPIRATION: '15m',
        JWT_REFRESH_EXPIRATION: '7d',
      };
      return config[key] || defaultValue;
    }),
  };

  const mockLoggerService = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    _prisma = module.get<PrismaService>(PrismaService);
    _jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('deve validar usuário com credenciais corretas', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 12),
        fullName: 'Test User',
        role: UserRole.REPORTER,
        isActive: true,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        blockedReason: null,
        blockedAt: null,
        blockedBy: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result.passwordHash).toBeUndefined(); // Senha não deve ser retornada
    });

    it('deve lançar UnauthorizedException para email inexistente', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUser('nonexistent@example.com', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException para usuário inativo', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 12),
        isActive: false,
        isBlocked: false,
        role: UserRole.REPORTER,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.validateUser('test@example.com', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException para usuário bloqueado', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 12),
        isActive: true,
        isBlocked: true,
        blockedReason: 'Violação de políticas',
        role: UserRole.REPORTER,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.validateUser('test@example.com', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException para senha incorreta', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 12),
        isActive: true,
        isBlocked: false,
        role: UserRole.REPORTER,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.validateUser('test@example.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('deve criar novo usuário com sucesso', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        fullName: 'New User',
      };

      const mockCreatedUser = {
        id: 'new-user-id',
        email: registerDto.email,
        passwordHash: 'hashed-password',
        fullName: registerDto.fullName,
        role: UserRole.REPORTER,
        isActive: true,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null); // Email não existe
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);
      mockPrismaService.refreshToken.create.mockResolvedValue({});
      mockPrismaService.auditLog.create.mockResolvedValue({});
      mockJwtService.sign.mockReturnValue('mocked-jwt-token');

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('mocked-jwt-token');
      expect(result.refreshToken).toBe('mocked-jwt-token');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('deve lançar BadRequestException para email já existente', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        fullName: 'Existing User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('hasPermission', () => {
    it('deve retornar true se usuário tem a role necessária', () => {
      const result = service.hasPermission(UserRole.ADMIN, [UserRole.ADMIN, UserRole.INVESTIGATOR]);
      expect(result).toBe(true);
    });

    it('deve retornar false se usuário não tem a role necessária', () => {
      const result = service.hasPermission(UserRole.REPORTER, [
        UserRole.ADMIN,
        UserRole.INVESTIGATOR,
      ]);
      expect(result).toBe(false);
    });
  });
});
