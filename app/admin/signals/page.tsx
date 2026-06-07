"use client";
import { useEffect, useState } from "react";

type SignalStat = {
  id: string;
  pair: string;
  winRate: number;
  totalSignals: number;
  profitPips: string;
  barValues: string;
};

const PAIR_COLORS: Record<string, string> = {
  "XAU/USD": "bg-gold-500",
  "EUR/USD": "bg-blue-500",
  "GBP/USD": "bg-purple-500",
  "USD/JPY": "bg-rose-500",
};

export default function AdminSignalsPage() {
  const [stats, setStats] = useState<SignalStat[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/admin/signals/list")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  async function save(stat: SignalStat) {
    setSaving(stat.id);
    setMessage(null);
    const res = await fetch("/api/admin/signals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stat),
    });
    const data = await res.json();
    setSaving(null);
    if (res.ok) {
      setStats((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      setMessage({ id: stat.id, text: "Saved successfully!", ok: true });
    } else {
      setMessage({ id: stat.id, text: data.error || "Save failed", ok: false });
    }
    setTimeout(() => setMessage(null), 3000);
  }

  function update(id: string, field: keyof SignalStat, value: string) {
    setStats((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Signal Performance Stats</h1>
        <p className="text-slate-500 text-sm mt-1">
          Update the live signal stats shown on the landing page. Bar values: 7 numbers (0–100), comma-separated.
        </p>
      </div>

      <div className="space-y-6">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${PAIR_COLORS[stat.pair] ?? "bg-slate-500"} rounded-xl flex items-center justify-center`}>
                  <span className="text-white font-black text-xs">{stat.pair.split("/")[0]}</span>
                </div>
                <h2 className="text-slate-900 font-bold text-lg">{stat.pair}</h2>
              </div>
              {message?.id === stat.id && (
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  message.ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {message.text}
                </span>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Win Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={stat.winRate}
                  onChange={(e) => update(stat.id, "winRate", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Total Signals
                </label>
                <input
                  type="number"
                  min="0"
                  value={stat.totalSignals}
                  onChange={(e) => update(stat.id, "totalSignals", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Profit (Pips)
                </label>
                <input
                  type="text"
                  value={stat.profitPips}
                  onChange={(e) => update(stat.id, "profitPips", e.target.value)}
                  placeholder="+4,230"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Bar Values (7 nums)
                </label>
                <input
                  type="text"
                  value={stat.barValues}
                  onChange={(e) => update(stat.id, "barValues", e.target.value)}
                  placeholder="80,95,85,100,90,88,92"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>

            {/* Mini bar chart preview */}
            <div className="flex items-end gap-1 h-8 mb-5 bg-slate-50 rounded-lg px-3 py-1">
              {stat.barValues.split(",").map((v, i) => {
                const h = Math.min(100, Math.max(0, Number(v.trim()) || 0));
                return (
                  <div
                    key={i}
                    className="flex-1 bg-gold-500/60 rounded-sm"
                    style={{ height: `${h}%` }}
                  />
                );
              })}
            </div>

            <button
              onClick={() => save(stat)}
              disabled={saving === stat.id}
              className="bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-slate-900 font-bold text-sm px-6 py-2.5 rounded-lg transition-colors"
            >
              {saving === stat.id ? "Saving…" : "Save Changes"}
            </button>
          </div>
        ))}

        {stats.length === 0 && (
          <div className="text-center py-12 text-slate-400">Loading signal stats…</div>
        )}
      </div>
    </div>
  );
}
