import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';
import { RegisterPayload } from './register.payload';
import { SameAs } from 'src/modules/common/validator/same-as.validator';

export class RegisterEmailPayload extends RegisterPayload {
  @ApiProperty({
    required: true,
    example: '11111111',
  })
  @IsNotEmpty()
  @MinLength(5)
  public password: string;

  @ApiProperty({ required: true, example: '11111111' })
  @SameAs('password')
  public passwordConfirmation: string;
}
