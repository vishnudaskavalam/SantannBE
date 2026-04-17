import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum } from 'class-validator';

export class CreateTreatmentDto {
  @ApiProperty({ example: 'In Vitro Fertilization (IVF)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'in-vitro-fertilization' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'Short description about IVF' })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'Detailed description about IVF' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '/images/treatments/ivf.jpg' })
  @IsString()
  @IsOptional()
  imagePath?: string;

  @ApiPropertyOptional({ example: 'active', enum: ['active', 'inactive', 'deleted'] })
  @IsEnum(['active', 'inactive', 'deleted'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ type: [String], example: ['High success rate', 'Safe'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keyBenefits?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Consultation', 'Stimulation', 'Retrieval'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  process?: string[];
}
