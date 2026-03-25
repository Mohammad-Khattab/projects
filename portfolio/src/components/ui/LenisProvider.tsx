"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { log, measureAsync } from "@/lib/logger";

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const init = async () => {
      const gsap = await measureAsync("GSAP import", () => import("gsap").then(m => m.default));
      const { ScrollTrigger } = await measureAsync("ScrollTrigger import", () => import("gsap/ScrollTrigger"));
      gsap.registerPlugin(ScrollTrigger);
      log.info("INIT", "GSAP + ScrollTrigger registered");

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 2,
      });
      lenisRef.current = lenis;
      log.info("INIT", "Lenis smooth scroll initialized", { duration: 1.2 });

      let lastLoggedSection = "";
      let scrollEventCount = 0;

      lenis.on("scroll", (e: { scroll: number; limit: number; velocity: number; direction: number; progress: number }) => {
        ScrollTrigger.update();
        scrollEventCount++;

        // Log scroll milestones (not every frame — too noisy)
        if (scrollEventCount % 60 === 0) {
          log.info("SCROLL", `Scroll tick #${scrollEventCount}`, {
            progress: `${(e.progress * 100).toFixed(1)}%`,
            velocity: e.velocity.toFixed(3),
            direction: e.direction === 1 ? "down" : "up",
            position: `${Math.round(e.scroll)}px / ${Math.round(e.limit)}px`,
          });
        }

        // Log section entries
        const sections = ["hero", "about", "projects", "contact"];
        for (const id of sections) {
          const el = document.getElementById(id);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (rect.top <= 80 && rect.bottom > 80 && lastLoggedSection !== id) {
            lastLoggedSection = id;
            log.info("SCROLL", `Entered section: #${id}`, {
              scrollY: Math.round(e.scroll),
            });
          }
        }
      });

      const tickerCb = (time: number) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(tickerCb);
      gsap.ticker.lagSmoothing(0);
      log.info("SCROLL", "Lenis + GSAP ticker synced");

      return () => {
        log.info("SCROLL", `Lenis destroyed after ${scrollEventCount} scroll events`);
        gsap.ticker.remove(tickerCb);
        lenis.destroy();
      };
    };

    let cleanup: (() => void) | undefined;
    init().then((fn) => { cleanup = fn; }).catch((err) => {
      log.error("SCROLL", "Lenis/GSAP init failed", err);
    });

    return () => { cleanup?.(); };
  }, []);

  return <>{children}</>;
}
