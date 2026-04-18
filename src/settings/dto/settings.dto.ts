import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class GeneralSettingsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  hours?: string;
}

export class AboutSettingsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  headline?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  body?: string;
}

export class SectionSettingsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  heading?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}

export class TreatmentSectionSettingsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}

export class HeroSlideDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  buttonText?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  buttonLink?: string;
}

export class ExpertDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  image?: string;
}

export class HomePageSettingsDto {
  @ApiPropertyOptional({ type: TreatmentSectionSettingsDto })
  @ValidateNested()
  @Type(() => TreatmentSectionSettingsDto)
  @IsOptional()
  treatmentSection?: TreatmentSectionSettingsDto;

  @ApiPropertyOptional({ type: SectionSettingsDto })
  @ValidateNested()
  @Type(() => SectionSettingsDto)
  @IsOptional()
  aboutSection?: SectionSettingsDto;

  @ApiPropertyOptional({ type: SectionSettingsDto })
  @ValidateNested()
  @Type(() => SectionSettingsDto)
  @IsOptional()
  teamSection?: SectionSettingsDto;

  @ApiPropertyOptional({ type: SectionSettingsDto })
  @ValidateNested()
  @Type(() => SectionSettingsDto)
  @IsOptional()
  questionsSection?: SectionSettingsDto;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({ type: GeneralSettingsDto })
  @ValidateNested()
  @Type(() => GeneralSettingsDto)
  @IsOptional()
  general?: GeneralSettingsDto;

  @ApiPropertyOptional({ type: AboutSettingsDto })
  @ValidateNested()
  @Type(() => AboutSettingsDto)
  @IsOptional()
  about?: AboutSettingsDto;

  @ApiPropertyOptional({ type: HomePageSettingsDto })
  @ValidateNested()
  @Type(() => HomePageSettingsDto)
  @IsOptional()
  homePage?: HomePageSettingsDto;

  @ApiPropertyOptional({ type: [ExpertDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpertDto)
  @IsOptional()
  experts?: ExpertDto[];

  @ApiPropertyOptional({ type: [HeroSlideDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HeroSlideDto)
  @IsOptional()
  heroSlides?: HeroSlideDto[];
}
