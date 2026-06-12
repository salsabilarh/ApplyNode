import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Payload JWT yang disimpan dalam token.
 * Menambahkan index signature agar kompatibel dengan tipe JWTPayload dari jose.
 */
export interface JWTPayload {
  id: string;
  email: string;
  [key: string]: unknown; // index signature untuk kompatibilitas
}

/**
 * Membuat JWT token menggunakan jose (Edge-compatible).
 */
export async function createJWT(payload: JWTPayload): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secret);
}

/**
 * Memverifikasi JWT token dan mengembalikan payload yang sudah divalidasi.
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    // Validasi struktur payload yang diharapkan
    if (typeof payload.id === 'string' && typeof payload.email === 'string') {
      return { id: payload.id, email: payload.email };
    }
    return null;
  } catch {
    return null;
  }
}