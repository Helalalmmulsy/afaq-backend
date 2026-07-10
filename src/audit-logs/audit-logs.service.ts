import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    userId?: string;
    module: string;
    operation: string;
    entityName?: string;
    entityId?: string;
    success: boolean;
    ipAddress?: string;
    deviceInfo?: string;
    browserInfo?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        module: params.module,
        operation: params.operation,
        entityName: params.entityName,
        entityId: params.entityId,
        success: params.success,
        ipAddress: params.ipAddress,
        deviceInfo: params.deviceInfo,
        browserInfo: params.browserInfo,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    userId?: string;
    operation?: string;
    module?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { skip, take, userId, operation, module, startDate, endDate } = params;
    const where: any = {};

    if (userId) where.userId = userId;
    if (operation) where.operation = operation;
    if (module) where.module = module;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }
}
