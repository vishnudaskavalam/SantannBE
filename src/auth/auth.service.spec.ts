import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userService: UserService;

  const rawToken = 'test_refresh_token';
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const mockUser = {
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    email: 'test@example.com',
    password: 'hashedpassword',
    refreshTokenHash: hashedToken,
    toObject: () => ({
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      password: 'hashedpassword',
      refreshTokenHash: hashedToken,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOneByEmail: jest.fn().mockResolvedValue(mockUser),
            findOneByToken: jest.fn(),
            findById: jest.fn().mockResolvedValue(mockUser),
            create: jest.fn(),
            updateRefreshTokenHash: jest.fn().mockResolvedValue(true),
            compareAndSetRefreshTokenHash: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendPasswordResetEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockImplementation((payload) =>
              Promise.resolve(`signed_${payload.email || payload.sub}`),
            ),
            verifyAsync: jest.fn().mockImplementation((token) =>
              Promise.resolve({
                email: 'test@example.com',
                sub: '507f1f77bcf86cd799439011',
                tokenType: 'refresh',
              }),
            ),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => defaultValue || 'test-secret'),
            getOrThrow: jest.fn((key: string) => 'test-secret'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
  });

  describe('login', () => {
    it('should generate both access_token and refreshToken and store hash', async () => {
      const user = { _id: { toString: () => '507f1f77bcf86cd799439011' }, email: 'test@example.com' };
      const result = await service.login(user);

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(userService.updateRefreshTokenHash).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.access_token).toBe('signed_test@example.com');
      expect(result.refreshToken).toBe('signed_507f1f77bcf86cd799439011');
    });
  });

  describe('refreshToken', () => {
    it('should verify token and return new access_token without password in user', async () => {
      const result = await service.refreshToken(rawToken);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(rawToken, expect.any(Object));
      expect(userService.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toHaveProperty('access_token');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('refreshTokenHash');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException if jwt verify fails', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockImplementationOnce(() => {
        return Promise.reject(new Error('invalid token'));
      });

      await expect(service.refreshToken('invalid_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(userService, 'findById').mockResolvedValueOnce(null as any);

      await expect(service.refreshToken('token_for_missing_user')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
