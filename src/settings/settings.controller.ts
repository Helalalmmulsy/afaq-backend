import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // ==========================================
  // PUBLIC CONFIGURATION ENDPOINT
  // ==========================================

  @Get('public')
  async getPublicSettings() {
    const keys = ['platform_name', 'contact_phone', 'contact_email', 'default_lat', 'default_lng'];
    const all = await this.settingsService.getAll();
    return all.filter((s) => keys.includes(s.key));
  }

  // ==========================================
  // ADMIN CONSOLE ENDPOINTS (DASHBOARD)
  // ==========================================

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'READ', module: 'SETTINGS' })
  async getAll() {
    return this.settingsService.getAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'SETTINGS' })
  async setSettings(@Body() body: { key?: string; value?: string; settings?: { key: string; value: string }[] }) {
    if (body.settings && body.settings.length > 0) {
      return this.settingsService.setMany(body.settings);
    }
    if (body.key && body.value !== undefined) {
      return this.settingsService.set(body.key, body.value);
    }
    return { success: false, message: 'Invalid payload' };
  }
}
