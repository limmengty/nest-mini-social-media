import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdatePostPayload {
  @ApiProperty({
    example: 'Good morning',
    required: true,
  })
  @IsNotEmpty()
  content: string;
}
