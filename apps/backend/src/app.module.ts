import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { ComplaintsModule } from '@modules/complaints/complaints.module';
import { SettingsModule } from '@modules/settings/settings.module';
import { AttachmentsModule } from '@modules/attachments/attachments.module';
import { DossiersModule } from '@modules/dossiers/dossiers.module';
import { CommentsModule } from '@modules/comments/comments.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { LoggerModule } from '@shared/logger/logger.module';
import { S3Module } from '@shared/s3/s3.module';
import { EmailModule } from '@shared/email/email.module';

@Module({
  imports: [
    // ====================================
    // CONFIGURAÇÃO GLOBAL
    // ====================================
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // ====================================
    // RATE LIMITING (Proteção contra abuso)
    // ====================================
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('RATE_LIMIT_TTL', 60) * 1000,
          limit: config.get<number>('RATE_LIMIT_MAX', 100),
        },
      ],
    }),

    // ====================================
    // SHARED MODULES
    // ====================================
    PrismaModule,
    LoggerModule,
    S3Module,
    EmailModule,

    // ====================================
    // FEATURE MODULES
    // ====================================
    AuthModule,
    UsersModule,
    ComplaintsModule,
    SettingsModule,
    AttachmentsModule,
    DossiersModule,
    CommentsModule,
    NotificationsModule,
  ],
  providers: [
    // Rate limiting global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
