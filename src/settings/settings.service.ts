import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateSettingsDto } from './dto/settings.dto';
import { Setting, SettingDocument } from './schemas/setting.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Setting.name)
    private readonly settingModel: Model<SettingDocument>,
  ) {}

  async upsert(updateSettingsDto: UpdateSettingsDto): Promise<Setting> {
    // Because it's a singleton, we always just update the first document we find,
    // or create it if no document exists.
    const existing = await this.settingModel.findOne();
    
    if (existing) {
      // Find the existing logic and update it deeply via Mongoose or assign
      // Because Mongoose subdocuments behave weirdly with top-level assignments sometimes,
      // it's safest to use $set, but findOneAndUpdate handles deep updates mostly fine.
      // E.g., if updateSettingsDto only has `general`, we don't want to wipe `homePage`.
      const updated = await this.settingModel.findOneAndUpdate(
        {}, 
        { $set: updateSettingsDto }, 
        { new: true }
      ).exec();
      return updated as Setting;
    }

    // If it doesn't exist, create the very first settings object.
    const createdSetting = new this.settingModel(updateSettingsDto);
    return createdSetting.save();
  }

  async getSettings(keysQuery?: string): Promise<Setting> {
    const query = this.settingModel.findOne();
    if (keysQuery) {
      const keys = keysQuery.split(',').map(k => k.trim()).join(' ');
      query.select(keys);
    }
    
    const settings = await query.exec();
    if (!settings) {
      // Return a blank default document if it doesn't exist yet to prevent crashes
      return new this.settingModel();
    }
    return settings;
  }
}
