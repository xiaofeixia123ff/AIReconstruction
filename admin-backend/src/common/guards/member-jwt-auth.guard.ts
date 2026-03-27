import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MemberJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Please login first');
    }
    // Only allow member type tokens
    if (user.type !== 'member') {
      throw new UnauthorizedException('Access denied');
    }
    return user;
  }
}
