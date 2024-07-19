import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CommentUpdatePayload {
  @ApiProperty({
    example: 'Good morning',
    required: true,
  })
  @IsNotEmpty()
  message: string;
}
