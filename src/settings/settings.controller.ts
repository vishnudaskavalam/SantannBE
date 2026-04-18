import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/settings.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @ApiOperation({ summary: 'Get global settings items manually (Public)' })
  @ApiQuery({ name: 'keys', required: false, type: String, description: 'Comma separated list of top-level keys to return (e.g. homePage,aboutUs)' })
  @Get()
  getPublicSettings(@Query('keys') keys?: string) {
    return this.settingsService.getSettings(keys);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get global settings (Admin)' })
  @Get('admin')
  getAdminSettings() {
    return this.settingsService.getSettings();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: UpdateSettingsDto })
  @ApiOperation({ summary: 'Create or update settings (Admin)' })
  @Post()
  upsertSettings(@Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.upsert(updateSettingsDto);
  }
}
