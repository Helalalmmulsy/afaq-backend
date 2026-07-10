import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // 1. MASTER DATA MANAGEMENT
  // ==========================================

  // --- Types ---
  async createType(data: { nameAr: string; nameEn?: string }) {
    const nameEn = (data.nameEn && data.nameEn.trim() !== '') ? data.nameEn : data.nameAr;
    return this.prisma.propertyType.create({
      data: { nameAr: data.nameAr, nameEn },
    });
  }

  async findAllTypes() {
    return this.prisma.propertyType.findMany({
      include: { specs: true },
    });
  }

  async updateType(id: string, data: { nameAr?: string; nameEn?: string }) {
    const nameEn = (data.nameEn !== undefined) 
      ? ((data.nameEn && data.nameEn.trim() !== '') ? data.nameEn : (data.nameAr || '')) 
      : undefined;
    return this.prisma.propertyType.update({
      where: { id },
      data: {
        nameAr: data.nameAr,
        ...(nameEn !== undefined ? { nameEn } : {}),
      },
    });
  }

  async deleteType(id: string) {
    try {
      return await this.prisma.propertyType.delete({ where: { id } });
    } catch {
      throw new BadRequestException('Cannot delete type, it is linked to properties');
    }
  }

  // --- Type Specs (Descriptions / Parameters) ---
  async createTypeSpec(typeId: string, data: { nameAr: string; nameEn?: string }) {
    const nameEn = (data.nameEn && data.nameEn.trim() !== '') ? data.nameEn : data.nameAr;
    return this.prisma.propertyTypeSpec.create({
      data: {
        nameAr: data.nameAr,
        nameEn,
        typeId,
      },
    });
  }

  async findAllTypeSpecs(typeId: string) {
    return this.prisma.propertyTypeSpec.findMany({
      where: { typeId },
    });
  }

  async updateTypeSpec(id: string, data: { nameAr?: string; nameEn?: string }) {
    const nameEn = (data.nameEn !== undefined) 
      ? ((data.nameEn && data.nameEn.trim() !== '') ? data.nameEn : (data.nameAr || '')) 
      : undefined;
    return this.prisma.propertyTypeSpec.update({
      where: { id },
      data: {
        nameAr: data.nameAr,
        ...(nameEn !== undefined ? { nameEn } : {}),
      },
    });
  }

  async deleteTypeSpec(id: string) {
    return this.prisma.propertyTypeSpec.delete({
      where: { id },
    });
  }

  // --- Categories ---
  async createCategory(data: { nameAr: string; nameEn?: string }) {
    const nameEn = (data.nameEn && data.nameEn.trim() !== '') ? data.nameEn : data.nameAr;
    return this.prisma.propertyCategory.create({
      data: { nameAr: data.nameAr, nameEn },
    });
  }

  async findAllCategories() {
    return this.prisma.propertyCategory.findMany();
  }

  async updateCategory(id: string, data: { nameAr?: string; nameEn?: string }) {
    const nameEn = (data.nameEn !== undefined) 
      ? ((data.nameEn && data.nameEn.trim() !== '') ? data.nameEn : (data.nameAr || '')) 
      : undefined;
    return this.prisma.propertyCategory.update({
      where: { id },
      data: {
        nameAr: data.nameAr,
        ...(nameEn !== undefined ? { nameEn } : {}),
      },
    });
  }

  async deleteCategory(id: string) {
    try {
      return await this.prisma.propertyCategory.delete({ where: { id } });
    } catch {
      throw new BadRequestException('Cannot delete category, it is linked to properties');
    }
  }

  // --- Features ---
  async createFeature(data: { nameAr: string; nameEn?: string }) {
    const nameEn = (data.nameEn && data.nameEn.trim() !== '') ? data.nameEn : data.nameAr;
    return this.prisma.propertyFeature.create({
      data: { nameAr: data.nameAr, nameEn },
    });
  }

  async findAllFeatures() {
    return this.prisma.propertyFeature.findMany();
  }

  async updateFeature(id: string, data: { nameAr?: string; nameEn?: string }) {
    const nameEn = (data.nameEn !== undefined) 
      ? ((data.nameEn && data.nameEn.trim() !== '') ? data.nameEn : (data.nameAr || '')) 
      : undefined;
    return this.prisma.propertyFeature.update({
      where: { id },
      data: {
        nameAr: data.nameAr,
        ...(nameEn !== undefined ? { nameEn } : {}),
      },
    });
  }

  async deleteFeature(id: string) {
    try {
      return await this.prisma.propertyFeature.delete({ where: { id } });
    } catch {
      throw new BadRequestException('Cannot delete feature, it is linked to properties');
    }
  }

  // --- Utilities ---
  async createUtility(data: { nameAr: string; nameEn?: string }) {
    const nameEn = (data.nameEn && data.nameEn.trim() !== '') ? data.nameEn : data.nameAr;
    return this.prisma.propertyUtility.create({
      data: { nameAr: data.nameAr, nameEn },
    });
  }

  async findAllUtilities() {
    return this.prisma.propertyUtility.findMany();
  }

  async updateUtility(id: string, data: { nameAr?: string; nameEn?: string }) {
    const nameEn = (data.nameEn !== undefined) 
      ? ((data.nameEn && data.nameEn.trim() !== '') ? data.nameEn : (data.nameAr || '')) 
      : undefined;
    return this.prisma.propertyUtility.update({
      where: { id },
      data: {
        nameAr: data.nameAr,
        ...(nameEn !== undefined ? { nameEn } : {}),
      },
    });
  }

  async deleteUtility(id: string) {
    try {
      return await this.prisma.propertyUtility.delete({ where: { id } });
    } catch {
      throw new BadRequestException('Cannot delete utility, it is linked to properties');
    }
  }

  // --- Guarantees ---
  async createGuarantee(data: { nameAr: string; nameEn?: string }) {
    const nameEn = (data.nameEn && data.nameEn.trim() !== '') ? data.nameEn : data.nameAr;
    return this.prisma.propertyGuarantee.create({
      data: { nameAr: data.nameAr, nameEn },
    });
  }

  async findAllGuarantees() {
    return this.prisma.propertyGuarantee.findMany();
  }

  async updateGuarantee(id: string, data: { nameAr?: string; nameEn?: string }) {
    const nameEn = (data.nameEn !== undefined) 
      ? ((data.nameEn && data.nameEn.trim() !== '') ? data.nameEn : (data.nameAr || '')) 
      : undefined;
    return this.prisma.propertyGuarantee.update({
      where: { id },
      data: {
        nameAr: data.nameAr,
        ...(nameEn !== undefined ? { nameEn } : {}),
      },
    });
  }

  async deleteGuarantee(id: string) {
    try {
      return await this.prisma.propertyGuarantee.delete({ where: { id } });
    } catch {
      throw new BadRequestException('Cannot delete guarantee, it is linked to properties');
    }
  }


  // ==========================================
  // 2. CORE PROPERTY MANAGEMENT
  // ==========================================

  async create(data: {
    titleAr: string;
    titleEn?: string;
    descriptionAr: string;
    descriptionEn?: string;
    price: number;
    area: number;
    city: string;
    latitude?: number;
    longitude?: number;
    contactPhone: string;
    typeId: string;
    typeSpecId?: string;
    categoryId: string;
    status?: 'DRAFT' | 'READY' | 'PUBLISHED' | 'SUSPENDED' | 'ARCHIVED';
    currency?: any;
    featureIds?: string[];
    utilityIds?: string[];
    guaranteeIds?: string[];
    media?: { url: string; isPrimary?: boolean }[];
  }) {
    const titleEn = (data.titleEn && data.titleEn.trim() !== '') ? data.titleEn : data.titleAr;
    const descriptionEn = (data.descriptionEn && data.descriptionEn.trim() !== '') ? data.descriptionEn : data.descriptionAr;

    return this.prisma.$transaction(async (tx) => {
      // 1. Create property
      const property = await tx.property.create({
        data: {
          titleAr: data.titleAr,
          titleEn,
          descriptionAr: data.descriptionAr,
          descriptionEn,
          price: data.price,
          area: data.area,
          city: data.city,
          latitude: data.latitude ?? 14.5422, // Default Dhamar City Center
          longitude: data.longitude ?? 44.4000,
          contactPhone: data.contactPhone,
          typeId: data.typeId,
          typeSpecId: data.typeSpecId,
          categoryId: data.categoryId,
          status: data.status || 'DRAFT',
          currency: data.currency || 'USD',
        },
      });

      // 2. Link features
      if (data.featureIds && data.featureIds.length > 0) {
        await tx.propertyFeatureMap.createMany({
          data: data.featureIds.map((featureId) => ({
            propertyId: property.id,
            featureId,
          })),
        });
      }

      // 3. Link utilities
      if (data.utilityIds && data.utilityIds.length > 0) {
        await tx.propertyUtilityMap.createMany({
          data: data.utilityIds.map((utilityId) => ({
            propertyId: property.id,
            utilityId,
          })),
        });
      }

      // 4. Link guarantees
      if (data.guaranteeIds && data.guaranteeIds.length > 0) {
        await tx.propertyGuaranteeMap.createMany({
          data: data.guaranteeIds.map((guaranteeId) => ({
            propertyId: property.id,
            guaranteeId,
          })),
        });
      }

      // 5. Add Media
      if (data.media && data.media.length > 0) {
        await tx.propertyMedia.createMany({
          data: data.media.map((m) => ({
            propertyId: property.id,
            url: m.url,
            isPrimary: m.isPrimary || false,
          })),
        });
      }

      return this.findOne(property.id, tx);
    });
  }

  async update(
    id: string,
    data: {
      titleAr?: string;
      titleEn?: string;
      descriptionAr?: string;
      descriptionEn?: string;
      price?: number;
      area?: number;
      city?: string;
      latitude?: number;
      longitude?: number;
      contactPhone?: string;
      typeId?: string;
      typeSpecId?: string;
      categoryId?: string;
      status?: 'DRAFT' | 'READY' | 'PUBLISHED' | 'SUSPENDED' | 'ARCHIVED';
      currency?: any;
      featureIds?: string[];
      utilityIds?: string[];
      guaranteeIds?: string[];
    },
  ) {
    // Check if property exists
    await this.findOne(id);

    const titleEn = (data.titleEn !== undefined) 
      ? ((data.titleEn && data.titleEn.trim() !== '') ? data.titleEn : (data.titleAr || '')) 
      : undefined;
    const descriptionEn = (data.descriptionEn !== undefined) 
      ? ((data.descriptionEn && data.descriptionEn.trim() !== '') ? data.descriptionEn : (data.descriptionAr || '')) 
      : undefined;

    return this.prisma.$transaction(async (tx) => {
      // 1. Update basic fields
      await tx.property.update({
        where: { id },
        data: {
          titleAr: data.titleAr,
          ...(titleEn !== undefined ? { titleEn } : {}),
          descriptionAr: data.descriptionAr,
          ...(descriptionEn !== undefined ? { descriptionEn } : {}),
          price: data.price,
          area: data.area,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
          contactPhone: data.contactPhone,
          typeId: data.typeId,
          typeSpecId: data.typeSpecId,
          categoryId: data.categoryId,
          status: data.status,
          currency: data.currency,
        },
      });

      // 2. Re-link features
      if (data.featureIds !== undefined) {
        await tx.propertyFeatureMap.deleteMany({ where: { propertyId: id } });
        if (data.featureIds.length > 0) {
          await tx.propertyFeatureMap.createMany({
            data: data.featureIds.map((featureId) => ({
              propertyId: id,
              featureId,
            })),
          });
        }
      }

      // 3. Re-link utilities
      if (data.utilityIds !== undefined) {
        await tx.propertyUtilityMap.deleteMany({ where: { propertyId: id } });
        if (data.utilityIds.length > 0) {
          await tx.propertyUtilityMap.createMany({
            data: data.utilityIds.map((utilityId) => ({
              propertyId: id,
              utilityId,
            })),
          });
        }
      }

      // 4. Re-link guarantees
      if (data.guaranteeIds !== undefined) {
        await tx.propertyGuaranteeMap.deleteMany({ where: { propertyId: id } });
        if (data.guaranteeIds.length > 0) {
          await tx.propertyGuaranteeMap.createMany({
            data: data.guaranteeIds.map((guaranteeId) => ({
              propertyId: id,
              guaranteeId,
            })),
          });
        }
      }

      return this.findOne(id, tx);
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
    typeId?: string;
    categoryId?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    status?: 'DRAFT' | 'READY' | 'PUBLISHED' | 'SUSPENDED' | 'ARCHIVED';
    onlyPublished?: boolean;
  }) {
    const {
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
      onlyPublished,
    } = params;

    const where: any = {};

    // Guest / Customer visibility constraint
    if (onlyPublished) {
      where.status = 'PUBLISHED';
    } else if (status && (status as string) !== 'ALL') {
      where.status = status;
    } else if (!status) {
      where.status = { not: 'ARCHIVED' }; // Exclude archived properties by default for dashboard
    }

    if (typeId) where.typeId = typeId;
    if (categoryId) where.categoryId = categoryId;
    if (city) where.city = { contains: city, mode: 'insensitive' };

    // Price and Area filtering
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    if (minArea || maxArea) {
      where.area = {};
      if (minArea) where.area.gte = minArea;
      if (maxArea) where.area.lte = maxArea;
    }

    if (search) {
      where.OR = [
        { titleAr: { contains: search, mode: 'insensitive' } },
        { titleEn: { contains: search, mode: 'insensitive' } },
        { descriptionAr: { contains: search, mode: 'insensitive' } },
        { descriptionEn: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        include: {
          type: true,
          typeSpec: true,
          category: true,
          media: true,
          features: { include: { feature: true } },
          utilities: { include: { utility: true } },
          guarantees: { include: { guarantee: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);

    return { properties, total };
  }

  async findOne(id: string, tx?: any) {
    const client = tx || this.prisma;
    const property = await client.property.findUnique({
      where: { id },
      include: {
        type: true,
        typeSpec: true,
        category: true,
        media: true,
        features: { include: { feature: true } },
        utilities: { include: { utility: true } },
        guarantees: { include: { guarantee: true } },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  async changeStatus(id: string, status: 'DRAFT' | 'READY' | 'PUBLISHED' | 'SUSPENDED' | 'ARCHIVED') {
    return this.prisma.property.update({
      where: { id },
      data: { status },
    });
  }

  // ==========================================
  // 3. PROPERTY MEDIA MANAGEMENT
  // ==========================================

  async addMedia(propertyId: string, media: { url: string; isPrimary?: boolean }) {
    await this.findOne(propertyId); // Verify property exists
    return this.prisma.propertyMedia.create({
      data: {
        propertyId,
        url: media.url,
        isPrimary: media.isPrimary || false,
      },
    });
  }

  async removeMedia(mediaId: string) {
    return this.prisma.propertyMedia.delete({
      where: { id: mediaId },
    });
  }
}
