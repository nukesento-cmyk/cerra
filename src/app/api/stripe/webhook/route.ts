import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkout = event.data.object as Stripe.Checkout.Session;
        const orderId = checkout.metadata?.orderId;

        if (!orderId) break;

        if (checkout.payment_status === "paid") {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: "paid", failureReason: null },
          });
        } else {
          // Session completed but payment not confirmed — mark cancelled
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "cancelled",
              failureReason: `Payment not completed (${checkout.payment_status})`,
            },
          });
        }
        break;
      }

      case "checkout.session.async_payment_failed": {
        const checkout = event.data.object as Stripe.Checkout.Session;
        const orderId = checkout.metadata?.orderId;
        if (!orderId) break;

        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "cancelled",
            failureReason: "Payment failed.",
          },
        });
        break;
      }

      case "checkout.session.expired": {
        const checkout = event.data.object as Stripe.Checkout.Session;
        const orderId = checkout.metadata?.orderId;
        if (!orderId) break;

        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "cancelled",
            failureReason: "Checkout session expired.",
          },
        });
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = intent.metadata?.orderId;
        if (!orderId) break;

        const reason =
          intent.last_payment_error?.message ?? "Payment declined.";

        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "cancelled",
            failureReason: reason,
          },
        });
        break;
      }

      default:
        // Ignore events we don't handle
        break;
    }
  } catch (e) {
    console.error("[stripe/webhook] handler error:", e);
    // Still return 200 so Stripe doesn't retry forever
    return NextResponse.json({ received: true, error: "handler_failed" });
  }

  return NextResponse.json({ received: true });
}