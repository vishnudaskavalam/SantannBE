import { Controller, Post, Get, Delete, Param, UseInterceptors, UploadedFile, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload an image file and register its metadata to the new table' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          example: 'hero'
        }
      },
    },
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req: any, file: any, callback: any) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
  }))
  uploadFile(@UploadedFile() file: any, @Body() createMediaDto: CreateMediaDto) {
    if (!file) {
      throw new BadRequestException('File is required!');
    }
    const fileUrl = `/uploads/${file.filename}`;
    return this.mediaService.createMediaRecord(fileUrl, createMediaDto);
  }

  @ApiOperation({ summary: 'List all uploaded media items from the table' })
  @Get()
  getAllMedia() {
    return this.mediaService.getAllMedia();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a media record and its physical file' })
  @Delete(':id')
  deleteMedia(@Param('id') id: string) {
    return this.mediaService.deleteMedia(id);
  }
}

