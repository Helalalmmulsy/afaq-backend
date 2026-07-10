import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class FirebaseAuthService {
  async verifyIdToken(token: string): Promise<{ email: string; name: string; uid: string }> {
    // Local development mock token support
    if (token.startsWith('mock_')) {
      const parts = token.split('_');
      const role = parts[1] || 'customer';
      const uid = parts[2] || 'mock-uid-123';
      const email = `${role}-${uid}@example.com`;
      const name = `Mock ${role.charAt(0).toUpperCase() + role.slice(1)}`;
      return { email, name, uid };
    }

    try {
      // Decode base64 JWT payload without verifying signature for standard tokens
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        throw new Error('Invalid JWT format');
      }
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        Buffer.from(base64, 'base64')
          .toString()
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      const payload = JSON.parse(jsonPayload);
      
      return {
        email: payload.email || '',
        name: payload.name || payload.email?.split('@')[0] || 'Firebase User',
        uid: payload.sub || payload.user_id || 'firebase-uid',
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid Firebase Token format');
    }
  }
}
