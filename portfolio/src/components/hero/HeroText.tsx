"use client";

import { useEffect, useRef } from "react";
import { useMagnetic } from "@/hooks/useMagnetic";
import { log } from "@/lib/logger";

export default function HeroText() {
  const nameRef    = useRef<HTMLHeadingElement>(null);
  const lineRef    = useRef<HTMLDivElement>(null);
  const subRef     = useRef<HTMLParagraphElement>(null);
  const ctaWrapRef = useRef<HTMLDivElement>(null);
  const ctaBtnRef  = useMagnetic<HTMLButtonElement>(0.45, 90);

  useEffect(() => {
    let gsap: typeof import("gsap").default;

    const init = async () => {
      gsap = (await import("gsap")).default;
      log.info("INIT", "HeroText GSAP loaded");

      const name     = nameRef.current;
      const line     = lineRef.current;
      const sub      = subRef.current;
      const ctaWrap  = ctaWrapRef.current;
      if (!name || !line || !sub || !ctaWrap) {
        log.error("ANIM", "HeroText refs not ready");
        return;
      }

      // ── Split name into per-char spans, \n becomes a line break ──
      const raw = name.dataset.text || "";
      name.innerHTML = raw
        .split("")
        .map((ch) => {
          if (ch === "\n") return `<br />`;
          return `<span class="char-wrap" style="display:inline-block;overflow:hidden;vertical-align:bottom"><span class="char" style="display:inline-block">${ch === " " ? "&nbsp;" : ch}</span></span>`;
        })
        .join("");

      const chars = name.querySelectorAll<HTMLElement>(".char");

      // Set initial states
      gsap.set(chars,   { y: "110%", opacity: 0 });
      gsap.set(line,    { scaleX: 0, transformOrigin: "left center" });
      gsap.set(sub,     { y: 24, opacity: 0 });
      gsap.set(ctaWrap, { y: 20, opacity: 0 });

      log.info("ANIM", "HeroText reveal starting", { chars: chars.length, delay: "0.5s" });
      const t0 = performance.now();
      const tl = gsap.timeline({
        delay: 0.5,
        onStart: () => log.info("ANIM", "HeroText timeline started"),
        onComplete: () => log.perf("HeroText full reveal", performance.now() - t0),
      });

      tl.to(chars,   { y: "0%", opacity: 1, duration: 0.9, stagger: 0.035, ease: "power3.out" })
        .to(line,    { scaleX: 1, duration: 0.7, ease: "power2.inOut" }, "-=0.5")
        .to(sub,     { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.4")
        .to(ctaWrap, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.3");
    };

    init();
  }, []);

  const handleScrollToWork = () => {
    log.info("INTERACT", "CTA 'View My Work' clicked — scrolling to #projects");
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="relative z-10 flex flex-col justify-center h-full"
      style={{ padding: "0 6vw", maxWidth: "860px" }}
    >
      {/* Name */}
      <h1
        ref={nameRef}
        data-text={"Mohammad\nKhattab"}
        style={{
          fontFamily: "var(--font-surgena)",
          fontSize: "clamp(3rem, 6.5vw, 6.5rem)",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 0.95,
          color: "var(--color-ivory)",
          marginBottom: "1.2rem",
        }}
      >
        Mohammad<br />Khattab
      </h1>

      {/* Divider line */}
      <div
        ref={lineRef}
        style={{
          height: "1px",
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "var(--color-brown)",
          marginBottom: "1.2rem",
        }}
      />

      {/* Subtitle */}
      <p
        ref={subRef}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(0.8rem, 1.4vw, 1rem)",
          fontWeight: 400,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "var(--color-brown)",
          marginBottom: "3rem",
        }}
      >
        Industrial Engineer · Web Designer
      </p>

      {/* CTA */}
      <div ref={ctaWrapRef}>
        <button
          ref={ctaBtnRef}
          onClick={handleScrollToWork}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "1rem",
            padding: "0.9rem 2rem",
            border: "1px solid var(--color-border)",
            background: "transparent",
            color: "var(--color-gold)",
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            fontWeight: 500,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            cursor: "none",
            transition: "border-color 0.3s ease, background 0.3s ease, color 0.3s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.borderColor = "var(--color-gold)";
            el.style.background   = "rgba(196,168,130,0.06)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.borderColor = "var(--color-border)";
            el.style.background  = "transparent";
          }}
        >
          View My Work
          <span
            style={{
              display: "inline-block",
              transition: "transform 0.3s ease",
            }}
            className="btn-arrow"
          >
            →
          </span>
        </button>
      </div>
    </div>
  );
}
