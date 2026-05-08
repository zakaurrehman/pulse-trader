"use client";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Sale {
  id: string;
  clientName: string;
  clientEmail: string | null;
  amount: number;
  description: string | null;
  createdAt: string;
  commission: { amount: number } | null;
}

export default function ClientsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => {
        // We'll use the full sales list — fetch separately
        setSales(data.recentSales || []);
      });

    // Fetch all sales for this affiliate
    fetch("/api/dashboard/clients")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSales(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
  const totalEarned = sales.reduce((sum, s) => sum + (s.commission?.amount ?? 0), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">My Clients</h1>
        <p className="text-slate-500 mt-1">All clients who purchased through your referral link</p>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Clients", value: sales.length, color: "text-blue-600" },
          { label: "Total Revenue", value: formatCurrency(totalRevenue), color: "text-slate-800" },
          { label: "Your Earnings", value: formatCurrency(totalEarned), color: "text-green-600" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">{c.label}</p>
            <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Client Purchase History</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : !sales.length ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm">No clients yet. Share your referral link to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {["Client Name", "Email", "Purchase Amount", "Your Commission", "Date"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-800 text-sm">{sale.clientName}</td>
                    <td className="px-5 py-4 text-slate-500 text-sm">{sale.clientEmail || "—"}</td>
                    <td className="px-5 py-4 font-bold text-slate-900 text-sm">{formatCurrency(sale.amount)}</td>
                    <td className="px-5 py-4 text-sm">
                      <span className="text-green-600 font-bold">+{formatCurrency(sale.commission?.amount ?? sale.amount * 0.5)}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-sm">{formatDate(sale.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
