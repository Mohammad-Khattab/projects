"use client";

import { useEffect } from "react";
import { log } from "@/lib/logger";

export default function PageLogger() {
  useEffect(() => {
    const t0 = performance.now();

    log.group("Portfolio — Page Init");
    log.info("INIT", "Document loaded", {
      url: window.location.href,
      viewport: `${window.innerWidth}×${window.innerHeight}`,
      dpr: window.devicePixelRatio,
      userAgent: navigator.userAgent.slice(0, 80),
      touch: window.matchMedia("(pointer: coarse)").matches,
    });

    // Fonts
    document.fonts.ready.then(() => {
      log.info("INIT", "Fonts ready", {
        loaded: [...document.fonts].map((f) => `${f.family} ${f.weight}`).slice(0, 10),
      });
    });

    // Performance metrics via PerformanceObserver
    if (typeof PerformanceObserver !== "undefined") {
      // LCP
      try {
        const lcpObs = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
          log.perf("LCP (Largest Contentful Paint)", last.startTime);
        });
        lcpObs.observe({ type: "largest-contentful-paint", buffered: true });

        // CLS
        const clsObs = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const e = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
            if (!e.hadRecentInput) {
              log.info("PERF", `CLS shift: ${e.value.toFixed(4)}`);
            }
          }
        });
        clsObs.observe({ type: "layout-shift", buffered: true });

        // FID / interaction
        const fidObs = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const e = entry as PerformanceEntry & { processingStart: number; startTime: number };
            log.perf("First Input Delay", e.processingStart - e.startTime);
          }
        });
        fidObs.observe({ type: "first-input", buffered: true });
      } catch (err) {
        log.info("PERF", "PerformanceObserver partially unavailable", err);
      }
    }

    // Time to interactive (rough)
    const onLoad = () => {
      log.perf("Page load (window.onload)", performance.now() - t0);
      log.groupEnd();
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    // Unhandled errors
    const onError = (e: ErrorEvent) => {
      log.error("ERROR", "Unhandled window error", {
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        col: e.colno,
      });
    };
    const onUnhandledRejection = (e: PromiseRejectionEvent) => {
      log.error("ERROR", "Unhandled promise rejection", e.reason);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
