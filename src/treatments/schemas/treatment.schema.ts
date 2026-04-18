import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TreatmentDocument = Treatment & Document;

@Schema()
class ProcessStep {
  @Prop()
  step: string;

  @Prop()
  detail: string;
}

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

  @Prop({ required: true, enum: ['active', 'inactive', 'deleted'], default: 'active' })
  status: string;

  @Prop()
  iconType: string;

  @Prop([String])
  keyBenefits: string[];

  @Prop({ type: [ProcessStep], default: [] })
  process: ProcessStep[];
}

export const TreatmentSchema = SchemaFactory.createForClass(Treatment);
