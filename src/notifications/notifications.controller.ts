import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ==========================================
  // CLIENT NOTIFICATION ENDPOINTS
  // ==========================================

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Request() req: any,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.notificationsService.findAllForUser(req.user.id, skip, take);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Post('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  // ==========================================
  // TEST SENDING ENDPOINT (ADMINS ONLY)
  // ==========================================

  @Post('test-send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  async sendTestNotification(
    @Body() body: { userId?: string; roleName?: string; title: string; body: string; type: 'PUSH' | 'IN_APP'; data?: any },
  ) {
    if (body.userId) {
      return this.notificationsService.sendToUser(body.userId, body.title, body.body, body.type, body.data);
    }
    if (body.roleName) {
      return this.notificationsService.sendToRole(body.roleName, body.title, body.body, body.type, body.data);
    }
    return { success: false, message: 'Specify userId or roleName' };
  }
}
