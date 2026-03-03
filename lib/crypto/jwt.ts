export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  valid: boolean | null;
}

export async function decodeJwt(token: string): Promise<DecodedJwt | null> {
  try {
    const jose = await import('jose');
    const header = jose.decodeProtectedHeader(token);
    const payload = jose.decodeJwt(token);
    return { header, payload, valid: null };
  } catch {
    return null;
  }
}

export async function verifyJwt(token: string, secret: string): Promise<boolean> {
  try {
    const jose = await import('jose');
    const key = new TextEncoder().encode(secret);
    await jose.jwtVerify(token, key);
    return true;
  } catch {
    return false;
  }
}

export async function encodeJwt(
  payload: Record<string, unknown>,
  secret: string,
): Promise<string> {
  const jose = await import('jose');
  const key = new TextEncoder().encode(secret);

  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .sign(key);
}

export function formatTimestamp(epoch: unknown): string | null {
  if (typeof epoch !== 'number') return null;
  try {
    return new Date(epoch * 1000).toLocaleString();
  } catch {
    return null;
  }
}