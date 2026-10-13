import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    console.log("[mpesa/callback] received:", JSON.stringify(body, null, 2));

    const stk = body?.Body?.stkCallback;
    if (!stk) {
      // Malformed payload — still return 200 so Safaricom doesn't retry
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const checkoutRequestId = stk.CheckoutRequestID as string | undefined;
    const resultCode = stk.ResultCode as number | undefined;

    if (!checkoutRequestId) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (resultCode === 0) {
      const items = stk.CallbackMetadata?.Item;
      let receipt: string | null = null;
      if (Array.isArray(items)) {
        const found = items.find(
          (i: unknown) =>
            i &&
            typeof i === "object" &&
            (i as { Name?: string }).Name === "MpesaReceiptNumber",
        );
        if (found) {
          receipt = String((found as { Value?: unknown }).Value ?? "") || null;
        }
      }

      await prisma.order.updateMany({
        where: { mpesaCheckoutRequestId: checkoutRequestId, status: "pending" },
        data: { status: "paid", mpesaReceipt: receipt },
      });
    } else {
      await prisma.order.updateMany({
        where: { mpesaCheckoutRequestId: checkoutRequestId, status: "pending" },
        data: { status: "cancelled" },
      });
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (e) {
    // Log the real error but still return 200 — Safaricom retries forever on non-200
    console.error("[mpesa/callback] handler error:", e);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}