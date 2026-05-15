"use client";
import { useEffect, useRef } from "react";

export default function VideoPlayer({ url }: { url: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  // Reset player when video URL changes
  useEffect(() => {
    if (ref.current) {
      ref.current.load();
    }
  }, [url]);

  return (
    <video
      ref={ref}
      controls
      className="w-full aspect-video bg-black"
      preload="metadata"
    >
      <source src={url} />
      Your browser does not support video playback.
    </video>
  );
}
