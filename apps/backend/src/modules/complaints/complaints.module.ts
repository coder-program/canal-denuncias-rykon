import { Module } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { ComplaintsController } from './complaints.controller';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { LoggerModule } from '@shared/logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [ComplaintsController],
  providers: [ComplaintsService],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}
