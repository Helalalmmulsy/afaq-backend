import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { MediaCategory, MediaFile } from '@prisma/client';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Upload single or multiple files and register in database
   */
  async uploadFiles(
    files: Express.Multer.File[],
    category: MediaCategory = 'GENERAL',
    altText?: string,
    uploadedById?: string,
  ): Promise<MediaFile[]> {
    const results: MediaFile[] = [];

    for (const file of files) {
      const uploadResult = await this.storageService.uploadFile(file, category);

      const record = await this.prisma.mediaFile.create({
        data: {
          fileName: uploadResult.fileName,
          originalName: uploadResult.originalName,
          fileUrl: uploadResult.fileUrl,
          fileType: uploadResult.fileType || 'application/octet-stream',
          fileSize: uploadResult.fileSize,
          category,
          altText: altText || uploadResult.originalName,
          uploadedById: uploadedById || null,
        },
      });

      results.push(record);
    }

    return results;
  }

  /**
   * Find media files with category, type, search filters and pagination
   */
  async findAll(params: {
    category?: MediaCategory;
    fileType?: string; // 'image', 'document', 'other'
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const { category, fileType, search, skip = 0, take = 50 } = params;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (search && search.trim().length > 0) {
      where.OR = [
        { originalName: { contains: search.trim(), mode: 'insensitive' } },
        { fileName: { contains: search.trim(), mode: 'insensitive' } },
        { altText: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    if (fileType) {
      if (fileType === 'image') {
        where.fileType = { startsWith: 'image/' };
      } else if (fileType === 'document') {
        where.OR = [
          { fileType: { contains: 'pdf' } },
          { fileType: { contains: 'document' } },
          { fileType: { contains: 'sheet' } },
          { fileType: { contains: 'msword' } },
          { fileType: { contains: 'dwg' } },
          { originalName: { endsWith: '.dwg', mode: 'insensitive' } },
          { originalName: { endsWith: '.dxf', mode: 'insensitive' } },
        ];
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.mediaFile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: Number(skip),
        take: Number(take),
        include: {
          uploader: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.mediaFile.count({ where }),
    ]);

    return {
      items,
      total,
      skip: Number(skip),
      take: Number(take),
    };
  }

  /**
   * Get media statistics (count, size, category breakdown)
   */
  async getStats() {
    const [totalFiles, allMedia] = await Promise.all([
      this.prisma.mediaFile.count(),
      this.prisma.mediaFile.findMany({
        select: {
          fileSize: true,
          fileType: true,
          category: true,
          fileUrl: true,
        },
      }),
    ]);

    let totalBytes = 0;
    let imagesCount = 0;
    let documentsCount = 0;
    let localFallbackCount = 0;
    const categoryCounts: Record<string, number> = {};

    for (const item of allMedia) {
      totalBytes += item.fileSize || 0;
      if (item.fileType?.startsWith('image/')) {
        imagesCount++;
      } else {
        documentsCount++;
      }
      if (item.fileUrl?.includes('/uploads/')) {
        localFallbackCount++;
      }
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    }

    const storageInfo = this.storageService.getStorageInfo();

    return {
      totalFiles,
      totalBytes,
      imagesCount,
      documentsCount,
      categoryCounts,
      localFallbackCount,
      ...storageInfo,
    };
  }

  /**
   * Update media metadata
   */
  async update(id: string, data: { category?: MediaCategory; altText?: string }) {
    const existing = await this.prisma.mediaFile.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('الملف غير موجود');
    }

    return this.prisma.mediaFile.update({
      where: { id },
      data: {
        category: data.category,
        altText: data.altText,
      },
    });
  }

  /**
   * Delete media file from DB and storage
   */
  async delete(id: string) {
    const existing = await this.prisma.mediaFile.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('الملف غير موجود');
    }

    await this.storageService.deleteFile(existing.fileUrl, existing.fileName);
    await this.prisma.mediaFile.delete({ where: { id } });

    return { success: true, message: 'تم حذف الملف بنجاح' };
  }
}
