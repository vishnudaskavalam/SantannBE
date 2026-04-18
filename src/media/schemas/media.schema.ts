import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MediaDocument = Media & Document;

@Schema({ timestamps: true })
export class Media {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  type: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
