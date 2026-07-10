import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Request() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  @Get()
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'READ', module: 'USERS' })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('roleName') roleName?: string,
    @Query('status') status?: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED',
  ) {
    return this.usersService.findAll({ skip, take, search, roleName, status });
  }

  @Get('roles')
  async findAllRoles() {
    return this.usersService.findAllRoles();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    // Users can only view their own profile, unless they are SYSTEM_ADMIN or ADMIN
    if (req.user.id !== id && req.user.role !== 'SYSTEM_ADMIN' && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to view this profile');
    }
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'CREATE', module: 'USERS' })
  async create(@Body() body: any) {
    return this.usersService.create(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    // Users can only update their own profile, unless they are SYSTEM_ADMIN or ADMIN
    if (req.user.id !== id && req.user.role !== 'SYSTEM_ADMIN' && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to edit this profile');
    }
    return this.usersService.update(id, body);
  }

  @Patch(':id/suspend')
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'USERS' })
  async suspend(@Param('id') id: string) {
    return this.usersService.suspend(id);
  }

  @Patch(':id/archive')
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'DELETE', module: 'USERS' })
  async archive(@Param('id') id: string) {
    return this.usersService.archive(id);
  }
}
