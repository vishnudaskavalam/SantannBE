import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingDocument = Setting & Document;

@Schema()
class GeneralSettings {
  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  hours: string;

  @Prop()
  address: string;

  @Prop()
  logoPath: string;

  @Prop()
  footerDescription: string;

  @Prop()
  workingHours: string;
}

@Schema()
class AboutSettings {
  @Prop()
  headline: string;

  @Prop()
  body: string;

  @Prop()
  heroImage: string;

  @Prop()
  mainImage: string;

  @Prop()
  cardTitle: string;

  @Prop()
  cardBody: string;
}

@Schema()
class SectionSettings {
  @Prop()
  heading: string;

  @Prop()
  description: string;
}

@Schema()
class TreatmentSectionSettings {
  @Prop()
  title: string;

  @Prop()
  description: string;
}

@Schema()
class HeroSlide {
  @Prop()
  id: string;

  @Prop()
  image: string;

  @Prop()
  title: string;

  @Prop()
  subtitle: string;

  @Prop()
  description: string;

  @Prop()
  buttonText: string;

  @Prop()
  buttonLink: string;
}

@Schema()
class Expert {
  @Prop()
  id: string;

  @Prop()
  name: string;

  @Prop()
  title: string;

  @Prop()
  image: string;
}

@Schema()
class HomePageSettings {
  @Prop({ type: TreatmentSectionSettings })
  treatmentSection: TreatmentSectionSettings;

  @Prop({ type: SectionSettings })
  aboutSection: SectionSettings;

  @Prop({ type: SectionSettings })
  teamSection: SectionSettings;

  @Prop({ type: SectionSettings })
  questionsSection: SectionSettings;
}

@Schema()
class TeamSettings {
  @Prop()
  headline: string;

  @Prop()
  body: string;
}

@Schema({ timestamps: true })
export class Setting {
  @Prop({ type: GeneralSettings, default: {} })
  general: GeneralSettings;

  @Prop({ type: AboutSettings, default: {} })
  about: AboutSettings;

  @Prop({ type: TeamSettings, default: {} })
  team: TeamSettings;

  @Prop({ type: HomePageSettings, default: {} })
  homePage: HomePageSettings;

  @Prop({ type: [Expert], default: [] })
  experts: Expert[];

  @Prop({ type: [HeroSlide], default: [] })
  heroSlides: HeroSlide[];
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
