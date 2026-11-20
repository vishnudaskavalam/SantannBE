import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../user/schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private sanitizeUser(user: UserDocument | any) {
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    return obj;
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User profile not found');
    }
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    const { name, email, phone, avatar, currentPassword, newPassword } =
      updateProfileDto;

    // If email is changing, check if another user already has this email
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = await this.userModel
        .findOne({
          email: email.toLowerCase(),
          _id: { $ne: userId },
        })
        .exec();

      if (existing) {
        throw new ConflictException('Email already in use by another account');
      }
      user.email = email.toLowerCase();
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        throw new BadRequestException(
          'Current password is required to set a new password',
        );
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException('Current password does not match');
      }
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(newPassword, salt);
    }

    const savedUser = await user.save();
    return this.sanitizeUser(savedUser);
  }
}

