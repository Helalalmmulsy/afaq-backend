import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseAuthService } from './firebase-auth.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private firebaseAuthService: FirebaseAuthService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    // Note: In production, passwords must be hashed (e.g., using bcrypt/argon2)
    if (!user || user.password !== pass) {
      return null;
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('تم إيقاف حسابك من قبل الإدارة. يرجى مراجعة الدعم الفني.');
    }

    if (user.status === 'ARCHIVED') {
      throw new UnauthorizedException('هذا الحساب تم أرشفته أو حذفه.');
    }

    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role.name };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    };
  }

  async loginWithFirebase(firebaseToken: string) {
    const firebasePayload = await this.firebaseAuthService.verifyIdToken(firebaseToken);
    
    // Find or create customer user
    let user = await this.prisma.user.findUnique({
      where: { email: firebasePayload.email },
      include: { role: true },
    });

    if (!user) {
      // Find or create CUSTOMER role
      let customerRole = await this.prisma.role.findUnique({
        where: { name: 'CUSTOMER' },
      });

      if (!customerRole) {
        customerRole = await this.prisma.role.create({
          data: {
            name: 'CUSTOMER',
            nameAr: 'عميل',
            nameEn: 'Customer',
          },
        });
      }

      user = await this.prisma.user.create({
        data: {
          name: firebasePayload.name,
          email: firebasePayload.email,
          roleId: customerRole.id,
          status: 'ACTIVE',
        },
        include: { role: true },
      });
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('تم إيقاف حسابك من قبل الإدارة. يرجى مراجعة الدعم الفني.');
    }

    if (user.status === 'ARCHIVED') {
      throw new UnauthorizedException('هذا الحساب تم أرشفته أو حذفه.');
    }

    // Generate local JWT
    const payload = { email: user.email, sub: user.id, role: user.role.name };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    };
  }
}
