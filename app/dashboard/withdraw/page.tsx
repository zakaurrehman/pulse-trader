"use client";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

export default function WithdrawPage() {
  const [available, setAvailable] = useState(0);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => setAvailable(d.availableBalance ?? 0))
      .finally(() => setFetching(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (parsed > available) {
      setError("Amount exceeds your available balance.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parsed }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setSuccess("Withdrawal request submitted! The admin will review and process it shortly.");
    setAmount("");
    setAvailable((prev) => prev - parsed);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Request Withdrawal</h1>
        <p className="text-slate-500 mt-1">Submit a request to withdraw your available commission balance</p>
      </div>

      {/* Balance card */}
      <div className="bg-slate-900 rounded-2xl p-6 mb-6">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Available Balance</p>
        {fetching ? (
          <div className="h-10 bg-slate-800 rounded animate-pulse w-32" />
        ) : (
          <p className="text-amber-400 font-black text-4xl">{formatCurrency(available)}</p>
        )}
        <p className="text-slate-500 text-sm mt-2">This is the amount available for withdrawal</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-bold text-slate-900 mb-5">Withdrawal Request</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-5">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Amount to Withdraw (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                min="1"
                step="0.01"
                max={available}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="0.00"
                className="w-full border border-slate-300 rounded-lg pl-8 pr-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <p className="text-slate-400 text-xs mt-1">Max: {formatCurrency(available)}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-700 text-sm font-semibold mb-1">Payment Method</p>
            <p className="text-blue-600 text-sm">
              Your commission will be sent via your registered payment method. Contact admin if you need to update it.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || fetching || available <= 0}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-black py-3 rounded-lg transition-colors"
          >
            {loading ? "Submitting..." : "Submit Withdrawal Request"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-700 mb-3">What happens next?</h3>
          <ul className="space-y-2">
            {[
              "Your request is reviewed by the admin",
              "Once approved, payment is processed to your account",
              "You'll see the status update in your commissions page",
            ].map((step) => (
              <li key={step} className="flex items-start gap-2 text-slate-500 text-sm">
                <span className="text-amber-500 mt-0.5">→</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
