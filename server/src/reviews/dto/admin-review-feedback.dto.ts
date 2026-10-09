import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AdminReviewFeedbackDto {
  @ApiProperty({ maxLength: 3000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  feedback!: string;
}
