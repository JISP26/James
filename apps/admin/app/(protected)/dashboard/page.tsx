import Link from "next/link";
import { getSupabaseServerSessionClient } from "@/lib/supabase-server";
import { StatCard } from "@/components/StatCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

function formatRM(n: number) {
  return `RM ${n.toFixed(2)}`;
}

export default async function DashboardPage() {
  const supabase = getSupabaseServerSessionClient();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: todayOrders },
    { data: monthlyOrders },
    { count: pendingOrders },
    { count: paidOrders },
    { count: processingOrders },
    { count: completedOrders },
    { count: totalProducts },
    { data: lowStockProducts },
    { count: outOfStockProducts },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", startOfToday),
    supabase.from("orders").select("grand_total").gte("created_at", startOfMonth),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["New Order", "Pending Payment"]),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "Paid"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "Processing"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "Completed"),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id, name, inventory_quantity, low_stock_threshold").gt("inventory_quantity", 0),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("inventory_quantity", 0),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
  ]);

  const monthlyRevenue = (monthlyOrders ?? []).reduce((sum: number, o: any) => sum + Number(o.grand_total), 0);
  const lowStockCount = (lowStockProducts ?? []).filter(
    (p: any) => p.inventory_quantity <= p.low_stock_threshold
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <h1>Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Today Orders" value={todayOrders ?? 0} />
        <StatCard label="Monthly Orders" value={monthlyOrders?.length ?? 0} />
        <StatCard label="Monthly Revenue" value={formatRM(monthlyRevenue)} />
        <StatCard label="Pending Orders" value={pendingOrders ?? 0} />
        <StatCard label="Paid Orders" value={paidOrders ?? 0} />
        <StatCard label="Processing Orders" value={processingOrders ?? 0} />
        <StatCard label="Completed Orders" value={completedOrders ?? 0} />
        <StatCard label="Total Products" value={totalProducts ?? 0} />
        <StatCard label="Low Stock Products" value={lowStockCount} />
        <StatCard label="Out of Stock Products" value={outOfStockProducts ?? 0} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3>Recent Orders</h3>
          <Link href="/orders" className="text-xs uppercase tracking-wider hover:text-jisp-blue">
            View All
          </Link>
        </div>
        <div className="bg-jisp-white border border-jisp-light overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-jisp-grey border-b border-jisp-light">
                <th className="p-3">Order Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {(recentOrders ?? []).map((o: any) => (
                <tr key={o.id} className="border-b border-jisp-light last:border-0 hover:bg-jisp-blue-hover">
                  <td className="p-3">
                    <Link href={`/orders/${o.id}`} className="hover:text-jisp-blue">{o.order_number}</Link>
                  </td>
                  <td className="p-3">{o.customer_name}</td>
                  <td className="p-3">{formatRM(o.grand_total)}</td>
                  <td className="p-3">{o.status}</td>
                  <td className="p-3">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {(recentOrders ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-jisp-grey">No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
