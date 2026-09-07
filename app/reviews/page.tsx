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
    <div className="min-h-screen bg-void">
      {/* Navbar */}
      <nav className="bg-abyss/95 backdrop-blur border-b border-hairline sticky top-0 z-50 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo height={38} />
          </Link>
          <Link href="/register" className="bg-gold-500 hover:bg-gold-highlight text-void font-bold text-sm px-4 py-2 rounded-lg transition-colors">
            Join Affiliate Program
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-ink mb-3">Client Reviews & Ratings</h1>
          <p className="text-mist text-lg">Real feedback from our trading education students</p>
          {reviews.length > 0 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-2xl font-black text-ink">{avgRating.toFixed(1)}</span>
              <span className="text-fog text-sm">({reviews.length} reviews)</span>
            </div>
          )}
        </div>

        {/* Submit review */}
        {submitted ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center mb-8">
            <p className="text-green-400 font-bold text-lg mb-1">Thank you for your review!</p>
            <p className="text-green-400/80 text-sm">Your review is pending approval and will appear here once verified.</p>
          </div>
        ) : (
          <div className="bg-panel rounded-2xl border border-hairline shadow-sm mb-8">
            {!showForm ? (
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-bold text-ink">Share Your Experience</p>
                  <p className="text-mist text-sm">Help others by writing a review</p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gold-500 hover:bg-gold-highlight text-void font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
                >
                  Write a Review
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                <h2 className="font-bold text-ink mb-5">Write Your Review</h2>
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-mist mb-1.5">Your Name *</label>
                      <input
                        required
                        value={form.clientName}
                        onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                        placeholder="John Doe"
                        className="w-full bg-abyss border border-hairline rounded-lg px-3.5 py-2.5 text-ink placeholder:text-fog focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-mist mb-1.5">Email (optional)</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="john@email.com"
                        className="w-full bg-abyss border border-hairline rounded-lg px-3.5 py-2.5 text-ink placeholder:text-fog focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-mist mb-2">Your Rating *</label>
                    <StarPicker value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-mist mb-1.5">Your Review *</label>
                    <textarea
                      required
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      placeholder="Share your trading experience with Dominators Club..."
                      rows={4}
                      className="w-full bg-abyss border border-hairline rounded-lg px-3.5 py-2.5 text-ink placeholder:text-fog focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-gold-500 hover:bg-gold-highlight disabled:opacity-60 text-void font-black px-6 py-2.5 rounded-lg transition-colors"
                    >
                      {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="text-mist hover:text-ink font-semibold px-4 py-2.5 rounded-lg border border-hairline hover:bg-abyss transition-colors"
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
          <div className="text-center py-12 text-fog">Loading reviews...</div>
        ) : !reviews.length ? (
          <div className="text-center py-12">
            <p className="text-fog text-lg">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-panel rounded-2xl border border-hairline shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-void border border-hairline rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gold-500 font-black text-sm">
                      {review.clientName[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <p className="font-bold text-ink">{review.clientName}</p>
                      <StarRating rating={review.rating} />
                      <span className="text-fog text-xs">{formatDate(review.createdAt)}</span>
                    </div>
                    <p className="text-mist leading-relaxed">{review.content}</p>
                    {review.imageUrl && (
                      <img
                        src={review.imageUrl}
                        alt="Trading result"
                        className="mt-3 rounded-xl max-h-56 object-cover border border-hairline"
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
