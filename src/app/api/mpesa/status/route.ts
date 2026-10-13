import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { queryStkStatus } from "@/lib/mpesa/server";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.sub },
    select: { id: true, status: true, mpesaReceipt: true, mpesaCheckoutRequestId: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If still pending and we have a checkout ID, ask Daraja directly
  if (order.status === "pending" && order.mpesaCheckoutRequestId) {
    try {
      const result = await queryStkStatus(order.mpesaCheckoutRequestId);

      // 4999 = still processing, keep waiting
      // 1037 = timeout, 1032 = cancelled, 1 = insufficient funds
      // 0 or no ResultCode = success (check CallbackMetadata for receipt)
      const code = result?.ResultCode;

      if (code === 0 || (code === undefined && result?.ResultCode === undefined)) {
        // Success — extract receipt if present, otherwise mark paid
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "paid" },
        });
        return NextResponse.json({ status: "paid", receipt: order.mpesaReceipt });
      }

      if (code === 1037 || code === 1032 || code === 1 || code === 1019) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "cancelled" },
        });
        return NextResponse.json({ status: "cancelled" });
      }

      // 4999 or unknown — still processing
      return NextResponse.json({ status: "pending" });
    } catch {
      // Daraja query failed — fall through to DB state
    }
  }

  return NextResponse.json({ status: order.status, receipt: order.mpesaReceipt });
}