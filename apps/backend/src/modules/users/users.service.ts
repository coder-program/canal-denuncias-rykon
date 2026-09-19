import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(role?: UserRole) {
    const users = await this.prisma.user.findMany({
      where: role ? { role } : {},
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        isBlocked: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        isBlocked: true,
        blockedReason: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async blockUser(userId: string, reason: string, blockedBy: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: true,
        blockedReason: reason,
        blockedAt: new Date(),
        blockedBy,
      },
    });
  }

  async unblockUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: false,
        blockedReason: null,
        blockedAt: null,
        blockedBy: null,
      },
    });
  }

  async create(createUserDto: CreateUserDto) {
    // Verificar se email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Criar usuário
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        passwordHash: hashedPassword,
        role: createUserDto.role,
        isActive: createUserDto.isActive ?? true,
        isBlocked: false,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        isBlocked: true,
        createdAt: true,
      },
    });

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Verificar se usuário existe
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Se está mudando email, verificar se já existe
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email já está em uso');
      }
    }

    // Preparar dados para atualização
    const updateData: any = { ...updateUserDto };

    // Se mudou a senha, fazer hash
    if (updateUserDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete updateData.password;
    }

    // Se bloqueou o usuário, adicionar dados de bloqueio
    if (updateUserDto.isBlocked && !user.isBlocked) {
      updateData.blockedAt = new Date();
    }

    // Se desbloqueou, limpar dados de bloqueio
    if (updateUserDto.isBlocked === false && user.isBlocked) {
      updateData.blockedReason = null;
      updateData.blockedAt = null;
      updateData.blockedBy = null;
    }

    // Atualizar usuário
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        isBlocked: true,
        blockedReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async delete(id: string) {
    // Verificar se usuário existe
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Não permitir deletar o próprio usuário (poderia adicionar essa verificação)
    // Para agora, vamos apenas deletar
    await this.prisma.user.delete({ where: { id } });

    return { message: 'Usuário deletado com sucesso' };
  }
}
