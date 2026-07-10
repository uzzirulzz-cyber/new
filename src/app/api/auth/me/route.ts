import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  return NextResponse.json({ user });
}
