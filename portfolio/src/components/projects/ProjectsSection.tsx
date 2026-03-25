"use client";

import { useEffect, useRef } from "react";
import { PROJECTS } from "@/data/projects";
import ProjectCard from "./ProjectCard";

export default function ProjectsSection() {
  const labelRef   = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const init = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      [labelRef.current, headingRef.current].forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          }
        );
      });
    };
    init();
  }, []);

  return (
    <section
      id="projects"
      style={{
        padding: "8rem 6vw",
        backgroundColor: "var(--color-bg)",
      }}
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
            marginBottom: "1.5rem",
          }}
        >
          02 — Selected Work
        </span>

        <h2
          ref={headingRef}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            color: "var(--color-ivory)",
            marginBottom: "4rem",
            lineHeight: 1.1,
          }}
        >
          Things I&apos;ve built.
        </h2>

        {/* Cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
