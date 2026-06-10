const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.job.createMany({
    data: [
      {
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
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });