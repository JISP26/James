"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select, useToast } from "@jisp/ui";

const STATUSES = ["New Order", "Pending Payment", "Paid", "Processing", "Shipped", "Completed", "Cancelled"];
const PAYMENT_STATUSES = ["Unpaid", "Paid", "Refunded"];

export function OrderStatusControls({
  orderId,
  status,
  paymentStatus,
}: {
  orderId: string;
  status: string;
  paymentStatus: string;
}) {
  const [localStatus, setLocalStatus] = useState(status);
  const [localPaymentStatus, setLocalPaymentStatus] = useState(paymentStatus);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  async function update(field: "status" | "paymentStatus", value: string) {
    setSaving(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    setSaving(false);
    if (res.ok) {
      showToast("Order updated.", "success");
      router.refresh();
    } else {
      showToast("Failed to update order.", "error");
    }
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <span className="text-xs uppercase tracking-wider text-jisp-grey block mb-1">Order Status</span>
        <Select
          value={localStatus}
          disabled={saving}
          onChange={(e) => {
            setLocalStatus(e.target.value);
            update("status", e.target.value);
          }}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>
      <div>
        <span className="text-xs uppercase tracking-wider text-jisp-grey block mb-1">Payment Status</span>
        <Select
          value={localPaymentStatus}
          disabled={saving}
          onChange={(e) => {
            setLocalPaymentStatus(e.target.value);
            update("paymentStatus", e.target.value);
          }}
        >
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>
    </div>
  );
}
