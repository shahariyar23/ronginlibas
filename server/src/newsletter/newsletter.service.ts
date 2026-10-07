import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(email: string) {
    await this.prisma.newsletterSubscriber.upsert({
      where: { email: email.trim().toLowerCase() },
      update: { isActive: true },
      create: { email: email.trim().toLowerCase() },
    });
    return { subscribed: true };
  }

  async unsubscribe(email: string) {
    await this.prisma.newsletterSubscriber.updateMany({
      where: { email: email.trim().toLowerCase(), isActive: true },
      data: { isActive: false },
    });
    return { unsubscribed: true };
  }
}
