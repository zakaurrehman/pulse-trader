"use client";

import { useEffect } from "react";

// Keeps the single-page nav working (smooth-scroll to each section) without leaving
// a #fragment in the address bar — so the URL stays clean, e.g. thedominatorclub.com/
export default function CleanHashLinks() {
  useEffect(() => {
    // If someone lands on a hashed URL (e.g. a bookmarked /#home), scroll to the
    // target once and then wipe the hash from the address bar.
    if (window.location.hash) {
      const el = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      el?.scrollIntoView();
    }

    // Intercept clicks on in-page anchor links so they scroll smoothly and never
    // append a #fragment to the URL. Let modified clicks (new tab, etc.) pass through.
    function handleClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href")?.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
