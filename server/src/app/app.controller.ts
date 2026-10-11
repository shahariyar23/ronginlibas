import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator.js';

@ApiTags('System')
@Public()
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Backend root status check' })
  getRoot() {
    return {
      success: true,
      message: 'Rongin Libas API is operational',
      data: {
        status: 'ok',
        service: 'rongin-libas-backend',
        environment: process.env.NODE_ENV || 'development',
        documentation: '/api/docs',
        healthCheck: '/api/v1/health',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
