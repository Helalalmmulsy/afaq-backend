import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  override handleRequest<TUser = any>(err: any, user: any, info: any, context: any, status?: any): TUser {
    // If there's an error or no user, return null instead of throwing an UnauthorizedException
    if (err || !user) {
      return null as any;
    }
    return user;
  }
}
