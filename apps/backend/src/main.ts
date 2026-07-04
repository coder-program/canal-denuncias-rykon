import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');

  // ====================================
  // INCREASE PAYLOAD SIZE LIMIT
  // ====================================
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // ====================================
  // SECURITY MIDDLEWARES
  // ====================================
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  app.use(compression());

  // ====================================
  // CORS
  // ====================================
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3001'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // ====================================
  // VALIDATION PIPE (Global)
  // ====================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não definidas no DTO
      forbidNonWhitelisted: true, // Lança erro se propriedades extras forem enviadas
      transform: true, // Transforma payloads para tipos do DTO
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ====================================
  // API PREFIX
  // ====================================
  app.setGlobalPrefix(apiPrefix);

  // ====================================
  // SWAGGER / OPENAPI DOCUMENTATION
  // ====================================
  const config = new DocumentBuilder()
    .setTitle('Canal de Denúncias - API')
    .setDescription(
      'API REST para Canal de Denúncias Corporativo - Produção Grade\n\n' +
      '## Funcionalidades\n' +
      '- Autenticação JWT com refresh tokens\n' +
      '- RBAC (Role-Based Access Control)\n' +
      '- Denúncias anônimas ou identificadas\n' +
      '- Gestão de investigações e dossiês\n' +
      '- Upload de evidências com validação\n' +
      '- Auditoria completa e logs imutáveis\n' +
      '- Conformidade LGPD, ISO 27001, ISO 37002\n\n' +
      '## Segurança\n' +
      '- TLS 1.3 obrigatório em produção\n' +
      '- Rate limiting habilitado\n' +
      '- Criptografia AES-256 para dados sensíveis\n' +
      '- Tokens JWT com expiração curta',
    )
    .setVersion('1.0.0')
    .setContact(
      'Time de Compliance',
      'https://suaempresa.com',
      'compliance@suaempresa.com',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Insira o token JWT obtido no endpoint /auth/login',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Autenticação e gerenciamento de tokens')
    .addTag('complaints', 'Denúncias e acompanhamento de protocolos')
    .addTag('users', 'Gerenciamento de usuários')
    .addTag('dossiers', 'Dossiês e relatórios de investigação')
    .addTag('audit', 'Logs de auditoria')
    .addTag('settings', 'Configurações do sistema')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Canal de Denúncias - API Docs',
  });

  // ====================================
  // START SERVER
  // ====================================
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`);
  logger.log(`🛡️  Security: Helmet + CORS enabled`);
  logger.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
