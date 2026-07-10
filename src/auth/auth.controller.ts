import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any) {
    try {
      if (!body.email || !body.password) {
        throw new UnauthorizedException('Email and password are required');
      }
      const user = await this.authService.validateUser(body.email, body.password);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return await this.authService.login(user);
    } catch (err) {
      console.error('LOGIN_ROUTE_CRASH:', err);
      throw err;
    }
  }

  @Post('firebase')
  @HttpCode(HttpStatus.OK)
  async firebaseLogin(@Body() body: any) {
    if (!body.token) {
      throw new UnauthorizedException('Firebase ID Token is required');
    }
    return this.authService.loginWithFirebase(body.token);
  }
}
