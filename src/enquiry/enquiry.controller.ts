import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { EnquiryService } from './enquiry.service';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryStatusDto } from './dto/update-enquiry.dto';
import { FilterEnquiryDto } from './dto/filter-enquiry.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('enquiries')
@Controller('enquiries')
export class EnquiryController {
  constructor(private readonly enquiryService: EnquiryService) {}

  @ApiOperation({ summary: 'Create a new enquiry (Public)' })
  @ApiResponse({ status: 201, description: 'The enquiry has been successfully created.' })
  @Post()
  create(@Body() createEnquiryDto: CreateEnquiryDto) {
    return this.enquiryService.create(createEnquiryDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all enquiries with pagination and filters' })
  @Get()
  findAll(@Query() filterDto: FilterEnquiryDto) {
    return this.enquiryService.findAll(filterDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get count of new enquiries' })
  @Get('count/new')
  countNew() {
    return this.enquiryService.countNew();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get monthly stats for enquiries' })
  @Get('stats/monthly')
  getMonthlyStats() {
    return this.enquiryService.getMonthlyStats();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get details of a specific enquiry' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enquiryService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update the status or notes of an enquiry' })
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateEnquiryStatusDto: UpdateEnquiryStatusDto) {
    return this.enquiryService.updateStatus(id, updateEnquiryStatusDto);
  }
}
