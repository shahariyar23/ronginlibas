import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator.js';

@ApiTags('System')
@Public()
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Backend system liveness and health status check' })
  checkHealth() {
    return {
      success: true,
      message: 'Rongin Libas API is running',
      data: {
        status: 'ok',
        service: 'rongin-libas-backend',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    };
  }
}
