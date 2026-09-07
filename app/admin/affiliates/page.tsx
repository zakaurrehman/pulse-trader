"use client";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

interface Affiliate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string | null;
  country: string;
  username: string;
  paymentMethod: string | null;
  socialHandle: string | null;
  status: string;
  referralCode: string | null;
  createdAt: string;
  _count: { sales: number; commissions: number };
}

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/affiliates")
      .then((r) => r.json())
      .then(setAffiliates)
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: "APPROVED" | "REJECTED") {
    setUpdating(id);
    const res = await fetch("/api/affiliates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (res.ok) {
      setAffiliates((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status, referralCode: data.referralCode ?? a.referralCode } : a
        )
      );
    }
    setUpdating(null);
  }

  const filtered = filter === "ALL" ? affiliates : affiliates.filter((a) => a.status === filter);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/15 text-yellow-400",
    APPROVED: "bg-green-500/15 text-green-400",
    REJECTED: "bg-red-500/15 text-red-400",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-ink">Affiliates</h1>
        <p className="text-mist mt-1">Manage affiliate registrations and approvals</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              filter === s ? "border-gold-500 bg-gold-500/10" : "border-hairline bg-panel hover:border-gold-500/30"
            }`}
          >
            <p className="text-fog text-xs font-semibold uppercase tracking-wider mb-1">{s}</p>
            <p className="text-2xl font-black text-ink">
              {affiliates.filter((a) => a.status === s).length}
            </p>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
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
          <div className="p-10 text-center text-fog text-sm">No affiliates found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-abyss">
                <tr>
                  {["Name / Contact", "Location", "Payment", "Sales", "Status", "Joined", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-fog uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-abyss">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-ink text-sm">{a.fullName}</p>
                      <p className="text-fog text-xs">{a.email}</p>
                      <p className="text-fog text-xs">{a.phone}</p>
                      <p className="text-mist text-xs font-mono mt-0.5">@{a.username}</p>
                      {a.referralCode && (
                        <p className="text-gold-highlight text-xs font-mono mt-0.5">Code: {a.referralCode}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-mist text-sm">
                      {a.city ? `${a.city}, ` : ""}{a.country}
                    </td>
                    <td className="px-4 py-4 text-mist text-sm">{a.paymentMethod ?? "—"}</td>
                    <td className="px-4 py-4 text-mist text-sm">{a._count.sales}</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-fog text-xs">{formatDate(a.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {a.status !== "APPROVED" && (
                          <button
                            onClick={() => updateStatus(a.id, "APPROVED")}
                            disabled={updating === a.id}
                            className="bg-green-500/15 hover:bg-green-500/25 text-green-400 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                        {a.status !== "REJECTED" && (
                          <button
                            onClick={() => updateStatus(a.id, "REJECTED")}
                            disabled={updating === a.id}
                            className="bg-red-500/15 hover:bg-red-500/25 text-red-400 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            Reject
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
