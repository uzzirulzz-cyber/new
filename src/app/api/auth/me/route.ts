import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const wallet = await db.wallet.findUnique({ where: { userId: user.id } });

    return NextResponse.json({
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        name: user.name,
        mobile: user.mobile,
        country: user.country,
        role: user.role,
        status: user.status,
        kycStatus: user.kycStatus,
        referralCode: user.referralCode,
        invitationCode: user.invitationCode,
        profilePhoto: user.profilePhoto,
        lastLogin: user.lastLogin,
        lastLoginIp: user.lastLoginIp,
        mustChangePassword: user.mustChangePassword,
        createdAt: user.createdAt,
      },
      wallet: wallet
        ? {
            available: wallet.available,
            frozen: wallet.frozen,
            totalProfit: wallet.totalProfit,
            todayProfit: wallet.todayProfit,
            totalAssets: wallet.available + wallet.frozen,
          }
        : null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
