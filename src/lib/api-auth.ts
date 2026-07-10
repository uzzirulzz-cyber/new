import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "./db";

// ─── Password hashing ─────────────────────────────────────────
export async function hashPassword(pwd: string): Promise<string> {
  return bcrypt.hash(pwd, 10);
}

export async function verifyPassword(pwd: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pwd, hash);
}

// ─── Auth helpers ─────────────────────────────────────────────
export interface SafeUser {
  id: string;
  uid: string;
  email: string;
  name: string;
  phone: string | null;
  country: string | null;
  role: string;
  status: string;
  kycStatus: string;
  balance: number;
  vipLevel: number;
  invitationCode: string | null;
  referralCode: string;
  linkedSubAgentId: string | null;
  mustChangePassword: boolean;
  registeredAt: Date;
  lastLoginAt: Date | null;
}

export function toSafeUser(u: any): SafeUser {
  return {
    id: u.id,
    uid: u.uid,
    email: u.email,
    name: u.name,
    phone: u.phone,
    country: u.country,
    role: u.role,
    status: u.status,
    kycStatus: u.kycStatus,
    balance: u.balance,
    vipLevel: u.vipLevel,
    invitationCode: u.invitationCode,
    referralCode: u.referralCode,
    linkedSubAgentId: u.linkedSubAgentId,
    mustChangePassword: u.mustChangePassword,
    registeredAt: u.registeredAt,
    lastLoginAt: u.lastLoginAt,
  };
}

export async function getAuthUser(req: NextRequest): Promise<SafeUser | null> {
  const userId = req.headers.get("x-user-id");
  if (!userId) return null;
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  if (user.status === "BANNED") return null;
  return toSafeUser(user);
}

export async function requireRole(req: NextRequest, ...roles: string[]): Promise<SafeUser | null> {
  const user = await getAuthUser(req);
  if (!user) return null;
  if (!roles.includes(user.role)) return null;
  return user;
}

// ─── Logging ──────────────────────────────────────────────────
export async function logLogin(userId: string | null, email: string, req: NextRequest, success: boolean, reason?: string) {
  await db.loginLog.create({
    data: {
      userId,
      email,
      ip: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent")?.slice(0, 500) || null,
      success,
      reason,
    },
  });
}

export async function logAction(adminId: string, action: string, req: NextRequest, target?: { type: string; id: string }, details?: string) {
  await db.actionLog.create({
    data: {
      adminId,
      action,
      targetType: target?.type,
      targetId: target?.id,
      details,
      ip: req.headers.get("x-forwarded-for") || "unknown",
    },
  });
}

export function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for") || "unknown";
}

export function generateTxId(prefix: string = "TXN"): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
