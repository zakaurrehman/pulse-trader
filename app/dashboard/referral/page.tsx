"use client";
import { useEffect, useState } from "react";

export default function ReferralPage() {
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => setCode(data.referralCode))
      .finally(() => setLoading(false));
  }, []);

  const referralUrl = code ? `${appUrl}/api/ref/${code}` : null;

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">My Referral Link</h1>
        <p className="text-slate-500 mt-1">Share this link to earn 50% commission on every sale</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-48 mb-4" />
          <div className="h-12 bg-slate-100 rounded" />
        </div>
      ) : !code ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <p className="text-amber-700 font-semibold">Your referral link will appear here once your account is approved.</p>
        </div>
      ) : (
        <>
          {/* Main link card */}
          <div className="bg-slate-900 rounded-2xl p-6 mb-6">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Your Unique Referral Link</p>
            <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-3 mb-4">
              <p className="text-amber-400 font-mono text-sm flex-1 break-all">{referralUrl}</p>
            </div>
            <button
              onClick={() => handleCopy(referralUrl!)}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-3 rounded-xl transition-colors"
            >
              {copied ? "✓ Copied!" : "Copy Link"}
            </button>
          </div>

          {/* Code card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Referral Code</p>
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 rounded-xl px-5 py-3 font-mono font-bold text-xl text-slate-900 tracking-widest">
                {code}
              </div>
              <button
                onClick={() => handleCopy(code)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-sm px-4 py-3 rounded-xl transition-colors"
              >
                Copy Code
              </button>
            </div>
          </div>

          {/* How to use */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">How to Use Your Link</h2>
            <div className="space-y-4">
              {[
                { num: "1", title: "Share your link", desc: "Post it on social media, WhatsApp, email, or directly to potential clients." },
                { num: "2", title: "Client clicks & buys", desc: "When someone clicks your link and makes a purchase, it's tracked to your account." },
                { num: "3", title: "Earn 50% commission", desc: "Your commission is automatically credited to your balance after each sale." },
                { num: "4", title: "Request withdrawal", desc: "When ready, submit a withdrawal request from your dashboard." },
              ].map((step) => (
                <div key={step.num} className="flex gap-4">
                  <span className="w-7 h-7 bg-amber-500 text-slate-900 font-black text-sm rounded-full flex items-center justify-center flex-shrink-0">
                    {step.num}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{step.title}</p>
                    <p className="text-slate-500 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
