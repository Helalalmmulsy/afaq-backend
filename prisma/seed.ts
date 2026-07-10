import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start comprehensive seeding...');

  // --- Clean existing data to avoid conflicts ---
  // Delete in reverse order of dependencies
  await prisma.projectTask.deleteMany({});
  await prisma.projectMilestone.deleteMany({});
  await prisma.projectAttachment.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.workProject.deleteMany({});
  await prisma.serviceRequest.deleteMany({});
  await prisma.propertyMedia.deleteMany({});
  await prisma.propertyFeatureMap.deleteMany({});
  await prisma.propertyUtilityMap.deleteMany({});
  await prisma.propertyGuaranteeMap.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.propertyTypeSpec.deleteMany({});
  await prisma.propertyType.deleteMany({});
  await prisma.propertyCategory.deleteMany({});
  await prisma.propertyFeature.deleteMany({});
  await prisma.propertyUtility.deleteMany({});
  await prisma.propertyGuarantee.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.news.deleteMany({});
  await prisma.engineeringTip.deleteMany({});
  await prisma.companyAchievement.deleteMany({});
  await prisma.engineerProfile.deleteMany({});
  await prisma.contractorProfile.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.systemSetting.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { not: 'admin@afaq.com' } } });

  // 1. Seed Roles
  const roles = [
    { name: 'SYSTEM_ADMIN', nameAr: 'مدير النظام', nameEn: 'System Administrator' },
    { name: 'ADMIN', nameAr: 'مدير العمليات', nameEn: 'Operations Manager' },
    { name: 'EMPLOYEE', nameAr: 'موظف', nameEn: 'Employee' },
    { name: 'ENGINEER', nameAr: 'مهندس', nameEn: 'Engineer' },
    { name: 'CONTRACTOR', nameAr: 'مقاول', nameEn: 'Contractor' },
    { name: 'CUSTOMER', nameAr: 'عميل', nameEn: 'Customer' },
  ];

  const dbRoles: Record<string, any> = {};
  for (const role of roles) {
    const dbRole = await prisma.role.upsert({
      where: { name: role.name },
      update: { nameAr: role.nameAr, nameEn: role.nameEn },
      create: role,
    });
    dbRoles[role.name] = dbRole;
  }
  console.log('Seeded Roles');

  // 2. Link Admin permissions
  const systemAdminRole = dbRoles['SYSTEM_ADMIN'];
  const permissions = await prisma.permission.findMany();
  for (const perm of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: systemAdminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: systemAdminRole.id,
        permissionId: perm.id,
      },
    });
  }
  console.log('Verified Admin Permissions');

  // 2.5 Ensure default System Admin exists
  const existingAdmin = await prisma.user.findFirst({ where: { email: 'admin@afaq.com' } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'مدير النظام',
        email: 'admin@afaq.com',
        password: 'admin123',
        phone: '777777777',
        roleId: dbRoles['SYSTEM_ADMIN'].id,
        status: 'ACTIVE',
      },
    });
  }
  console.log('Seeded/Verified Admin User');

  // 3. Seed Users (Engineers, Contractors, Customers)
  // Engineers
  const engUser1 = await prisma.user.create({
    data: {
      name: 'المهندس أحمد صالح البكاري',
      email: 'ahmed@afaq.com',
      password: 'password123',
      phone: '771234567',
      roleId: dbRoles['ENGINEER'].id,
      status: 'ACTIVE',
      engineerProfile: {
        create: {
          specialization: 'STRUCTURE',
          experienceYears: 8,
          bio: 'مهندس إنشائي متخصص في تصميم الأبراج السكنية ومقاومة الزلازل.',
          skills: ['AutoCAD', 'Revit', 'Structural Analysis'],
        },
      },
    },
  });

  const engUser2 = await prisma.user.create({
    data: {
      name: 'المهندسة ريم خالد اليوسفي',
      email: 'reem@afaq.com',
      password: 'password123',
      phone: '772345678',
      roleId: dbRoles['ENGINEER'].id,
      status: 'ACTIVE',
      engineerProfile: {
        create: {
          specialization: 'ARCHITECTURE',
          experienceYears: 5,
          bio: 'مهندسة معمارية متخصصة في التصاميم الحديثة والواجهات الزجاجية والمعمار الأخضر.',
          skills: ['3ds Max', 'SketchUp', 'V-Ray Rendering'],
        },
      },
    },
  });

  // Contractors
  const contUser1 = await prisma.user.create({
    data: {
      name: 'المقاول فؤاد الحميري للتشييد',
      email: 'fouad@afaq.com',
      password: 'password123',
      phone: '773456789',
      roleId: dbRoles['CONTRACTOR'].id,
      status: 'ACTIVE',
      contractorProfile: {
        create: {
          companyName: 'مؤسسة الحميري للتجارة والمقاولات العامة',
          experienceYears: 12,
          skills: ['حفر وتأسيس', 'أعمال الخرسانة المسلحة', 'واجهات خارجية حجر'],
          bio: 'مؤسسة يمنية رائدة في تشييد المباني السكنية والتجارية والمشاريع الكبيرة.',
        },
      },
    },
  });

  const contUser2 = await prisma.user.create({
    data: {
      name: 'المقاول صخر عبيد للتشطيبات',
      email: 'sakhr@afaq.com',
      password: 'password123',
      phone: '774567890',
      roleId: dbRoles['CONTRACTOR'].id,
      status: 'ACTIVE',
      contractorProfile: {
        create: {
          companyName: 'عبيد لخدمات الديكور والتشطيب الداخلي',
          experienceYears: 7,
          skills: ['تشطيب داخلي', 'أعمال الجبس والديكور', 'أعمال الطلاء والكهرباء'],
          bio: 'خبرة طويلة في التشطيب الفاخر للفيلات والشقق السكنية الفاخرة.',
        },
      },
    },
  });

  // Customers
  const customer1 = await prisma.user.create({
    data: {
      name: 'علي ناصر الكبسي اليمن',
      email: 'customer1@afaq.com',
      password: 'password123',
      phone: '775678901',
      roleId: dbRoles['CUSTOMER'].id,
      status: 'ACTIVE',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'أروى محمد الشريف',
      email: 'customer2@afaq.com',
      password: 'password123',
      phone: '776789012',
      roleId: dbRoles['CUSTOMER'].id,
      status: 'ACTIVE',
    },
  });

  const engProfile1 = await prisma.engineerProfile.findFirst({ where: { userId: engUser1.id } });
  const engProfile2 = await prisma.engineerProfile.findFirst({ where: { userId: engUser2.id } });
  const contProfile1 = await prisma.contractorProfile.findFirst({ where: { userId: contUser1.id } });
  const contProfile2 = await prisma.contractorProfile.findFirst({ where: { userId: contUser2.id } });

  console.log('Seeded Users (Engineers, Contractors, Customers)');

  // 4. Seed Property Metadata
  // Types & Specs
  const typeHouse = await prisma.propertyType.create({
    data: {
      nameAr: 'منزل سكني مستقل',
      nameEn: 'Independent House',
      specs: {
        createMany: {
          data: [
            { nameAr: 'طابق واحد', nameEn: '1 Floor' },
            { nameAr: 'طابقين وملحق', nameEn: '2 Floors with Annex' },
            { nameAr: '3 طوابق كاملة', nameEn: '3 Complete Floors' },
          ],
        },
      },
    },
    include: { specs: true },
  });

  const typeVilla = await prisma.propertyType.create({
    data: {
      nameAr: 'فيلا فاخرة',
      nameEn: 'Luxury Villa',
      specs: {
        createMany: {
          data: [
            { nameAr: 'دوبلكس طابقين', nameEn: 'Duplex 2 Floors' },
            { nameAr: 'فيلا ملكية 3 طوابق', nameEn: 'Royal 3-Floor Villa' },
          ],
        },
      },
    },
    include: { specs: true },
  });

  const typeApartment = await prisma.propertyType.create({
    data: {
      nameAr: 'شقة سكنية',
      nameEn: 'Apartment',
      specs: {
        createMany: {
          data: [
            { nameAr: 'شقة استوديو صغيرة', nameEn: 'Studio Apartment' },
            { nameAr: 'شقة 4 غرف وصالة', nameEn: '4 Rooms Apartment' },
            { nameAr: 'شقة دوبلكس فاخرة', nameEn: 'Duplex Apartment' },
          ],
        },
      },
    },
    include: { specs: true },
  });

  const typeLand = await prisma.propertyType.create({
    data: {
      nameAr: 'أرض فضاء',
      nameEn: 'Vacant Land',
      specs: {
        createMany: {
          data: [
            { nameAr: 'أرض تجارية على شارعين', nameEn: 'Commercial on 2 Streets' },
            { nameAr: 'أرض سكنية مستوية', nameEn: 'Residential Land' },
            { nameAr: 'أرض زراعية خصبة', nameEn: 'Agricultural Land' },
          ],
        },
      },
    },
    include: { specs: true },
  });

  // Categories
  const catRes = await prisma.propertyCategory.create({ data: { nameAr: 'سكني', nameEn: 'Residential' } });
  const catComm = await prisma.propertyCategory.create({ data: { nameAr: 'تجاري', nameEn: 'Commercial' } });
  const catAgri = await prisma.propertyCategory.create({ data: { nameAr: 'زراعي', nameEn: 'Agricultural' } });
  const catInv = await prisma.propertyCategory.create({ data: { nameAr: 'استثماري', nameEn: 'Investment' } });

  // Features
  const featGarden = await prisma.propertyFeature.create({ data: { nameAr: 'حديقة خاصة', nameEn: 'Private Garden' } });
  const featParking = await prisma.propertyFeature.create({ data: { nameAr: 'موقف سيارات واسع', nameEn: 'Spacious Parking' } });
  const featPool = await prisma.propertyFeature.create({ data: { nameAr: 'مسبح داخلي', nameEn: 'Indoor Pool' } });
  const featStone = await prisma.propertyFeature.create({ data: { nameAr: 'واجهة حجرية فاخرة', nameEn: 'Stone Facade' } });

  // Utilities
  const utilElec = await prisma.propertyUtility.create({ data: { nameAr: 'كهرباء عمومية 24 ساعة', nameEn: 'Public Electricity' } });
  const utilWater = await prisma.propertyUtility.create({ data: { nameAr: 'شبكة مياه حكومية', nameEn: 'Government Water Network' } });
  const utilFiber = await prisma.propertyUtility.create({ data: { nameAr: 'إنترنت فايبر عالي السرعة', nameEn: 'Fiber Internet' } });

  // Guarantees
  const guarConst = await prisma.propertyGuarantee.create({ data: { nameAr: 'ضمان إنشائي وعيوب خفية 10 سنوات', nameEn: '10 Years Structural Guarantee' } });
  const guarInstall = await prisma.propertyGuarantee.create({ data: { nameAr: 'ضمان تمديدات كهربائية وسباكة سنتين', nameEn: '2 Years Plumbing/Electricity Guarantee' } });

  console.log('Seeded Property Metadata (Types, Specs, Categories, Features, Utilities, Guarantees)');

  // 5. Seed Properties
  const prop1 = await prisma.property.create({
    data: {
      titleAr: 'فيلا دوبلكس حجر يمني فاخرة في مدينة ذمار',
      titleEn: 'Luxury Stone Duplex Villa in Dhamar City',
      descriptionAr: 'فيلا راقية تتكون من طابقين وبدروم، واجهتها حجر حراز يمني فاخر، تحتوي على حديقة أمامية واسعة وموقف سيارات مستقل. تشطيبات سوبر لوكس جاهزة للسكن الفوري.',
      descriptionEn: 'Premium stone duplex villa consisting of two floors and a basement. High class finishes, front garden, private parking. Ready for immediate move-in.',
      price: 280000,
      area: 320,
      city: 'ذمار',
      latitude: 14.5450,
      longitude: 44.4050,
      contactPhone: '771234567',
      typeId: typeVilla.id,
      typeSpecId: typeVilla.specs[0].id, // Duplex
      categoryId: catRes.id,
      status: 'PUBLISHED',
      currency: 'USD',
      features: { createMany: { data: [{ featureId: featGarden.id }, { featureId: featParking.id }, { featureId: featStone.id }] } },
      utilities: { createMany: { data: [{ utilityId: utilElec.id }, { utilityId: utilWater.id }, { utilityId: utilFiber.id }] } },
      guarantees: { createMany: { data: [{ guaranteeId: guarConst.id }, { guaranteeId: guarInstall.id }] } },
      media: { createMany: { data: [{ url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400', isPrimary: true }] } },
    },
  });

  const prop2 = await prisma.property.create({
    data: {
      titleAr: 'منزل مستقل 3 طوابق كاملة شارع رداع ذمار',
      titleEn: 'Independent 3-Floor House Rada Street',
      descriptionAr: 'منزل تجاري وسكني يقع على شارع رئيسي بعرض 14 متر، يتكون من 3 طوابق: الطابق الأرضي يضم 3 فتحات تجارية وجراج سيارة، والطابقين العلويين شقق سكنية عائلية.',
      descriptionEn: 'Commercial and residential building located on a 14m main street. Consists of 3 floors: ground floor has 3 shops and a garage, upper floors contain family apartments.',
      price: 195000,
      area: 200,
      city: 'ذمار',
      latitude: 14.5422,
      longitude: 44.4000,
      contactPhone: '773456789',
      typeId: typeHouse.id,
      typeSpecId: typeHouse.specs[2].id, // 3 Complete floors
      categoryId: catComm.id,
      status: 'PUBLISHED',
      currency: 'SAR',
      features: { createMany: { data: [{ featureId: featParking.id }, { featureId: featStone.id }] } },
      utilities: { createMany: { data: [{ utilityId: utilElec.id }, { utilityId: utilWater.id }] } },
      guarantees: { createMany: { data: [{ guaranteeId: guarConst.id }] } },
      media: { createMany: { data: [{ url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=400', isPrimary: true }] } },
    },
  });

  const prop3 = await prisma.property.create({
    data: {
      titleAr: 'أرض تجارية مستوية ممتازة للاستثمار العقاري',
      titleEn: 'Flat Commercial Land for Real Estate Investment',
      descriptionAr: 'أرض فضاء ركنية مساحتها 12 لبنة تقع على شارعين رئيسيين إسفلت، مثالية جداً لبناء عمارة سكنية تجارية أو مول تجاري مصغر. الأوراق والوثائق مسجلة بالسجل العقاري.',
      descriptionEn: 'Flat corner land plot measuring 12 Libna, located on two asphalted main streets. Excellent for investment, commercial building or miniature mall.',
      price: 55000000,
      area: 540,
      city: 'صنعاء',
      latitude: 15.3500,
      longitude: 44.2000,
      contactPhone: '775678901',
      typeId: typeLand.id,
      typeSpecId: typeLand.specs[0].id, // Commercial 2 streets
      categoryId: catInv.id,
      status: 'PUBLISHED',
      currency: 'YER',
      utilities: { createMany: { data: [{ utilityId: utilElec.id }, { utilityId: utilWater.id }] } },
      media: { createMany: { data: [{ url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400', isPrimary: true }] } },
    },
  });

  console.log('Seeded Properties');

  // 6. Seed Services
  const svc1 = await prisma.service.create({
    data: {
      nameAr: 'التصاميم والاستشارات الهندسية الشاملة',
      nameEn: 'Architectural & Engineering Designs',
      department: 'ENGINEERING',
      shortDescriptionAr: 'تصميم مخططات معمارية وإنشائية احترافية ثلاثية الأبعاد متوافقة مع كود البناء الدولي.',
      shortDescriptionEn: 'Professional architectural, structural and 3D interior design layouts compatible with international codes.',
      detailedDescriptionAr: 'نقدم خدمة تصميم كاملة تشمل المخططات المعمارية والإنشائية، وتصاميم الواجهات الحجرية والزجاجية، مع تقديم مساقط ومناظير 3D للمبنى من الخارج والداخل لضمان مطابقة التصور للواقع قبل البدء بالبناء.',
      detailedDescriptionEn: 'We offer full blueprint designs including floor layouts, structural calculations, facade modeling, and 3D architectural renders for perfect visualization.',
      coverImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=400',
      status: 'PUBLISHED',
    },
  });

  const svc2 = await prisma.service.create({
    data: {
      nameAr: 'المقاولات العامة وتشييد الهياكل الخرسانية',
      nameEn: 'General Contracting & Building Structures',
      department: 'CONTRACTING',
      shortDescriptionAr: 'تنفيذ أعمال العظم والخرسانة المسلحة وتشييد العمارات والفلل بأعلى جودة وإشراف معتمد.',
      shortDescriptionEn: 'Execution of building carcasses, reinforced concrete works and structural developments under engineer approval.',
      detailedDescriptionAr: 'نقوم بتنفيذ جميع أعمال التشييد والبناء ابتداءً من الحفر والردم وصب الخرسانة المسلحة للأساسات، الأوتاد، والأعمدة والأسقف، مروراً بالبناء وتركيب الواجهات الحجرية بأحدث الطرق الهندسية وتحت إشراف مهندسينا المعتمدين.',
      detailedDescriptionEn: 'We carry out all concrete framework, earth excavation, structural casting, blockwork, stone cladding and bricklaying with approved quality control.',
      coverImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=400',
      status: 'PUBLISHED',
    },
  });

  console.log('Seeded Services');

  // 7. Seed Service Requests
  const req1 = await prisma.serviceRequest.create({
    data: {
      customerId: customer1.id,
      serviceId: svc1.id,
      projectName: 'تصميم فيلا سكنية حديثة دورين وملحق للعميل علي الكبسي',
      description: 'أريد تصميم مخطط فيلا حديثة تشمل مواقف ومسبح صغير، أريد الواجهة حجر وتصميم حديث (مودرن). الأرض تقع في مخطط الشباب بمدينة ذمار.',
      expectedBudget: 1500,
      location: 'ذمار - حي الشباب',
      latitude: 14.5400,
      longitude: 44.4100,
      status: 'PROJECT_CREATED',
      propertyType: 'VILLA',
      currency: 'USD',
    },
  });

  const req2 = await prisma.serviceRequest.create({
    data: {
      customerId: customer2.id,
      serviceId: svc2.id,
      projectName: 'عظم عمارة سكنية 4 طوابق في حدة صنعاء',
      description: 'تنفيذ مبنى عظم عمارة سكنية أربعة طوابق، المخططات الهندسية والإنشائية جاهزة ومعتمدة، ونرغب بالتعاقد الفوري للبدء بالحفر وتجهيز الأساسات.',
      expectedBudget: 75000,
      location: 'صنعاء - حي حدة',
      latitude: 15.3100,
      longitude: 44.1800,
      status: 'PROJECT_CREATED',
      propertyType: 'BUILDING',
      currency: 'SAR',
    },
  });

  const req3 = await prisma.serviceRequest.create({
    data: {
      customerId: customer1.id,
      serviceId: svc1.id,
      projectName: 'استشارة هندسية لتعديل واجهات تجارية',
      description: 'أبحث عن تعديل واجهات محلات تجارية لعمارة قائمة وتصميم ديكور خارجي حديث باستخدام الكلادينج والإضاءة المخفية.',
      expectedBudget: 600,
      location: 'ذمار - الشارع العام',
      latitude: 14.5422,
      longitude: 44.4000,
      status: 'NEW',
      propertyType: 'COMMERCIAL',
      currency: 'YER',
    },
  });

  console.log('Seeded Service Requests');

  // 8. Seed Work Projects
  // Project 1
  const proj1 = await prisma.workProject.create({
    data: {
      requestId: req1.id,
      name: req1.projectName,
      description: req1.description,
      budget: 1500,
      startDate: new Date('2026-07-01'),
      expectedEndDate: new Date('2026-08-15'),
      status: 'IN_PROGRESS',
      progressPercentage: 45,
      currency: 'USD',
      members: {
        createMany: {
          data: [
            { engineerId: engProfile2?.id, role: 'ENGINEER' }, // Reem (Architect)
            { contractorId: contProfile2?.id, role: 'CONTRACTOR' }, // Sakhr (Finishes)
          ],
        },
      },
      tasks: {
        createMany: {
          data: [
            { title: 'تحليل الموقع ورفع القياسات والأبعاد', description: 'زيارة موقع الأرض في حي الشباب ورفع الإحداثيات وتحديد الأبعاد بدقة.', status: 'DONE', dueDate: new Date('2026-07-05') },
            { title: 'إعداد المساقط الأفقية والمخططات الأولية', description: 'تصميم المخطط المعماري الداخلي للطوابق وتوزيع الغرف والحمامات والصالات.', status: 'DONE', dueDate: new Date('2026-07-15') },
            { title: 'تصميم الواجهات ثلاثية الأبعاد 3D Renders', description: 'تجهيز اللقطات المعمارية الخارجية والواجهات والحدائق والمسبح باستخدام برامج التصيير المعتمدة.', status: 'IN_PROGRESS', dueDate: new Date('2026-07-30') },
            { title: 'إعداد المخططات الإنشائية والخرسانية', description: 'تخطيط وتوزيع القواعد والجسور وتحديد كميات الحديد والخرسانة المطلوبة.', status: 'TODO', dueDate: new Date('2026-08-10') },
          ],
        },
      },
      milestones: {
        createMany: {
          data: [
            { title: 'تسليم المخططات المعمارية الأولية والموافقة عليها', description: 'عرض المساقط وتفاصيل التوزيع على المالك وحفظ ملاحظاته.', status: 'COMPLETED', dueDate: new Date('2026-07-16') },
            { title: 'تسليم ملف التصاميم المعمارية والإنشائية النهائي', description: 'تجهيز ملف التسليم والرسومات بصيغة PDF وتصميم 3D للمبنى.', status: 'PENDING', dueDate: new Date('2026-08-15') },
          ],
        },
      },
    },
  });

  // Project 2
  const proj2 = await prisma.workProject.create({
    data: {
      requestId: req2.id,
      name: req2.projectName,
      description: req2.description,
      budget: 82000,
      startDate: new Date('2026-06-10'),
      expectedEndDate: new Date('2026-11-30'),
      status: 'IN_PROGRESS',
      progressPercentage: 20,
      currency: 'SAR',
      members: {
        createMany: {
          data: [
            { engineerId: engProfile1?.id, role: 'ENGINEER' }, // Ahmed (Structure)
            { contractorId: contProfile1?.id, role: 'CONTRACTOR' }, // Fouad (General Contracting)
          ],
        },
      },
      tasks: {
        createMany: {
          data: [
            { title: 'تخطيط وتحديد مسار الحفر وتأمين الموقع', description: 'وضع علامات المساحة للبدء بالحفر وتأمين المباني المجاورة وتوصيلات المياه الكهربائية.', status: 'DONE', dueDate: new Date('2026-06-15') },
            { title: 'أعمال حفر القواعد والأساسات للمبنى', description: 'حفر الأرض للوصول للعمق المحدد بالخرسانة والتأسيس.', status: 'DONE', dueDate: new Date('2026-06-25') },
            { title: 'صب الخرسانة العادية (النظافة) للقواعد', description: 'صب الطبقة الرقيقة الممهدة لتسليح القواعد.', status: 'DONE', dueDate: new Date('2026-07-02') },
            { title: 'تركيب حديد التسليح وتجهيز قوالب الخشب للقواعد', description: 'وضع حديد تسليح القواعد والرقاب وتثبيتها تمهيداً لعملية الصب.', status: 'IN_PROGRESS', dueDate: new Date('2026-07-20') },
            { title: 'صب الخرسانة المسلحة للقواعد', description: 'توريد الخرسانة الجاهزة والبدء بصب القواعد الخرسانية.', status: 'TODO', dueDate: new Date('2026-07-28') },
          ],
        },
      },
      milestones: {
        createMany: {
          data: [
            { title: 'اكتمال أعمال حفر القواعد والأساسات للأرض', description: 'فحص الحفر ومستوى التربة من قبل المهندس الإنشائي والموافقة عليه.', status: 'COMPLETED', dueDate: new Date('2026-06-26') },
            { title: 'اكتمال صب الخرسانة المسلحة للقواعد الأساسية ورقاب الأعمدة', description: 'الانتهاء من صب كافة قواعد الدور الأرضي والميدة الأساسية.', status: 'PENDING', dueDate: new Date('2026-08-05') },
          ],
        },
      },
    },
  });

  console.log('Seeded Operational Work Projects, Tasks, Milestones');

  // 9. Seed Community Content
  // Articles
  const art1 = await prisma.article.create({
    data: {
      titleAr: 'خطوات اختيار حديد التسليح المناسب لمشروعك السكني في اليمن',
      titleEn: 'Steps to Choose the Right Reinforcing Steel in Yemen',
      summaryAr: 'دليل كامل باللغة العربية يشرح أنواع حديد التسليح المتوفر بالأسواق والفرق بينها وطريقة التحقق من الجودة.',
      summaryEn: 'A guide explaining reinforcement steel grades, market variants and checking quality standards.',
      contentAr: 'يعتبر حديد التسليح عصب البناء الخرساني، ولاختيار الحديد المناسب يجب عليك فحص رتبة الحديد (Grade 60) والتحقق من عدم وجود صدأ سطحي مقشر، والتأكد من بلد المنشأ والشهادات المرفقة من المصنع لضمان سلامة أساسات وسقف المنزل على المدى الطويل.',
      contentEn: 'Steel is the backbone of concrete structure. Choosing the right steel grade (Grade 60) protects building foundations. Always check manufacture certificates and surface conditions.',
      author: 'المهندس أحمد صالح البكاري',
      coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400',
      status: 'PUBLISHED',
      categoryAr: 'نصائح هندسية',
      categoryEn: 'Engineering Tips',
    },
  });

  const art2 = await prisma.article.create({
    data: {
      titleAr: 'أهمية العزل المائي والحراري للقواعد والأسطح ودورها في إطالة عمر المبنى',
      titleEn: 'Importance of Water & Thermal Insulation in Buildings',
      summaryAr: 'لماذا يعتبر عزل القواعد الخرسانية ضد الرطوبة والمياه الجوفية خطوة لا يمكن التغاضي عنها؟',
      summaryEn: 'Why waterproofing is crucial for building basements and concrete foundations longevity.',
      contentAr: 'تتسرب المياه الجوفية والرطوبة إلى داخل الخرسانة غير المعزولة مسببة صدأ الحديد وتفكك المادة الأسمنتية، مما يهدد بسقوط المبنى. استخدام القار البارد أو الرولات العازلة يحمي الأساسات والأسطح بنسبة 100% ويحافظ على استقرار الأعمدة.',
      contentEn: 'Insulation keeps groundwater away from reinforcing steel, preventing oxidation and internal cracking. Bitumen coating and asphalt membrane protect concrete bases effectively.',
      author: 'المهندسة ريم خالد اليوسفي',
      coverImage: 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?q=80&w=400',
      status: 'PUBLISHED',
      categoryAr: 'مقالات التشييد',
      categoryEn: 'Construction Articles',
    },
  });

  // Tips
  await prisma.engineeringTip.create({
    data: {
      titleAr: 'تجنب صب الخرسانة المسلحة في درجات الحرارة المرتفعة جداً',
      titleEn: 'Avoid Casting Concrete in High Temperature Climates',
      descriptionAr: 'تؤدي درجات الحرارة التي تتجاوز 38 درجة مئوية إلى تبخر سريع جداً للماء في الخرسانة قبل اكتمال تفاعلها الكيميائي، مما يسبب شروخاً وتشققات شعرية تضعف المقاومة الإنشائية بمقدار 30%. يُنصح بالصب في فترة المساء أو الصباح الباكر ورش المياه باستمرار.',
      descriptionEn: 'High temperatures cause flash hydration and water evaporation, weakening concrete properties. Cast during evening hours or early morning for optimum strength.',
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=400',
      status: 'PUBLISHED',
    },
  });

  // Testimonials
  await prisma.testimonial.create({
    data: {
      customerNameAr: 'علي ناصر الكبسي',
      customerNameEn: 'Ali Naser Al-Kebsi',
      jobTitleAr: 'رجل أعمال ويوتيوبر',
      jobTitleEn: 'Businessman & YouTuber',
      rating: 5,
      commentAr: 'تعاملت مع آفاق العرب في تصميم فيلتي الخاصة، والتصميم المعماري كان قمة في الروعة ومستغل لكل مساحة في الأرض، مع تقديم استشارات حكيمة وفرت علي الكثير من المال.',
      commentEn: 'Outstanding consulting services! The structural plan for my villa was engineered perfectly. High-fidelity layouts saved me a lot of money.',
      status: 'PUBLISHED',
    },
  });

  await prisma.testimonial.create({
    data: {
      customerNameAr: 'أروى محمد الشريف',
      customerNameEn: 'Arwa Mohammad',
      jobTitleAr: 'مالكة عمارة سكنية في صنعاء',
      jobTitleEn: 'Residential Landlord',
      rating: 4,
      commentAr: 'فريق مقاولات كفء ومحترف جداً، صبوا أساسات عمارة حدة بسرعة وإشراف مستمر ونظافة في العمل. أشكر المهندس والعمال على جهودهم.',
      commentEn: 'Professional contracting team! They poured the structural bases of my building very fast and with strict supervision. Thank you.',
      status: 'PUBLISHED',
    },
  });

  // Comments & Likes (Link to articles)
  await prisma.comment.create({
    data: {
      customerId: customer1.id,
      content: 'مقال رائع ومعلومات قيمة جداً، خصوصاً فيما يتعلق بحديد التسليح اليمني المتوفر!',
      status: 'APPROVED',
      articleId: art1.id,
    },
  });

  await prisma.comment.create({
    data: {
      customerId: customer2.id,
      content: 'أتمنى إضافة مقال خاص بكيفية معالجة تعشيش الخرسانة بعد إزالة قوالب الخشب.',
      status: 'PENDING',
      articleId: art1.id,
    },
  });

  // 10. Seed System Settings
  await prisma.systemSetting.createMany({
    data: [
      { key: 'platform_name', value: 'آفاق العرب الذكية' },
      { key: 'platform_email', value: 'contact@afaq.com' },
      { key: 'platform_phone', value: '+967 771234567' },
      { key: 'platform_address', value: 'صنعاء، اليمن' },
      { key: 'ai_api_key', value: '' },
      { key: 'ai_model', value: 'gemini-2.0-flash' },
      { key: 'ai_monthly_limit', value: '1000' },
    ],
  });
  console.log('Seeded System Settings');

  // 11. Seed Audit Logs
  const adminUser = await prisma.user.findFirst({ where: { email: 'admin@afaq.com' } });
  if (adminUser) {
    await prisma.auditLog.createMany({
      data: [
        {
          userId: adminUser.id,
          module: 'USERS',
          operation: 'LOGIN',
          success: true,
          ipAddress: '192.168.1.50',
          deviceInfo: 'Windows 11 PC',
          browserInfo: 'Chrome 126.0.0',
          createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
        },
        {
          userId: adminUser.id,
          module: 'SETTINGS',
          operation: 'UPDATE',
          entityName: 'SystemSetting',
          entityId: 'platform_name',
          success: true,
          ipAddress: '192.168.1.50',
          deviceInfo: 'Windows 11 PC',
          browserInfo: 'Chrome 126.0.0',
          createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
        },
        {
          userId: adminUser.id,
          module: 'PROPERTIES',
          operation: 'CREATE',
          entityName: 'Property',
          entityId: 'prop-uuid-seed-1',
          success: true,
          ipAddress: '192.168.1.50',
          deviceInfo: 'Windows 11 PC',
          browserInfo: 'Chrome 126.0.0',
          createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        },
        {
          userId: adminUser.id,
          module: 'CONTENT',
          operation: 'PUBLISH',
          entityName: 'Article',
          entityId: 'art-uuid-seed-1',
          success: true,
          ipAddress: '192.168.1.50',
          deviceInfo: 'Windows 11 PC',
          browserInfo: 'Chrome 126.0.0',
          createdAt: new Date(Date.now() - 120 * 60 * 1000), // 2 hours ago
        },
        {
          userId: adminUser.id,
          module: 'USERS',
          operation: 'LOGIN',
          success: false,
          ipAddress: '192.168.1.12',
          deviceInfo: 'iPhone 15 Pro',
          browserInfo: 'Safari Mobile',
          createdAt: new Date(Date.now() - 180 * 60 * 1000), // 3 hours ago
        },
        {
          userId: adminUser.id,
          module: 'PROJECTS',
          operation: 'UPDATE',
          entityName: 'WorkProject',
          entityId: 'proj-uuid-seed-1',
          success: true,
          ipAddress: '192.168.1.50',
          deviceInfo: 'Windows 11 PC',
          browserInfo: 'Chrome 126.0.0',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        },
      ],
    });
    console.log('Seeded Audit Logs');
  }

  console.log('Comprehensive Seeding Completed Successfully! 🚀');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
