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
    const publicKeys = [
      'platform_name',
      'platform_logo',
      'platform_email',
      'platform_phone',
      'platform_address',
      'office_latitude',
      'office_longitude',
      'facebook_url',
      'instagram_url',
      'twitter_url',
      'linkedin_url',
      'snapchat_url',
      'youtube_url',
      'whatsapp_phone',
      'default_lat',
      'default_lng',
      'about_us',
      'company_vision',
      'company_mission',
    ];
    const all = await this.settingsService.getAll();
    const filtered = all.filter((s) => publicKeys.includes(s.key));
    const map: Record<string, string> = {};
    filtered.forEach((s) => {
      map[s.key] = s.value;
    });
    return {
      settings: filtered,
      ...map,
    };
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
