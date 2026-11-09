import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Department, RequestStatus, ProjectStatus } from '@prisma/client';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // ==========================================
  // PUBLIC ENDPOINTS
  // ==========================================

  @Get('engineers')
  async findEngineers() {
    return this.servicesService.findEngineers();
  }

  @Post('engineers/:id/reviews')
  @UseGuards(JwtAuthGuard)
  async addEngineerReview(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { rating: number; comment: string },
  ) {
    return this.servicesService.addEngineerReview(req.user.id, id, body);
  }

  @Post('projects/:id/publish-showcase')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'CREATE', module: 'SERVICES' })
  async publishProjectToShowcase(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.servicesService.publishProjectToShowcase(id, body);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAllServices(
    @Query('department') department?: Department,
    @Query('status') status?: 'DRAFT' | 'PUBLISHED' | 'SUSPENDED' | 'ARCHIVED',
    @Request() req?: any,
  ) {
    const hasAdminAccess = req?.user && (req.user.role === 'SYSTEM_ADMIN' || req.user.role === 'ADMIN');
    return this.servicesService.findAllServices({
      department,
      status,
      onlyPublished: !hasAdminAccess,
    });
  }

  @Get(':id')
  async findOneService(@Param('id') id: string) {
    return this.servicesService.findOneService(id);
  }

  // ==========================================
  // CUSTOMER ENDPOINTS (MOBILE CLIENT)
  // ==========================================

  @Post('requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  async submitRequest(@Request() req: any, @Body() body: any) {
    return this.servicesService.submitRequest(req.user.id, body);
  }

  @Get('requests/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  async findMyRequests(
    @Request() req: any,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: RequestStatus,
  ) {
    return this.servicesService.findAllRequests({
      skip,
      take,
      status,
      customerId: req.user.id,
    });
  }

  // ==========================================
  // SERVICE REQUESTS ADMINISTRATION
  // ==========================================

  @Get('requests/all')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN', 'EMPLOYEE')
  @RequirePermissions({ action: 'READ', module: 'SERVICES' })
  async findAllRequests(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('customerId') customerId?: string,
    @Query('department') department?: Department,
    @Query('status') status?: RequestStatus,
    @Query('search') search?: string,
  ) {
    return this.servicesService.findAllRequests({ skip, take, customerId, department, status, search });
  }

  @Get('requests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN', 'EMPLOYEE')
  @RequirePermissions({ action: 'READ', module: 'SERVICES' })
  async findOneRequest(@Param('id') id: string) {
    return this.servicesService.findOneRequest(id);
  }

  @Patch('requests/:id/review')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN', 'EMPLOYEE')
  @RequirePermissions({ action: 'UPDATE', module: 'SERVICES' })
  async reviewRequest(@Param('id') id: string, @Body('status') status: any) {
    return this.servicesService.reviewRequest(id, status);
  }

  @Post('requests/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'SERVICES' })
  async approveRequest(@Param('id') id: string, @Body() body: any) {
    return this.servicesService.approveRequestAndGenerateProject(id, body);
  }

  // ==========================================
  // OPERATIONAL PROJECTS MANAGEMENT
  // ==========================================

  @Get('projects/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAllProjects(
    @Request() req: any,
    @Query('status') status?: ProjectStatus,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.servicesService.findAllProjects(req.user, { status, skip, take });
  }

  @Get('projects/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOneProject(@Param('id') id: string, @Request() req: any) {
    return this.servicesService.findOneProject(id, req.user);
  }

  @Patch('projects/:id/progress')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN', 'ENGINEER', 'CONTRACTOR')
  async updateProgress(
    @Param('id') id: string,
    @Body('progressPercentage') progressPercentage: number,
    @Request() req: any,
  ) {
    // If not Admin/Staff, make sure the user is assigned to this project
    if (req.user.role !== 'SYSTEM_ADMIN' && req.user.role !== 'ADMIN' && req.user.role !== 'EMPLOYEE') {
      await this.servicesService.findOneProject(id, req.user); // Enforces access check
    }
    return this.servicesService.updateProgress(id, progressPercentage);
  }

  @Post('projects/:id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'PROJECTS' })
  async assignMembers(@Param('id') id: string, @Body() body: any) {
    return this.servicesService.assignMembers(id, body);
  }

  // --- PROJECT TASKS ---
  @Post('projects/:id/tasks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN', 'ENGINEER')
  async createTask(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    if (req.user.role !== 'SYSTEM_ADMIN' && req.user.role !== 'ADMIN') {
      await this.servicesService.findOneProject(id, req.user);
    }
    return this.servicesService.createTask(id, body);
  }

  @Patch('projects/tasks/:taskId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN', 'ENGINEER', 'CONTRACTOR')
  async updateTask(@Param('taskId') taskId: string, @Body() body: any) {
    return this.servicesService.updateTask(taskId, body);
  }

  @Delete('projects/tasks/:taskId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN', 'ENGINEER')
  async deleteTask(@Param('taskId') taskId: string) {
    return this.servicesService.deleteTask(taskId);
  }

  // --- PROJECT MILESTONES ---
  @Post('projects/:id/milestones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN', 'ENGINEER')
  async createMilestone(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    if (req.user.role !== 'SYSTEM_ADMIN' && req.user.role !== 'ADMIN') {
      await this.servicesService.findOneProject(id, req.user);
    }
    return this.servicesService.createMilestone(id, body);
  }

  @Patch('projects/milestones/:milestoneId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN', 'ENGINEER')
  async updateMilestone(@Param('milestoneId') milestoneId: string, @Body() body: any) {
    return this.servicesService.updateMilestone(milestoneId, body);
  }

  @Delete('projects/milestones/:milestoneId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN', 'ENGINEER')
  async deleteMilestone(@Param('milestoneId') milestoneId: string) {
    return this.servicesService.deleteMilestone(milestoneId);
  }

  // --- PROJECT ATTACHMENTS ---
  @Post('projects/:id/attachments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN', 'ENGINEER', 'CONTRACTOR')
  async addAttachment(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    if (req.user.role !== 'SYSTEM_ADMIN' && req.user.role !== 'ADMIN') {
      await this.servicesService.findOneProject(id, req.user);
    }
    return this.servicesService.addAttachment(id, body);
  }

  @Delete('projects/attachments/:attachmentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN', 'ENGINEER', 'CONTRACTOR')
  async removeAttachment(@Param('attachmentId') attachmentId: string) {
    return this.servicesService.removeAttachment(attachmentId);
  }

  // --- SERVICES CRUD (ADMIN) ---
  @Post('items')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'CREATE', module: 'SERVICES' })
  async createService(@Body() body: any) {
    return this.servicesService.createService(body);
  }

  @Patch('items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'SERVICES' })
  async updateService(@Param('id') id: string, @Body() body: any) {
    return this.servicesService.updateService(id, body);
  }

  @Delete('items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'DELETE', module: 'SERVICES' })
  async deleteService(@Param('id') id: string) {
    return this.servicesService.deleteService(id);
  }
}
