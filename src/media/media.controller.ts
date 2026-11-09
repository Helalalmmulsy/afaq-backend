import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { MediaCategory } from '@prisma/client';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Upload multiple files
   * POST /media/upload
   */
  @Post('upload')
  @UseGuards(OptionalJwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 20, {
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max per file
  }))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('category') category?: MediaCategory,
    @Body('altText') altText?: string,
    @Request() req?: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('لم يتم إرفاق أي ملف للرفع');
    }

    const userId = req?.user?.id || req?.user?.sub;
    const mediaCategory = category || 'GENERAL';

    const uploaded = await this.mediaService.uploadFiles(
      files,
      mediaCategory,
      altText,
      userId,
    );

    return {
      success: true,
      count: uploaded.length,
      files: uploaded,
    };
  }

  /**
   * Upload single file
   * POST /media/upload-single
   */
  @Post('upload-single')
  @UseGuards(OptionalJwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 50 * 1024 * 1024 },
  }))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category?: MediaCategory,
    @Body('altText') altText?: string,
    @Request() req?: any,
  ) {
    if (!file) {
      throw new BadRequestException('لم يتم إرفاق أي ملف للرفع');
    }

    const userId = req?.user?.id || req?.user?.sub;
    const mediaCategory = category || 'GENERAL';

    const [uploaded] = await this.mediaService.uploadFiles(
      [file],
      mediaCategory,
      altText,
      userId,
    );

    return {
      success: true,
      file: uploaded,
    };
  }

  /**
   * List media files with filters
   * GET /media
   */
  @Get()
  async findAll(
    @Query('category') category?: MediaCategory,
    @Query('fileType') fileType?: string,
    @Query('search') search?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.mediaService.findAll({
      category,
      fileType,
      search,
      skip,
      take,
    });
  }

  /**
   * Get media statistics
   * GET /media/stats
   */
  @Get('stats')
  async getStats() {
    return this.mediaService.getStats();
  }

  /**
   * Update media metadata
   * PATCH /media/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { category?: MediaCategory; altText?: string },
  ) {
    return this.mediaService.update(id, body);
  }

  /**
   * Delete media file
   * DELETE /media/:id
   */
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.mediaService.delete(id);
  }
}
