"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { PROJECTS, type Project } from "@/data/projects";

function wrap(n: number, len: number) {
  return ((n % len) + len) % len;
}

const ICONS = ["◈", "⬡", "◎", "◇", "△"];

function SpotlightCard({
  project,
  index,
  active,
}: {
  project: Project;
  index: number;
  active: boolean;
}) {
  const num = String(index + 1).padStart(2, "0");

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "16px",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: active
          ? "inset 3px 0 0 var(--color-gold), 0 32px 80px rgba(0,0,0,0.55)"
          : "inset 3px 0 0 var(--color-border), 0 12px 40px rgba(0,0,0,0.35)",
        transition: "box-shadow 0.4s ease",
      }}
    >
      {/* Radial warm glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 90% 0%, rgba(196,168,130,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Watermark number */}
      <div
        style={{
          position: "absolute",
          bottom: "-0.15em",
          right: "0.1em",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(7rem, 18vw, 11rem)",
          fontWeight: 700,
          lineHeight: 1,
          color: active ? "rgba(196,168,130,0.06)" : "rgba(107,81,64,0.07)",
          userSelect: "none",
          pointerEvents: "none",
          letterSpacing: "-0.04em",
          transition: "color 0.4s ease",
        }}
      >
        {num}
      </div>

      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.4rem 1.6rem 0",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.1rem",
            color: active ? "var(--color-gold)" : "var(--color-brown)",
            transition: "color 0.3s ease",
          }}
        >
          {ICONS[index % ICONS.length]}
        </span>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "var(--color-brown)",
            opacity: 0.7,
          }}
        >
          {project.year}
        </span>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "1.2rem 1.6rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            color: "var(--color-ivory)",
            lineHeight: 1.15,
            marginBottom: "1rem",
          }}
        >
          {project.title}
        </h3>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.35rem",
            marginBottom: "1rem",
          }}
        >
          {project.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.55rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-brown)",
                border: "1px solid var(--color-border)",
                borderRadius: "999px",
                padding: "0.25rem 0.65rem",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.82rem",
            lineHeight: 1.65,
            color: "var(--color-brown)",
            opacity: active ? 1 : 0.6,
            transition: "opacity 0.3s ease",
            maxWidth: "36ch",
          }}
        >
          {project.description}
        </p>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          padding: "1.1rem 1.6rem",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.62rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: active ? "var(--color-gold)" : "var(--color-brown)",
            transition: "color 0.3s ease",
            cursor: "pointer",
          }}
        >
          Explore →
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.75rem",
            fontStyle: "italic",
            color: "var(--color-border)",
          }}
        >
          {num}
        </span>
      </div>
    </div>
  );
}

export default function SpotlightDeck() {
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const len = PROJECTS.length;

  const prev = useCallback(() => setActive((a) => wrap(a - 1, len)), [len]);
  const next = useCallback(() => setActive((a) => wrap(a + 1, len)), [len]);

  // Auto-advance every 3.5 s, pause on hover
  React.useEffect(() => {
    if (hovering) return;
    const id = setInterval(() => setActive((a) => wrap(a + 1, len)), 3500);
    return () => clearInterval(id);
  }, [hovering, len]);

  const CARD_W = 420;
  const CARD_H = 500;
  const SPREAD_X = 230;
  const SPREAD_ROT = 10;

  return (
    <div
      style={{ position: "relative", width: "100%" }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* 3D stage */}
      <div
        style={{
          position: "relative",
          height: CARD_H + 80,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {PROJECTS.map((project, i) => {
            const off = i - active;
            const wrapped =
              off > len / 2 ? off - len : off < -len / 2 ? off + len : off;
            const abs = Math.abs(wrapped);

            const isActive = wrapped === 0;
            const x = wrapped * SPREAD_X;
            const rotZ = wrapped * SPREAD_ROT;
            const scale = isActive ? 1 : abs === 1 ? 0.88 : 0.75;
            const opacity = isActive ? 1 : abs === 1 ? 0.55 : 0;
            const zIndex = 10 - abs;

            return (
              <motion.div
                key={project.id}
                style={{
                  position: "absolute",
                  width: CARD_W,
                  height: CARD_H,
                  zIndex,
                  cursor: isActive ? "default" : "pointer",
                }}
                animate={{ x, rotateZ: rotZ, scale, opacity }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                onClick={() => !isActive && setActive(i)}
                drag={isActive ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(_e, info) => {
                  if (info.offset.x > 80 || info.velocity.x > 500) prev();
                  else if (info.offset.x < -80 || info.velocity.x < -500) next();
                }}
              >
                <SpotlightCard project={project} index={i} active={isActive} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          marginTop: "2.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
        }}
      >
        {(["←", "→"] as const).map((arrow) => (
          <button
            key={arrow}
            onClick={arrow === "←" ? prev : next}
            style={{
              background: "none",
              border: "1px solid var(--color-border)",
              borderRadius: "50%",
              width: "38px",
              height: "38px",
              color: "var(--color-brown)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-gold)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--color-gold)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--color-brown)";
            }}
          >
            {arrow}
          </button>
        ))}
      </div>

      {/* Dots */}
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {PROJECTS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            style={{
              width: idx === active ? "20px" : "6px",
              height: "6px",
              borderRadius: "999px",
              background: idx === active ? "var(--color-gold)" : "var(--color-border)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "width 0.3s ease, background 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
