import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { EmailModule } from '@shared/email/email.module';
import { LoggerModule } from '@shared/logger/logger.module';

@Module({
  imports: [PrismaModule, EmailModule, LoggerModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
