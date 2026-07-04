import { Module } from '@nestjs/common';
import { DossiersService } from './dossiers.service';
import { DossiersController } from './dossiers.controller';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { S3Module } from '@shared/s3/s3.module';
import { LoggerModule } from '@shared/logger/logger.module';

@Module({
  imports: [PrismaModule, S3Module, LoggerModule],
  controllers: [DossiersController],
  providers: [DossiersService],
  exports: [DossiersService],
})
export class DossiersModule {}
