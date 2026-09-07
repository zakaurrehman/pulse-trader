"use client";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  note: string | null;
  createdAt: string;
  affiliate: { fullName: string; username: string; paymentMethod: string };
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "PAID" | "REJECTED">("ALL");

  useEffect(() => {
    fetch("/api/withdrawals")
      .then((r) => r.json())
      .then(setWithdrawals)
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: string, note?: string) {
    setUpdating(id);
    const res = await fetch("/api/withdrawals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, note }),
    });
    if (res.ok) {
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status } : w))
      );
    }
    setUpdating(null);
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/15 text-yellow-400",
    APPROVED: "bg-blue-500/15 text-blue-400",
    PAID: "bg-green-500/15 text-green-400",
    REJECTED: "bg-red-500/15 text-red-400",
  };

  const filtered = filter === "ALL" ? withdrawals : withdrawals.filter((w) => w.status === filter);
  const pendingTotal = withdrawals.filter((w) => w.status === "PENDING").reduce((s, w) => s + w.amount, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-ink">Withdrawal Requests</h1>
        <p className="text-mist mt-1">Review and process affiliate withdrawal requests</p>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5">
          <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-1">Pending</p>
          <p className="text-2xl font-black text-yellow-400">{withdrawals.filter((w) => w.status === "PENDING").length}</p>
          <p className="text-yellow-400/80 text-sm mt-1">{formatCurrency(pendingTotal)} total</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5">
          <p className="text-green-400 text-xs font-semibold uppercase tracking-wider mb-1">Paid Out</p>
          <p className="text-2xl font-black text-green-400">
            {formatCurrency(withdrawals.filter((w) => w.status === "PAID").reduce((s, w) => s + w.amount, 0))}
          </p>
        </div>
        <div className="bg-panel border border-hairline rounded-2xl p-5">
          <p className="text-fog text-xs font-semibold uppercase tracking-wider mb-1">Total Requests</p>
          <p className="text-2xl font-black text-ink">{withdrawals.length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(["ALL", "PENDING", "APPROVED", "PAID", "REJECTED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filter === f ? "bg-gold-500 text-void" : "bg-panel text-mist border border-hairline hover:bg-abyss"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-panel rounded-2xl border border-hairline shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-fog">Loading...</div>
        ) : !filtered.length ? (
          <div className="p-10 text-center text-fog text-sm">No withdrawal requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-abyss">
                <tr>
                  {["Affiliate", "Payment Method", "Amount", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-fog uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filtered.map((w) => (
                  <tr key={w.id} className="hover:bg-abyss">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-ink text-sm">{w.affiliate.fullName}</p>
                      <p className="text-fog text-xs">@{w.affiliate.username}</p>
                    </td>
                    <td className="px-4 py-4 text-mist text-sm">{w.affiliate.paymentMethod}</td>
                    <td className="px-4 py-4 font-black text-ink">{formatCurrency(w.amount)}</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[w.status]}`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-fog text-xs">{formatDate(w.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {w.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => updateStatus(w.id, "APPROVED")}
                              disabled={updating === w.id}
                              className="bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(w.id, "REJECTED")}
                              disabled={updating === w.id}
                              className="bg-red-500/15 hover:bg-red-500/25 text-red-400 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {w.status === "APPROVED" && (
                          <button
                            onClick={() => updateStatus(w.id, "PAID")}
                            disabled={updating === w.id}
                            className="bg-green-500/15 hover:bg-green-500/25 text-green-400 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            Mark as Paid
                          </button>
                        )}
                      </div>
                    </td>
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
