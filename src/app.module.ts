import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { ServicesModule } from './services/services.module';
import { ContentModule } from './content/content.module';
import { AiModule } from './ai/ai.module';
import { SettingsModule } from './settings/settings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    ServicesModule,
    ContentModule,
    AiModule,
    SettingsModule,
    NotificationsModule,
    AuditLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
