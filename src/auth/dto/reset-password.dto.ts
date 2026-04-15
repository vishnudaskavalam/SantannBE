import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';
import { ValidateTokenDto } from './validate-token.dto';

export class ResetPasswordDto extends ValidateTokenDto {
  @ApiProperty({
    example: 'newSuperSecret123',
    description: 'The new password',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
