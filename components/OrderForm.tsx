"use client";
import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

type Course = {
  id: string;
  name: string;
  price: number;
  period: string;
};

export default function OrderForm({
  defaultRefCode,
  defaultService,
  courses,
}: {
  defaultRefCode: string;
  defaultService: string;
  courses: Course[];
}) {
  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    phone: "",
    country: "",
    service: defaultService,
    referralCode: defaultRefCode,
    paymentNote: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const selectedService = courses.find((s) => s.name === form.service);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError("");
    if (!form.service) { setError("Please select a service."); return; }
    if (!form.paymentNote.trim()) { setError("Please enter your payment reference / transaction ID."); return; }
    setLoading(true);
    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Something went wrong."); return; }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Order Submitted!</h2>
          <p className="text-slate-500 mb-2">
            Thank you, <strong>{form.clientName}</strong>. Your payment request for{" "}
            <strong>{form.service}</strong> has been received.
          </p>
          <p className="text-slate-500 text-sm mb-8">
            Our team will verify your payment and confirm your access within <strong>24–48 hours</strong>. Check your email for updates.
          </p>
          <Link
            href="/"
            className="inline-block bg-gold-500 hover:bg-gold-400 text-slate-900 font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 py-10 px-4 text-center">
        <Link href="/" className="inline-block mb-6">
          <Logo height={50} />
        </Link>
        <h1 className="text-3xl font-black text-white mb-2">Place Your Order</h1>
        <p className="text-slate-400">Select your service, make payment, and submit your reference below.</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <form onSubmit={submit} className="space-y-6">

          {/* Step 1: Choose Service */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-slate-900 font-bold text-lg mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-gold-500 rounded-full text-slate-900 font-black text-sm flex items-center justify-center">1</span>
              Choose Your Service
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {courses.map((s) => (
                <label
                  key={s.name}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    form.service === s.name
                      ? "border-gold-500 bg-gold-50"
                      : "border-slate-200 hover:border-gold-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="service"
                    value={s.name}
                    checked={form.service === s.name}
                    onChange={() => set("service", s.name)}
                    className="mt-1 accent-gold-500"
                  />
                  <div>
                    <p className={`font-bold text-sm ${form.service === s.name ? "text-gold-700" : "text-slate-900"}`}>
                      {s.name}
                    </p>
                    <p className="text-gold-500 font-black text-base">
                      ${s.price.toFixed(2)}
                      <span className="text-slate-400 font-normal text-xs ml-1">/{s.period}</span>
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Step 2: Payment Instructions */}
          {selectedService && (
            <div className="bg-gold-50 border border-gold-200 rounded-2xl p-6">
              <h2 className="text-slate-900 font-bold text-lg mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-gold-500 rounded-full text-slate-900 font-black text-sm flex items-center justify-center">2</span>
                Make Your Payment
              </h2>
              <p className="text-slate-700 text-sm mb-4">
                Send exactly <strong className="text-gold-600">${selectedService.price.toFixed(2)}</strong> for{" "}
                <strong>{selectedService.name}</strong> using one of the methods below:
              </p>
              <div className="space-y-3">
                <div className="bg-white rounded-xl border border-gold-200 p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bank Transfer</p>
                  <p className="text-sm text-slate-700 font-medium">Bank Name: <span className="text-slate-500">[Your Bank Name]</span></p>
                  <p className="text-sm text-slate-700 font-medium">Account Number: <span className="text-slate-500">[Your Account Number]</span></p>
                  <p className="text-sm text-slate-700 font-medium">Account Name: <span className="text-slate-500">Dominators Club</span></p>
                </div>
                <div className="bg-white rounded-xl border border-gold-200 p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">WhatsApp / Contact</p>
                  <p className="text-sm text-slate-700">Message us on WhatsApp: <a href="https://wa.me/923066062012" target="_blank" rel="noopener noreferrer" className="text-gold-600 font-semibold hover:underline">+92 306 6062012</a></p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                After sending payment, fill in your details below and enter your transaction reference or a screenshot description.
              </p>
            </div>
          )}

          {/* Step 3: Your Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-slate-900 font-bold text-lg mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-gold-500 rounded-full text-slate-900 font-black text-sm flex items-center justify-center">3</span>
              Your Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Full Name *</label>
                <input
                  required
                  value={form.clientName}
                  onChange={(e) => set("clientName", e.target.value)}
                  placeholder="John Smith"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Email Address *</label>
                <input
                  required
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => set("clientEmail", e.target.value)}
                  placeholder="john@example.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Phone Number</label>
                <input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Country</label>
                <input
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  placeholder="United States"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                Payment Reference / Transaction ID *
              </label>
              <textarea
                required
                rows={3}
                value={form.paymentNote}
                onChange={(e) => set("paymentNote", e.target.value)}
                placeholder="Enter your transaction ID, reference number, or describe how you paid (e.g. 'Sent via bank transfer, ref: TXN123456')"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
              />
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                Referral Code <span className="text-slate-400 font-normal normal-case">(if you have one)</span>
              </label>
              <input
                value={form.referralCode}
                onChange={(e) => set("referralCode", e.target.value.toUpperCase())}
                placeholder="e.g. ABC12345"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono uppercase"
              />
              {form.referralCode && (
                <p className="text-xs text-gold-600 mt-1">Your purchase will be credited to this affiliate.</p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-slate-900 font-black text-lg py-4 rounded-xl transition-colors shadow-lg"
          >
            {loading ? "Submitting…" : "Submit Order →"}
          </button>

          <p className="text-center text-slate-400 text-xs">
            By submitting, you agree that your payment will be manually verified by our team within 24–48 hours.
          </p>
        </form>
      </div>
    </div>
  );
}
