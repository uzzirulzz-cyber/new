import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "./db";

const SESSION_COOKIE = "bx_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "blockexchange-buzz-dev-secret-change-in-production"
);
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

export interface SessionPayload {
  userId: string;
  uid: string;
  email: string;
  role: string;
}

// ─── Password hashing ──────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── JWT ───────────────────────────────────────────────────────

export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ─── Cookie helpers (server-side) ──────────────────────────────

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

// ─── Get current user (server-side) ────────────────────────────

export async function getCurrentUser() {
  const token = await getSessionCookie();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      uid: true,
      email: true,
      name: true,
      mobile: true,
      country: true,
      role: true,
      status: true,
      kycStatus: true,
      referralCode: true,
      invitationCode: true,
      profilePhoto: true,
      lastLogin: true,
      lastLoginIp: true,
      lastLoginDevice: true,
      createdAt: true,
    },
  });

  if (!user) return null;
  if (user.status === "BANNED") return null;

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: admin access required");
  }
  return user;
}

// ─── UID + referral code generation ────────────────────────────

export function generateUid(): string {
  const chars = "0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `BX-${code}`;
}

export function generateReferralCode(name: string): string {
  const prefix = name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}${suffix}`;
}

export function generateTxId(prefix: string): string {
  const chars = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${code}`;
}
