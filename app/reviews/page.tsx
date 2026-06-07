"use client";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import { StarRating, StarPicker } from "@/components/StarRating";
import Link from "next/link";
import Logo from "@/components/Logo";

interface Review {
  id: string;
  clientName: string;
  rating: number;
  content: string;
  imageUrl: string | null;
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({ clientName: "", email: "", rating: 0, content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then(setReviews)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError("");
    if (form.rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
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
    setSubmitted(true);
    setShowForm(false);
  }

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-slate-900 sticky top-0 z-50 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo height={38} />
          </Link>
          <Link href="/register" className="bg-gold-500 hover:bg-gold-400 text-slate-900 font-bold text-sm px-4 py-2 rounded-lg transition-colors">
            Join Affiliate Program
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-3">Client Reviews & Ratings</h1>
          <p className="text-slate-500 text-lg">Real feedback from our trading education students</p>
          {reviews.length > 0 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-2xl font-black text-slate-900">{avgRating.toFixed(1)}</span>
              <span className="text-slate-500 text-sm">({reviews.length} reviews)</span>
            </div>
          )}
        </div>

        {/* Submit review */}
        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mb-8">
            <p className="text-green-700 font-bold text-lg mb-1">Thank you for your review!</p>
            <p className="text-green-600 text-sm">Your review is pending approval and will appear here once verified.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8">
            {!showForm ? (
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Share Your Experience</p>
                  <p className="text-slate-500 text-sm">Help others by writing a review</p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gold-500 hover:bg-gold-400 text-slate-900 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
                >
                  Write a Review
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                <h2 className="font-bold text-slate-900 mb-5">Write Your Review</h2>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Name *</label>
                      <input
                        required
                        value={form.clientName}
                        onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                        placeholder="John Doe"
                        className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email (optional)</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="john@email.com"
                        className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Your Rating *</label>
                    <StarPicker value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Review *</label>
                    <textarea
                      required
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      placeholder="Share your trading experience with Dominators Club..."
                      rows={4}
                      className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-slate-900 font-black px-6 py-2.5 rounded-lg transition-colors"
                    >
                      {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="text-slate-500 hover:text-slate-700 font-semibold px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Reviews list */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading reviews...</div>
        ) : !reviews.length ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gold-500 font-black text-sm">
                      {review.clientName[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <p className="font-bold text-slate-900">{review.clientName}</p>
                      <StarRating rating={review.rating} />
                      <span className="text-slate-400 text-xs">{formatDate(review.createdAt)}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{review.content}</p>
                    {review.imageUrl && (
                      <img
                        src={review.imageUrl}
                        alt="Trading result"
                        className="mt-3 rounded-xl max-h-56 object-cover border border-slate-200"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
