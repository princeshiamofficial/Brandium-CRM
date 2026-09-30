import { NextResponse } from "next/server";
import { fetchGatewayBalance } from "@/lib/sms-gateway-server";

export async function GET() {
  const result = await fetchGatewayBalance();
  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}
