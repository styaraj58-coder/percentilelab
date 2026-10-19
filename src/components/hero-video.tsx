"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "deciding" | "autoplay" | "tap";

// The home page's promo video is several megabytes. Large screens on a normal
// connection get the silent loop, started only once it is about to scroll into
// view. Phones, data-saver mode, slow connections and "reduce motion" get a
// plain poster with a Play button instead and download nothing until tapped.
export function HeroVideo({ src }: { src: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("deciding");
  const [near, setNear] = useState(false);
  const [tapped, setTapped] = useState(false);

  useEffect(() => {
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    const phone = window.matchMedia("(max-width: 767px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slow = Boolean(connection?.saveData) || /(^|-)2g$/.test(connection?.effectiveType ?? "");
    setMode(phone || reduced || slow ? "tap" : "autoplay");
  }, []);

  useEffect(() => {
    if (mode !== "autoplay" || !wrapRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, [mode]);

  if (mode === "autoplay" && near) {
    return <video src={src} autoPlay loop muted playsInline className="h-full w-full object-cover" />;
  }

  if (mode === "tap" && tapped) {
    return <video src={src} autoPlay loop playsInline controls className="h-full w-full object-contain" />;
  }

  return (
    <div ref={wrapRef} className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-navy to-brand-navy-light">
      {mode === "tap" && (
        <button
          type="button"
          onClick={() => setTapped(true)}
          className="group flex flex-col items-center gap-3 text-white"
          aria-label="Play the Percentile Lab video"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold text-brand-navy shadow-lg transition-transform group-active:scale-95">
            <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7" aria-hidden="true">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
            </svg>
          </span>
          <span className="text-sm font-semibold">Watch the video</span>
        </button>
      )}
    </div>
  );
}
