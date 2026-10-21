"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const NUMBER_RE = /^(-?\d+(?:\.\d+)?)(.*)$/;

function splitValue(value: string) {
  const match = value.trim().match(NUMBER_RE);
  if (!match) return null;
  return { target: Number(match[1]), suffix: match[2] || "" };
}

export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const parsed = useMemo(() => splitValue(value), [value]);
  const [animated, setAnimated] = useState(value);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || !parsed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) setStarted(true);
      },
      { threshold: 0.45 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [parsed]);

  useEffect(() => {
    if (!started || !parsed) return;

    const integerMode = Number.isInteger(parsed.target);
    const formatter = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: integerMode ? 0 : 1,
      minimumFractionDigits: integerMode ? 0 : 1,
    });

    let raf = 0;
    const start = performance.now();
    const duration = 1200;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = parsed.target * eased;
      const rendered = integerMode ? Math.round(next) : Number(next.toFixed(1));
      setAnimated(`${formatter.format(rendered)}${parsed.suffix}`);
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setAnimated(value);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [parsed, started, value]);

  return <span ref={ref} className={className} aria-label={value}>{started && parsed ? animated : value}</span>;
}
