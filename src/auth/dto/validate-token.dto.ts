import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ValidateTokenDto {
  @ApiProperty({
    example: 'd9b2d...f4e',
    description: 'The secure reset token provided in the email',
  })
  @IsNotEmpty()
  token: string;
}
