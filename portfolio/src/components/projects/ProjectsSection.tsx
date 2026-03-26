"use client";

import { useEffect, useRef } from "react";
import { log } from "@/lib/logger";
import { motion } from "framer-motion";
import { PROJECTS } from "@/data/projects";
import SpotlightDeck from "./SpotlightDeck";

export default function ProjectsSection() {
  const labelRef   = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lineRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    log.info("INIT", "ProjectsSection mounted", { count: PROJECTS.length });
    const init = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const els = [labelRef.current, headingRef.current];
      els.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(el,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, delay: i * 0.1, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%" } }
        );
      });

      if (lineRef.current) {
        gsap.fromTo(lineRef.current,
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 1, ease: "power3.inOut",
            scrollTrigger: { trigger: lineRef.current, start: "top 88%" } }
        );
      }
    };
    init();
  }, []);

  return (
    <section
      id="projects"
      style={{ padding: "8rem 6vw", backgroundColor: "var(--color-bg)" }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
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
            marginBottom: "1.25rem",
          }}
        >
          02 — Selected Work
        </span>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <h2
            ref={headingRef}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              color: "var(--color-ivory)",
              lineHeight: 1.1,
            }}
          >
            Things I&apos;ve built.
          </h2>

          {/* Animated count */}
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--color-border)",
            }}
          >
            {PROJECTS.length} projects
          </motion.span>
        </div>

        {/* Animated divider line */}
        <div
          ref={lineRef}
          style={{
            height: "1px",
            backgroundColor: "var(--color-border)",
            marginBottom: "3rem",
          }}
        />

        <SpotlightDeck />
      </div>
    </section>
  );
}
