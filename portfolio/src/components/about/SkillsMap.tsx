"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import MapScene from "@/components/hero/MapScene";
import { SKILL_CATEGORIES } from "@/data/skills";

/* ─── Full-screen background globe ───────────────────────────────────────── */
function BgGlobe() {
  const mesh  = useRef<THREE.Mesh>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (mesh.current)  { mesh.current.rotation.y += 0.0018; mesh.current.rotation.x += 0.0007; }
    if (ring1.current) { ring1.current.rotation.z = t * 0.06; ring1.current.scale.setScalar(1 + Math.sin(t * 0.4) * 0.015); }
    if (ring2.current) { ring2.current.rotation.x = t * 0.04; ring2.current.rotation.z = -t * 0.03; }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshBasicMaterial color="#A79277" wireframe />
      </mesh>
      <mesh ref={ring1} position={[0, 0, -0.5]}>
        <torusGeometry args={[2.2, 0.006, 8, 80]} />
        <meshBasicMaterial color="#C4A882" transparent opacity={0.2} />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[1.85, 0.004, 8, 80]} />
        <meshBasicMaterial color="#6B5140" transparent opacity={0.35} />
      </mesh>
    </>
  );
}

/* ─── Overlay ─────────────────────────────────────────────────────────────── */
function SkillsOverlay({
  isOpen, originX, originY, onClose,
}: {
  isOpen: boolean; originX: number; originY: number; onClose: () => void;
}) {
  const [activeCatIdx, setActiveCatIdx] = useState<number | null>(null);
  const activeCat = activeCatIdx !== null ? SKILL_CATEGORIES[activeCatIdx] : null;

  useEffect(() => { if (!isOpen) setActiveCatIdx(null); }, [isOpen]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        /* Clicking the backdrop (globe) = go back */
        <motion.div
          key="skills-fs"
          onClick={onClose}
          initial={{ scale: 0.06, opacity: 0, filter: "blur(12px)" }}
          animate={{ scale: 1,    opacity: 1, filter: "blur(0px)"  }}
          exit={{    scale: 0.06, opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 500,
            backgroundColor: "#1C1410",
            transformOrigin: `${originX}px ${originY}px`,
            cursor: "none",
          }}
        >
          {/* Globe background */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <Canvas
              camera={{ position: [0, 0, 2.2], fov: 75 }}
              gl={{ alpha: true, antialias: true }}
              style={{ width: "100%", height: "100%", display: "block" }}
              dpr={[1, 1.2]}
            >
              <BgGlobe />
            </Canvas>
          </div>

          {/* Vignette */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
            background: "radial-gradient(ellipse at center, rgba(28,20,16,0.05) 0%, rgba(28,20,16,0.72) 65%, rgba(28,20,16,0.96) 100%)",
          }} />

          {/* Hint — click anywhere to go back */}
          {!activeCat && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{
                position: "absolute",
                bottom: "2.5rem",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
                pointerEvents: "none",
              }}
            >
              <span style={{
                fontFamily: "Surgena, sans-serif",
                fontSize: "0.42rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "var(--color-border)",
              }}>
                Click anywhere to go back
              </span>
            </motion.div>
          )}

          {/* Content — stopPropagation so clicks here don't close */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute", inset: 0, zIndex: 5,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "6rem 8vw 5rem",
              pointerEvents: "none",
            }}
          >
            <AnimatePresence mode="wait">

              {/* ── Categories ──────────────────────────────────────────── */}
              {!activeCat && (
                <motion.div
                  key="cats"
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
                  style={{ width: "100%", maxWidth: "1000px", pointerEvents: "auto" }}
                >
                  {/* Label */}
                  <span style={{
                    display: "block",
                    fontFamily: "Surgena, sans-serif",
                    fontSize: "0.5rem",
                    letterSpacing: "0.45em",
                    textTransform: "uppercase",
                    color: "var(--color-border)",
                    marginBottom: "1rem",
                    textAlign: "center",
                  }}>
                    02 — Skills
                  </span>

                  {/* Heading */}
                  <h2 style={{
                    fontFamily: "Surgena, sans-serif",
                    fontSize: "clamp(2.2rem, 4vw, 3.8rem)",
                    fontWeight: 300,
                    color: "var(--color-ivory)",
                    marginBottom: "4rem",
                    letterSpacing: "-0.02em",
                    textAlign: "center",
                    lineHeight: 1.1,
                  }}>
                    What I work with.
                  </h2>

                  {/* Editorial list — one per row, full-width */}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {SKILL_CATEGORIES.map((cat, i) => (
                      <motion.button
                        key={cat.id}
                        initial={{ opacity: 0, x: -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.08, duration: 0.45, ease: "easeOut" }}
                        onClick={() => setActiveCatIdx(i)}
                        style={{
                          background: "transparent",
                          border: "none",
                          borderBottom: "1px solid rgba(107,81,64,0.25)",
                          padding: "1.4rem 0",
                          cursor: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          transition: "padding-left 0.3s ease",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.paddingLeft = "1.2rem";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.paddingLeft = "0";
                        }}
                      >
                        {/* Left: index + icon + label */}
                        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                          <span style={{
                            fontFamily: "Surgena, sans-serif",
                            fontSize: "0.44rem",
                            letterSpacing: "0.25em",
                            color: "var(--color-border)",
                            minWidth: "24px",
                          }}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span style={{ fontSize: "1.3rem", color: "var(--color-gold)" }}>
                            {cat.icon}
                          </span>
                          <span style={{
                            fontFamily: "Surgena, sans-serif",
                            fontSize: "clamp(1.2rem, 2.5vw, 2rem)",
                            fontWeight: 300,
                            letterSpacing: "-0.01em",
                            color: "var(--color-ivory)",
                            transition: "color 0.25s",
                          }}>
                            {cat.label}
                          </span>
                        </div>

                        {/* Right: skill count + arrow */}
                        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                          <span style={{
                            fontFamily: "Surgena, sans-serif",
                            fontSize: "0.44rem",
                            letterSpacing: "0.2em",
                            color: "var(--color-border)",
                            textTransform: "uppercase",
                          }}>
                            {cat.skills.length} skills
                          </span>
                          <span style={{
                            color: "var(--color-gold)",
                            fontSize: "1rem",
                            opacity: 0.7,
                          }}>
                            →
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Skills ──────────────────────────────────────────────── */}
              {activeCat && (
                <motion.div
                  key={`sk-${activeCat.id}`}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ width: "100%", maxWidth: "640px", pointerEvents: "auto" }}
                >
                  {/* Back to categories */}
                  <button
                    onClick={() => setActiveCatIdx(null)}
                    style={{
                      background: "transparent", border: "none", cursor: "none",
                      display: "inline-flex", alignItems: "center", gap: "0.5rem",
                      color: "var(--color-border)",
                      fontFamily: "Surgena, sans-serif",
                      fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase",
                      marginBottom: "2.2rem", transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--color-brown)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--color-border)"; }}
                  >
                    ← All categories
                  </button>

                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                    <span style={{ fontSize: "2rem", color: "var(--color-gold)" }}>{activeCat.icon}</span>
                    <h2 style={{
                      fontFamily: "Surgena, sans-serif",
                      fontSize: "clamp(1.8rem, 3.5vw, 3rem)",
                      fontWeight: 300, letterSpacing: "-0.02em",
                      color: "var(--color-ivory)",
                    }}>
                      {activeCat.label}
                    </h2>
                  </div>

                  <div style={{ height: "1px", backgroundColor: "rgba(107,81,64,0.3)", marginBottom: "1.6rem" }} />

                  {/* Skill rows */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {activeCat.skills.map((skill, i) => (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, x: -18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.055, duration: 0.35 }}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "0.85rem 1.2rem",
                          background: "rgba(28,20,16,0.55)",
                          backdropFilter: "blur(16px)",
                          border: "1px solid rgba(107,81,64,0.22)",
                          borderRadius: "8px",
                        }}
                      >
                        <span style={{
                          fontFamily: "Surgena, sans-serif",
                          fontSize: "0.66rem", letterSpacing: "0.1em",
                          textTransform: "uppercase", color: "var(--color-brown)",
                        }}>
                          {skill.name}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                          <div style={{ display: "flex", gap: "4px" }}>
                            {Array.from({ length: 5 }, (_, j) => (
                              <div key={j} style={{
                                width: "26px", height: "2px", borderRadius: "2px",
                                backgroundColor: j < skill.level ? "var(--color-gold)" : "rgba(107,81,64,0.3)",
                              }} />
                            ))}
                          </div>
                          <span style={{
                            fontFamily: "Surgena, sans-serif", fontSize: "0.42rem",
                            letterSpacing: "0.12em", color: "var(--color-border)", minWidth: "58px",
                          }}>
                            {["","Beginner","Basic","Intermediate","Advanced","Expert"][skill.level]}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Jump pills */}
                  <div style={{ marginTop: "2rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {SKILL_CATEGORIES.filter((_, i) => i !== activeCatIdx).map((cat, i) => (
                      <motion.button
                        key={cat.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        onClick={() => setActiveCatIdx(SKILL_CATEGORIES.indexOf(cat))}
                        style={{
                          background: "rgba(28,20,16,0.5)", backdropFilter: "blur(10px)",
                          border: "1px solid rgba(107,81,64,0.4)", borderRadius: "999px",
                          padding: "5px 14px", cursor: "none",
                          fontFamily: "Surgena, sans-serif", fontSize: "0.44rem",
                          letterSpacing: "0.14em", textTransform: "uppercase",
                          color: "var(--color-border)", transition: "border-color 0.2s, color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.borderColor = "var(--color-gold)";
                          el.style.color = "var(--color-ivory)";
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.borderColor = "rgba(107,81,64,0.4)";
                          el.style.color = "var(--color-border)";
                        }}
                      >
                        {cat.icon} {cat.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ─── Main export ─────────────────────────────────────────────────────────── */
export default function SkillsMap() {
  const mouse        = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen,  setIsOpen]  = useState(false);
  const [originX, setOriginX] = useState(0);
  const [originY, setOriginY] = useState(0);

  const handleOrbClick = () => {
    if (containerRef.current) {
      const r = containerRef.current.getBoundingClientRect();
      setOriginX(r.left + r.width  / 2);
      setOriginY(r.top  + r.height / 2);
    }
    setIsOpen(true);
  };

  return (
    <>
      <SkillsOverlay isOpen={isOpen} originX={originX} originY={originY} onClose={() => setIsOpen(false)} />

      <div
        ref={containerRef}
        style={{ position: "relative", width: "100%", height: "100%" }}
        onMouseMove={(e) => {
          const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          mouse.current.x =  ((e.clientX - r.left) / r.width  - 0.5) * 2;
          mouse.current.y = -((e.clientY - r.top)  / r.height - 0.5) * 2;
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 55 }}
          gl={{ alpha: true, antialias: true }}
          style={{ width: "100%", height: "100%", display: "block" }}
          dpr={[1, 1.2]}
        >
          <MapScene mouse={mouse} onGlobeClick={handleOrbClick} />
        </Canvas>

        {!isOpen && (
          <div style={{
            position: "absolute", bottom: "0.8rem", left: "50%",
            transform: "translateX(-50%)", pointerEvents: "none",
            animation: "fadeUpIn 0.4s ease both",
          }}>
            <span style={{
              fontFamily: "Surgena, sans-serif", fontSize: "0.45rem",
              letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-border)",
            }}>
              Click the orb
            </span>
          </div>
        )}
      </div>
    </>
  );
}
