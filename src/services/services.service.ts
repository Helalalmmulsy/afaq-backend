import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Department, RequestStatus, ProjectStatus, ProjectMemberRole } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // 1. SERVICES MANAGEMENT
  // ==========================================

  async createService(data: {
    nameAr: string;
    nameEn?: string;
    department: Department;
    shortDescriptionAr: string;
    shortDescriptionEn?: string;
    detailedDescriptionAr: string;
    detailedDescriptionEn?: string;
    coverImage: string;
    status?: 'DRAFT' | 'PUBLISHED' | 'SUSPENDED' | 'ARCHIVED';
  }) {
    const nameEn = (data.nameEn && data.nameEn.trim() !== '') ? data.nameEn : data.nameAr;
    const shortDescriptionEn = (data.shortDescriptionEn && data.shortDescriptionEn.trim() !== '') ? data.shortDescriptionEn : data.shortDescriptionAr;
    const detailedDescriptionEn = (data.detailedDescriptionEn && data.detailedDescriptionEn.trim() !== '') ? data.detailedDescriptionEn : data.detailedDescriptionAr;

    return this.prisma.service.create({
      data: {
        ...data,
        nameEn,
        shortDescriptionEn,
        detailedDescriptionEn,
        status: data.status || 'DRAFT',
      },
    });
  }

  async findEngineers() {
    return this.prisma.user.findMany({
      where: {
        role: {
          name: 'ENGINEER',
        },
        status: 'ACTIVE',
      },
      include: {
        engineerProfile: {
          include: {
            projectMembers: {
              include: {
                project: true,
              },
            },
          },
        },
      },
    });
  }

  async findAllServices(params: {
    department?: Department;
    status?: 'DRAFT' | 'PUBLISHED' | 'SUSPENDED' | 'ARCHIVED';
    onlyPublished?: boolean;
  }) {
    const { department, status, onlyPublished } = params;
    const where: any = {};

    if (onlyPublished) {
      where.status = 'PUBLISHED';
    } else if (status) {
      where.status = status;
    } else {
      where.status = { not: 'ARCHIVED' };
    }

    if (department) {
      where.department = department;
    }

    return this.prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneService(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async updateService(
    id: string,
    data: {
      nameAr?: string;
      nameEn?: string;
      department?: Department;
      shortDescriptionAr?: string;
      shortDescriptionEn?: string;
      detailedDescriptionAr?: string;
      detailedDescriptionEn?: string;
      coverImage?: string;
      status?: 'DRAFT' | 'PUBLISHED' | 'SUSPENDED' | 'ARCHIVED';
    },
  ) {
    const service = await this.findOneService(id);
    if (service.status === 'ARCHIVED') {
      throw new BadRequestException('Archived services cannot be modified');
    }

    const nameEn = (data.nameEn !== undefined) 
      ? ((data.nameEn && data.nameEn.trim() !== '') ? data.nameEn : (data.nameAr || '')) 
      : undefined;
    const shortDescriptionEn = (data.shortDescriptionEn !== undefined) 
      ? ((data.shortDescriptionEn && data.shortDescriptionEn.trim() !== '') ? data.shortDescriptionEn : (data.shortDescriptionAr || '')) 
      : undefined;
    const detailedDescriptionEn = (data.detailedDescriptionEn !== undefined) 
      ? ((data.detailedDescriptionEn && data.detailedDescriptionEn.trim() !== '') ? data.detailedDescriptionEn : (data.detailedDescriptionAr || '')) 
      : undefined;

    return this.prisma.service.update({
      where: { id },
      data: {
        ...data,
        ...(nameEn !== undefined ? { nameEn } : {}),
        ...(shortDescriptionEn !== undefined ? { shortDescriptionEn } : {}),
        ...(detailedDescriptionEn !== undefined ? { detailedDescriptionEn } : {}),
      },
    });
  }

  async deleteService(id: string) {
    // Soft delete by archiving
    return this.updateService(id, { status: 'ARCHIVED' });
  }


  // ==========================================
  // 2. CUSTOMER SERVICE REQUESTS
  // ==========================================

  async submitRequest(
    customerId: string,
    data: {
      serviceId: string;
      projectName: string;
      description: string;
      expectedBudget?: number;
      location: string;
      latitude?: number;
      longitude?: number;
      propertyType?: string;
      currency?: any;
      attachments?: { fileName: string; fileUrl: string; fileType: string; fileSize: number }[];
    },
  ) {
    const service = await this.findOneService(data.serviceId);
    if (service.status === 'SUSPENDED') {
      throw new BadRequestException('A suspended service cannot receive new requests');
    }
    if (service.status === 'ARCHIVED' || service.status === 'DRAFT') {
      throw new BadRequestException('Service is currently unavailable');
    }

    return this.prisma.$transaction(async (tx) => {
      const request = await tx.serviceRequest.create({
        data: {
          customerId,
          serviceId: data.serviceId,
          projectName: data.projectName,
          description: data.description,
          expectedBudget: data.expectedBudget,
          location: data.location,
          latitude: data.latitude ?? 14.5422, // Default Dhamar
          longitude: data.longitude ?? 44.4000,
          status: 'NEW',
          propertyType: data.propertyType,
          currency: data.currency || 'USD',
        },
      });

      if (data.attachments && data.attachments.length > 0) {
        await tx.requestAttachment.createMany({
          data: data.attachments.map((a) => ({
            requestId: request.id,
            fileName: a.fileName,
            fileUrl: a.fileUrl,
            fileType: a.fileType,
            fileSize: a.fileSize,
          })),
        });
      }

      return tx.serviceRequest.findUnique({
        where: { id: request.id },
        include: { attachments: true, service: true },
      });
    });
  }

  async findAllRequests(params: {
    skip?: number;
    take?: number;
    customerId?: string;
    department?: Department;
    status?: RequestStatus;
    search?: string;
  }) {
    const { skip, take, customerId, department, status, search } = params;
    const where: any = {};

    if (customerId) where.customerId = customerId;
    if (status) where.status = status;
    
    if (department) {
      where.service = { department };
    }

    if (search) {
      where.OR = [
        { projectName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [requests, total] = await Promise.all([
      this.prisma.serviceRequest.findMany({
        where,
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        include: { customer: true, service: true, attachments: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.serviceRequest.count({ where }),
    ]);

    return { requests, total };
  }

  async findOneRequest(id: string) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: { customer: true, service: true, attachments: true, workProject: true },
    });
    if (!request) {
      throw new NotFoundException('Service request not found');
    }
    return request;
  }

  async reviewRequest(id: string, status: 'UNDER_REVIEW' | 'WAITING_CUSTOMER' | 'REJECTED' | 'CLOSED') {
    await this.findOneRequest(id);
    return this.prisma.serviceRequest.update({
      where: { id },
      data: { status },
    });
  }


  // ==========================================
  // 3. WORK PROJECTS MANAGEMENT
  // ==========================================

  async approveRequestAndGenerateProject(
    requestId: string,
    projectData: {
      budget: number;
      startDate: Date;
      expectedEndDate: Date;
    },
  ) {
    const request = await this.findOneRequest(requestId);
    if (request.status === 'APPROVED' || request.status === 'PROJECT_CREATED') {
      throw new BadRequestException('Request is already approved and project is created');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update Request Status to APPROVED/PROJECT_CREATED
      await tx.serviceRequest.update({
        where: { id: requestId },
        data: { status: 'PROJECT_CREATED' },
      });

      // 2. Generate Work Project
      const project = await tx.workProject.create({
        data: {
          requestId,
          name: request.projectName,
          description: request.description,
          budget: projectData.budget,
          startDate: new Date(projectData.startDate),
          expectedEndDate: new Date(projectData.expectedEndDate),
          status: 'PLANNED',
          currency: request.currency,
        },
      });

      return project;
    });
  }

  async findAllProjects(
    user: { id: string; role: string },
    params: {
      status?: ProjectStatus;
      skip?: number;
      take?: number;
    },
  ) {
    const { status, skip, take } = params;
    const where: any = {};

    if (status) where.status = status;

    // Data-level security constraints based on user roles
    if (user.role === 'ENGINEER') {
      // Find the engineer profile id
      const engProfile = await this.prisma.engineerProfile.findUnique({
        where: { userId: user.id },
      });
      if (!engProfile) throw new ForbiddenException('Engineer profile not configured');
      where.members = { some: { engineerId: engProfile.id } };
    } else if (user.role === 'CONTRACTOR') {
      // Find the contractor profile id
      const contProfile = await this.prisma.contractorProfile.findUnique({
        where: { userId: user.id },
      });
      if (!contProfile) throw new ForbiddenException('Contractor profile not configured');
      where.members = { some: { contractorId: contProfile.id } };
    } else if (user.role !== 'SYSTEM_ADMIN' && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
      where.request = { customerId: user.id };
    }

    const [projects, total] = await Promise.all([
      this.prisma.workProject.findMany({
        where,
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        include: {
          request: { include: { customer: true, service: true } },
          members: { include: { engineer: { include: { user: true } }, contractor: { include: { user: true } } } },
          tasks: true,
          milestones: true,
          attachments: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workProject.count({ where }),
    ]);

    return { projects, total };
  }

  async findOneProject(id: string, user: { id: string; role: string }) {
    const project = await this.prisma.workProject.findUnique({
      where: { id },
      include: {
        request: { include: { customer: true, service: true } },
        members: { include: { engineer: { include: { user: true } }, contractor: { include: { user: true } } } },
        tasks: { include: { assignedUser: true } },
        milestones: true,
        attachments: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Role-based data boundaries check
    if (user.role === 'ENGINEER') {
      const isMember = project.members.some((m) => m.engineer?.userId === user.id);
      if (!isMember) throw new ForbiddenException('Access denied to this project');
    } else if (user.role === 'CONTRACTOR') {
      const isMember = project.members.some((m) => m.contractor?.userId === user.id);
      if (!isMember) throw new ForbiddenException('Access denied to this project');
    } else if (user.role !== 'SYSTEM_ADMIN' && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
      const isOwner = project.request?.customerId === user.id;
      if (!isOwner) throw new ForbiddenException('Access denied to this project');
    }

    return project;
  }

  async updateProgress(id: string, progressPercentage: number) {
    if (progressPercentage < 0 || progressPercentage > 100) {
      throw new BadRequestException('Progress must be between 0 and 100');
    }
    return this.prisma.workProject.update({
      where: { id },
      data: {
        progressPercentage,
        status: progressPercentage === 100 ? 'COMPLETED' : 'IN_PROGRESS',
      },
    });
  }

  async assignMembers(
    projectId: string,
    data: {
      engineerIds?: string[]; // engineer profile ids
      contractorIds?: string[]; // contractor profile ids
    },
  ) {
    await this.prisma.workProject.findUniqueOrThrow({ where: { id: projectId } });

    return this.prisma.$transaction(async (tx) => {
      // Clear existing members
      await tx.projectMember.deleteMany({ where: { projectId } });

      // Link engineers
      if (data.engineerIds && data.engineerIds.length > 0) {
        await tx.projectMember.createMany({
          data: data.engineerIds.map((engineerId) => ({
            projectId,
            engineerId,
            role: ProjectMemberRole.ENGINEER,
          })),
        });
      }

      // Link contractors
      if (data.contractorIds && data.contractorIds.length > 0) {
        await tx.projectMember.createMany({
          data: data.contractorIds.map((contractorId) => ({
            projectId,
            contractorId,
            role: ProjectMemberRole.CONTRACTOR,
          })),
        });
      }

      return tx.workProject.findUnique({
        where: { id: projectId },
        include: { members: true },
      });
    });
  }


  // ==========================================
  // 4. PROJECT TASKS MANAGEMENT
  // ==========================================

  async createTask(
    projectId: string,
    data: { title: string; description?: string; assignedUserId?: string; dueDate: Date },
  ) {
    return this.prisma.projectTask.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        assignedUserId: data.assignedUserId,
        dueDate: new Date(data.dueDate),
        status: 'TODO',
      },
    });
  }

  async updateTask(
    taskId: string,
    data: { title?: string; description?: string; assignedUserId?: string; dueDate?: Date; status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'; completionPercentage?: number },
  ) {
    return this.prisma.projectTask.update({
      where: { id: taskId },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });
  }

  async deleteTask(taskId: string) {
    return this.prisma.projectTask.delete({ where: { id: taskId } });
  }


  // ==========================================
  // 5. PROJECT MILESTONES MANAGEMENT
  // ==========================================

  async createMilestone(
    projectId: string,
    data: { title: string; description?: string; dueDate: Date },
  ) {
    return this.prisma.projectMilestone.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        status: 'PENDING',
      },
    });
  }

  async updateMilestone(
    milestoneId: string,
    data: { title?: string; description?: string; dueDate?: Date; status?: 'PENDING' | 'COMPLETED' },
  ) {
    return this.prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });
  }

  async deleteMilestone(milestoneId: string) {
    return this.prisma.projectMilestone.delete({ where: { id: milestoneId } });
  }

  // ==========================================
  // 6. PROJECT ATTACHMENTS
  // ==========================================

  async addAttachment(
    projectId: string,
    data: { fileName: string; fileUrl: string; fileType: string; fileSize: number },
  ) {
    return this.prisma.projectAttachment.create({
      data: {
        projectId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
      },
    });
  }

  async removeAttachment(attachmentId: string) {
    return this.prisma.projectAttachment.delete({ where: { id: attachmentId } });
  }
}
