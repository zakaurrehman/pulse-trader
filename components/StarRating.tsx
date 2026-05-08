"use client";

export function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`text-lg ${i < rating ? "text-amber-400" : "text-slate-300"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-3xl transition-colors hover:scale-110 ${
            star <= value ? "text-amber-400" : "text-slate-300 hover:text-amber-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
