import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdatePayload {
  @ApiProperty({
    required: false,
    example: 'Mengty',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    required: true,
    example: 'mengty',
  })
  @IsNotEmpty()
  public firstname: string;

  @ApiProperty({
    required: true,
    example: 'lim',
  })
  @IsNotEmpty()
  public lastname: string;

  @ApiProperty({
    required: true,
    example: 'xxx@gmail.com',
  })
  @IsEmail()
  email: string;
}
