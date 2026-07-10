import { NextRequest, NextResponse } from "next/server";
import { getCoin, getInitialCandles } from "@/lib/market-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol") || "BTC";
    const count = Number(searchParams.get("count") || 60);

    const coin = getCoin(symbol);
    if (!coin) return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });

    const candles = getInitialCandles(coin.basePrice, count);
    return NextResponse.json({ candles, coin });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
