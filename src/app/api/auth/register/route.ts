import { NextRequest } from 'next/server';
import { registerUser } from '@/services/authService';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return errorResponse('Data tidak lengkap', 400);
    }

    const { token } = await registerUser(name, email, password);
    const response = successResponse({ message: 'Registrasi sukses' }, 201);
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });
    return response;
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}