import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-service";
import { fetchOrderByNumber } from "@jisp/database";
import { formatRM } from "@/lib/format";
import { Button } from "@jisp/ui";

const PAYMENT_INSTRUCTIONS: Record<string, string> = {
  "Bank Transfer":
    "Please transfer the grand total to Maybank 1234-5678-9012 (JISP Sdn Bhd) and email your payment receipt to hello@jisp.com with your order number.",
  DuitNow:
    "Please scan the DuitNow QR (sent to your email) or transfer to 012-345 6789 and use your order number as the reference.",
  "Cash on Delivery":
    "Please prepare the exact grand total in cash. Payment will be collected upon delivery.",
  "Payment Gateway":
    "Online payment is coming soon. For now, please contact us at hello@jisp.com to arrange payment for this order.",
};

export default async function OrderSuccessPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const supabase = getSupabaseServiceRoleClient();
  const order = await fetchOrderByNumber(supabase, params.orderNumber);
  if (!order) notFound();

  const address = order.address;

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-16">
      <div className="text-center mb-10">
        <h1>Thank You</h1>
        <p className="text-sm text-jisp-grey mt-2">Your order has been placed successfully.</p>
      </div>

      <div className="border border-jisp-light p-6 flex flex-col gap-6">
        <div className="flex justify-between flex-wrap gap-2">
          <div>
            <span className="text-xs uppercase tracking-wider text-jisp-grey">Order Number</span>
            <p className="text-sm font-medium">{order.order_number}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-jisp-grey">Customer Name</span>
            <p className="text-sm">{order.customer_name}</p>
          </div>
        </div>

        <div>
          <span className="text-xs uppercase tracking-wider text-jisp-grey">Ordered Products</span>
          <div className="mt-2 flex flex-col gap-2">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.product_name} × {item.quantity}
                  {(item.size || item.color) && (
                    <span className="text-jisp-grey"> ({[item.size, item.color].filter(Boolean).join(" / ")})</span>
                  )}
                </span>
                <span>{formatRM(item.line_total)}</span>
              </div>
            ))}
          </div>
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
            <span>Total Amount</span>
            <span>{formatRM(order.grand_total)}</span>
          </div>
        </div>

        {address && (
          <div>
            <span className="text-xs uppercase tracking-wider text-jisp-grey">Delivery Address</span>
            <p className="text-sm mt-1">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.postcode}, {address.country}
            </p>
          </div>
        )}

        <div>
          <span className="text-xs uppercase tracking-wider text-jisp-grey">Payment Method</span>
          <p className="text-sm mt-1">{order.payment_method}</p>
        </div>

        <div className="bg-jisp-light p-4">
          <span className="text-xs uppercase tracking-wider text-jisp-grey">Payment Instructions</span>
          <p className="text-sm mt-1">{PAYMENT_INSTRUCTIONS[order.payment_method]}</p>
        </div>
      </div>

      <div className="text-center mt-10">
        <Link href="/">
          <Button variant="primary">Return to Home</Button>
        </Link>
      </div>
    </div>
  );
}
