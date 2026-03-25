"use client";

import { useEffect, useRef } from "react";
import { useMagnetic } from "@/hooks/useMagnetic";

const SOCIALS = [
  { label: "GitHub",   href: "#", symbol: "↗" },
  { label: "LinkedIn", href: "#", symbol: "↗" },
  { label: "Dribbble", href: "#", symbol: "↗" },
];

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const emailRef   = useRef<HTMLAnchorElement>(null);
  const socialsRef = useRef<HTMLDivElement>(null);
  const ctaBtnRef  = useMagnetic<HTMLAnchorElement>(0.4, 100);

  useEffect(() => {
    const init = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const els = [headingRef.current, emailRef.current, socialsRef.current];
      els.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.9, delay: i * 0.15, ease: "power2.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
          }
        );
      });
    };
    init();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{
        padding: "10rem 6vw 8rem",
        backgroundColor: "var(--color-bg)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow behind heading */}
      <div
        aria-hidden="true"
        className="animate-glow-pulse"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(196,168,130,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
          textAlign: "center",
        }}
      >
        {/* Section label */}
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-body)",
            fontSize: "0.65rem",
            fontWeight: 500,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "var(--color-brown)",
            marginBottom: "2.5rem",
          }}
        >
          03 — Contact
        </span>

        {/* Big CTA headline */}
        <h2
          ref={headingRef}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3rem, 8vw, 7.5rem)",
            fontWeight: 300,
            fontStyle: "italic",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            color: "var(--color-ivory)",
            marginBottom: "3rem",
          }}
        >
          Let&apos;s Build<br />
          <span style={{ color: "var(--color-gold)" }}>Something.</span>
        </h2>

        {/* Email link */}
        <a
          ref={(el) => {
            // assign to both refs
            (emailRef as React.MutableRefObject<HTMLAnchorElement | null>).current = el;
            (ctaBtnRef as React.MutableRefObject<HTMLAnchorElement | null>).current = el;
          }}
          href="mailto:hello@yourname.com"
          style={{
            display: "inline-block",
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.9rem, 1.8vw, 1.2rem)",
            fontWeight: 400,
            letterSpacing: "0.05em",
            color: "var(--color-brown)",
            textDecoration: "none",
            position: "relative",
            marginBottom: "3.5rem",
            paddingBottom: "4px",
            cursor: "none",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-gold)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-brown)";
          }}
        >
          hello@yourname.com
          <span
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "1px",
              backgroundColor: "var(--color-gold)",
              transform: "scaleX(0)",
              transformOrigin: "left",
              transition: "transform 0.4s ease",
            }}
            className="email-underline"
          />
        </a>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            width: "120px",
            backgroundColor: "var(--color-border)",
            margin: "0 auto 3rem",
          }}
        />

        {/* Social links */}
        <div
          ref={socialsRef}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "3rem",
          }}
        >
          {SOCIALS.map(({ label, href, symbol }) => (
            <a
              key={label}
              href={href}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.7rem",
                fontWeight: 500,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "var(--color-brown)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                cursor: "none",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-ivory)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-brown)";
              }}
            >
              {label}
              <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>{symbol}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
