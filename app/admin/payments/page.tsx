"use client";
import { useEffect, useState } from "react";

type PaymentRequest = {
  id: string;
  clientName: string;
  clientEmail: string;
  phone: string | null;
  country: string | null;
  service: string;
  amount: number;
  referralCode: string | null;
  paymentNote: string | null;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  rejectedNote: string | null;
  createdAt: string;
  affiliate: { fullName: string; username: string } | null;
};

const STATUS_COLORS = {
  PENDING:   "bg-gold-500/15 text-gold-highlight",
  CONFIRMED: "bg-green-500/15 text-green-400",
  REJECTED:  "bg-red-500/15 text-red-400",
};

export default function AdminPaymentsPage() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "CONFIRMED" | "REJECTED">("ALL");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/payments");
    const data = await res.json();
    setRequests(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function showToast(text: string, ok: boolean) {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function confirm(id: string) {
    setActing(id);
    const res = await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "confirm" }),
    });
    const data = await res.json();
    setActing(null);
    if (res.ok) {
      const info = data.enrolled ? " Student enrolled automatically." : data.studentFound === false ? " No student account found for this email." : "";
      showToast("Payment confirmed!" + info, true);
      load();
    } else {
      showToast(data.error || "Failed to confirm", false);
    }
  }

  async function reject() {
    if (!rejectModal) return;
    setActing(rejectModal.id);
    const res = await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: rejectModal.id, action: "reject", rejectedNote: rejectNote }),
    });
    setActing(null);
    setRejectModal(null);
    setRejectNote("");
    if (res.ok) {
      showToast("Payment request rejected.", true);
      load();
    } else {
      showToast("Failed to reject", false);
    }
  }

  const displayed = filter === "ALL" ? requests : requests.filter((r) => r.status === filter);
  const counts = {
    ALL: requests.length,
    PENDING: requests.filter((r) => r.status === "PENDING").length,
    CONFIRMED: requests.filter((r) => r.status === "CONFIRMED").length,
    REJECTED: requests.filter((r) => r.status === "REJECTED").length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all ${
          toast.ok ? "bg-green-500 text-void" : "bg-red-500 text-white"
        }`}>
          {toast.text}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-panel border border-hairline rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-ink font-bold text-lg mb-2">Reject Payment</h3>
            <p className="text-mist text-sm mb-4">Optionally provide a reason. The record will be marked as rejected.</p>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="w-full bg-abyss border border-hairline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-fog focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={reject}
                disabled={acting === rejectModal.id}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                {acting === rejectModal.id ? "Rejecting…" : "Confirm Reject"}
              </button>
              <button
                onClick={() => { setRejectModal(null); setRejectNote(""); }}
                className="flex-1 border border-hairline text-mist font-bold py-2.5 rounded-xl text-sm hover:bg-abyss transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-black text-ink">Payment Requests</h1>
        <p className="text-mist text-sm mt-1">Review client orders. Confirming a payment automatically logs the sale and creates the affiliate commission.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["ALL", "PENDING", "CONFIRMED", "REJECTED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
              filter === f
                ? "bg-gold-500 text-void border-gold-500"
                : "bg-panel text-mist border-hairline hover:border-gold-500/40"
            }`}
          >
            {f} <span className="ml-1 opacity-60">({counts[f]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-fog">Loading…</div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 bg-panel rounded-2xl border border-hairline">
          <p className="text-fog text-lg">No {filter !== "ALL" ? filter.toLowerCase() : ""} payment requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((r) => (
            <div key={r.id} className={`bg-panel rounded-2xl border shadow-sm p-5 ${
              r.status === "PENDING" ? "border-gold-500/40" : "border-hairline"
            }`}>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-ink font-bold">{r.clientName}</h3>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[r.status]}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-mist text-sm">{r.clientEmail}</p>
                  {r.phone && <p className="text-fog text-xs mt-0.5">{r.phone} {r.country ? `· ${r.country}` : ""}</p>}
                </div>
                <div className="text-right">
                  <p className="text-gold-highlight font-black text-xl">${r.amount.toFixed(2)}</p>
                  <p className="text-mist text-sm">{r.service}</p>
                  <p className="text-fog text-xs mt-0.5">{new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-abyss rounded-xl p-3">
                  <p className="text-xs font-semibold text-fog uppercase tracking-wider mb-1">Referred By</p>
                  {r.affiliate ? (
                    <>
                      <p className="text-ink font-semibold text-sm">{r.affiliate.fullName}</p>
                      <p className="text-fog text-xs">@{r.affiliate.username} · Code: <span className="font-mono">{r.referralCode}</span></p>
                    </>
                  ) : (
                    <p className="text-fog text-sm italic">{r.referralCode ? `Unknown code: ${r.referralCode}` : "No referral"}</p>
                  )}
                </div>
                <div className="bg-abyss rounded-xl p-3">
                  <p className="text-xs font-semibold text-fog uppercase tracking-wider mb-1">Payment Reference</p>
                  <p className="text-mist text-sm">{r.paymentNote || <span className="italic text-fog">No reference provided</span>}</p>
                </div>
              </div>

              {r.status === "CONFIRMED" && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-2 text-green-400 text-sm font-medium">
                  ✅ Confirmed — Sale & commission logged to affiliate
                </div>
              )}

              {r.status === "REJECTED" && r.rejectedNote && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2 text-red-400 text-sm">
                  ❌ Rejected: {r.rejectedNote}
                </div>
              )}

              {r.status === "PENDING" && (
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => confirm(r.id)}
                    disabled={acting === r.id}
                    className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 disabled:opacity-50 text-void font-bold text-sm px-6 py-2.5 rounded-xl transition-colors"
                  >
                    {acting === r.id ? "Processing…" : "✓ Confirm Payment"}
                  </button>
                  <button
                    onClick={() => setRejectModal({ id: r.id })}
                    disabled={acting === r.id}
                    className="flex-1 sm:flex-none border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold text-sm px-6 py-2.5 rounded-xl transition-colors"
                  >
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
