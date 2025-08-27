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

  @Get('debug')
  @Public()
  @ApiOperation({ summary: 'Debug endpoint to test routes' })
  @ApiResponse({ status: 200, description: 'Debug information' })
  async debug() {
    try {
      // Test database connection
      const dbTest = await this.prisma.$queryRaw`SELECT 1 as test`
      
      // Test categories endpoint
      let categoriesTest = null
      try {
        categoriesTest = await this.prisma.category.findMany({ take: 1 })
      } catch (error) {
        categoriesTest = { error: error.message }
      }

      // Test agent config endpoint
      let agentConfigTest = null
      try {
        agentConfigTest = await this.prisma.agentConfig.findFirst()
      } catch (error) {
        agentConfigTest = { error: error.message }
      }

      return {
        success: true,
        timestamp: new Date().toISOString(),
        database: {
          status: 'connected',
          test: dbTest
        },
        categories: {
          status: categoriesTest?.error ? 'error' : 'working',
          data: categoriesTest
        },
        agentConfig: {
          status: agentConfigTest?.error ? 'error' : 'working',
          data: agentConfigTest
        }
      }
    } catch (error) {
      console.error('❌ Debug error:', error)
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
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