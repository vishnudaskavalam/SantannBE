import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    authService = {
      login: jest.fn().mockResolvedValue({
        access_token: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        user: { _id: '123', email: 'test@example.com' },
      }),
      refreshToken: jest.fn().mockResolvedValue({
        access_token: 'new_access_token',
        user: { _id: '123', email: 'test@example.com' },
      }),
      logout: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('should set the refreshToken cookie as httpOnly and return only access_token and user', async () => {
      const mockReq = { user: { _id: '123', email: 'test@example.com' } };
      const mockRes = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.login(mockReq, mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'mock_refresh_token',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        }),
      );

      expect(result).toEqual({
        access_token: 'mock_access_token',
        user: { _id: '123', email: 'test@example.com' },
      });
      expect(result).not.toHaveProperty('refreshToken');
    });
  });

  describe('refresh', () => {
    it('should refresh token using cookie', async () => {
      const mockReq = { cookies: { refreshToken: 'mock_refresh_token' } };
      const mockRes = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.refresh(mockReq, mockRes);

      expect(authService.refreshToken).toHaveBeenCalledWith(
        'mock_refresh_token',
      );
      expect(result).toEqual({
        access_token: 'new_access_token',
        user: { _id: '123', email: 'test@example.com' },
      });
      expect(result).not.toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException if cookie is missing', async () => {
      const mockReq = { cookies: {} };
      const mockRes = { cookie: jest.fn() } as unknown as Response;

      await expect(controller.refresh(mockReq, mockRes)).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should clear refreshToken cookie and call logout service', async () => {
      const mockReq = { user: { userId: '123' } };
      const mockRes = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.logout(mockReq, mockRes);

      expect(authService.logout).toHaveBeenCalledWith('123');
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        }),
      );
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
