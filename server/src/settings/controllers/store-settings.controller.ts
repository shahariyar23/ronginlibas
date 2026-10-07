import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator.js';
import { SettingsService } from '../services/settings.service.js';

@ApiTags('Storefront')
@Public()
@Controller('store')
export class StoreSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Retrieve customer-safe store configuration' })
  async getSettings() {
    return {
      message: 'Store settings retrieved successfully',
      data: await this.settingsService.getPublicSettings(),
    };
  }
}
