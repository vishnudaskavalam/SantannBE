import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateEnquiryStatusDto {
  @ApiPropertyOptional({ enum: ['new', 'contacted', 'resolved', 'deleted'] })
  @IsOptional()
  @IsEnum(['new', 'contacted', 'resolved', 'deleted'])
  status?: string;

  @ApiPropertyOptional({ example: 'Patient was contacted on Tuesday.' })
  @IsOptional()
  @IsString()
  internalNotes?: string;
}
