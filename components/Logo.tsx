import type { CSSProperties } from "react";

export default function Logo({ height = 40 }: { height?: number }) {
  const scale = height / 40;

  const wrapStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: `${Math.round(7 * scale)}px`,
    lineHeight: 1,
    flexShrink: 0,
  };

  const badgeStyle: CSSProperties = {
    width: `${Math.round(height * 0.88)}px`,
    height: `${Math.round(height * 0.88)}px`,
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    borderRadius: `${Math.round(5 * scale)}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const letterStyle: CSSProperties = {
    color: "#0f172a",
    fontWeight: 900,
    fontSize: `${Math.round(height * 0.54)}px`,
    letterSpacing: "-0.04em",
    fontFamily: "system-ui, -apple-system, sans-serif",
    lineHeight: 1,
  };

  const textWrap: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.15,
  };

  const topStyle: CSSProperties = {
    color: "currentColor",
    fontWeight: 900,
    fontSize: `${Math.round(height * 0.4)}px`,
    letterSpacing: "-0.02em",
    fontFamily: "system-ui, -apple-system, sans-serif",
    whiteSpace: "nowrap",
  };

  const subStyle: CSSProperties = {
    color: "#f59e0b",
    fontWeight: 700,
    fontSize: `${Math.round(height * 0.27)}px`,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    fontFamily: "system-ui, -apple-system, sans-serif",
    whiteSpace: "nowrap",
  };

  return (
    <span style={wrapStyle}>
      <span style={badgeStyle}>
        <span style={letterStyle}>D</span>
      </span>
      <span style={textWrap}>
        <span style={topStyle}>Dominators</span>
        <span style={subStyle}>Club</span>
      </span>
    </span>
  );
}
