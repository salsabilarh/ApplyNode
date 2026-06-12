import { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getJobsByUser, createJob } from '@/services/jobService';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return errorResponse('Unauthorized', 401);
    const payload = await verifyJWT(token);
    if (!payload) return errorResponse('Invalid token', 401);

    const jobs = await getJobsByUser(payload.id);
    return successResponse(jobs);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return errorResponse('Unauthorized', 401);
    const payload = await verifyJWT(token);
    if (!payload) return errorResponse('Invalid token', 401);

    const body = await req.json();
    const newJob = await createJob(payload.id, body);
    return successResponse(newJob, 201);
  } catch (error) {
    return handleApiError(error);
  }
}