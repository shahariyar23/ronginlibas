import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator.js';
import { NewsletterEmailDto } from './dto/newsletter-email.dto.js';
import { NewsletterService } from './newsletter.service.js';

@ApiTags('Newsletter')
@Public()
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Subscribe an email address to store announcements' })
  async subscribe(@Body() dto: NewsletterEmailDto) {
    return {
      message: 'Subscription saved successfully',
      data: await this.newsletterService.subscribe(dto.email),
    };
  }

  @Delete('unsubscribe')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Unsubscribe an email address from store announcements' })
  async unsubscribe(@Body() dto: NewsletterEmailDto) {
    return {
      message: 'Unsubscribe request processed successfully',
      data: await this.newsletterService.unsubscribe(dto.email),
    };
  }
}
