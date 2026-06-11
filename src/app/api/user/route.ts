import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userPayload = await verifyJWT(token);
  
  // PERBAIKAN: Cek apakah userPayload valid
  if (!userPayload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userPayload.id }, // TypeScript sekarang tahu userPayload tidak null
    select: { name: true, email: true, createdAt: true }
  });

  return NextResponse.json(user);
}

export async function DELETE() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userPayload = await verifyJWT(token);
  
  // PERBAIKAN: Cek apakah userPayload valid
  if (!userPayload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
  
  await prisma.user.delete({ where: { id: userPayload.id } });
  
  const response = NextResponse.json({ message: 'Akun berhasil dihapus' });
  response.cookies.delete('token');
  return response;
}