import type { SupabaseClient } from "@supabase/supabase-js";

export interface CartLineInput {
  productId: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
}

export interface CheckoutInput {
  customerName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  deliveryMethod: string;
  paymentMethod: "Bank Transfer" | "DuitNow" | "Cash on Delivery" | "Payment Gateway";
  customerNote?: string;
  items: CartLineInput[];
}

const DELIVERY_FEE_STANDARD = 12;
const FREE_DELIVERY_THRESHOLD = 250;

function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `JISP-${y}${m}${d}-${rand}`;
}

/**
 * Creates an order using server-side price/stock validation.
 * NEVER trust totals sent from the browser — always recompute here.
 * Must be called with a service-role or elevated server client.
 */
export async function createOrderServerSide(
  supabase: SupabaseClient,
  input: CheckoutInput
) {
  if (!input.items.length) {
    throw new Error("Cart is empty.");
  }

  const productIds = input.items.map((i) => i.productId);
  const { data: products, error: productErr } = await supabase
    .from("products")
    .select("*, variants:product_variants(*)")
    .in("id", productIds)
    .eq("is_published", true);
  if (productErr) throw productErr;

  const productMap = new Map((products ?? []).map((p: any) => [p.id, p]));

  let subtotal = 0;
  const lineItems: any[] = [];

  for (const line of input.items) {
    const product = productMap.get(line.productId);
    if (!product) {
      throw new Error(`Product not found or unpublished: ${line.productId}`);
    }
    if (product.sizes?.length && !line.size) {
      throw new Error(`Size is required for ${product.name}.`);
    }
    if (product.colors?.length && !line.color) {
      throw new Error(`Color is required for ${product.name}.`);
    }

    // Determine stock: prefer variant-level, fallback to product-level.
    let availableStock = product.inventory_quantity;
    if (product.variants?.length) {
      const variant = product.variants.find(
        (v: any) => v.size === (line.size ?? null) && v.color === (line.color ?? null)
      );
      if (variant) availableStock = variant.inventory_quantity;
    }
    if (availableStock < line.quantity) {
      throw new Error(`Insufficient stock for ${product.name}.`);
    }

    const unitPrice = product.sale_price ?? product.regular_price;
    const lineTotal = Number((unitPrice * line.quantity).toFixed(2));
    subtotal += lineTotal;

    lineItems.push({
      product_id: product.id,
      product_name: product.name,
      product_image_url: null, // filled in below once we fetch images
      sku: product.sku,
      size: line.size ?? null,
      color: line.color ?? null,
      unit_price: unitPrice,
      quantity: line.quantity,
      line_total: lineTotal,
    });
  }

  // Fetch main images for the line items (best-effort, non-blocking on failure)
  const { data: images } = await supabase
    .from("product_images")
    .select("product_id, url, is_main")
    .in("product_id", productIds);
  for (const item of lineItems) {
    const main =
      images?.find((im: any) => im.product_id === item.product_id && im.is_main) ??
      images?.find((im: any) => im.product_id === item.product_id);
    item.product_image_url = main?.url ?? null;
  }

  subtotal = Number(subtotal.toFixed(2));
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE_STANDARD;
  const grandTotal = Number((subtotal + deliveryFee).toFixed(2));

  // Upsert customer by email
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("*")
    .eq("email", input.email)
    .maybeSingle();

  let customerId: string;
  if (existingCustomer) {
    customerId = existingCustomer.id;
    await supabase
      .from("customers")
      .update({ name: input.customerName, phone: input.phone })
      .eq("id", customerId);
  } else {
    const { data: newCustomer, error: custErr } = await supabase
      .from("customers")
      .insert({
        name: input.customerName,
        email: input.email,
        phone: input.phone,
      })
      .select()
      .single();
    if (custErr) throw custErr;
    customerId = newCustomer.id;
  }

  const orderNumber = generateOrderNumber();

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: customerId,
      customer_name: input.customerName,
      customer_email: input.email,
      customer_phone: input.phone,
      delivery_method: input.deliveryMethod,
      payment_method: input.paymentMethod,
      payment_status: "Unpaid",
      status: "New Order",
      subtotal,
      delivery_fee: deliveryFee,
      grand_total: grandTotal,
      customer_note: input.customerNote ?? null,
    })
    .select()
    .single();
  if (orderErr) throw orderErr;

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(lineItems.map((li) => ({ ...li, order_id: order.id })));
  if (itemsErr) throw itemsErr;

  const { error: addrErr } = await supabase.from("addresses").insert({
    order_id: order.id,
    customer_id: customerId,
    line1: input.addressLine1,
    line2: input.addressLine2 ?? null,
    city: input.city,
    state: input.state,
    postcode: input.postcode,
    country: input.country,
  });
  if (addrErr) throw addrErr;

  // Decrement inventory (best effort — for MVP, not fully transactional)
  for (const item of lineItems) {
    const product = productMap.get(item.product_id);
    if (product) {
      await supabase
        .from("products")
        .update({ inventory_quantity: Math.max(0, product.inventory_quantity - item.quantity) })
        .eq("id", item.product_id);
    }
  }

  return { order, items: lineItems, orderNumber };
}

export async function fetchOrderByNumber(
  supabase: SupabaseClient,
  orderNumber: string
) {
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*), address:addresses(*)")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error) throw error;
  return order;
}
