import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createJWT } from '@/lib/auth'; // Pastikan fungsi ini tersedia

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    // 1. Buat User baru
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // 2. Buat Token JWT (Sama seperti logika di API Login)
    const token = await createJWT({ id: newUser.id, email: newUser.email });

    // 3. Buat Response dan Set Cookie
    const response = NextResponse.json({ message: 'Registrasi sukses' }, { status: 201 });
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 hari
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Gagal melakukan registrasi' }, { status: 500 });
  }
}