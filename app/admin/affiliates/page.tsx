"use client";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

interface Affiliate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  username: string;
  paymentMethod: string;
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
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Affiliates</h1>
        <p className="text-slate-500 mt-1">Manage affiliate registrations and approvals</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              filter === s ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white hover:shadow-sm"
            }`}
          >
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{s}</p>
            <p className="text-2xl font-black text-slate-900">
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
              filter === f ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Loading...</div>
        ) : !filtered.length ? (
          <div className="p-10 text-center text-slate-400 text-sm">No affiliates found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {["Name / Contact", "Location", "Payment", "Sales", "Status", "Joined", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900 text-sm">{a.fullName}</p>
                      <p className="text-slate-400 text-xs">{a.email}</p>
                      <p className="text-slate-400 text-xs">{a.phone}</p>
                      <p className="text-slate-500 text-xs font-mono mt-0.5">@{a.username}</p>
                      {a.referralCode && (
                        <p className="text-amber-600 text-xs font-mono mt-0.5">Code: {a.referralCode}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-600 text-sm">
                      {a.city}, {a.country}
                    </td>
                    <td className="px-4 py-4 text-slate-600 text-sm">{a.paymentMethod}</td>
                    <td className="px-4 py-4 text-slate-600 text-sm">{a._count.sales}</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-400 text-xs">{formatDate(a.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {a.status !== "APPROVED" && (
                          <button
                            onClick={() => updateStatus(a.id, "APPROVED")}
                            disabled={updating === a.id}
                            className="bg-green-100 hover:bg-green-200 text-green-700 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                        {a.status !== "REJECTED" && (
                          <button
                            onClick={() => updateStatus(a.id, "REJECTED")}
                            disabled={updating === a.id}
                            className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
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
