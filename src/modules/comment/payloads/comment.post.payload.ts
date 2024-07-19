import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CommentPostPayload {
  @ApiProperty({
    example: 'Good morning',
    required: true,
  })
  @IsNotEmpty()
  message: string;

  // @ApiProperty({
  //   example: '6192ec7e-4f39-4c5b-94b1-c4e99fad7e30',
  //   required: true,
  // })
  // @IsNotEmpty()
  // byPostId: string;
}
