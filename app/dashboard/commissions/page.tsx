"use client";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Stats {
  earnedCommissions: number;
  availableBalance: number;
  withdrawnAmount: number;
  withdrawals: { id: string; amount: number; status: string; createdAt: string }[];
}

export default function CommissionsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const statusMap: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-blue-100 text-blue-700",
    PAID: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Commissions</h1>
        <p className="text-slate-500 mt-1">Track your earnings and commission balance</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Earned", value: formatCurrency(stats?.earnedCommissions ?? 0), color: "text-green-600", sub: "All-time commissions" },
          { label: "Available Balance", value: formatCurrency(stats?.availableBalance ?? 0), color: "text-amber-600", sub: "Ready to withdraw" },
          { label: "Total Withdrawn", value: formatCurrency(stats?.withdrawnAmount ?? 0), color: "text-slate-700", sub: "Successfully paid" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">{c.label}</p>
            <p className={`text-3xl font-black ${c.color}`}>{loading ? "—" : c.value}</p>
            <p className="text-slate-400 text-xs mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Withdrawal History</h2>
          <a href="/dashboard/withdraw" className="text-amber-600 hover:text-amber-500 text-sm font-semibold">
            Request Withdrawal →
          </a>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : !stats?.withdrawals.length ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm">No withdrawal requests yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {["Amount", "Status", "Date"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-slate-900">{formatCurrency(w.amount)}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusMap[w.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-sm">{formatDate(w.createdAt)}</td>
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
