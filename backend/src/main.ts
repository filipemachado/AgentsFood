import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as compression from 'compression';
import * as morgan from 'morgan';
import * as path from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Serve static files (uploads)
  app.useStaticAssets(path.join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Security
  app.use(helmet());
  app.use(compression());
  
  // Logging
  app.use(morgan('combined'));

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      configService.get('FRONTEND_URL', 'http://localhost:3000'),
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api', {
    exclude: ['/health', '/webhook/whatsapp'],
  });

  // Swagger documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('AgentsFood API')
      .setDescription('API para gerenciamento de cardápio e agente WhatsApp')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Autenticação')
      .addTag('products', 'Produtos')
      .addTag('categories', 'Categorias')
      .addTag('agent', 'Configuração do Agente')
      .addTag('whatsapp', 'WhatsApp Integration')
      .addTag('conversations', 'Conversas')
      .addTag('upload', 'Upload de Arquivos')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    console.log('📚 Swagger documentation available at: http://localhost:3001/api/docs');
  }

  const port = configService.get('PORT', 3001);
  await app.listen(port);

  console.log('🚀 AgentsFood Backend is running!');
  console.log(`📡 Server: http://localhost:${port}`);
  console.log(`🏥 Health Check: http://localhost:${port}/health`);
}

bootstrap().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});