import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMediaDto {
  @ApiProperty({ example: 'hero', description: 'What type/category this media maps to' })
  @IsString()
  @IsNotEmpty()
  type: string;
}
