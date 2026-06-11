// src/app/api/user/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userPayload = await verifyJWT(token);
  const user = await prisma.user.findUnique({
    where: { id: userPayload.id },
    select: { name: true, email: true, createdAt: true }
  });

  return NextResponse.json(user);
}

export async function DELETE() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userPayload = await verifyJWT(token);
  
  // Karena onDelete: Cascade di schema, hapus user otomatis hapus semua jobs
  await prisma.user.delete({ where: { id: userPayload.id } });
  
  const response = NextResponse.json({ message: 'Akun berhasil dihapus' });
  response.cookies.delete('token');
  return response;
}