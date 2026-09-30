import { NextResponse } from "next/server";
import { z } from "zod";
import { logSmsAttempts, normalizeBdPhone, sendViaGateway } from "@/lib/sms-gateway-server";

const sendSchema = z.object({
  phones: z.array(z.string().trim().min(1)).min(1).max(500),
  message: z.string().trim().min(1, "Message is required").max(1600),
  recipient_name: z.string().trim().max(255).nullish(),
  prospect_id: z.string().max(36).nullish(),
  mode: z.enum(["Single", "Bulk"]).default("Single"),
  sent_by: z.string().max(36).nullish(),
});

export async function POST(req: Request) {
  const parsed = sendSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, response: parsed.error.issues[0]?.message || "Invalid request." },
      { status: 400 },
    );
  }

  const { message, ...meta } = parsed.data;
  const phones = parsed.data.phones.map(normalizeBdPhone);
  const invalidIndex = phones.findIndex((p) => p === null);
  if (invalidIndex !== -1) {
    return NextResponse.json(
      {
        success: false,
        response: `Invalid Bangladeshi mobile number: ${parsed.data.phones[invalidIndex]}`,
      },
      { status: 400 },
    );
  }

  const validPhones = phones as string[];
  const result = await sendViaGateway(validPhones, message);
  try {
    await logSmsAttempts(validPhones, message, result, meta);
  } catch (err) {
    console.warn("SMS log write failed:", err);
  }
  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}
