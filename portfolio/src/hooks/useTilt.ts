"use client";

import { useRef, useCallback } from "react";

interface TiltOptions {
  maxTilt?: number;    // degrees
  perspective?: number; // px
  scale?: number;
}

export function useTilt<T extends HTMLElement>({
  maxTilt = 12,
  perspective = 900,
  scale = 1.03,
}: TiltOptions = {}) {
  const ref = useRef<T>(null);
  const sheenRef = useRef<HTMLDivElement | null>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;   // 0–1
      const y = (e.clientY - rect.top)  / rect.height;  // 0–1

      const rotX =  (0.5 - y) * maxTilt * 2;
      const rotY = -(0.5 - x) * maxTilt * 2;

      el.style.transform = `perspective(${perspective}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
      el.style.transition = "transform 0.1s linear";

      // Sheen position
      if (sheenRef.current) {
        sheenRef.current.style.opacity = "1";
        sheenRef.current.style.backgroundImage =
          `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(196,168,130,0.18) 0%, transparent 60%)`;
      }
    },
    [maxTilt, perspective, scale]
  );

  const onMouseLeave = useCallback((_e?: React.MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`;
    el.style.transition = "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)";
    if (sheenRef.current) {
      sheenRef.current.style.opacity = "0";
    }
  }, [perspective]);

  return { ref, sheenRef, onMouseMove, onMouseLeave };
}
