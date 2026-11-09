require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log('Seeding DevTeamMember and updating platform_logo...');

  // Update platform_logo
  await prisma.systemSetting.upsert({
    where: { key: 'platform_logo' },
    update: { value: '/brand/app_icon.png' },
    create: { key: 'platform_logo', value: '/brand/app_icon.png' },
  });
  console.log('Updated platform_logo to /brand/app_icon.png');

  // Seed Dev Team
  const members = [
    {
      name: 'أيمن الذاهبي',
      role: 'مهندس برمجيات وتطوير المنظومات السحابية (Cloud & Backend Architect)',
      bio: 'هندسة وبناء البنية التحتية السحابية، وتصميم قواعد البيانات وحلول المنظومة المتكاملة والذكاء الاصطناعي.',
      phone: '777633944',
      email: 'ayman@afaqalarab.com',
      github: 'https://github.com/ayman-aldhahabi',
      order: 1,
      isActive: true,
    },
    {
      name: 'هلال الملصي',
      role: 'مهندس برمجيات ومطور تطبيقات الهاتف (Mobile App Architect & Flutter Lead)',
      bio: 'تطوير وهندسة واجهات وتجربة مستخدم تطبيق الهاتف، والأنظمة التفاعلية وتكامل الخدمات والواجهات الذكية.',
      phone: '777633944',
      email: 'helal@afaqalarab.com',
      github: 'https://github.com/helal-almalsy',
      order: 2,
      isActive: true,
    },
  ];

  for (const m of members) {
    const existing = await prisma.devTeamMember.findFirst({
      where: { name: m.name },
    });
    if (existing) {
      await prisma.devTeamMember.update({
        where: { id: existing.id },
        data: m,
      });
      console.log(`Updated member: ${m.name}`);
    } else {
      await prisma.devTeamMember.create({
        data: m,
      });
      console.log(`Created member: ${m.name}`);
    }
  }

  const allMembers = await prisma.devTeamMember.findMany({
    orderBy: { order: 'asc' },
  });
  console.log('Current DevTeam members in DB:', allMembers.length);
  for (const item of allMembers) {
    console.log(`- ${item.name} (${item.role}) - Phone: ${item.phone} - Email: ${item.email}`);
  }
}

seed()
  .catch((err) => {
    console.error('Seed error:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
