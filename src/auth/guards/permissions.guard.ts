import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, RequiredPermission } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.permissions || !user.role) {
      return false;
    }

    // System Administrator bypasses all checks
    if (user.role === 'SYSTEM_ADMIN') {
      return true;
    }

    // Check if user has all required permissions
    return requiredPermissions.every((reqPerm) =>
      user.permissions.some(
        (userPerm: { action: string; module: string }) =>
          userPerm.action === reqPerm.action && userPerm.module === reqPerm.module,
      ),
    );
  }
}
