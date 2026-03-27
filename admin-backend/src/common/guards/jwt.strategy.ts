import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      // Extract token from Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  /** Called after token is verified, return value is injected into req.user */
  async validate(payload: { sub: number; username: string }) {
    const user = await this.userService.findById(payload.sub);
    if (!user || user.status === 0) {
      throw new UnauthorizedException('User not found or disabled');
    }
    // Return safe user info (no password)
    const { password, ...result } = user;
    return result;
  }
}
