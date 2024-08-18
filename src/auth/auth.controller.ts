import { Controller, Post, UseGuards, Request, Body, Get, HttpException, HttpStatus, Res, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forget_password.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,    private userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }
  
  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string): Promise<void> {
    await this.userService.requestPasswordReset(email);
  }

  @Post('reset-password')
  async resetPassword(@Body('token') token: string, @Body('newPassword') newPassword: string): Promise<void> {
    await this.userService.resetPassword(token, newPassword);
  }
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async profile(@Req() req) {
    if (!req.user) {
        throw new UnauthorizedException('Invalid credentials');
    }
    return req.user;
  }
}
