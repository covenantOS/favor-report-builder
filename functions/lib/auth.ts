const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial, KEY_LENGTH * 8
  );
  return `${ITERATIONS}:${toHex(salt)}:${toHex(new Uint8Array(derivedBits))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':');
  if (parts.length !== 3) return false;
  const [iterStr, saltHex, hashHex] = parts;
  const salt = fromHex(saltHex);
  const expectedHash = fromHex(hashHex);
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: parseInt(iterStr), hash: 'SHA-256' },
    keyMaterial, expectedHash.length * 8
  );
  const actualHash = new Uint8Array(derivedBits);
  if (actualHash.length !== expectedHash.length) return false;
  let result = 0;
  for (let i = 0; i < actualHash.length; i++) result |= actualHash[i] ^ expectedHash[i];
  return result === 0;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  return bytes;
}

export function generateSessionId(): string {
  return crypto.randomUUID();
}

export function getSessionCookie(sessionId: string, maxAgeSec = 86400 * 7): string {
  return `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAgeSec}`;
}

export function clearSessionCookie(): string {
  return 'session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
}

export function parseSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

export async function validateSession(
  db: D1Database,
  cookieHeader: string | null
): Promise<{ id: number; username: string; name: string | null; role: string } | null> {
  const sessionId = parseSessionCookie(cookieHeader);
  if (!sessionId) return null;
  const row = await db.prepare(
    `SELECT u.id, u.username, u.name, u.role FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.id = ? AND s.expires_at > datetime('now')`
  ).bind(sessionId).first<{ id: number; username: string; name: string | null; role: string }>();
  return row || null;
}
