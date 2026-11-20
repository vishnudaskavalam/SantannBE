import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { name, email, password } = createUserDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
    });

    return createdUser.save();
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email })
      .select('+password +refreshTokenHash');
  }

  async updateRefreshTokenHash(
    userId: string | Types.ObjectId,
    refreshTokenHash: string | null,
  ) {
    return this.userModel.updateOne(
      { _id: userId },
      { $set: { refreshTokenHash } },
    );
  }

  async compareAndSetRefreshTokenHash(
    userId: string | Types.ObjectId,
    oldHash: string,
    newHash: string,
  ): Promise<boolean> {
    const result = await this.userModel.updateOne(
      {
        _id: userId,
        refreshTokenHash: oldHash,
      },
      {
        $set: { refreshTokenHash: newHash },
      },
    );

    return result.modifiedCount === 1;
  }
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('+password +refreshTokenHash').exec();
  }

  async findOneByToken(token: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ resetPasswordToken: token }).exec();
  }
}
