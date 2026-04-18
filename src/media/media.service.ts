import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { Media, MediaDocument } from './schemas/media.schema';
import { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name)
    private readonly mediaModel: Model<MediaDocument>,
  ) {}

  async createMediaRecord(url: string, createMediaDto: CreateMediaDto): Promise<Media> {
    const createdMedia = new this.mediaModel({
      url,
      type: createMediaDto.type,
    });
    return createdMedia.save();
  }

  async getAllMedia(): Promise<Media[]> {
    return this.mediaModel.find().exec();
  }

  async deleteMedia(id: string): Promise<{ deleted: boolean }> {
    const media = await this.mediaModel.findById(id).exec();
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    // Attempt to delete physical file
    try {
      const filePath = path.join(process.cwd(), media.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.warn(`Could not delete physical file for ${media.url}:`, err);
    }

    await this.mediaModel.findByIdAndDelete(id).exec();
    return { deleted: true };
  }

  async updateMedia(id: string, updateData: any): Promise<Media> {
    const updatedMedia = await this.mediaModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updatedMedia) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    return updatedMedia;
  }
}
