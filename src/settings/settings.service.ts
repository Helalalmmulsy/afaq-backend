import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get(key: string, defaultValue = ''): Promise<string> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    return setting ? setting.value : defaultValue;
  }

  async getAll() {
    const list = await this.prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });
    if (list.length === 0) {
      const defaults = [
        { key: 'platform_name', value: 'آفاق العرب الذكية' },
        { key: 'platform_logo', value: '' },
        { key: 'platform_email', value: 'contact@afaq.com' },
        { key: 'platform_phone', value: '777633944' },
        { key: 'platform_address', value: 'محافظة ذمار، اليمن' },
        { key: 'office_latitude', value: '14.55998012643909' },
        { key: 'office_longitude', value: '44.3859385889446' },
        { key: 'facebook_url', value: 'https://www.facebook.com/share/1GXQJ3L19s/' },
        { key: 'instagram_url', value: '' },
        { key: 'twitter_url', value: '' },
        { key: 'linkedin_url', value: '' },
        { key: 'snapchat_url', value: '' },
        { key: 'youtube_url', value: '' },
        { key: 'whatsapp_phone', value: '777633944' },
        { key: 'ai_enabled', value: 'true' },
        { key: 'ai_api_key', value: process.env.AI_API_KEY || '' },
        { key: 'ai_model', value: 'gemini-3.8-flash' },
        { key: 'ai_monthly_limit', value: '1000' },
      ];
      await this.setMany(defaults);
      return this.prisma.systemSetting.findMany({
        orderBy: { key: 'asc' },
      });
    }
    return list;
  }

  async set(key: string, value: string) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      update: { value, updatedAt: new Date() },
      create: { key, value },
    });
  }

  async setMany(settings: { key: string; value: string }[]) {
    return this.prisma.$transaction(
      settings.map((s) =>
        this.prisma.systemSetting.upsert({
          where: { key: s.key },
          update: { value: s.value, updatedAt: new Date() },
          create: { key: s.key, value: s.value },
        }),
      ),
    );
  }
}
