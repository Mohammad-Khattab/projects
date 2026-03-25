"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import HeroText from "./HeroText";
import ScrollCue from "./ScrollCue";

// Three.js canvas — no SSR
const HeroCanvas = dynamic(() => import("./HeroCanvas"), {
  ssr: false,
  loading: () => null,
});

export default function HeroSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: "600px",
        overflow: "hidden",
        backgroundColor: "var(--color-bg)",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Gradient vignette — bottom fade */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 70% 50%, rgba(167,146,119,0.06) 0%, transparent 65%), linear-gradient(to bottom, transparent 60%, rgba(28,20,16,0.95) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* 3D Canvas — right-side focal point (desktop only) */}
      {!isMobile && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: "-5%",
            width: "65%",
            height: "100%",
            zIndex: 0,
            opacity: 0.85,
          }}
        >
          <HeroCanvas />
        </div>
      )}

      {/* Mobile gradient fallback */}
      {isMobile && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 80% 20%, rgba(196,168,130,0.12) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(167,146,119,0.08) 0%, transparent 50%)",
            zIndex: 0,
          }}
        />
      )}

      {/* Text content */}
      <HeroText />

      {/* Scroll indicator */}
      <ScrollCue />
    </section>
  );
}
