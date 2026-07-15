import { notFound } from "next/navigation";
import { getSupabaseServerSessionClient } from "@/lib/supabase-server";
import { OrderStatusControls } from "@/components/OrderStatusControls";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order Details" };
export const dynamic = "force-dynamic";

function formatRM(n: number) {
  return `RM ${n.toFixed(2)}`;
}

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServerSessionClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, items:order_items(*), address:addresses(*)")
    .eq("id", params.id)
    .maybeSingle();

  if (!order) notFound();

  const address = Array.isArray(order.address) ? order.address[0] : order.address;

  const timeline = [
    { label: "Order Placed", date: order.created_at },
    { label: "Last Updated", date: order.updated_at },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <h1>Order {order.order_number}</h1>
        <p className="text-sm text-jisp-grey mt-1">
          Placed on {new Date(order.created_at).toLocaleString()}
        </p>
      </div>

      <section className="bg-jisp-white border border-jisp-light p-6 flex flex-col gap-4">
        <h3>Status</h3>
        <OrderStatusControls orderId={order.id} status={order.status} paymentStatus={order.payment_status} />
      </section>

      <section className="bg-jisp-white border border-jisp-light p-6 flex flex-col gap-2">
        <h3>Customer Details</h3>
        <p className="text-sm">{order.customer_name}</p>
        <p className="text-sm text-jisp-grey">{order.customer_email}</p>
        <p className="text-sm text-jisp-grey">{order.customer_phone}</p>
      </section>

      {address && (
        <section className="bg-jisp-white border border-jisp-light p-6 flex flex-col gap-2">
          <h3>Delivery Address</h3>
          <p className="text-sm">
            {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.postcode}, {address.country}
          </p>
          <p className="text-sm text-jisp-grey">Delivery Method: {order.delivery_method}</p>
        </section>
      )}

      {order.customer_note && (
        <section className="bg-jisp-white border border-jisp-light p-6">
          <h3 className="mb-2">Customer Note</h3>
          <p className="text-sm text-jisp-grey">{order.customer_note}</p>
        </section>
      )}

      <section className="bg-jisp-white border border-jisp-light p-6 flex flex-col gap-4">
        <h3>Products</h3>
        <div className="flex flex-col gap-4">
          {(order.items ?? []).map((item: any) => (
            <div key={item.id} className="flex gap-4 border-b border-jisp-light pb-4 last:border-0">
              {item.product_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.product_image_url} alt="" className="h-20 w-16 object-cover" />
              ) : (
                <div className="h-20 w-16 bg-jisp-light" />
              )}
              <div className="flex-1">
                <p className="text-sm">{item.product_name}</p>
                <p className="text-xs text-jisp-grey">
                  {[item.size, item.color].filter(Boolean).join(" / ")} · SKU {item.sku}
                </p>
                <p className="text-xs text-jisp-grey">
                  {formatRM(item.unit_price)} × {item.quantity}
                </p>
              </div>
              <p className="text-sm">{formatRM(item.line_total)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-jisp-light pt-4 flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatRM(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span>{order.delivery_fee === 0 ? "Free" : formatRM(order.delivery_fee)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Grand Total</span>
            <span>{formatRM(order.grand_total)}</span>
          </div>
        </div>
      </section>

      <section className="bg-jisp-white border border-jisp-light p-6 flex flex-col gap-2">
        <h3>Payment</h3>
        <p className="text-sm">Method: {order.payment_method}</p>
        <p className="text-sm">Status: {order.payment_status}</p>
      </section>

      <section className="bg-jisp-white border border-jisp-light p-6">
        <h3 className="mb-3">Order Timeline</h3>
        <div className="flex flex-col gap-2">
          {timeline.map((t) => (
            <div key={t.label} className="flex justify-between text-sm">
              <span>{t.label}</span>
              <span className="text-jisp-grey">{new Date(t.date).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
