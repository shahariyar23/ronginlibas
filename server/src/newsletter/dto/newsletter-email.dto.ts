import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class NewsletterEmailDto {
  @ApiProperty({ example: 'patron@example.com' })
  @IsEmail()
  email: string;
}
