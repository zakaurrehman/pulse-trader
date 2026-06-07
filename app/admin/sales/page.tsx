"use client";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Affiliate {
  id: string;
  fullName: string;
  username: string;
  referralCode: string | null;
}

interface Sale {
  id: string;
  clientName: string;
  clientEmail: string | null;
  amount: number;
  description: string | null;
  createdAt: string;
  affiliate: { fullName: string; username: string };
  commission: { amount: number } | null;
}

export default function SalesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    affiliateId: "",
    clientName: "",
    clientEmail: "",
    amount: "",
    description: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/affiliates").then((r) => r.json()),
      fetch("/api/sales").then((r) => r.json()),
    ]).then(([aff, sal]) => {
      setAffiliates(aff.filter((a: any) => a.status === "APPROVED"));
      setSales(sal);
    }).finally(() => setLoading(false));
  }, []);

  function update(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setSuccess(`Sale logged! Commission of ${formatCurrency(parseFloat(form.amount) * 0.5)} credited to affiliate.`);
    setForm({ affiliateId: "", clientName: "", clientEmail: "", amount: "", description: "" });

    // Refresh sales
    fetch("/api/sales").then((r) => r.json()).then(setSales);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Log a Sale</h1>
        <p className="text-slate-500 mt-1">Record a client purchase to credit 50% commission to the affiliate</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-5">New Sale</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Affiliate *</label>
                <select
                  required
                  value={form.affiliateId}
                  onChange={(e) => update("affiliateId", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="">Select affiliate</option>
                  {affiliates.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.fullName} (@{a.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client Name *</label>
                <input
                  type="text"
                  required
                  value={form.clientName}
                  onChange={(e) => update("clientName", e.target.value)}
                  placeholder="Client full name"
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client Email</label>
                <input
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => update("clientEmail", e.target.value)}
                  placeholder="client@email.com"
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sale Amount (USD) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => update("amount", e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-slate-300 rounded-lg pl-8 pr-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                {form.amount && (
                  <p className="text-green-600 text-xs mt-1 font-semibold">
                    Commission to credit: {formatCurrency(parseFloat(form.amount || "0") * 0.5)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description / Notes</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="e.g. 3-month trading course"
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-slate-900 font-black py-3 rounded-lg transition-colors"
              >
                {submitting ? "Logging..." : "Log Sale & Credit Commission"}
              </button>
            </form>
          </div>
        </div>

        {/* Sales table */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">All Sales ({sales.length})</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading...</div>
            ) : !sales.length ? (
              <div className="p-10 text-center text-slate-400 text-sm">No sales yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Client", "Affiliate", "Amount", "Commission", "Date"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sales.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-800 text-sm">{s.clientName}</p>
                          {s.clientEmail && <p className="text-slate-400 text-xs">{s.clientEmail}</p>}
                        </td>
                        <td className="px-4 py-4 text-slate-600 text-sm">{s.affiliate.fullName}</td>
                        <td className="px-4 py-4 font-bold text-slate-900 text-sm">{formatCurrency(s.amount)}</td>
                        <td className="px-4 py-4 text-green-600 font-bold text-sm">
                          {formatCurrency(s.commission?.amount ?? s.amount * 0.5)}
                        </td>
                        <td className="px-4 py-4 text-slate-400 text-xs">{formatDate(s.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
