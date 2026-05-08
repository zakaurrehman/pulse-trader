"use client";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Stats {
  totalSales: number;
  salesCount: number;
  earnedCommissions: number;
  availableBalance: number;
  withdrawnAmount: number;
  referralCode: string | null;
  recentSales: { id: string; clientName: string; amount: number; createdAt: string }[];
  withdrawals: { id: string; amount: number; status: string; createdAt: string }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (loading) return <PageSkeleton />;

  const statCards = [
    { label: "Total Sales Generated", value: formatCurrency(stats?.totalSales ?? 0), sub: `${stats?.salesCount ?? 0} sales`, color: "text-blue-600" },
    { label: "Earned Commissions", value: formatCurrency(stats?.earnedCommissions ?? 0), sub: "50% of each sale", color: "text-green-600" },
    { label: "Available Balance", value: formatCurrency(stats?.availableBalance ?? 0), sub: "Ready to withdraw", color: "text-amber-600" },
    { label: "Withdrawn", value: formatCurrency(stats?.withdrawnAmount ?? 0), sub: "Total paid out", color: "text-slate-600" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Track your affiliate performance and earnings</p>
      </div>

      {/* Referral Link Banner */}
      {stats?.referralCode && (
        <div className="bg-slate-900 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Your Referral Link</p>
            <p className="text-amber-400 font-mono text-sm break-all">
              {appUrl}/api/ref/{stats.referralCode}
            </p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(`${appUrl}/api/ref/${stats?.referralCode}`)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm px-4 py-2 rounded-lg transition-colors flex-shrink-0"
          >
            Copy Link
          </button>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">{card.label}</p>
            <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
            <p className="text-slate-400 text-xs mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent sales */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Recent Sales</h2>
          </div>
          {!stats?.recentSales.length ? (
            <div className="p-8 text-center text-slate-400 text-sm">No sales yet</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentSales.map((sale) => (
                <div key={sale.id} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{sale.clientName}</p>
                    <p className="text-slate-400 text-xs">{formatDate(sale.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-sm">{formatCurrency(sale.amount)}</p>
                    <p className="text-green-600 text-xs font-semibold">+{formatCurrency(sale.amount * 0.5)} earned</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Withdrawal history */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Withdrawal History</h2>
          </div>
          {!stats?.withdrawals.length ? (
            <div className="p-8 text-center text-slate-400 text-sm">No withdrawals yet</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.withdrawals.map((w) => (
                <div key={w.id} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{formatCurrency(w.amount)}</p>
                    <p className="text-slate-400 text-xs">{formatDate(w.createdAt)}</p>
                  </div>
                  <StatusBadge status={w.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-blue-100 text-blue-700",
    PAID: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

function PageSkeleton() {
  return (
    <div className="p-6 max-w-6xl mx-auto animate-pulse">
      <div className="h-7 bg-slate-200 rounded w-48 mb-2" />
      <div className="h-4 bg-slate-100 rounded w-64 mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-100 rounded-2xl h-28" />
        ))}
      </div>
    </div>
  );
}
