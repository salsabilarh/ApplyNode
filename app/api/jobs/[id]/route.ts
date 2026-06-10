import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(job);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const job = await prisma.job.update({
      where: { id: params.id },
      data: {
        ...body,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
        openingDate: body.openingDate ? new Date(body.openingDate) : undefined,
        plannedApplyDate: body.plannedApplyDate
          ? new Date(body.plannedApplyDate)
          : body.plannedApplyDate === null
          ? null
          : undefined,
      },
    });
    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.job.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Deleted' });
}