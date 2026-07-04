import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { LoggerModule } from '@shared/logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
