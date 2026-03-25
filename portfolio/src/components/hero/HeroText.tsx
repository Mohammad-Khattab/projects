"use client";

import { useEffect, useRef } from "react";
import { useMagnetic } from "@/hooks/useMagnetic";

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

      const name     = nameRef.current;
      const line     = lineRef.current;
      const sub      = subRef.current;
      const ctaWrap  = ctaWrapRef.current;
      if (!name || !line || !sub || !ctaWrap) return;

      // ── Split name into per-char spans ──
      const raw = name.dataset.text || name.textContent || "";
      name.innerHTML = raw
        .split("")
        .map((ch) =>
          `<span class="char-wrap" style="display:inline-block;overflow:hidden;vertical-align:bottom"><span class="char" style="display:inline-block">${ch === " " ? "&nbsp;" : ch}</span></span>`
        )
        .join("");

      const chars = name.querySelectorAll<HTMLElement>(".char");

      // Set initial states
      gsap.set(chars,   { y: "110%", opacity: 0 });
      gsap.set(line,    { scaleX: 0, transformOrigin: "left center" });
      gsap.set(sub,     { y: 24, opacity: 0 });
      gsap.set(ctaWrap, { y: 20, opacity: 0 });

      const tl = gsap.timeline({ delay: 0.5 });

      tl.to(chars,   { y: "0%", opacity: 1, duration: 0.9, stagger: 0.035, ease: "power3.out" })
        .to(line,    { scaleX: 1, duration: 0.7, ease: "power2.inOut" }, "-=0.5")
        .to(sub,     { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.4")
        .to(ctaWrap, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.3");
    };

    init();
  }, []);

  const handleScrollToWork = () => {
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
        data-text="YOUR NAME"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(3.5rem, 10vw, 9rem)",
          fontWeight: 300,
          letterSpacing: "-0.02em",
          lineHeight: 0.95,
          color: "var(--color-ivory)",
          marginBottom: "1.2rem",
        }}
      >
        YOUR NAME
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
        Full Stack Developer &amp; Designer
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
