import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // 1. SEND NOTIFICATION LOGIC
  // ==========================================

  async sendToUser(
    userId: string,
    title: string,
    body: string,
    type: 'PUSH' | 'IN_APP',
    data?: any,
  ) {
    // 1. Save to database
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title,
        body,
        type: type === 'PUSH' ? NotificationType.PUSH : NotificationType.IN_APP,
        isRead: false,
      },
    });

    // 2. FCM Push Notification Stub (For Mobile & Client integration)
    console.log(`[FCM PUSH] Sending Notification to User ${userId}:`);
    console.log(`  Title: ${title}`);
    console.log(`  Body: ${body}`);
    console.log(`  Type: ${type}`);
    console.log(`  Payload: ${JSON.stringify(data || {})}`);

    return notification;
  }

  async sendToRole(
    roleName: string,
    title: string,
    body: string,
    type: 'PUSH' | 'IN_APP',
    data?: any,
  ) {
    // Find all users who have this role
    const users = await this.prisma.user.findMany({
      where: {
        role: {
          name: roleName,
        },
      },
    });

    if (users.length === 0) return [];

    // Send notifications concurrently
    return Promise.all(
      users.map((user) => this.sendToUser(user.id, title, body, type, data)),
    );
  }

  // ==========================================
  // 2. CLIENT MANAGEMENT ENDPOINTS
  // ==========================================

  async findAllForUser(userId: string, skip?: number, take?: number) {
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return { notifications, total };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
