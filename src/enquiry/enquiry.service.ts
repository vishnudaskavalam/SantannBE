import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Enquiry, EnquiryDocument } from './schemas/enquiry.schema';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryStatusDto } from './dto/update-enquiry.dto';
import { FilterEnquiryDto } from './dto/filter-enquiry.dto';

@Injectable()
export class EnquiryService {
  constructor(
    @InjectModel(Enquiry.name) private enquiryModel: Model<EnquiryDocument>,
  ) {}

  async create(createEnquiryDto: CreateEnquiryDto): Promise<Enquiry> {
    const lastEnquiry = await this.enquiryModel
      .findOne()
      .sort({ createdAt: -1 })
      .exec();

    let nextIdNumber = 1001;
    if (lastEnquiry && lastEnquiry.enquiryId) {
      const parts = lastEnquiry.enquiryId.split('-');
      if (parts.length === 2 && !isNaN(Number(parts[1]))) {
        nextIdNumber = parseInt(parts[1], 10) + 1;
      }
    }

    const nextEnquiryId = `ENQ-${nextIdNumber}`;

    const newEnquiry = new this.enquiryModel({
      ...createEnquiryDto,
      enquiryId: nextEnquiryId,
    });

    return newEnquiry.save();
  }

  async findAll(filterDto: FilterEnquiryDto) {
    const { page = 1, limit = 10, ...filters } = filterDto;
    
    const query: any = {};
    
    if (filters.name) {
      query.name = { $regex: new RegExp(filters.name, 'i') };
    }
    if (filters.enquiryId) {
      query.enquiryId = filters.enquiryId;
    }
    if (filters.email) {
      query.email = { $regex: new RegExp(filters.email, 'i') };
    }
    if (filters.mobileNumber) {
      query.mobileNumber = { $regex: new RegExp(filters.mobileNumber, 'i') };
    }
    if (filters.type) {
      query.type = filters.type;
    }
    if (filters.status) {
      query.status = filters.status;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.enquiryModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.enquiryModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Enquiry> {
    const enquiry = await this.enquiryModel.findById(id).exec();
    if (!enquiry) {
      throw new NotFoundException(`Enquiry #${id} not found`);
    }
    return enquiry;
  }

  async updateStatus(id: string, updateEnquiryStatusDto: UpdateEnquiryStatusDto): Promise<Enquiry> {
    const existingEnquiry = await this.enquiryModel
      .findByIdAndUpdate(id, { $set: updateEnquiryStatusDto }, { new: true })
      .exec();

    if (!existingEnquiry) {
      throw new NotFoundException(`Enquiry #${id} not found`);
    }
    return existingEnquiry;
  }

  async countNew(): Promise<{ count: number }> {
    const count = await this.enquiryModel.countDocuments({ status: 'new' }).exec();
    return { count };
  }
}
