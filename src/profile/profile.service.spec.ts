import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProfileService } from './profile.service';
import { User } from '../user/schemas/user.schema';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('ProfileService', () => {
  let service: ProfileService;
  let mockUserModel: any;

  const mockUserInstance: any = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'hashedPassword123',
    phone: '+1234567890',
    avatar: 'https://example.com/avatar.jpg',
    toObject: function () {
      return {
        _id: this._id,
        name: this.name,
        email: this.email,
        password: this.password,
        phone: this.phone,
        avatar: this.avatar,
      };
    },
    save: jest.fn().mockImplementation(function () {
      return Promise.resolve(this);
    }),
  };

  beforeEach(async () => {
    mockUserModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUserInstance),
      }),
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  describe('getProfile', () => {
    it('should return sanitized user profile', async () => {
      const result = await service.getProfile('507f1f77bcf86cd799439011');
      expect(result).toBeDefined();
      expect(result.name).toBe('Jane Doe');
      expect(result.password).toBeUndefined();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getProfile('nonexistent_id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update name and phone successfully', async () => {
      const result = await service.updateProfile('507f1f77bcf86cd799439011', {
        name: 'Jane Smith',
        phone: '+9876543210',
      });

      expect(result.name).toBe('Jane Smith');
      expect(result.phone).toBe('+9876543210');
      expect(result.password).toBeUndefined();
    });

    it('should throw ConflictException if new email already exists for another user', async () => {
      mockUserModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({ _id: 'other_id', email: 'taken@example.com' }),
      });

      await expect(
        service.updateProfile('507f1f77bcf86cd799439011', {
          email: 'taken@example.com',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if newPassword provided without currentPassword', async () => {
      await expect(
        service.updateProfile('507f1f77bcf86cd799439011', {
          newPassword: 'NewSecretPassword123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if currentPassword does not match', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => Promise.resolve(false) as any);

      await expect(
        service.updateProfile('507f1f77bcf86cd799439011', {
          currentPassword: 'WrongPassword',
          newPassword: 'NewSecretPassword123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update password when currentPassword matches', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => Promise.resolve(true) as any);
      jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => Promise.resolve('newHashedPassword') as any);

      const result = await service.updateProfile('507f1f77bcf86cd799439011', {
        currentPassword: 'CorrectPassword',
        newPassword: 'NewSecretPassword123',
      });

      expect(mockUserInstance.password).toBe('newHashedPassword');
      expect(result.password).toBeUndefined();
    });
  });
});

