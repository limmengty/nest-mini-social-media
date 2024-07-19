import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatePostPayload {
  @ApiProperty({
    example: 'Good morning',
    required: true,
  })
  @IsNotEmpty()
  content: string;
}
