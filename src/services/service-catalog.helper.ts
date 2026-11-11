import { Department, TaxonomyGroup } from '@prisma/client';

export const SYNCABLE_TAXONOMY_GROUPS: TaxonomyGroup[] = [
  TaxonomyGroup.SERVICE_TYPE,
  TaxonomyGroup.ENGINEERING_CONSULTATION,
  TaxonomyGroup.CONTRACTING_FIELD,
];

interface ServicePreset {
  subCategory: string;
  coverImage: string;
  shortDescriptionAr: string;
  shortDescriptionEn: string;
  detailedDescriptionAr: string;
  detailedDescriptionEn: string;
}

export const TAXONOMY_SERVICE_PRESETS: Record<string, ServicePreset> = {
  // ── Engineering: Architectural (ARCH) ───────────────────────────────────
  ARCH: {
    subCategory: 'ARCH',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&fit=crop&q=80',
    shortDescriptionAr: 'إعداد المخططات المعمارية وتوزيع الفراغات الداخلية وتصميم الواجهات بتقنية 3D.',
    shortDescriptionEn: 'Architectural floor plans, interior layouts, and 3D facade visualizations.',
    detailedDescriptionAr:
      'نقدم تصاميم معمارية مبتكرة تشمل توزيع الفراغات الوظيفية بدقة، تصميم الواجهات العصرية والتراثية، والديكور الداخلي مع إخراج مناظير ثلاثية الأبعاد (3D Rendering) ومخططات تنفيذية كاملة جاهزة للترخيص والبناء.',
    detailedDescriptionEn:
      'Complete architectural & interior design deliverables including space optimization, facade design, 3D renders, and permit-ready architectural working drawings.',
  },
  LANDSCAPE: {
    subCategory: 'ARCH',
    coverImage: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&fit=crop&q=80',
    shortDescriptionAr: 'تصميم وتنسيق الحدائق المنزلية والفلل والجلسات الخارجية والممرات والمسابح.',
    shortDescriptionEn: 'Landscape architecture for residential gardens, courtyards, pools, and outdoor lounges.',
    detailedDescriptionAr:
      'تصميم متكامل للمساحات الخارجية والحدائق يشمل توزيع الغطاء النباتي، شبكات الري الحديثة، الإضاءة المعمارية الخارجية، البرجولات والجلسات العائلية بتناغم تام مع الطراز المعماري للمبنى.',
    detailedDescriptionEn:
      'Full outdoor living design covering hardscape, planting layouts, irrigation planning, architectural lighting, and modern pergolas/seating areas.',
  },

  // ── Engineering: Structural & Supervision (STRUCT) ──────────────────────
  STRUCT: {
    subCategory: 'STRUCT',
    coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&fit=crop&q=80',
    shortDescriptionAr: 'التحليل الإنشائي وحساب الأحمال وتصميم القواعد والأعمدة والأسقف وفق كود البناء.',
    shortDescriptionEn: 'Structural engineering analysis, load calculations, and reinforced concrete framing design.',
    detailedDescriptionAr:
      'تصميم وتحليل إنشائي دقيق لجميع أنواع المنشآت الخرسانية باستخدام أحدث البرامج الهندسية (ETABS / SAFE / SAP2000) لتحقيق أعلى معاملات الأمان الزلزالي والإنشائي مع الاقتصادية المثلى في كميات الحديد والخرسانة.',
    detailedDescriptionEn:
      'Precision structural modeling and detailing of foundations, columns, slabs, and shear walls in accordance with ACI/IBC building codes.',
  },
  SUPERVISION: {
    subCategory: 'STRUCT',
    coverImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&fit=crop&q=80',
    shortDescriptionAr: 'إشراف هندسي ميداني دوري لاستلام أعمال الحفر والحدادة والنجارة وصب الخرسانة.',
    shortDescriptionEn: 'On-site engineering supervision, reinforcement inspection, and concrete pour QA.',
    detailedDescriptionAr:
      'زيارات ميدانية منتظمة لموقع المشروع من قِبل مهندسين مختصين لمطابقة التنفيذ مع المخططات المعتمدة، استلام التسليح والأبعاد الخرسانية قبل الصب، ضبط الجودة، وتقديم تقارير متابعة دورية بالصور والملاحظات للمالك.',
    detailedDescriptionEn:
      'Dedicated field supervision covering rebar verification, formwork alignment, concrete testing coordination, and milestone photographic reporting.',
  },
  QUANTITIES: {
    subCategory: 'STRUCT',
    coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&fit=crop&q=80',
    shortDescriptionAr: 'إعداد جداول الكميات والمواصفات الفنية (BOQ) ودفاتر شروط التنفيذ والمناقصات.',
    shortDescriptionEn: 'Detailed Bills of Quantities (BOQ), material take-offs, and technical specifications.',
    detailedDescriptionAr:
      'حصر هندسي دقيق لجميع البنود الإنشائية والمعمارية وأعمال التشطيبات والأنظمة الكهروميكانيكية مع إعداد كراسات الشروط والمواصفات الفنية وجداول الكميات لتسعير المقاولين وضبط ميزانية المشروع.',
    detailedDescriptionEn:
      'Comprehensive quantity surveying from approved drawings alongside standardized technical specifications for accurate contractor tendering.',
  },

  // ── Engineering: Consultations (CONSULT) ────────────────────────────────
  STRUCT_SAFETY: {
    subCategory: 'CONSULT',
    coverImage: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&fit=crop&q=80',
    shortDescriptionAr: 'فحص المباني القائمة وتشخيص التصدعات والهبوط وتقييم صلاحية المبنى أو إضافة أدوار.',
    shortDescriptionEn: 'Structural health assessment, crack diagnostics, and vertical expansion feasibility.',
    detailedDescriptionAr:
      'معاينة هندسية ميدانية متخصصة لفحص الحالة الإنشائية للمباني القائمة، تشخيص أسباب الشروخ والرطوبة أو الهبوط، التحقق من إمكانية التعلية وإضافة أدوار، وإصدار تقرير فني مفصل بالمعالجات والتدعيم المطلوب.',
    detailedDescriptionEn:
      'Diagnostic site inspection of existing structures, core/non-destructive evaluation recommendations, crack analysis, and strengthening engineering reports.',
  },
  BLUEPRINT_REVIEW: {
    subCategory: 'CONSULT',
    coverImage: 'https://images.unsplash.com/photo-1503387837-b154d5074bd2?w=800&fit=crop&q=80',
    shortDescriptionAr: 'مراجعة وتدقيق المخططات المعمارية والإنشائية والتأكد من سلامتها وكفاءتها الاقتصادية.',
    shortDescriptionEn: 'Peer review and value-engineering audit of architectural and structural blueprints.',
    detailedDescriptionAr:
      'تدقيق شامل للمخططات المصممة مسبقاً لكشف أي تعارضات بين المعماري والإنشائي، تحسين استغلال المساحات، ومراجعة التسليح والقطاعات الخرسانية لضمان أعلى مستوى من الجودة والأمان وتفادي الهدر في التكاليف.',
    detailedDescriptionEn:
      'Independent third-party audit checking multi-discipline coordination, code compliance, rebar optimization, and space utilization.',
  },
  COST_ESTIMATE: {
    subCategory: 'CONSULT',
    coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&fit=crop&q=80',
    shortDescriptionAr: 'دراسة وتقدير تكلفة البناء والميزانية التقديرية لحديد التسليح والخرسانة والتشطيبات.',
    shortDescriptionEn: 'Construction cost estimation, budget forecasting, and material volume analysis.',
    detailedDescriptionAr:
      'استشارة مالية وهندسية لتحديد التكلفة التقديرية لمشروعك قبل البدء في التنفيذ، تشمل حساب كميات الحديد والخرسانة ومراحل العظم والتشطيب وفق أسعار السوق المحلية المحدثة.',
    detailedDescriptionEn:
      'Realistic pre-construction cost modeling breaking down excavation, concrete skeleton, MEP, and finishing budgets.',
  },
  TECHNICAL_ADVICE: {
    subCategory: 'CONSULT',
    coverImage: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&fit=crop&q=80',
    shortDescriptionAr: 'استشارات فنية وهندسية فورية قبل شراء العقار أو اختيار مواد البناء أو بدء التشطيب.',
    shortDescriptionEn: 'Expert engineering guidance prior to property purchase, building, or remodeling.',
    detailedDescriptionAr:
      'جلسات استشارية متخصصة للإجابة عن استفساراتك الهندسية المتعلقة باختيار الأرض أو العقار، تقييم جدوى التعديل الداخلي، اختيار أنظمة العزل والمواد المناسبة وتفادي الأخطاء التنفيذية الشائعة.',
    detailedDescriptionEn:
      'One-on-one engineering advisory covering pre-purchase inspections, remodeling feasibility, waterproofing systems, and material selection.',
  },
  DISPUTES: {
    subCategory: 'CONSULT',
    coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&fit=crop&q=80',
    shortDescriptionAr: 'تحكيم هندسي محايد وفصل في النزاعات الفنية وإثبات الحالة وحصر الأعمال المنفذة.',
    shortDescriptionEn: 'Independent engineering arbitration, dispute resolution, and executed work valuation.',
    detailedDescriptionAr:
      'إعداد تقارير خبرة وتحكيم هندسي محايد وموثق للفصل في الخلافات الفنية والتعاقدية بين الملاك والمقاولين، شامل حصر الأعمال المنجزة فعلياً وتقييم العيوب التنفيذية ومطابقة المواصفات.',
    detailedDescriptionEn:
      'Objective technical assessment and documentation of completed scopes, defects, and contractual compliance for dispute resolution.',
  },

  // ── Contracting: Concrete & Core Structural (CONCRETE) ──────────────────
  CONCRETE: {
    subCategory: 'CONCRETE',
    coverImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800',
    shortDescriptionAr: 'تنفيذ أعمال العظم والخرسانة المسلحة وتشييد العمارات والفلل بأعلى جودة وإشراف معتمد.',
    shortDescriptionEn: 'Execution of building carcasses, reinforced concrete works and structural developments.',
    detailedDescriptionAr:
      'تنفيذ جميع أعمال العظم والهياكل الخرسانية المسلحة للفلل والعمائر والمجمعات التجارية ابتداءً من القواعد والميد والأعمدة والأسقف وفق المخططات المعتمدة ومراقبة الجودة الهندسية.',
    detailedDescriptionEn:
      'Full execution of reinforced concrete structures including foundations, columns, slabs, and blockwork under strict engineering QC.',
  },
  TURNKEY: {
    subCategory: 'CONCRETE',
    coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&fit=crop&q=80',
    shortDescriptionAr: 'تنفيذ المباني تسليم مفتاح من الحفر والأساسات وحتى التشطيب النهائي والسكن.',
    shortDescriptionEn: 'Complete turnkey building delivery from excavation through structural & final finishing.',
    detailedDescriptionAr:
      'باقة المقاولات المتكاملة (تسليم مفتاح) لتنفيذ مشروعك السكني أو التجاري بالكامل بعقد واضح وجدول زمني محدد يشمل الحفر والخرسانة والمباني والسباكة والكهرباء والتشطيب النهائي.',
    detailedDescriptionEn:
      'Single-contract end-to-end project execution managing civil, structural, MEP, and turnkey architectural finishing on schedule.',
  },
  EXCAVATION: {
    subCategory: 'CONCRETE',
    coverImage: 'https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=800&fit=crop&q=80',
    shortDescriptionAr: 'أعمال الحفر والتسوية والقطع الصخري وإحلال التربة وتجهيز موقع التأسيس والأساسات.',
    shortDescriptionEn: 'Site grading, rock excavation, soil replacement, and foundation preparation works.',
    detailedDescriptionAr:
      'تنفيذ كافة أعمال تجهيز الموقع والحفر الهندسي بمعدات حديثة، بما يشمل الردم على طبقات والدمك الميكانيكي وإحلال التربة وعزل الأساسات تحت إشراف هندسي مباشر.',
    detailedDescriptionEn:
      'Site earthworks including clearing, bulk excavation, rock breaking, engineered backfilling, compaction, and substructure preparation.',
  },

  // ── Contracting: Finishing & Renovation (FINISH) ────────────────────────
  FINISHING: {
    subCategory: 'FINISH',
    coverImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&fit=crop&q=80',
    shortDescriptionAr: 'تنفيذ كافة أعمال التشطيبات الداخلية والخارجية واللياسة والدهانات والأرضيات والجبس.',
    shortDescriptionEn: 'Interior & exterior finishing: plastering, painting, tiling, gypsum, and MEP fit-outs.',
    detailedDescriptionAr:
      'أعمال التشطيبات المتكاملة بجودة عالية تشمل التمديدات الصحية والكهربائية، اللياسة الموزونة، تركيب الرخام والبورسلين والسيراميك، الديكورات الجبسية، الدهانات والواجهات الحجرية الحديثة.',
    detailedDescriptionEn:
      'High-precision architectural fit-outs covering MEP rough-in/fixtures, plastering, stone/porcelain flooring, gypsum ceilings, and coatings.',
  },
  RENOVATION: {
    subCategory: 'FINISH',
    coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&fit=crop&q=80',
    shortDescriptionAr: 'ترميم وتأهيل المباني القائمة ومعالجة التصدعات وتحديث الواجهات وتغيير توزيع المساحات.',
    shortDescriptionEn: 'Structural restoration, building remodeling, crack repair, and facade modernization.',
    detailedDescriptionAr:
      'خدمات ترميم وإعادة تأهيل شاملة للمباني والفلل والشقق القديمة، تشمل معالجة التسربات والرطوبة، تدعيم العناصر الإنشائية، تجديد التمديدات وإعادة التشطيب والتصميم الداخلي.',
    detailedDescriptionEn:
      'Comprehensive renovation covering waterproofing remediation, structural repair, MEP upgrades, and modern interior/exterior facelifts.',
  },
};

export function normalizeSubCategory(
  department: Department | string,
  raw?: string | null,
): string | null {
  const clean = (raw || '').trim().toUpperCase();
  if (!clean) return null;

  if (department === Department.CONTRACTING || department === 'CONTRACTING') {
    if (clean === 'FINISHING' || clean === 'FINISH' || clean === 'RENOVATION') return 'FINISH';
    if (clean === 'CONCRETE' || clean === 'TURNKEY' || clean === 'EXCAVATION') return 'CONCRETE';
    return clean;
  }

  if (clean === 'CONSULTATION' || clean === 'CONSULT') return 'CONSULT';
  if (clean === 'STRUCTURAL' || clean === 'STRUCT' || clean === 'SUPERVISION' || clean === 'QUANTITIES') return 'STRUCT';
  if (clean === 'ARCHITECTURAL' || clean === 'ARCH' || clean === 'LANDSCAPE') return 'ARCH';
  return clean;
}

export function inferServiceSubCategory(
  department: Department | string,
  taxonomyCode?: string | null,
  ...texts: Array<string | null | undefined>
): string {
  const code = (taxonomyCode || '').trim().toUpperCase();
  const isContracting = department === Department.CONTRACTING || department === 'CONTRACTING';

  if (code) {
    if (isContracting) {
      if (['FINISHING', 'RENOVATION', 'FINISH'].includes(code)) return 'FINISH';
      return 'CONCRETE';
    }
    if (['STRUCT_SAFETY', 'BLUEPRINT_REVIEW', 'COST_ESTIMATE', 'TECHNICAL_ADVICE', 'DISPUTES', 'CONSULT'].includes(code)) {
      return 'CONSULT';
    }
    if (['STRUCT', 'SUPERVISION', 'QUANTITIES'].includes(code)) {
      return 'STRUCT';
    }
    if (['ARCH', 'LANDSCAPE'].includes(code)) {
      return 'ARCH';
    }
  }

  const combined = texts
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (isContracting) {
    if (
      /تشطيب|finish|ديكور|دهان|جبس|إكساء|بلاط|سيراميك|ترميم|renovat|صيان/.test(combined) &&
      !/عظم|خرسان|قواعد|حفر|هيكل/.test(combined)
    ) {
      return 'FINISH';
    }
    return 'CONCRETE';
  }

  if (
    /تقييم السلامة|فحص التصدع|فحص المباني|مراجعة المخططات|تقدير التكاليف|استشارة فنية|نزاعات|تحكيم|consult/.test(
      combined,
    )
  ) {
    return 'CONSULT';
  }

  if (/إنشائ|structur|هيكل|خرسان|أحمال|إشراف|supervis|كميات|quantit|boq/.test(combined)) {
    // Only treat as STRUCT if it's not primarily an architectural comprehensive overview mentioning both
    if (!/تصميم مخططات معمارية وإنشائية|التصاميم والاستشارات/.test(combined)) {
      return 'STRUCT';
    }
  }

  if (/معمار|architect|تصميم|ديكور|حدائق|لاندسكيب|landscape|واجهات|مخطط/.test(combined)) {
    return 'ARCH';
  }

  if (/استشار/.test(combined)) {
    return 'CONSULT';
  }

  return 'ARCH';
}

export function mapTaxonomyGroupToDepartmentAndSubCategory(
  group: TaxonomyGroup,
  code: string,
  nameAr: string,
  nameEn: string,
  description?: string | null,
): { department: Department; subCategory: string } {
  if (group === TaxonomyGroup.CONTRACTING_FIELD) {
    return {
      department: Department.CONTRACTING,
      subCategory: inferServiceSubCategory(Department.CONTRACTING, code, nameAr, nameEn, description),
    };
  }
  if (group === TaxonomyGroup.ENGINEERING_CONSULTATION) {
    return {
      department: Department.ENGINEERING,
      subCategory: 'CONSULT',
    };
  }
  return {
    department: Department.ENGINEERING,
    subCategory: inferServiceSubCategory(Department.ENGINEERING, code, nameAr, nameEn, description),
  };
}

export function buildServiceFromTaxonomyItem(item: {
  group: TaxonomyGroup;
  code: string;
  nameAr: string;
  nameEn: string;
  description?: string | null;
  isActive: boolean;
}) {
  const { department, subCategory } = mapTaxonomyGroupToDepartmentAndSubCategory(
    item.group,
    item.code,
    item.nameAr,
    item.nameEn,
    item.description,
  );
  const preset = TAXONOMY_SERVICE_PRESETS[item.code];

  const fallbackCoverBySub: Record<string, string> = {
    ARCH: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&fit=crop&q=80',
    STRUCT: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&fit=crop&q=80',
    CONSULT: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&fit=crop&q=80',
    CONCRETE: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800',
    FINISH: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&fit=crop&q=80',
  };

  const descClean = item.description?.trim();
  const shortAr = descClean || preset?.shortDescriptionAr || item.nameAr;
  const shortEn = preset?.shortDescriptionEn || item.nameEn;
  const detailedAr =
    preset?.detailedDescriptionAr ||
    (descClean
      ? `${item.nameAr}: ${descClean}. يتم تنفيذ هذه الخدمة وفق أعلى المعايير الهندسية وبإشراف كادر متخصص ومعتمد.`
      : `${item.nameAr}: خدمة احترافية مقدمة من فريق مكتب آفاق العرب الهندسي والمقاولات وفق أحدث الأكواد والمعايير المعتمدة.`);
  const detailedEn =
    preset?.detailedDescriptionEn ||
    `${item.nameEn}: Professional engineering and execution service delivered by Afaq Al-Arab certified team.`;

  return {
    nameAr: item.nameAr.trim(),
    nameEn: item.nameEn.trim() || item.nameAr.trim(),
    department,
    subCategory,
    taxonomyCode: item.code,
    basePrice: null as number | null,
    shortDescriptionAr: shortAr,
    shortDescriptionEn: shortEn,
    detailedDescriptionAr: detailedAr,
    detailedDescriptionEn: detailedEn,
    coverImage: preset?.coverImage || fallbackCoverBySub[subCategory] || fallbackCoverBySub.ARCH,
    status: (item.isActive ? 'PUBLISHED' : 'SUSPENDED') as 'PUBLISHED' | 'SUSPENDED',
  };
}
