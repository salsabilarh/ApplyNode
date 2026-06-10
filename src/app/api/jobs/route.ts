import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Status } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as Status | null;
  const platform = searchParams.get('platform');
  const priority = searchParams.get('priority');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'deadline';

  const where: any = {};
  if (status) where.status = status;
  if (platform) where.platform = platform;
  if (priority) where.priority = priority;
  if (search) {
    where.OR = [
      { position: { contains: search } },
      { company: { contains: search } },
      { description: { contains: search } },
    ];
  }

  let orderBy: any = { deadline: 'asc' };
  if (sort === 'createdAt') orderBy = { createdAt: 'desc' };
  else if (sort === 'priority') orderBy = { priority: 'asc' };

  const jobs = await prisma.job.findMany({
    where,
    orderBy,
  });

  return NextResponse.json(jobs);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      position,
      jobType,
      company,
      platform,
      sourceLink,
      description,
      duration,
      deadline,
      openingDate,
      priority,
      status,
      plannedApplyDate,
      plannedApplyTime,
      applyNotes,
      notes,
    } = body;

    const job = await prisma.job.create({
      data: {
        position,
        jobType,
        company,
        platform,
        sourceLink,
        description,
        duration,
        deadline: new Date(deadline),
        openingDate: openingDate ? new Date(openingDate) : undefined,
        priority,
        status: status || 'TO_BE_APPLY',
        plannedApplyDate: plannedApplyDate ? new Date(plannedApplyDate) : null,
        plannedApplyTime,
        applyNotes,
        notes,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah lowongan' }, { status: 500 });
  }
}
