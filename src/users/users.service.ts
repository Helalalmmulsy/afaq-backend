import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    roleId: string;
    engineerDetails?: {
      specialization: string;
      experienceYears: number;
      bio?: string;
      qualifications?: string[];
      certificates?: string[];
      skills?: string[];
    };
    contractorDetails?: {
      companyName?: string;
      experienceYears: number;
      skills?: string[];
      certificates?: string[];
      bio?: string;
    };
  }) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: data.roleId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Start transaction to ensure atomicity
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password, // In production, hash this!
          roleId: data.roleId,
          status: 'ACTIVE',
        },
        include: { role: true },
      });

      // Automatically create engineer profile if role is ENGINEER
      if (role.name === 'ENGINEER') {
        if (!data.engineerDetails) {
          throw new BadRequestException('Engineer details are required for ENGINEER role');
        }
        await tx.engineerProfile.create({
          data: {
            userId: user.id,
            specialization: data.engineerDetails.specialization,
            experienceYears: data.engineerDetails.experienceYears,
            bio: data.engineerDetails.bio,
            qualifications: data.engineerDetails.qualifications || [],
            certificates: data.engineerDetails.certificates || [],
            skills: data.engineerDetails.skills || [],
          },
        });
      }

      // Automatically create contractor profile if role is CONTRACTOR
      if (role.name === 'CONTRACTOR') {
        if (!data.contractorDetails) {
          throw new BadRequestException('Contractor details are required for CONTRACTOR role');
        }
        await tx.contractorProfile.create({
          data: {
            userId: user.id,
            companyName: data.contractorDetails.companyName,
            experienceYears: data.contractorDetails.experienceYears,
            bio: data.contractorDetails.bio,
            certificates: data.contractorDetails.certificates || [],
            skills: data.contractorDetails.skills || [],
          },
        });
      }

      return user;
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
    roleName?: string;
    status?: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  }) {
    const { skip, take, search, roleName, status } = params;

    const where: any = {};

    if (status) {
      where.status = status;
    } else {
      where.status = { not: 'ARCHIVED' }; // Exclude archived by default
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (roleName) {
      where.role = { name: roleName };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        include: {
          role: true,
          engineerProfile: true,
          contractorProfile: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map((u) => {
        const { password, ...result } = u;
        return result;
      }),
      total,
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        engineerProfile: true,
        contractorProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...result } = user;
    return result;
  }

  async update(
    id: string,
    data: {
      name?: string;
      phone?: string;
      password?: string;
      roleId?: string;
      status?: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
      engineerDetails?: {
        specialization?: string;
        experienceYears?: number;
        bio?: string;
        qualifications?: string[];
        certificates?: string[];
        skills?: string[];
        customProjects?: any;
        customExperiences?: any;
        customReviews?: any;
      };
      contractorDetails?: {
        companyName?: string;
        experienceYears?: number;
        bio?: string;
        certificates?: string[];
        skills?: string[];
        customProjects?: any;
        customExperiences?: any;
        customReviews?: any;
      };
    },
  ) {
    const user = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      // Update basic fields
      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          name: data.name,
          phone: data.phone,
          password: data.password, // In production, hash this!
          roleId: data.roleId,
          status: data.status,
        },
        include: { role: true },
      });

      // Update engineer details if profile exists
      if (user.role.name === 'ENGINEER' && data.engineerDetails) {
        await tx.engineerProfile.upsert({
          where: { userId: id },
          create: {
            userId: id,
            specialization: data.engineerDetails.specialization || 'General',
            experienceYears: data.engineerDetails.experienceYears || 0,
            bio: data.engineerDetails.bio,
            qualifications: data.engineerDetails.qualifications || [],
            certificates: data.engineerDetails.certificates || [],
            skills: data.engineerDetails.skills || [],
            customProjects: data.engineerDetails.customProjects || [],
            customExperiences: data.engineerDetails.customExperiences || [],
            customReviews: data.engineerDetails.customReviews || [],
          },
          update: {
            specialization: data.engineerDetails.specialization,
            experienceYears: data.engineerDetails.experienceYears,
            bio: data.engineerDetails.bio,
            qualifications: data.engineerDetails.qualifications,
            certificates: data.engineerDetails.certificates,
            skills: data.engineerDetails.skills,
            customProjects: data.engineerDetails.customProjects,
            customExperiences: data.engineerDetails.customExperiences,
            customReviews: data.engineerDetails.customReviews,
          },
        });
      }

      // Update contractor details if profile exists
      if (user.role.name === 'CONTRACTOR' && data.contractorDetails) {
        await tx.contractorProfile.upsert({
          where: { userId: id },
          create: {
            userId: id,
            companyName: data.contractorDetails.companyName,
            experienceYears: data.contractorDetails.experienceYears || 0,
            bio: data.contractorDetails.bio,
            certificates: data.contractorDetails.certificates || [],
            skills: data.contractorDetails.skills || [],
            customProjects: data.contractorDetails.customProjects || [],
            customExperiences: data.contractorDetails.customExperiences || [],
            customReviews: data.contractorDetails.customReviews || [],
          },
          update: {
            companyName: data.contractorDetails.companyName,
            experienceYears: data.contractorDetails.experienceYears,
            bio: data.contractorDetails.bio,
            certificates: data.contractorDetails.certificates,
            skills: data.contractorDetails.skills,
            customProjects: data.contractorDetails.customProjects,
            customExperiences: data.contractorDetails.customExperiences,
            customReviews: data.contractorDetails.customReviews,
          },
        });
      }

      const { password, ...result } = updatedUser;
      return result;
    });
  }

  async suspend(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });
  }

  async activate(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
  }

  async toggleStatus(id: string) {
    const user = await this.findOne(id);
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    return this.prisma.user.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true, engineerProfile: true, contractorProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role.name === 'SYSTEM_ADMIN') {
      const adminCount = await this.prisma.user.count({
        where: { role: { name: 'SYSTEM_ADMIN' } },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot delete the sole System Admin');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Delete AI conversations
      await tx.aIConversation.deleteMany({ where: { customerId: id } });

      // 2. Unassign tasks
      await tx.projectTask.updateMany({
        where: { assignedUserId: id },
        data: { assignedUserId: null },
      });

      // 3. Delete Project Members for engineer or contractor
      if (user.engineerProfile) {
        await tx.projectMember.deleteMany({ where: { engineerId: user.engineerProfile.id } });
        await tx.engineerProfile.delete({ where: { id: user.engineerProfile.id } });
      }
      if (user.contractorProfile) {
        await tx.projectMember.deleteMany({ where: { contractorId: user.contractorProfile.id } });
        await tx.contractorProfile.delete({ where: { id: user.contractorProfile.id } });
      }

      // 4. Delete Service Requests and their attachments if customer
      const serviceRequests = await tx.serviceRequest.findMany({
        where: { customerId: id },
        select: { id: true },
      });
      const reqIds = serviceRequests.map((r) => r.id);
      if (reqIds.length > 0) {
        await tx.requestAttachment.deleteMany({ where: { requestId: { in: reqIds } } });
        await tx.workProject.deleteMany({ where: { requestId: { in: reqIds } } });
        await tx.serviceRequest.deleteMany({ where: { id: { in: reqIds } } });
      }

      // 5. Delete comments, ratings, likes, notifications, audit logs
      await tx.comment.deleteMany({ where: { customerId: id } });
      await tx.rating.deleteMany({ where: { customerId: id } });
      await tx.like.deleteMany({ where: { customerId: id } });
      await tx.notification.deleteMany({ where: { userId: id } });
      await tx.auditLog.deleteMany({ where: { userId: id } });

      // 6. Finally delete the user
      await tx.user.delete({ where: { id } });

      return { message: 'User deleted successfully' };
    });
  }

  async archive(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }

  async findAllRoles() {
    return this.prisma.role.findMany();
  }
}
