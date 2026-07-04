import { Module } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { S3Module } from '@shared/s3/s3.module';
import { LoggerModule } from '@shared/logger/logger.module';

@Module({
  imports: [PrismaModule, S3Module, LoggerModule],
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
