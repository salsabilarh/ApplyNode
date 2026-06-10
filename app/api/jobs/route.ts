import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const user = token ? await verifyJWT(token) : null;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const now = new Date();

    // 1. OTOMATISASI: Update status ke CLOSED jika waktu sekarang sudah melewati deadline
    // dan status sebelumnya bukan CLOSED.
    await prisma.job.updateMany({
      where: {
        userId: user.id,
        status: { not: 'CLOSED' },
        deadline: { lt: now }, // lt = less than (kurang dari waktu sekarang)
      },
      data: {
        status: 'CLOSED',
      },
    });

    // 2. Ambil data jobs milik user yang sudah ter-update paling aktual
    const jobs = await prisma.job.findMany({
      where: { userId: user.id },
      orderBy: { deadline: 'asc' },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat data lowongan' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const user = token ? await verifyJWT(token) : null;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    
    // Validasi penentuan status awal saat pembuatan data baru (jika langsung backdate/lewat deadline)
    const deadlineDate = new Date(body.deadline);
    const initialStatus = deadlineDate < new Date() ? 'CLOSED' : (body.status || 'TO_BE_APPLY');

    const job = await prisma.job.create({
      data: {
        userId: user.id,
        position: body.position,
        jobType: body.jobType,
        company: body.company,
        platform: body.platform,
        sourceLink: body.sourceLink,
        description: body.description,
        deadline: deadlineDate,
        priority: body.priority,
        status: initialStatus,
      },
    });
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan lowongan' }, { status: 500 });
  }
}