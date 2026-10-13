import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { readCart } from "@/lib/cart";
import { initiateStkPush } from "@/lib/mpesa/server";

const Schema = z.object({
  phone: z.string().min(10).max(13),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please log in to check out." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid Kenyan phone number." }, { status: 400 });
  }

  const cart = await readCart();
  if (cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: cart.items.map((i) => i.productId) }, isActive: true },
  });

  const byId = new Map(products.map((p) => [p.id, p]));
  let totalKes = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const p = byId.get(item.productId);
    if (!p) continue;
    const unitPrice = p.isOnOffer && p.salePriceKes != null ? p.salePriceKes : p.spKes;
    totalKes += unitPrice * item.quantity;
    orderItems.push({ productId: p.id, quantity: item.quantity, unitPrice });
  }

  if (orderItems.length === 0) {
    return NextResponse.json({ error: "No valid items." }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      userId: session.sub,
      status: "pending",
      currency: "KES",
      total: totalKes,
      paymentMethod: "mpesa",
      items: { create: orderItems },
    },
  });

  try {
    const stkResponse = await initiateStkPush({
      phone: parsed.data.phone,
      amount: totalKes,
      accountReference: order.id.slice(0, 12),
      transactionDesc: "Cerra order",
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { mpesaCheckoutRequestId: stkResponse.CheckoutRequestID },
    });

    return NextResponse.json({
      orderId: order.id,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      message: "Check your phone and enter your M-Pesa PIN.",
    });
  } catch (e) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "cancelled" },
    });
    const msg = e instanceof Error ? e.message : "STK Push failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}