"use client";
import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const PAYMENT_METHODS = ["Bank Transfer", "PayPal", "Wise", "Crypto (USDT/BTC)", "Mobile Money", "Other"];

export default function AffiliateRegisterPage() {
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", city: "", country: "",
    username: "", password: "", confirmPassword: "", paymentMethod: "", socialHandle: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role: "AFFILIATE" }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error || "Registration failed."); return; }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-3xl">✓</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Application Submitted!</h2>
          <p className="text-slate-500 mb-6 leading-relaxed">
            Your affiliate application has been submitted. An admin will review and approve your account. You will be able to login once approved.
          </p>
          <Link href="/login" className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-lg transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block"><Logo height={52} /></Link>
          <p className="text-slate-400 mt-3 text-sm">Earn 50% commission on every sale you refer</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-900">Affiliate Registration</h1>
            <p className="text-slate-500 text-sm mt-1">Fill in your details below. All fields marked * are required.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name *" value={form.fullName} onChange={(v) => update("fullName", v)} placeholder="John Doe" />
              <Field label="Email Address *" type="email" value={form.email} onChange={(v) => update("email", v)} placeholder="john@example.com" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Phone Number *" type="tel" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+1 234 567 8900" />
              <Field label="Username *" value={form.username} onChange={(v) => update("username", v)} placeholder="john_trader" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="City *" value={form.city} onChange={(v) => update("city", v)} placeholder="New York" />
              <Field label="Country *" value={form.country} onChange={(v) => update("country", v)} placeholder="United States" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Preferred Payment Method *</label>
              <select
                required
                value={form.paymentMethod}
                onChange={(e) => update("paymentMethod", e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select payment method</option>
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <Field
              label="Social Media Handle / Platform Link (optional)"
              value={form.socialHandle}
              onChange={(v) => update("socialHandle", v)}
              placeholder="@yourhandle or https://instagram.com/yourpage"
            />

            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Set Your Password</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Password *" type="password" value={form.password} onChange={(v) => update("password", v)} placeholder="Min. 8 characters" />
                <Field label="Confirm Password *" type="password" value={form.confirmPassword} onChange={(v) => update("confirmPassword", v)} placeholder="Re-enter password" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-black py-3 rounded-lg transition-colors"
            >
              {loading ? "Submitting…" : "Submit Application"}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already registered?{" "}
            <Link href="/login" className="text-amber-600 font-semibold hover:text-amber-500">Sign in here</Link>
          </p>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          <Link href="/" className="hover:text-slate-300 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={label.includes("*")}
        className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-slate-400"
      />
    </div>
  );
}
