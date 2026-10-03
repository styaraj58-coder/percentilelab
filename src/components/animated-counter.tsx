"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({
  value,
  duration = 1200,
}: {
  value: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Starts at the real value so the server-rendered HTML (search engines,
  // no-JS visitors, slow connections) shows the true number, never "0".
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setDisplay(value);
      return;
    }

    // The parent <Reveal> keeps this hidden until scrolled into view, so
    // resetting to 0 here is never seen - it just primes the count-up.
    setDisplay(0);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        function tick(now: number) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}
