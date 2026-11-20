import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private mailService: MailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);

    if (!isPasswordValid) {
      return null;
    }

    const userObj = user.toObject();

    delete userObj.password;
    delete userObj.refreshTokenHash;
    delete userObj.resetPasswordToken;
    delete userObj.resetPasswordExpires;

    return userObj;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_ACCESS_EXPIRES_IN',
        '15m',
      ) as any,
    });

    const refreshToken = await this.jwtService.signAsync(
      { ...payload, tokenType: 'refresh' },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
          '7d',
        ) as any,
      },
    );

    return { accessToken, refreshToken };
  }

  async login(user: any) {
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Store only the hash, never the raw refresh token.
    await this.userService.updateRefreshTokenHash(
      user._id,
      this.hashToken(refreshToken),
    );

    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    delete userObj.refreshTokenHash;

    return {
      access_token: accessToken,
      refreshToken,
      user: userObj,
    };
  }
  async logout(userId: string): Promise<void> {
    await this.userService.updateRefreshTokenHash(userId, null);
  }

  async refreshToken(token: string) {
    if (!token) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const secret =
        this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

      const payload = await this.jwtService.verifyAsync(token, {
        secret,
        algorithms: ['HS256'],
      });

      if (payload?.tokenType !== 'refresh' || !payload.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.userService.findById(payload.sub);
      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Session expired');
      }

      const incomingHash = this.hashToken(token);

      if (incomingHash !== user.refreshTokenHash) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      const { accessToken, refreshToken } = await this.generateTokens(user);

      // Replace the old hash with the new hash.
      // Ideally this must be an atomic compare-and-set DB operation.
      const updated = await this.userService.compareAndSetRefreshTokenHash(
        user._id.toString(),
        incomingHash,
        this.hashToken(refreshToken),
      );

      if (!updated) {
        throw new UnauthorizedException('Refresh token already used');
      }

      const userObj = user.toObject ? user.toObject() : { ...user };
      delete userObj.password;
      delete userObj.refreshTokenHash;

      return {
        access_token: accessToken,
        refreshToken,
        user: userObj,
      };
    } catch (error) {
      console.log(error)
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    const { password, ...result } = user.toObject();
    return result;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      // Do not reveal whether a user exists to prevent email enumeration
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save hashed token and expiration to the user object (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);
  }

  async validateResetToken(token: string): Promise<boolean> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userService.findOneByToken(hashedToken);

    if (!user) {
      return false;
    }

    // Check expiration
    if (
      user.resetPasswordExpires &&
      user.resetPasswordExpires.getTime() < Date.now()
    ) {
      return false;
    }

    return true;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userService.findOneByToken(hashedToken);

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    if (
      user.resetPasswordExpires &&
      user.resetPasswordExpires.getTime() < Date.now()
    ) {
      throw new UnauthorizedException('Token has expired');
    }

    const salt = await bcrypt.genSalt();
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = newHashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  }
}
