import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Assuming JwtAuthGuard path based on previous findings

@ApiTags('treatments')
@Controller('treatments')
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  // ==========================================
  // Public APIs
  // ==========================================

  @ApiOperation({ summary: 'List all treatments (Public)' })
  @Get()
  findAllPublic() {
    return this.treatmentsService.findAllPublic();
  }

  @ApiOperation({ summary: 'List all treatments in menu (Public)' })
  @Get('menu')
  findMenuPublic() {
    return this.treatmentsService.findMenuPublic();
  }

  // ==========================================
  // Authenticated APIs (Admin)
  // ==========================================

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all treatments (Admin)' })
  @Get('admin')
  findAllAdmin() {
    return this.treatmentsService.findAllAdmin();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreateTreatmentDto })
  @ApiOperation({ summary: 'Create a new treatment (Admin)' })
  @Post()
  create(@Body() createTreatmentDto: CreateTreatmentDto) {    
    return this.treatmentsService.create(createTreatmentDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a treatment (Admin)' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTreatmentDto: UpdateTreatmentDto,
  ) {
    return this.treatmentsService.update(id, updateTreatmentDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Soft delete a treatment (Admin)' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.treatmentsService.remove(id);
  }

  // NOTE: Dynamic parameter routes must always go at the very bottom,
  // otherwise they act as wildcards and devour static routes like 'admin' or 'menu'.

  @ApiOperation({ summary: 'Get details of a specific treatment (Public)' })
  @Get(':slug')
  findOnePublic(@Param('slug') slug: string) {
    return this.treatmentsService.findOnePublic(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get treatment details (Admin)' })
  @Get('admin/:id')
  findOneAdmin(@Param('id') id: string) {
    return this.treatmentsService.findOneAdmin(id);
  }
}
