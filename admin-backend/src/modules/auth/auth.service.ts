import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../user/user.service';
import { MemberService } from '../member/member.service';
import { LoginDto } from './dto/login.dto';
import { WxLoginDto } from './dto/wx-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly memberService: MemberService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  /** Admin login: verify username and password, return JWT token */
  async login(loginDto: LoginDto, ip: string) {
    const { username, password } = loginDto;

    // 1. Find user
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Username or password is incorrect');
    }

    // 2. Check status
    if (user.status === 0) {
      throw new BadRequestException('Account is disabled, please contact admin');
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Username or password is incorrect');
    }

    // 4. Update last login info
    await this.userService.updateLoginInfo(user.id, ip);

    // 5. Sign JWT token
    const payload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload);

    // 6. Build user info (exclude password)
    const { password: _pwd, ...userInfo } = user;

    return {
      access_token: token,
      userInfo,
    };
  }

  /** WeChat mini program login */
  async wxLogin(dto: WxLoginDto, ip: string) {
    const { code, nickName, avatarUrl } = dto;

    // 1. Exchange code for openid via WeChat API
    const appid = this.configService.get<string>('WX_APPID');
    const secret = this.configService.get<string>('WX_SECRET');
    const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

    let openid: string;
    let unionid: string;

    try {
      const response = await firstValueFrom(this.httpService.get(wxUrl));
      const wxData = response.data;

      if (wxData.errcode) {
        throw new BadRequestException(`WeChat login failed: ${wxData.errmsg}`);
      }

      openid = wxData.openid;
      unionid = wxData.unionid || '';
    } catch (err) {
      // In development mode, use code as mock openid
      if (this.configService.get('NODE_ENV') === 'development') {
        openid = `mock_openid_${code}`;
        unionid = '';
      } else {
        throw new BadRequestException('WeChat login failed, please try again');
      }
    }

    // 2. Find or create member
    let member = await this.memberService.findByOpenid(openid);
    if (!member) {
      member = await this.memberService.createByWx({
        openid,
        unionid,
        nickname: nickName || 'WeChat User',
        avatar: avatarUrl || '',
        lastLoginIp: ip,
      });
    } else {
      // Update login info and profile
      await this.memberService.updateLoginInfo(member.id, ip, {
        nickname: nickName || member.nickname,
        avatar: avatarUrl || member.avatar,
      });
      member = await this.memberService.findById(member.id);
    }

    // 3. Sign JWT token (member type)
    const payload = { sub: member.id, openid: member.openid, type: 'member' };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: member.id,
        nickName: member.nickname,
        avatarUrl: member.avatar,
        phone: member.phone,
        points: member.points,
        balance: member.balance,
      },
    };
  }
}
