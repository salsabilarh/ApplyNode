import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createJWT } from '@/lib/auth';

export async function registerUser(name: string, email: string, password: string) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error('Email sudah terdaftar');

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  const token = await createJWT({ id: user.id, email: user.email });
  return { user, token };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Email atau password salah');

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error('Email atau password salah');

  const token = await createJWT({ id: user.id, email: user.email });
  return { user, token };
}