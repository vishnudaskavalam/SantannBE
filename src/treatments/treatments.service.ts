import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { Treatment, TreatmentDocument } from './schemas/treatment.schema';

@Injectable()
export class TreatmentsService {
  constructor(
    @InjectModel(Treatment.name)
    private readonly treatmentModel: Model<TreatmentDocument>,
  ) {}

  async create(createTreatmentDto: CreateTreatmentDto): Promise<Treatment> {
    const createdTreatment = new this.treatmentModel(createTreatmentDto);
    return createdTreatment.save();
  }

  async update(id: string, updateTreatmentDto: UpdateTreatmentDto): Promise<Treatment> {
    const updatedTreatment = await this.treatmentModel
      .findByIdAndUpdate(id, updateTreatmentDto, { new: true })
      .exec();
    
    if (!updatedTreatment) {
      throw new NotFoundException(`Treatment with ID ${id} not found`);
    }
    return updatedTreatment;
  }

  async findAllAdmin(): Promise<Treatment[]> {
    // Select only requested fields: name and slug, implicitly excluding deleted perhaps?
    // User requested: list (only name and slug). We should probably exclude deleted ones from general admin view, or keep them.
    // Let's exclude deleted to be safe, or just return all and frontend filters. I'll exclude deleted.
    return this.treatmentModel.find({ status: { $ne: 'deleted' } }).exec();
  }

  async findOneAdmin(id: string): Promise<Treatment> {
    const treatment = await this.treatmentModel.findById(id).exec();
    if (!treatment) {
      throw new NotFoundException(`Treatment with ID ${id} not found`);
    }
    return treatment;
  }

  async remove(id: string): Promise<Treatment> {
    const deletedTreatment = await this.treatmentModel
      .findByIdAndUpdate(id, { status: 'deleted' }, { new: true })
      .exec();
      
    if (!deletedTreatment) {
      throw new NotFoundException(`Treatment with ID ${id} not found`);
    }
    return deletedTreatment;
  }

  async findAllPublic(): Promise<Treatment[]> {
    // Returns name, shortDescription, imagePath
    return this.treatmentModel
      .find({ status: 'active' })
      .select('name shortDescription imagePath slug')
      .exec();
  }

  async findMenuPublic(): Promise<Treatment[]> {
    // Returns name, slug
    return this.treatmentModel
      .find({ status: 'active' })
      .select('name slug')
      .exec();
  }

  async findOnePublic(slug: string): Promise<Treatment> {
    const treatment = await this.treatmentModel.findOne({ slug, status: 'active' }).exec();
    if (!treatment) {
      throw new NotFoundException(`Treatment with slug ${slug} not found`);
    }
    return treatment;
  }
}
