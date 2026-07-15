import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-service";
import { createOrderServerSide, type CheckoutInput } from "@jisp/database";

export const runtime = "nodejs";

const PAYMENT_METHODS = ["Bank Transfer", "DuitNow", "Cash on Delivery", "Payment Gateway"];

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  const required = [
    "customerName",
    "phone",
    "email",
    "addressLine1",
    "city",
    "state",
    "postcode",
    "country",
    "deliveryMethod",
    "paymentMethod",
  ];
  for (const field of required) {
    if (!body[field] || typeof body[field] !== "string" || !body[field].trim()) {
      return badRequest(`Missing required field: ${field}`);
    }
  }
  if (!PAYMENT_METHODS.includes(body.paymentMethod)) {
    return badRequest("Invalid payment method.");
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return badRequest("Cart is empty.");
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return badRequest("Invalid email address.");
  }

  const input: CheckoutInput = {
    customerName: body.customerName,
    phone: body.phone,
    email: body.email,
    addressLine1: body.addressLine1,
    addressLine2: body.addressLine2,
    city: body.city,
    state: body.state,
    postcode: body.postcode,
    country: body.country,
    deliveryMethod: body.deliveryMethod,
    paymentMethod: body.paymentMethod,
    customerNote: body.customerNote,
    items: body.items.map((i: any) => ({
      productId: i.productId,
      quantity: Number(i.quantity),
      size: i.size ?? null,
      color: i.color ?? null,
    })),
  };

  try {
    const supabase = getSupabaseServiceRoleClient();
    // All prices, stock, and totals are recomputed server-side inside
    // createOrderServerSide — client-submitted amounts are never trusted.
    const { orderNumber } = await createOrderServerSide(supabase, input);
    return NextResponse.json({ orderNumber });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create order." },
      { status: 400 }
    );
  }
}
