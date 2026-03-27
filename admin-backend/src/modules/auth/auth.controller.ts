import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { WxLoginDto } from './dto/wx-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** POST /auth/login - Admin login */
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket?.remoteAddress ||
      '';
    return this.authService.login(loginDto, ip);
  }

  /** POST /auth/wx-login - WeChat mini program login */
  @Post('wx-login')
  async wxLogin(@Body() wxLoginDto: WxLoginDto, @Req() req: any) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket?.remoteAddress ||
      '';
    return this.authService.wxLogin(wxLoginDto, ip);
  }
}
