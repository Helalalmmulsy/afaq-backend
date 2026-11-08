import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';
import { TaxonomyGroup } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('taxonomy')
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  // -------------------------------------------------------------
  // Public Endpoint (Mobile & Web App)
  // GET /taxonomy?group=ENGINEERING_CONSULTATION
  // Returns only active items sorted by sortOrder ASC
  // -------------------------------------------------------------
  @Get()
  async getActive(@Query('group') group?: TaxonomyGroup) {
    return this.taxonomyService.findActive(group);
  }

  // -------------------------------------------------------------
  // Admin Endpoint (Dashboard Console)
  // GET /taxonomy/all?group=...&search=...
  // Returns all items (active and inactive)
  // -------------------------------------------------------------
  @Get('all')
  async getAll(
    @Query('group') group?: TaxonomyGroup,
    @Query('search') search?: string,
  ) {
    return this.taxonomyService.findAll({ group, search });
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.taxonomyService.findOne(id);
  }

  // -------------------------------------------------------------
  // Reorder items
  // PUT /taxonomy/reorder
  // -------------------------------------------------------------
  @Put('reorder')
  async reorder(@Body() body: { items: { id: string; sortOrder: number }[] }) {
    return this.taxonomyService.reorder(body.items || []);
  }

  // -------------------------------------------------------------
  // Create new item
  // POST /taxonomy
  // -------------------------------------------------------------
  @Post()
  async create(
    @Body()
    body: {
      group: TaxonomyGroup;
      code?: string;
      nameAr: string;
      nameEn: string;
      description?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return this.taxonomyService.create(body);
  }

  // -------------------------------------------------------------
  // Update item
  // PUT /taxonomy/:id
  // -------------------------------------------------------------
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      nameAr: string;
      nameEn: string;
      description: string;
      sortOrder: number;
      isActive: boolean;
    }>,
  ) {
    return this.taxonomyService.update(id, body);
  }

  // -------------------------------------------------------------
  // Delete item
  // DELETE /taxonomy/:id
  // -------------------------------------------------------------
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.taxonomyService.delete(id);
  }
}
