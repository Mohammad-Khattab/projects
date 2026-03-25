"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { log } from "@/lib/logger";
import { useTilt } from "@/hooks/useTilt";
import type { Project } from "@/data/projects";

/* ── Per-card icon marks ──────────────────────────── */
const ICONS: Record<number, string> = { 1: "◈", 2: "⬡", 3: "◎" };

export default function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const { ref, sheenRef, onMouseMove, onMouseLeave } = useTilt<HTMLDivElement>({
    maxTilt: 8,
    perspective: 1000,
    scale: 1.02,
  });

  const arrowRef = useRef<HTMLSpanElement>(null);

  return (
    <motion.div
      initial={{ y: 56, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.75, delay: index * 0.14, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={(e) => {
          onMouseLeave(e);
          if (arrowRef.current) arrowRef.current.style.transform = "translateX(0)";
        }}
        onMouseEnter={() => {
          if (arrowRef.current) arrowRef.current.style.transform = "translateX(6px)";
        }}
        style={{
          position: "relative",
          backgroundColor: "var(--color-surface)",
          /* dot-grid texture — matches reference */
          backgroundImage:
            "radial-gradient(circle, rgba(167,146,119,0.12) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          border: "1px solid var(--color-border)",
          overflow: "hidden",
          cursor: "none",
          willChange: "transform",
          transition: "border-color 0.35s ease, box-shadow 0.35s ease",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseOver={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "var(--color-gold)";
          el.style.boxShadow = "0 0 32px rgba(196,168,130,0.1), 0 8px 40px rgba(0,0,0,0.4)";
          log.info("INTERACT", `Project card hover: "${project.title}"`);
        }}
        onMouseOut={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "var(--color-border)";
          el.style.boxShadow = "none";
        }}
      >
        {/* Sheen overlay */}
        <div
          ref={sheenRef}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 3,
            opacity: 0,
            transition: "opacity 0.2s ease",
          }}
        />

        {/* Top bar — icon + year */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.4rem 1.6rem 0",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Animated icon mark */}
          <motion.span
            animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 + index * 0.8, ease: "easeInOut" }}
            style={{
              fontSize: "1.6rem",
              color: "var(--color-gold)",
              lineHeight: 1,
              display: "block",
              filter: "drop-shadow(0 0 8px rgba(196,168,130,0.4))",
            }}
          >
            {ICONS[project.id] ?? "◆"}
          </motion.span>

          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.6rem",
              fontWeight: 500,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--color-border)",
            }}
          >
            {project.year}
          </span>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "1rem 1.6rem 1.6rem",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Title */}
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.65rem",
              fontWeight: 400,
              lineHeight: 1.15,
              color: "var(--color-ivory)",
              marginBottom: "0.6rem",
              letterSpacing: "-0.01em",
            }}
          >
            {project.title}
          </h3>

          {/* Tags — pill style like reference */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
            {project.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.55rem",
                  fontWeight: 500,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-brown)",
                  padding: "0.2rem 0.55rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(107,81,64,0.5)",
                  backgroundColor: "rgba(167,146,119,0.06)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "linear-gradient(to right, var(--color-border), transparent)",
              marginBottom: "1rem",
            }}
          />

          {/* Description */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.85rem",
              lineHeight: 1.75,
              fontWeight: 300,
              color: "var(--color-ivory)",
              opacity: 0.75,
              flex: 1,
              marginBottom: "1.4rem",
            }}
          >
            {project.description}
          </p>

          {/* CTA */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button
              onClick={() => log.info("INTERACT", `Project CTA clicked: "${project.title}"`, { id: project.id })}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontFamily: "var(--font-body)",
                fontSize: "0.6rem",
                fontWeight: 600,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "var(--color-gold)",
                background: "transparent",
                border: "none",
                cursor: "none",
                padding: 0,
              }}
            >
              Explore
              <span
                ref={arrowRef}
                style={{ transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)", display: "inline-block" }}
              >
                →
              </span>
            </button>

            {/* Project number — bottom right, large watermark */}
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.5rem",
                fontWeight: 300,
                color: "rgba(107,81,64,0.25)",
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              0{project.id}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
