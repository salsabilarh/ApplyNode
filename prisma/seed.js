const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // Impor bcrypt untuk hashing password mock user
const prisma = new PrismaClient();

async function main() {
  // 1. Buat password tiruan yang terenkripsi aman
  const hashedPassword = await bcrypt.hash('password123', 12);

  // 2. Buat atau cari user tiruan agar data seed terikat ke user ini
  const mockUser = await prisma.user.upsert({
    where: { email: 'developer@example.com' },
    update: {},
    create: {
      name: 'Salsabila Rafifah',
      email: 'developer@example.com',
      password: hashedPassword,
    },
  });

  console.log(`Mock user berhasil diverifikasi/dibuat dengan ID: ${mockUser.id}`);

  // 3. Masukkan data lowongan yang sudah disisipkan userId milik mockUser
  await prisma.job.createMany({
    data: [
      {
        userId: mockUser.id, // <--- Sisipkan Foreign Key di sini
        position: 'Frontend Developer',
        jobType: 'FULL_TIME',
        company: 'PT Tekno Nusantara',
        platform: 'LinkedIn',
        sourceLink: 'https://linkedin.com/example',
        description: 'Membangun aplikasi web dengan React.',
        deadline: new Date('2026-06-15'),
        openingDate: new Date('2026-06-01'),
        priority: 'HIGH',
        status: 'TO_BE_APPLY',
      },
      {
        userId: mockUser.id, // <--- Sisipkan Foreign Key di sini
        position: 'UI/UX Designer',
        jobType: 'FREELANCE',
        company: 'Kreatif Studio',
        platform: 'Jobstreet',
        sourceLink: 'https://jobstreet.co.id/example',
        deadline: new Date('2026-06-12'),
        priority: 'MEDIUM',
        status: 'ON_PROGRESS',
      },
      {
        userId: mockUser.id, // <--- Sisipkan Foreign Key di sini
        position: 'Backend Developer',
        jobType: 'CONTRACT',
        company: 'PT Digital Mandiri',
        platform: 'Glints',
        deadline: new Date('2026-06-18'),
        priority: 'LOW',
        status: 'TO_BE_APPLY',
      },
    ],
  });

  console.log('Seeding data lowongan kerja berhasil dimasukkan!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });