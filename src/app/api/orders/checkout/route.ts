import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { stripe } from "@/lib/stripe/server";
import { readCart } from "@/lib/cart";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Please log in to check out." },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const existingOrderId =
    typeof body?.orderId === "string" ? body.orderId : undefined;

  let order;

  if (existingOrderId) {
    // Resume flow — reuse an existing pending/cancelled order
    order = await prisma.order.findFirst({
      where: { id: existingOrderId, userId: session.sub },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.status === "paid") {
      return NextResponse.json(
        { error: "This order has already been paid." },
        { status: 400 },
      );
    }

    // Allow retry on cancelled orders — reset status
    if (order.status === "cancelled") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "pending", failureReason: null },
      });
      order = { ...order, status: "pending" as const, failureReason: null };
    }
  } else {
    // Fresh flow — build the order from the cart
    const cart = await readCart();
    if (cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: cart.items.map((i) => i.productId) },
        isActive: true,
      },
    });

    const byId = new Map(products.map((p) => [p.id, p]));
    const orderItems = [];
    let total = 0;

    for (const item of cart.items) {
      const p = byId.get(item.productId);
      if (!p) continue;
      const unitPrice =
        p.isOnOffer && p.salePriceUsd != null ? p.salePriceUsd : p.spUsd;
      total += unitPrice * item.quantity;
      orderItems.push({
        productId: p.id,
        quantity: item.quantity,
        unitPrice,
      });
    }

    if (orderItems.length === 0) {
      return NextResponse.json(
        { error: "No valid items in cart." },
        { status: 400 },
      );
    }

    const created = await prisma.order.create({
      data: {
        userId: session.sub,
        status: "pending",
        currency: "USD",
        total,
        paymentMethod: "stripe",
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    });
    order = created;
  }

  // Build Stripe line items from the order's items
  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.product.name,
        images:
          item.product.imageUrl?.startsWith("http") &&
          item.product.imageUrl.startsWith("https")
            ? [item.product.imageUrl]
            : [],
      },
      unit_amount: item.unitPrice,
    },
    quantity: item.quantity,
  }));

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout/cancel?orderId=${order.id}`,
    metadata: { orderId: order.id },
  });

  if (!checkoutSession.url) {
    return NextResponse.json(
      { error: "Could not create payment session." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    url: checkoutSession.url,
    orderId: order.id,
  });
}