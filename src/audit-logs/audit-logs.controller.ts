import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN')
  @RequirePermissions({ action: 'READ', module: 'AUDIT_LOGS' })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('module') module?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditLogsService.findAll({
      skip,
      take,
      userId,
      operation: action,
      module,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }
}
