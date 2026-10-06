import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from '../services/settings.service.js';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Storefront - Settings')
@Public()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('public')
  @ApiOperation({ summary: 'Retrieve public store details, contact channels, and delivery rates' })
  async getPublicSettings() {
    const data = await this.settingsService.getPublicSettings();
    return {
      message: 'Store configurations retrieved successfully',
      data,
    };
  }
}
