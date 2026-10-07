import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ReviewVoteDto {
  @ApiProperty()
  @IsBoolean()
  helpful: boolean;
}
