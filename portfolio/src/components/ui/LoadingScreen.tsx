"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import * as THREE from "three";

/* ─── Loading torus knot ─────────────────────────────────────────────────── */
function LoadingKnot() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.009;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.22;
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[1.6, 0.42, 220, 20]} />
      <meshBasicMaterial color="#C4A882" wireframe />
    </mesh>
  );
}

/* ─── Outer glow ring ────────────────────────────────────────────────────── */
function GlowRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.1;
    ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.9) * 0.025);
  });
  return (
    <mesh ref={ref} position={[0, 0, -1]}>
      <torusGeometry args={[2.8, 0.008, 8, 90]} />
      <meshBasicMaterial color="#C4A882" transparent opacity={0.28} />
    </mesh>
  );
}

/* ─── Inner orbit ring ───────────────────────────────────────────────────── */
function OrbitRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.18;
    ref.current.rotation.y = state.clock.elapsedTime * 0.07;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[2.1, 0.004, 8, 90]} />
      <meshBasicMaterial color="#6B5140" transparent opacity={0.5} />
    </mesh>
  );
}

/* ─── Timing constants ───────────────────────────────────────────────────── */
const HOLD_MS   = 2000;  // how long to show the loader
const EXIT_MS   = 600;   // split-panel exit duration

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function LoadingScreen() {
  const [progress,  setProgress]  = useState(0);
  const [exiting,   setExiting]   = useState(false);
  const [mounted,   setMounted]   = useState(true);

  useEffect(() => {
    // Smooth progress bar
    const start = performance.now();
    let raf: number;
    const tick = () => {
      const p = Math.min((performance.now() - start) / HOLD_MS, 1);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const exitTimer   = setTimeout(() => setExiting(true),                HOLD_MS);
    const unmountTimer = setTimeout(() => setMounted(false), HOLD_MS + EXIT_MS + 80);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(exitTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!mounted) return null;

  const panelEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      pointerEvents: exiting ? "none" : "all",
    }}>

      {/* ── Split panel — top half ───────────────────────────────────────── */}
      <motion.div
        animate={exiting ? { y: "-100%" } : { y: 0 }}
        transition={{ duration: EXIT_MS / 1000, ease: panelEase }}
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "50%",
          backgroundColor: "var(--color-bg)",
          zIndex: 2,
        }}
      />

      {/* ── Split panel — bottom half ────────────────────────────────────── */}
      <motion.div
        animate={exiting ? { y: "100%" } : { y: 0 }}
        transition={{ duration: EXIT_MS / 1000, ease: panelEase }}
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: "50%",
          backgroundColor: "var(--color-bg)",
          zIndex: 2,
        }}
      />

      {/* ── 3D canvas + label + bar (sits between the panels, z:1) ─────── */}
      <motion.div
        animate={exiting
          ? { opacity: 0, scale: 1.18 }
          : { opacity: 1, scale: 1 }}
        initial={{ opacity: 0, scale: 0.94 }}
        transition={exiting
          ? { duration: 0.38, ease: "easeIn" }
          : { duration: 0.5, ease: "easeOut" }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.4rem",
          zIndex: 3,
        }}
      >

        {/* Label */}
        <motion.span
          initial={{ opacity: 0, letterSpacing: "0.6em" }}
          animate={{ opacity: 1, letterSpacing: "0.45em" }}
          transition={{ duration: 0.9, delay: 0.15 }}
          style={{
            fontFamily: "Surgena, sans-serif",
            fontSize: "0.48rem",
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: "var(--color-border)",
          }}
        >
          ◈ &nbsp; Portfolio
        </motion.span>

        {/* 3D canvas */}
        <div style={{
          position: "relative",
          width: "360px",
          height: "360px",
        }}>
          <Canvas
            camera={{ position: [0, 0, 5.5], fov: 55 }}
            gl={{ alpha: true, antialias: true }}
            style={{ background: "transparent", display: "block" }}
            dpr={[1, 1.2]}
          >
            <ambientLight intensity={0.4} />
            <LoadingKnot />
            <GlowRing />
            <OrbitRing />
          </Canvas>

          {/* Scan-line sweep over canvas */}
          <div style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}>
            <div className="loading-scan-line" />
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          width: "180px",
          height: "1px",
          backgroundColor: "rgba(107,81,64,0.25)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            top: 0, left: 0, bottom: 0,
            width: `${progress * 100}%`,
            background: "linear-gradient(90deg, #6B5140, #C4A882)",
            boxShadow: "0 0 10px rgba(196,168,130,0.7)",
            transition: "width 50ms linear",
          }} />
        </div>

      </motion.div>

    </div>
  );
}
