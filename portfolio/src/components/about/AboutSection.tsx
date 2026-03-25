"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import MarqueeStrip from "./MarqueeStrip";

const About3DOrb = dynamic(() => import("./About3DOrb"), { ssr: false });

export default function AboutSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const headingRef  = useRef<HTMLHeadingElement>(null);
  const bio1Ref     = useRef<HTMLParagraphElement>(null);
  const bio2Ref     = useRef<HTMLParagraphElement>(null);
  const labelRef    = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const initGsap = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const heading = headingRef.current;
      const bio1    = bio1Ref.current;
      const bio2    = bio2Ref.current;
      const label   = labelRef.current;
      if (!heading || !bio1 || !bio2 || !label) return;

      // Clip-path reveal on heading
      gsap.fromTo(
        heading,
        { clipPath: "inset(0 100% 0 0)", opacity: 1 },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 1.1,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: heading,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // Label fade
      gsap.fromTo(
        label,
        { x: -20, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: label, start: "top 85%" },
        }
      );

      // Bio paragraphs stagger
      gsap.fromTo(
        [bio1, bio2],
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power2.out",
          scrollTrigger: { trigger: bio1, start: "top 82%" },
        }
      );
    };

    initGsap();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{
        padding: "10rem 6vw 6rem",
        backgroundColor: "var(--color-bg)",
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Section label */}
      <span
        ref={labelRef}
        style={{
          display: "block",
          fontFamily: "var(--font-body)",
          fontSize: "0.65rem",
          fontWeight: 500,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "var(--color-brown)",
          marginBottom: "1.5rem",
        }}
      >
        01 — About
      </span>

      {/* Heading + Orb row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "3rem",
          flexWrap: "wrap",
          marginBottom: "3rem",
        }}
      >
        <h2
          ref={headingRef}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
            fontWeight: 300,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "var(--color-ivory)",
            maxWidth: "560px",
            clipPath: "inset(0 100% 0 0)",
          }}
        >
          Crafting digital experiences at the intersection of code &amp; design.
        </h2>

        <About3DOrb />
      </div>

      {/* Bio */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2.5rem",
          maxWidth: "840px",
        }}
      >
        <p
          ref={bio1Ref}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "1rem",
            lineHeight: 1.8,
            fontWeight: 300,
            color: "var(--color-ivory)",
            opacity: 0.85,
          }}
        >
          I'm a full-stack developer and designer who builds things that feel as good as they look. I work across the entire stack — from data models to pixel-perfect interfaces — with a bias towards clean architecture and expressive design.
        </p>
        <p
          ref={bio2Ref}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "1rem",
            lineHeight: 1.8,
            fontWeight: 300,
            color: "var(--color-brown)",
          }}
        >
          Based in the intersection between engineering and craft, I believe the best digital products are built by people who respect both disciplines equally. Every line of code is a design decision.
        </p>
      </div>

      {/* Marquee skills strip */}
      <MarqueeStrip />
    </section>
  );
}
