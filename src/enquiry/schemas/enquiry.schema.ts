import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EnquiryDocument = Enquiry & Document;

@Schema({ timestamps: true })
export class Enquiry {
  @Prop({ unique: true })
  enquiryId: string;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({ required: true, enum: ['new', 'contacted', 'resolved', 'deleted'], default: 'new' })
  status: string;

  @Prop()
  type: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  email: string;

  @Prop({ required: true })
  mobileNumber: string;

  @Prop()
  message: string;

  @Prop()
  internalNotes: string;
}

export const EnquirySchema = SchemaFactory.createForClass(Enquiry);
