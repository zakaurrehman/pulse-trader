import Image from "next/image";
import type { CSSProperties } from "react";

const wrapStyle: CSSProperties = {
  mixBlendMode: "screen",
  display: "inline-block",
  lineHeight: 0,
  flexShrink: 0,
};

export default function Logo({ height = 40 }: { height?: number }) {
  return (
    <span style={wrapStyle}>
      <Image
        src="/The Pulse Traders Png.png"
        alt="The Pulse Traders"
        width={300}
        height={200}
        priority
        style={{ height: `${height}px`, width: "auto", display: "block" }}
      />
    </span>
  );
}
