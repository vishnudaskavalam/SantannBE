import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactMessage, ContactMessageDocument } from './schemas/contact.schema';
import { CreateContactDto } from './dto/create-contact.dto';
import { FilterContactDto } from './dto/filter-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(ContactMessage.name) private contactModel: Model<ContactMessageDocument>,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<ContactMessage> {
    const lastContact = await this.contactModel
      .findOne()
      .sort({ createdAt: -1 })
      .exec();

    let nextIdNumber = 1001;
    if (lastContact && lastContact.messageId) {
      const parts = lastContact.messageId.split('-');
      if (parts.length === 2 && !isNaN(Number(parts[1]))) {
        nextIdNumber = parseInt(parts[1], 10) + 1;
      }
    }

    const nextMessageId = `MSG-${nextIdNumber}`;

    const newContactMessage = new this.contactModel({
      ...createContactDto,
      messageId: nextMessageId,
    });

    return newContactMessage.save();
  }

  async findAll(filterDto: FilterContactDto) {
    const { page = 1, limit = 10, search, status } = filterDto;
    
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { email: { $regex: new RegExp(search, 'i') } },
      ];
    }
    
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.contactModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.contactModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<ContactMessage> {
    const message = await this.contactModel.findById(id).exec();
    if (!message) {
      throw new NotFoundException(`Message #${id} not found`);
    }
    return message;
  }

  async markAllRead(): Promise<{ success: boolean; modifiedCount: number }> {
    const res = await this.contactModel.updateMany(
      { status: 'unread' },
      { $set: { status: 'read' } }
    ).exec();
    return { success: true, modifiedCount: res.modifiedCount };
  }
  
  async updateStatus(id: string, status: string): Promise<ContactMessage> {
     const message = await this.contactModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).exec();
     if (!message) throw new NotFoundException(`Message overflow`);
     return message;
  }

  async countUnread(): Promise<{ count: number }> {
    const count = await this.contactModel.countDocuments({ status: 'unread' }).exec();
    return { count };
  }
}
