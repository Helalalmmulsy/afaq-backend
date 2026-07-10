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
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  // ==========================================
  // PUBLIC ENDPOINTS (GUESTS & CUSTOMERS)
  // ==========================================

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('typeId') typeId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('minArea') minArea?: number,
    @Query('maxArea') maxArea?: number,
    @Query('status') status?: 'DRAFT' | 'READY' | 'PUBLISHED' | 'SUSPENDED' | 'ARCHIVED',
    @Request() req?: any,
  ) {
    const hasAdminAccess = req?.user && (req.user.role === 'SYSTEM_ADMIN' || req.user.role === 'ADMIN');
    return this.propertiesService.findAll({
      skip,
      take,
      search,
      typeId,
      categoryId,
      city,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      status,
      onlyPublished: !hasAdminAccess,
    });
  }

  @Get('types')
  async findAllTypes() {
    return this.propertiesService.findAllTypes();
  }

  @Get('categories')
  async findAllCategories() {
    return this.propertiesService.findAllCategories();
  }

  @Get('features')
  async findAllFeatures() {
    return this.propertiesService.findAllFeatures();
  }

  @Get('utilities')
  async findAllUtilities() {
    return this.propertiesService.findAllUtilities();
  }

  @Get('guarantees')
  async findAllGuarantees() {
    return this.propertiesService.findAllGuarantees();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  // ==========================================
  // ADMIN PROTECTED ENDPOINTS (DASHBOARD)
  // ==========================================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'CREATE', module: 'PROPERTIES' })
  async create(@Body() body: any) {
    return this.propertiesService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'PROPERTIES' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.propertiesService.update(id, body);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'PUBLISH', module: 'PROPERTIES' })
  async changeStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.propertiesService.changeStatus(id, status);
  }

  @Post(':id/media')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'PROPERTIES' })
  async addMedia(@Param('id') id: string, @Body() body: any) {
    return this.propertiesService.addMedia(id, body);
  }

  @Delete('media/:mediaId')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'PROPERTIES' })
  async removeMedia(@Param('mediaId') mediaId: string) {
    return this.propertiesService.removeMedia(mediaId);
  }

  @Post('types')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'CREATE', module: 'PROPERTIES' })
  async createType(@Body() body: any) {
    return this.propertiesService.createType(body);
  }

  @Patch('types/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'PROPERTIES' })
  async updateType(@Param('id') id: string, @Body() body: any) {
    return this.propertiesService.updateType(id, body);
  }

  @Delete('types/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'DELETE', module: 'PROPERTIES' })
  async deleteType(@Param('id') id: string) {
    return this.propertiesService.deleteType(id);
  }

  // --- Type Specs ---
  @Post('types/:typeId/specs')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'CREATE', module: 'PROPERTIES' })
  async createTypeSpec(@Param('typeId') typeId: string, @Body() body: any) {
    return this.propertiesService.createTypeSpec(typeId, body);
  }

  @Get('types/:typeId/specs')
  async findAllTypeSpecs(@Param('typeId') typeId: string) {
    return this.propertiesService.findAllTypeSpecs(typeId);
  }

  @Patch('types/specs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'PROPERTIES' })
  async updateTypeSpec(@Param('id') id: string, @Body() body: any) {
    return this.propertiesService.updateTypeSpec(id, body);
  }

  @Delete('types/specs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'DELETE', module: 'PROPERTIES' })
  async deleteTypeSpec(@Param('id') id: string) {
    return this.propertiesService.deleteTypeSpec(id);
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'CREATE', module: 'PROPERTIES' })
  async createCategory(@Body() body: any) {
    return this.propertiesService.createCategory(body);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'PROPERTIES' })
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    return this.propertiesService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'DELETE', module: 'PROPERTIES' })
  async deleteCategory(@Param('id') id: string) {
    return this.propertiesService.deleteCategory(id);
  }

  @Post('features')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'CREATE', module: 'PROPERTIES' })
  async createFeature(@Body() body: any) {
    return this.propertiesService.createFeature(body);
  }

  @Patch('features/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'PROPERTIES' })
  async updateFeature(@Param('id') id: string, @Body() body: any) {
    return this.propertiesService.updateFeature(id, body);
  }

  @Delete('features/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'DELETE', module: 'PROPERTIES' })
  async deleteFeature(@Param('id') id: string) {
    return this.propertiesService.deleteFeature(id);
  }

  @Post('utilities')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'CREATE', module: 'PROPERTIES' })
  async createUtility(@Body() body: any) {
    return this.propertiesService.createUtility(body);
  }

  @Patch('utilities/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'PROPERTIES' })
  async updateUtility(@Param('id') id: string, @Body() body: any) {
    return this.propertiesService.updateUtility(id, body);
  }

  @Delete('utilities/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'DELETE', module: 'PROPERTIES' })
  async deleteUtility(@Param('id') id: string) {
    return this.propertiesService.deleteUtility(id);
  }

  @Post('guarantees')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'CREATE', module: 'PROPERTIES' })
  async createGuarantee(@Body() body: any) {
    return this.propertiesService.createGuarantee(body);
  }

  @Patch('guarantees/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'PROPERTIES' })
  async updateGuarantee(@Param('id') id: string, @Body() body: any) {
    return this.propertiesService.updateGuarantee(id, body);
  }

  @Delete('guarantees/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'DELETE', module: 'PROPERTIES' })
  async deleteGuarantee(@Param('id') id: string) {
    return this.propertiesService.deleteGuarantee(id);
  }
}
