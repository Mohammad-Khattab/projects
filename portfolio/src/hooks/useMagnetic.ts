"use client";

import { useRef, useEffect } from "react";

export function useMagnetic<T extends HTMLElement>(strength = 0.4, radius = 80) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        const pull = (radius - dist) / radius;
        el.style.transform = `translate(${dx * pull * strength}px, ${dy * pull * strength}px)`;
        el.style.transition = "transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)";
      }
    };

    const onMouseLeave = () => {
      el.style.transform = "translate(0, 0)";
      el.style.transition = "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
    };

    window.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [strength, radius]);

  return ref;
}
