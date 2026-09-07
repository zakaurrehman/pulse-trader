"use client";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import { StarRating } from "@/components/StarRating";

interface Review {
  id: string;
  clientName: string;
  email: string | null;
  rating: number;
  content: string;
  imageUrl: string | null;
  status: string;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then(setReviews)
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: "APPROVED" | "REJECTED") {
    setUpdating(id);
    const res = await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    }
    setUpdating(null);
  }

  const filtered = filter === "ALL" ? reviews : reviews.filter((r) => r.status === filter);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/15 text-yellow-400",
    APPROVED: "bg-green-500/15 text-green-400",
    REJECTED: "bg-red-500/15 text-red-400",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-ink">Client Reviews</h1>
        <p className="text-mist mt-1">Approve or reject client reviews before they go public</p>
      </div>

      {/* Counts */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              filter === s ? "border-gold-500 bg-gold-500/10" : "border-hairline bg-panel hover:border-gold-500/30"
            }`}
          >
            <p className="text-fog text-xs font-semibold uppercase tracking-wider mb-1">{s}</p>
            <p className="text-2xl font-black text-ink">{reviews.filter((r) => r.status === s).length}</p>
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
              filter === f ? "bg-gold-500 text-void" : "bg-panel text-mist border border-hairline hover:bg-abyss"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-10 text-center text-fog">Loading...</div>
      ) : !filtered.length ? (
        <div className="bg-panel rounded-2xl border border-hairline p-10 text-center text-fog text-sm">
          No reviews in this category.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <div key={review.id} className="bg-panel rounded-2xl border border-hairline shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-bold text-ink">{review.clientName}</p>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${statusColors[review.status]}`}>
                      {review.status}
                    </span>
                  </div>
                  {review.email && <p className="text-fog text-xs mb-2">{review.email}</p>}
                  <StarRating rating={review.rating} />
                  <p className="text-mist text-sm mt-3 leading-relaxed">{review.content}</p>
                  {review.imageUrl && (
                    <img
                      src={review.imageUrl}
                      alt="Review attachment"
                      className="mt-3 rounded-lg max-h-48 object-cover border border-hairline"
                    />
                  )}
                  <p className="text-fog text-xs mt-3">{formatDate(review.createdAt)}</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {review.status !== "APPROVED" && (
                    <button
                      onClick={() => updateStatus(review.id, "APPROVED")}
                      disabled={updating === review.id}
                      className="bg-green-500/15 hover:bg-green-500/25 text-green-400 font-semibold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  {review.status !== "REJECTED" && (
                    <button
                      onClick={() => updateStatus(review.id, "REJECTED")}
                      disabled={updating === review.id}
                      className="bg-red-500/15 hover:bg-red-500/25 text-red-400 font-semibold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
