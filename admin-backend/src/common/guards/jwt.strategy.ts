import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../modules/user/user.service';
import { MemberService } from '../../modules/member/member.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly memberService: MemberService,
  ) {
    super({
      // Extract token from Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  /** Called after token is verified, return value is injected into req.user */
  async validate(payload: { sub: number; username?: string; openid?: string; type?: string }) {
    // Mini program member token
    if (payload.type === 'member') {
      let member: any;
      try {
        member = await this.memberService.findById(payload.sub);
      } catch {
        throw new UnauthorizedException('User not found or disabled');
      }
      if (!member || member.status === 0) {
        throw new UnauthorizedException('User not found or disabled');
      }
      return { ...member, type: 'member' };
    }

    // Admin user token
    const user = await this.userService.findById(payload.sub);
    if (!user || user.status === 0) {
      throw new UnauthorizedException('User not found or disabled');
    }
    // Return safe user info (no password)
    const { password, ...result } = user;
    return result;
  }
}
