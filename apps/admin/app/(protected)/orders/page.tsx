"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Input, Select, EmptyState, PageLoading, ErrorState, useToast } from "@jisp/ui";

const STATUSES = ["New Order", "Pending Payment", "Paid", "Processing", "Shipped", "Completed", "Cancelled"];

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  created_at: string;
  grand_total: number;
  payment_method: string;
  payment_status: string;
  status: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setError(null);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    try {
      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load orders.");
      setOrders(data.orders);
    } catch (e: any) {
      setError(e.message);
    }
  }, [search, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, newStatus: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      showToast("Order status updated.", "success");
      load();
    } else {
      showToast("Failed to update order status.", "error");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1>Orders</h1>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search order # or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
          aria-label="Search orders"
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-[180px]" aria-label="Filter by status">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      {orders === null && !error && <PageLoading label="Loading orders" />}
      {error && <ErrorState description={error} onRetry={load} />}
      {orders && orders.length === 0 && <EmptyState title="No orders found" />}
      {orders && orders.length > 0 && (
        <div className="bg-jisp-white border border-jisp-light overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-jisp-grey border-b border-jisp-light">
                <th className="p-3">Order Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-jisp-light last:border-0 hover:bg-jisp-blue-hover">
                  <td className="p-3">
                    <Link href={`/orders/${o.id}`} className="hover:text-jisp-blue">{o.order_number}</Link>
                  </td>
                  <td className="p-3">{o.customer_name}</td>
                  <td className="p-3">{o.customer_phone}</td>
                  <td className="p-3">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="p-3">RM {o.grand_total.toFixed(2)}</td>
                  <td className="p-3">
                    {o.payment_method}
                    <span className="block text-xs text-jisp-grey">{o.payment_status}</span>
                  </td>
                  <td className="p-3">
                    <Select
                      aria-label={`Update status for ${o.order_number}`}
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="text-xs py-1.5"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
