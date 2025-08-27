import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';

import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AgentModule } from './modules/agent/agent.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { HealthModule } from './modules/health/health.module';
import { EstablishmentModule } from './modules/establishment/establishment.module';
import { UploadModule } from './modules/upload/upload.module';
import { SeedModule } from './modules/seed/seed.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [
        () => ({
          JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret-key-for-development-only',
          DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/agentsfood',
          REDIS_HOST: process.env.REDIS_HOST || 'localhost',
          REDIS_PORT: process.env.REDIS_PORT || 6379,
          PORT: process.env.PORT || 3001,
          NODE_ENV: process.env.NODE_ENV || 'development',
        }),
      ],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Redis/Bull for job queues
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
      }),
    }),

    // Application modules
    PrismaModule,
    HealthModule,
    AuthModule,
    EstablishmentModule,
    ProductsModule,
    CategoriesModule,
    AgentModule,
    WhatsappModule,
    ConversationsModule,
    UploadModule,
    SeedModule,
  ],
})
export class AppModule {}