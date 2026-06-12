import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400, details?: any): NextResponse {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

export function handleApiError(error: unknown): NextResponse {
  console.error('[API Error]', error);
  const message = error instanceof Error ? error.message : 'Terjadi kesalahan internal server';
  return errorResponse(message, 500);
}