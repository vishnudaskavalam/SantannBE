import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEnquiryDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'johndoe@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+1234567890' })
  @IsNotEmpty()
  @IsString()
  mobileNumber: string;

  @ApiPropertyOptional({ example: 'IVF' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'I want to know more about the process.' })
  @IsOptional()
  @IsString()
  message?: string;
}
