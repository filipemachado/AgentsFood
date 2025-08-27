import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';

import { Public } from '@/common/decorators/public.decorator';
import { PrismaService } from '@/common/prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async check() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        services: {
          database: 'connected',
          redis: 'connected', // TODO: Add actual Redis health check
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        services: {
          database: 'disconnected',
          redis: 'unknown',
        },
      };
    }
  }

  @Post('migrate')
  @Public()
  @ApiOperation({ summary: 'Execute Prisma migrations' })
  @ApiResponse({ status: 200, description: 'Migrations executed successfully' })
  async executeMigrations() {
    try {
      console.log('🔄 Starting Prisma migrations...');

      // Execute Prisma migrations
      const { execSync } = require('child_process');
      
      // Generate Prisma client
      execSync('npx prisma generate', { stdio: 'inherit' });
      
      // Push schema to database (create tables)
      execSync('npx prisma db push', { stdio: 'inherit' });

      console.log('✅ Migrations completed successfully');

      return {
        success: true,
        message: 'Database migrations completed successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error during migrations:', error);
      throw error;
    }
  }

  @Post('seed')
  @Public()
  @ApiOperation({ summary: 'Execute database seed' })
  @ApiResponse({ status: 200, description: 'Seed executed successfully' })
  async executeSeed() {
    try {
      console.log('🌱 Starting seed...');

      // Create admin user only
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = await this.prisma.user.upsert({
        where: { email: 'admin@agentsfood.com' },
        update: {},
        create: {
          email: 'admin@agentsfood.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN',
        },
      });

      console.log('✅ Admin user created:', adminUser.email);

      return {
        success: true,
        message: 'Seed executed successfully',
        data: {
          user: adminUser.email,
        },
      };
    } catch (error) {
      console.error('❌ Error during seed:', error);
      throw error;
    }
  }
}