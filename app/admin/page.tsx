"use client";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

interface Overview {
  totalAffiliates: number;
  pendingAffiliates: number;
  totalSales: number;
  totalSalesAmount: number;
  totalCommissions: number;
  pendingWithdrawals: number;
  pendingReviews: number;
  recentSales: { id: string; clientName: string; amount: number; affiliate: { fullName: string }; createdAt: string }[];
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Affiliates", value: data?.totalAffiliates ?? 0, color: "text-blue-600", link: "/admin/affiliates" },
    { label: "Pending Approvals", value: data?.pendingAffiliates ?? 0, color: "text-amber-600", link: "/admin/affiliates" },
    { label: "Total Sales", value: formatCurrency(data?.totalSalesAmount ?? 0), color: "text-green-600", link: "/admin/sales" },
    { label: "Total Commissions", value: formatCurrency(data?.totalCommissions ?? 0), color: "text-purple-600", link: "/admin/sales" },
    { label: "Pending Withdrawals", value: data?.pendingWithdrawals ?? 0, color: "text-red-600", link: "/admin/withdrawals" },
    { label: "Pending Reviews", value: data?.pendingReviews ?? 0, color: "text-slate-600", link: "/admin/reviews" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Admin Overview</h1>
        <p className="text-slate-500 mt-1">Dominators Club — Control Panel</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.link} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{loading ? "—" : s.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent sales */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Recent Sales</h2>
          <Link href="/admin/sales" className="text-amber-600 hover:text-amber-500 text-sm font-semibold">
            Log a Sale →
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : !data?.recentSales?.length ? (
          <div className="p-10 text-center text-slate-400 text-sm">No sales logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {["Client", "Affiliate", "Amount", "Commission", "Date"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-800 text-sm">{sale.clientName}</td>
                    <td className="px-5 py-4 text-slate-600 text-sm">{sale.affiliate.fullName}</td>
                    <td className="px-5 py-4 font-bold text-slate-900 text-sm">{formatCurrency(sale.amount)}</td>
                    <td className="px-5 py-4 text-green-600 font-bold text-sm">{formatCurrency(sale.amount * 0.5)}</td>
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
