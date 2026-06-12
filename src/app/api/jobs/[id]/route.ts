import { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { updateJob, deleteJob } from '@/services/jobService';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return errorResponse('Unauthorized', 401);
    const payload = await verifyJWT(token);
    if (!payload) return errorResponse('Invalid token', 401);

    const { id } = await params;
    const body = await req.json();
    const updated = await updateJob(id, payload.id, body);
    return successResponse(updated);
  } catch (error: any) {
    if (error.message === 'Job tidak ditemukan') {
      return errorResponse(error.message, 404);
    }
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return errorResponse('Unauthorized', 401);
    const payload = await verifyJWT(token);
    if (!payload) return errorResponse('Invalid token', 401);

    const { id } = await params;
    await deleteJob(id, payload.id);
    return successResponse({ message: 'Lowongan berhasil dihapus' });
  } catch (error: any) {
    if (error.message === 'Job tidak ditemukan') {
      return errorResponse(error.message, 404);
    }
    return handleApiError(error);
  }
}