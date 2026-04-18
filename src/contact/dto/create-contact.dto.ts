import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'Partnership Inquiry' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: 'I want to partner with Santaan.' })
  @IsNotEmpty()
  @IsString()
  message: string;
}
