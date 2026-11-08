import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaxonomyGroup, TaxonomyItem } from '@prisma/client';

export const INITIAL_TAXONOMIES = [
  // 1. Engineering Consultation Fields (مجال الاستشارة الهندسية)
  {
    group: TaxonomyGroup.ENGINEERING_CONSULTATION,
    code: 'STRUCT_SAFETY',
    nameAr: 'تقييم السلامة الإنشائية للمباني',
    nameEn: 'Building Structural Safety Assessment',
    description: 'فحص التصدعات والهبوط وسلامة الأعمدة والأسقف',
    sortOrder: 1,
    isActive: true,
  },
  {
    group: TaxonomyGroup.ENGINEERING_CONSULTATION,
    code: 'BLUEPRINT_REVIEW',
    nameAr: 'مراجعة المخططات الهندسية وتدقيقها',
    nameEn: 'Blueprint & Drawings Review',
    description: 'مطابقة المخططات المعمارية والإنشائية مع الكود المعتمد',
    sortOrder: 2,
    isActive: true,
  },
  {
    group: TaxonomyGroup.ENGINEERING_CONSULTATION,
    code: 'COST_ESTIMATE',
    nameAr: 'تقدير التكاليف وحساب الكميات',
    nameEn: 'Cost & Budget Estimation',
    description: 'حساب كميات حديد التسليح والخرسانة والميزانية التقديرية',
    sortOrder: 3,
    isActive: true,
  },
  {
    group: TaxonomyGroup.ENGINEERING_CONSULTATION,
    code: 'TECHNICAL_ADVICE',
    nameAr: 'استشارة فنية عامة',
    nameEn: 'General Technical Advice',
    description: 'إرشادات هندسية قبل الشراء أو البناء أو التشطيب',
    sortOrder: 4,
    isActive: true,
  },
  {
    group: TaxonomyGroup.ENGINEERING_CONSULTATION,
    code: 'DISPUTES',
    nameAr: 'حل نزاعات فنية وهندسية (تحكيم)',
    nameEn: 'Resolution of Technical Disputes',
    description: 'تحكيم هندسي معتمد بين الملاك والمقاولين',
    sortOrder: 5,
    isActive: true,
  },

  // 2. Contracting Fields (مجال المقاولات المطلوب)
  {
    group: TaxonomyGroup.CONTRACTING_FIELD,
    code: 'CONCRETE',
    nameAr: 'بناء عظم وهياكل خرسانية',
    nameEn: 'Concrete Skeleton & Structures',
    description: 'تنفيذ القواعد والميد والأعمدة والأسقف الخرسانية المسلحة',
    sortOrder: 1,
    isActive: true,
  },
  {
    group: TaxonomyGroup.CONTRACTING_FIELD,
    code: 'TURNKEY',
    nameAr: 'بناء متكامل (تسليم مفتاح)',
    nameEn: 'Full Turnkey Build',
    description: 'تنفيذ كامل من الحفر والأساسات وحتى التشطيب النهائي',
    sortOrder: 2,
    isActive: true,
  },
  {
    group: TaxonomyGroup.CONTRACTING_FIELD,
    code: 'FINISHING',
    nameAr: 'أعمال التشطيبات والديكور',
    nameEn: 'Finishing & Decoration',
    description: 'لياسة، دهانات، جبسيات، أرضيات، سباكة وكهرباء',
    sortOrder: 3,
    isActive: true,
  },
  {
    group: TaxonomyGroup.CONTRACTING_FIELD,
    code: 'RENOVATION',
    nameAr: 'ترميم وصيانة مباني',
    nameEn: 'Building Renovation & Maintenance',
    description: 'إعادة تأهيل المباني القائمة ومعالجة التصدعات',
    sortOrder: 4,
    isActive: true,
  },
  {
    group: TaxonomyGroup.CONTRACTING_FIELD,
    code: 'EXCAVATION',
    nameAr: 'أعمال الحفر والتأسيس',
    nameEn: 'Excavation & Foundations',
    description: 'تسوية الأراضي، الحفر الصخري، وإحلال التربة',
    sortOrder: 5,
    isActive: true,
  },

  // 3. Real Estate Transaction Types (نوع المعاملة المطلوبة)
  {
    group: TaxonomyGroup.TRANSACTION_TYPE,
    code: 'BUY',
    nameAr: 'شراء عقار',
    nameEn: 'Buy Property',
    description: 'البحث عن عقار متاح للشراء الفوري',
    sortOrder: 1,
    isActive: true,
  },
  {
    group: TaxonomyGroup.TRANSACTION_TYPE,
    code: 'RENT',
    nameAr: 'استئجار عقار',
    nameEn: 'Rent Property',
    description: 'استئجار شقق، فلل، مكاتب أو محلات تجارية',
    sortOrder: 2,
    isActive: true,
  },
  {
    group: TaxonomyGroup.TRANSACTION_TYPE,
    code: 'SELL',
    nameAr: 'عرض عقار للبيع',
    nameEn: 'Sell Property',
    description: 'تسويق عقار وعرضه على المنصة للبيع',
    sortOrder: 3,
    isActive: true,
  },
  {
    group: TaxonomyGroup.TRANSACTION_TYPE,
    code: 'INVEST',
    nameAr: 'فرصة استثمارية',
    nameEn: 'Real Estate Investment',
    description: 'استثمار عقاري ومشاريع تجارية بعوائد دورية',
    sortOrder: 4,
    isActive: true,
  },

  // 4. Required Service Types (نوع الخدمة الهندسية)
  {
    group: TaxonomyGroup.SERVICE_TYPE,
    code: 'ARCH',
    nameAr: 'تصاميم معمارية وديكور',
    nameEn: 'Architectural & Interior Design',
    description: 'مخططات معمارية، واجهات 3D وتوزيع فراغات',
    sortOrder: 1,
    isActive: true,
  },
  {
    group: TaxonomyGroup.SERVICE_TYPE,
    code: 'STRUCT',
    nameAr: 'تصميم وتحليل إنشائي',
    nameEn: 'Structural Design & Analysis',
    description: 'مخططات إنشائية دقيقة للأمان والاقتصادية',
    sortOrder: 2,
    isActive: true,
  },
  {
    group: TaxonomyGroup.SERVICE_TYPE,
    code: 'LANDSCAPE',
    nameAr: 'تصميم حدائق ومساحات خارجية',
    nameEn: 'Landscape Design',
    description: 'لاندسكيب، جلسات خارجية وحدائق منزلية',
    sortOrder: 3,
    isActive: true,
  },
  {
    group: TaxonomyGroup.SERVICE_TYPE,
    code: 'SUPERVISION',
    nameAr: 'إشراف هندسي ومتابعة تنفيذ',
    nameEn: 'Site Engineering Supervision',
    description: 'زيارات ميدانية لموقع البناء ومطابقة صب الخرسانة',
    sortOrder: 4,
    isActive: true,
  },
  {
    group: TaxonomyGroup.SERVICE_TYPE,
    code: 'QUANTITIES',
    nameAr: 'حساب كميات ومواصفات فنية',
    nameEn: 'Quantity Surveying & Specs',
    description: 'جداول كميات BOQ ودفاتر شروط التنفيذ',
    sortOrder: 5,
    isActive: true,
  },

  // 5. Property Types (نوع العقار)
  {
    group: TaxonomyGroup.PROPERTY_TYPE,
    code: 'VILLA',
    nameAr: 'فيلا مستقلة',
    nameEn: 'Independent Villa',
    description: 'فلل سكنية وقصور عائلية',
    sortOrder: 1,
    isActive: true,
  },
  {
    group: TaxonomyGroup.PROPERTY_TYPE,
    code: 'APARTMENT',
    nameAr: 'شقة سكنية',
    nameEn: 'Apartment',
    description: 'شقق عائلية وأدوار سكنية',
    sortOrder: 2,
    isActive: true,
  },
  {
    group: TaxonomyGroup.PROPERTY_TYPE,
    code: 'BUILDING',
    nameAr: 'عمارة / برج سكني تجاري',
    nameEn: 'Residential/Commercial Building',
    description: 'عمائر استثمارية وأبراج متعددة الطوابق',
    sortOrder: 3,
    isActive: true,
  },
  {
    group: TaxonomyGroup.PROPERTY_TYPE,
    code: 'LAND',
    nameAr: 'أرض سكنية أو تجارية',
    nameEn: 'Residential or Commercial Land',
    description: 'قطع أراض ومخططات معتمدة',
    sortOrder: 4,
    isActive: true,
  },
  {
    group: TaxonomyGroup.PROPERTY_TYPE,
    code: 'COMMERCIAL',
    nameAr: 'محل تجاري / معرض / مكتب',
    nameEn: 'Commercial Store / Office',
    description: 'مقرات شركات، معارض تجارية ومحلات',
    sortOrder: 5,
    isActive: true,
  },
];

@Injectable()
export class TaxonomyService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultsIfEmpty();
  }

  async seedDefaultsIfEmpty() {
    try {
      const count = await this.prisma.taxonomyItem.count();
      if (count === 0) {
        console.log('Seeding initial taxonomy items...');
        for (const item of INITIAL_TAXONOMIES) {
          await this.prisma.taxonomyItem.create({
            data: item,
          });
        }
        console.log(`Seeded ${INITIAL_TAXONOMIES.length} taxonomy items.`);
      }
    } catch (err) {
      console.error('Error seeding taxonomy items:', err);
    }
  }

  // Public / Mobile endpoint: active items sorted by sortOrder
  async findActive(group?: TaxonomyGroup): Promise<TaxonomyItem[]> {
    const where: any = { isActive: true };
    if (group) {
      where.group = group;
    }
    return this.prisma.taxonomyItem.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  // Admin endpoint: all items with optional filters
  async findAll(params?: { group?: TaxonomyGroup; search?: string }): Promise<TaxonomyItem[]> {
    const where: any = {};
    if (params?.group) {
      where.group = params.group;
    }
    if (params?.search) {
      where.OR = [
        { nameAr: { contains: params.search, mode: 'insensitive' } },
        { nameEn: { contains: params.search, mode: 'insensitive' } },
        { code: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.taxonomyItem.findMany({
      where,
      orderBy: [
        { group: 'asc' },
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  async findOne(id: string): Promise<TaxonomyItem> {
    const item = await this.prisma.taxonomyItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Taxonomy item with ID ${id} not found`);
    }
    return item;
  }

  async create(data: {
    group: TaxonomyGroup;
    code?: string;
    nameAr: string;
    nameEn: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<TaxonomyItem> {
    const code = (data.code && data.code.trim().length > 0)
      ? data.code.trim().toUpperCase().replace(/\s+/g, '_')
      : `OPT_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // If sortOrder is not provided, calculate next sortOrder in this group
    let sortOrder = data.sortOrder;
    if (sortOrder === undefined || sortOrder === null) {
      const maxItem = await this.prisma.taxonomyItem.findFirst({
        where: { group: data.group },
        orderBy: { sortOrder: 'desc' },
      });
      sortOrder = (maxItem?.sortOrder ?? 0) + 1;
    }

    return this.prisma.taxonomyItem.create({
      data: {
        group: data.group,
        code,
        nameAr: data.nameAr.trim(),
        nameEn: data.nameEn.trim(),
        description: data.description?.trim() || null,
        sortOrder,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async update(id: string, data: Partial<{
    nameAr: string;
    nameEn: string;
    description: string;
    sortOrder: number;
    isActive: boolean;
  }>): Promise<TaxonomyItem> {
    await this.findOne(id);
    return this.prisma.taxonomyItem.update({
      where: { id },
      data: {
        ...(data.nameAr !== undefined && { nameAr: data.nameAr.trim() }),
        ...(data.nameEn !== undefined && { nameEn: data.nameEn.trim() }),
        ...(data.description !== undefined && { description: data.description ? data.description.trim() : null }),
        ...(data.sortOrder !== undefined && { sortOrder: Number(data.sortOrder) }),
        ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
      },
    });
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);
    await this.prisma.taxonomyItem.delete({ where: { id } });
    return { success: true, message: 'Taxonomy item deleted successfully' };
  }

  async reorder(items: { id: string; sortOrder: number }[]): Promise<{ success: boolean; updatedCount: number }> {
    const updates = items.map((item) =>
      this.prisma.taxonomyItem.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      })
    );
    await this.prisma.$transaction(updates);
    return { success: true, updatedCount: updates.length };
  }
}
