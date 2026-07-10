import { NextResponse } from "next/server";
import { MEMBERSHIP_TIERS } from "@/lib/membership";

// GET /api/membership/levels — returns all membership tiers
export async function GET() {
  return NextResponse.json({ tiers: MEMBERSHIP_TIERS });
}
