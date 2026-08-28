import { NextResponse } from "next/server";
import { executeMySQLQueryFn } from "@/lib/crm.functions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sql, params } = body;

    if (!sql || typeof sql !== "string") {
      return NextResponse.json({ success: false, error: "SQL string required" }, { status: 400 });
    }

    const result = (await executeMySQLQueryFn({
      data: { sql, params: params || [] },
    })) as { success?: boolean; data?: unknown; error?: string };

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal database error" },
      { status: 500 },
    );
  }
}
