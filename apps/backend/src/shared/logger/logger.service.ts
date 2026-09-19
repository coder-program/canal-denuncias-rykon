import { Injectable, Logger as NestLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;
  private readonly nestLogger = new NestLogger(LoggerService.name);

  constructor(private configService: ConfigService) {
    const transports: winston.transport[] = [
      // Console transport (sempre habilitado)
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
            const ctx = context ? `[${context}]` : '';
            const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
            return `${timestamp} ${level} ${ctx} ${message}${metaStr}`;
          }),
        ),
      }),

      // File transport (logs estruturados em JSON)
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      }),
    ];

    // Elasticsearch transport (se configurado)
    const elasticsearchNode = this.configService.get<string>('ELASTICSEARCH_NODE');
    if (elasticsearchNode) {
      try {
        transports.push(
          new ElasticsearchTransport({
            level: 'info',
            clientOpts: {
              node: elasticsearchNode,
              auth: {
                username: this.configService.get<string>('ELASTICSEARCH_USERNAME', 'elastic'),
                password: this.configService.get<string>('ELASTICSEARCH_PASSWORD', 'changeme'),
              },
            },
            index: 'canal-denuncia-logs',
            transformer: (logData: any) => {
              // Maskear dados sensíveis antes de enviar ao Elasticsearch
              return {
                '@timestamp': new Date().toISOString(),
                severity: logData.level,
                message: logData.message,
                context: logData.context,
                meta: this.maskSensitiveData(logData.meta),
              };
            },
          }),
        );
        this.nestLogger.log('Elasticsearch transport enabled for logging');
      } catch (error) {
        this.nestLogger.warn('Failed to enable Elasticsearch transport', error);
      }
    }

    this.logger = winston.createLogger({
      level: this.configService.get<string>('LOG_LEVEL', 'info'),
      transports,
    });
  }

  /**
   * Maskear dados sensíveis (PII) antes de logar
   */
  private maskSensitiveData(data: any): any {
    if (!data) return data;

    const sensitiveKeys = ['password', 'passwordHash', 'email', 'cpf', 'phone', 'reporterEmail'];
    const masked = { ...data };

    for (const key of sensitiveKeys) {
      if (masked[key]) {
        masked[key] = '***MASKED***';
      }
    }

    return masked;
  }

  log(message: string, context?: string, meta?: any) {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: any) {
    this.logger.error(message, { context, trace, ...meta });
  }

  warn(message: string, context?: string, meta?: any) {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: any) {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: any) {
    this.logger.verbose(message, { context, ...meta });
  }
}
