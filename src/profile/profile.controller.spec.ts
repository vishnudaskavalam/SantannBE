import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

describe('ProfileController', () => {
  let controller: ProfileController;
  let service: Partial<ProfileService>;

  const mockProfile = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+1234567890',
  };

  beforeEach(async () => {
    service = {
      getProfile: jest.fn().mockResolvedValue(mockProfile),
      updateProfile: jest.fn().mockResolvedValue({
        ...mockProfile,
        name: 'Jane Updated',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
  });

  describe('getProfile', () => {
    it('should return the current user profile', async () => {
      const mockReq = { user: { userId: '507f1f77bcf86cd799439011' } };
      const result = await controller.getProfile(mockReq);

      expect(service.getProfile).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateProfile', () => {
    it('should call updateProfile with userId and DTO', async () => {
      const mockReq = { user: { userId: '507f1f77bcf86cd799439011' } };
      const updateDto = { name: 'Jane Updated' };

      const result = await controller.updateProfile(mockReq, updateDto);

      expect(service.updateProfile).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateDto,
      );
      expect(result.name).toBe('Jane Updated');
    });
  });
});

