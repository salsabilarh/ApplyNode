import { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getUserProfile, deleteUserAccount } from '@/services/userService';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return errorResponse('Unauthorized', 401);
    const payload = await verifyJWT(token);
    if (!payload) return errorResponse('Invalid token', 401);

    const user = await getUserProfile(payload.id);
    if (!user) return errorResponse('User tidak ditemukan', 404);
    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return errorResponse('Unauthorized', 401);
    const payload = await verifyJWT(token);
    if (!payload) return errorResponse('Invalid token', 401);

    await deleteUserAccount(payload.id);
    const response = successResponse({ message: 'Akun berhasil dihapus' });
    response.cookies.delete('token');
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}