import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseAuthService } from './firebase-auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env['JWT_SECRET'] || 'super-secret-key-afaq',
      signOptions: { expiresIn: '7d' }, // 7 days expiration
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, FirebaseAuthService, JwtStrategy],
  exports: [AuthService, FirebaseAuthService],
})
export class AuthModule {}
