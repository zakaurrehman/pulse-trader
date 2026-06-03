import Image from "next/image";

export default function Logo({ height = 40 }: { height?: number }) {
  // Intrinsic size: 2966×790. Width auto-calculated from height to preserve 3.75:1 ratio.
  return (
    <Image
      src="/logo.png"
      alt="Dominators Club"
      width={2966}
      height={790}
      priority
      style={{ height: `${height}px`, width: "auto", display: "block" }}
    />
  );
}
