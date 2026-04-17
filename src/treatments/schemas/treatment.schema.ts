import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TreatmentDocument = Treatment & Document;

@Schema({ timestamps: true })
export class Treatment {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  shortDescription: string;

  @Prop()
  description: string;

  @Prop()
  imagePath: string;

  @Prop({ required: true, enum: ['active', 'inactive', 'deleted'], default: 'active' })
  status: string;

  @Prop([String])
  keyBenefits: string[];

  @Prop([String])
  process: string[];
}

export const TreatmentSchema = SchemaFactory.createForClass(Treatment);
