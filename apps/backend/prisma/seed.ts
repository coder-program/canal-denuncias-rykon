import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ====================================
  // USUARIOS DEMO
  // ====================================
  console.log('Creating demo users...');

  const passwordHash = await bcrypt.hash('Demo123!@', 12);
  const superAdminHash = await bcrypt.hash('Admin@123', 12);

  // Super Admin (para plataforma OuviON)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@ouvion.com' },
    update: {},
    create: {
      email: 'superadmin@ouvion.com',
      passwordHash: superAdminHash,
      fullName: 'Super Administrador OuviON',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log('✅ Super Admin created:', superAdmin.email);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: {
      email: 'admin@empresa.com',
      passwordHash,
      fullName: 'Administrador do Sistema',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  console.log('✅ Admin created:', admin.email);

  // Investigador
  const investigator = await prisma.user.upsert({
    where: { email: 'investigador@empresa.com' },
    update: {},
    create: {
      email: 'investigador@empresa.com',
      passwordHash,
      fullName: 'João Silva - Investigador',
      role: UserRole.INVESTIGATOR,
      isActive: true,
    },
  });

  console.log('✅ Investigator created:', investigator.email);

  // Reporter (denunciante)
  const reporter = await prisma.user.upsert({
    where: { email: 'denunciante@empresa.com' },
    update: {},
    create: {
      email: 'denunciante@empresa.com',
      passwordHash,
      fullName: 'Maria Oliveira',
      role: UserRole.REPORTER,
      isActive: true,
    },
  });

  console.log('✅ Reporter created:', reporter.email);

  // Auditor
  const auditor = await prisma.user.upsert({
    where: { email: 'auditor@empresa.com' },
    update: {},
    create: {
      email: 'auditor@empresa.com',
      passwordHash,
      fullName: 'Pedro Santos - Auditor',
      role: UserRole.AUDITOR,
      isActive: true,
    },
  });

  console.log('✅ Auditor created:', auditor.email);

  // ====================================
  // SYSTEM SETTINGS
  // ====================================
  console.log('Creating system settings...');

  await prisma.systemSetting.upsert({
    where: { key: 'company_name' },
    update: {},
    create: {
      key: 'company_name',
      value: 'Empresa Demo Ltda',
      description: 'Nome da empresa exibido no sistema',
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'enable_anonymous_reports' },
    update: {},
    create: {
      key: 'enable_anonymous_reports',
      value: 'true',
      description: 'Permitir denúncias anônimas',
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'max_file_size_mb' },
    update: {},
    create: {
      key: 'max_file_size_mb',
      value: '10',
      description: 'Tamanho máximo de arquivo em MB',
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'data_retention_days' },
    update: {},
    create: {
      key: 'data_retention_days',
      value: '2555',
      description: 'Período de retenção de dados em dias (7 anos para LGPD)',
    },
  });

  console.log('✅ System settings created');

  // ====================================
  // AUDIT LOG DE SEED
  // ====================================
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'CREATE',
      resource: 'seed',
      resourceId: 'seed-script',
      details: {
        message: 'Database seeded with demo data',
        users_created: 4,
        settings_created: 4,
      },
    },
  });

  console.log('✅ Audit log created');

  console.log('\n🎉 Seeding completed!\n');
  console.log('📝 Demo users created:');
  console.log('   🔴 SUPER ADMIN: superadmin@ouvion.com      | Admin@123');
  console.log('   Admin:          admin@empresa.com          | Demo123!@');
  console.log('   Investigator:   investigador@empresa.com   | Demo123!@');
  console.log('   Reporter:       denunciante@empresa.com    | Demo123!@');
  console.log('   Auditor:        auditor@empresa.com        | Demo123!@');
  console.log('\n💡 Use these credentials to test the API!');
  console.log('🔑 Access Super Admin at: http://localhost:3001/loginadm\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
