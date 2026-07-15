import { getSupabaseServerSessionClient } from "@/lib/supabase-server";
import { EmptyState } from "@jisp/ui";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const supabase = getSupabaseServerSessionClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("*, orders(id, grand_total)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <h1>Customers</h1>
      {(!customers || customers.length === 0) && (
        <EmptyState title="No customers yet" description="Customers appear here after their first order." />
      )}
      {customers && customers.length > 0 && (
        <div className="bg-jisp-white border border-jisp-light overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-jisp-grey border-b border-jisp-light">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Orders</th>
                <th className="p-3">Total Spent</th>
                <th className="p-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: any) => {
                const orders = c.orders ?? [];
                const totalSpent = orders.reduce((sum: number, o: any) => sum + Number(o.grand_total), 0);
                return (
                  <tr key={c.id} className="border-b border-jisp-light last:border-0 hover:bg-jisp-blue-hover">
                    <td className="p-3">{c.name}</td>
                    <td className="p-3">{c.email}</td>
                    <td className="p-3">{c.phone}</td>
                    <td className="p-3">{orders.length}</td>
                    <td className="p-3">RM {totalSpent.toFixed(2)}</td>
                    <td className="p-3">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
