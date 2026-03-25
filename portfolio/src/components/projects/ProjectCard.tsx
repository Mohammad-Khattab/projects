"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useTilt } from "@/hooks/useTilt";
import type { Project } from "@/data/projects";

export default function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const { ref, sheenRef, onMouseMove, onMouseLeave } = useTilt<HTMLDivElement>({
    maxTilt: 10,
    perspective: 1000,
    scale: 1.025,
  });

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{
          position: "relative",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          overflow: "hidden",
          cursor: "none",
          willChange: "transform",
          transition: "border-color 0.3s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-brown)";
        }}
      >
        {/* Sheen overlay */}
        <div
          ref={sheenRef}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 2,
            opacity: 0,
            transition: "opacity 0.3s ease",
          }}
        />

        {/* Card header gradient */}
        <div
          style={{
            height: "160px",
            background: project.accent,
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            padding: "1.5rem",
          }}
        >
          {/* Year badge */}
          <span
            style={{
              position: "absolute",
              top: "1.2rem",
              right: "1.2rem",
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              fontWeight: 500,
              letterSpacing: "0.3em",
              color: "var(--color-brown)",
              textTransform: "uppercase",
            }}
          >
            {project.year}
          </span>

          {/* Project number */}
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "3.5rem",
              fontWeight: 300,
              color: "var(--color-border)",
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            0{project.id}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: "1.75rem" }}>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.6rem",
              fontWeight: 400,
              color: "var(--color-ivory)",
              marginBottom: "0.75rem",
              lineHeight: 1.2,
            }}
          >
            {project.title}
          </h3>

          {/* Tags */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "1.25rem",
            }}
          >
            {project.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.6rem",
                  fontWeight: 500,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--color-brown)",
                  padding: "0.25rem 0.6rem",
                  border: "1px solid var(--color-border)",
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
              backgroundColor: "var(--color-border)",
              marginBottom: "1.25rem",
            }}
          />

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              lineHeight: 1.75,
              fontWeight: 300,
              color: "var(--color-ivory)",
              opacity: 0.8,
              marginBottom: "1.5rem",
            }}
          >
            {project.description}
          </p>

          {/* CTA */}
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              fontWeight: 500,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--color-gold)",
              background: "transparent",
              border: "none",
              cursor: "none",
              padding: 0,
              transition: "gap 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.gap = "1rem";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.gap = "0.6rem";
            }}
          >
            View Project <span>→</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
