import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactMessageDocument = ContactMessage & Document;

@Schema({ timestamps: true })
export class ContactMessage {
  @Prop({ unique: true })
  messageId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, enum: ['unread', 'read'], default: 'unread' })
  status: string;
}

export const ContactMessageSchema = SchemaFactory.createForClass(ContactMessage);
