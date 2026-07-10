import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // ==========================================
  // CUSTOMER CHAT ENDPOINTS (MOBILE APPLICATION)
  // ==========================================

  @Post('conversations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  async startConversation(@Request() req: any, @Body('title') title?: string) {
    return this.aiService.startConversation(req.user.id, title);
  }

  @Get('conversations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  async getConversations(@Request() req: any) {
    return this.aiService.getConversations(req.user.id);
  }

  @Get('conversations/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  async getConversationHistory(@Param('id') id: string, @Request() req: any) {
    return this.aiService.getConversationHistory(id, req.user.id);
  }

  @Post('conversations/:id/message')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  async sendMessage(
    @Param('id') id: string,
    @Request() req: any,
    @Body('message') message: string,
  ) {
    return this.aiService.sendMessage(req.user.id, id, message);
  }

  // ==========================================
  // ADMIN & ANALYTICS ENDPOINTS (DASHBOARD)
  // ==========================================

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'READ', module: 'DASHBOARD' })
  async getUsageStats() {
    return this.aiService.getUsageStats();
  }
}
