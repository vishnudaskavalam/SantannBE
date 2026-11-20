import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Res,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { CookieOptions, Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ValidateTokenDto } from './dto/validate-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

const getRefreshTokenCookieOptions = (): CookieOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'User successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any, @Res({ passthrough: true }) res: Response) {
    const { access_token, refreshToken, user } = await this.authService.login(
      req.user,
    );

    res.cookie(
      REFRESH_TOKEN_COOKIE,
      refreshToken,
      getRefreshTokenCookieOptions(),
    );

    return {
      access_token,
      user,
    };
  }

  @ApiOperation({
    summary: 'Refresh access token using httpOnly refresh token cookie',
  })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Post('refresh')
  async refresh(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token =
      req.cookies?.[REFRESH_TOKEN_COOKIE] || req.cookies?.['refresh_token'];
    if (!token) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const { access_token, refreshToken, user } =
      await this.authService.refreshToken(token);

    res.cookie(
      REFRESH_TOKEN_COOKIE,
      refreshToken,
      getRefreshTokenCookieOptions(),
    );

    return {
      access_token,
      user,
    };
  }

  @ApiOperation({ summary: 'Log out and clear refresh token cookie' })
  @ApiResponse({ status: 200, description: 'Logged out successfully.' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (req.user?.userId) {
      await this.authService.logout(req.user.userId);
    }

    const cookieOptions = getRefreshTokenCookieOptions();
    res.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);

    return {
      message: 'Logged out successfully',
    };
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  @UseGuards(JwtAuthGuard)
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @ApiOperation({ summary: 'Request a password reset email' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent if account exists.',
  })
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return {
      message:
        'If that email address is in our database, we will send you an email to reset your password.',
    };
  }

  @ApiOperation({ summary: 'Validate a reset token' })
  @ApiBody({ type: ValidateTokenDto })
  @ApiResponse({ status: 200, description: 'Token is valid.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  @Post('validate-reset-token')
  async validateResetToken(@Body() validateTokenDto: ValidateTokenDto) {
    const isValid = await this.authService.validateResetToken(
      validateTokenDto.token,
    );
    if (!isValid) {
      return { valid: false, message: 'Invalid or expired token.' };
    }
    return { valid: true, message: 'Token is valid.' };
  }

  @ApiOperation({ summary: 'Reset password using the reset token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password successfully changed.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
    return { message: 'Password has been successfully reset.' };
  }
}
