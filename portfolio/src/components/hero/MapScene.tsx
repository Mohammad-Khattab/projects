"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ─── Particles ───────────────────────────────────────────────────────────── */
function Particles() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const count = 70;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.008; });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#F5EFE6" size={0.04} transparent opacity={0.22} sizeAttenuation />
    </points>
  );
}

/* ─── Ripple ring ─────────────────────────────────────────────────────────── */
function RippleRing({ tick }: { tick: number }) {
  const meshRef  = useRef<THREE.Mesh>(null);
  const matRef   = useRef<THREE.MeshBasicMaterial>(null);
  const t0       = useRef<number | null>(null);
  const lastTick = useRef(0);

  useFrame(({ clock }) => {
    if (!meshRef.current || !matRef.current) return;
    if (tick !== lastTick.current) {
      lastTick.current = tick;
      t0.current = clock.elapsedTime;
      meshRef.current.scale.setScalar(0.5);
      matRef.current.opacity = 0.55;
    }
    if (t0.current === null) return;
    const progress = (clock.elapsedTime - t0.current) / 0.85;
    if (progress > 1) { matRef.current.opacity = 0; return; }
    meshRef.current.scale.setScalar(0.5 + progress * 2.8);
    matRef.current.opacity = 0.55 * (1 - progress);
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[1.0, 0.012, 8, 64]} />
      <meshBasicMaterial ref={matRef} color="#C4A882" transparent opacity={0} />
    </mesh>
  );
}

/* ─── Globe ───────────────────────────────────────────────────────────────── */
function Globe({ onClick, rippleTick }: { onClick: () => void; rippleTick: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hov, setHov] = useState(false);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.003;
    meshRef.current.rotation.x += 0.001;
  });

  return (
    <>
      <RippleRing tick={rippleTick} />
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerEnter={() => setHov(true)}
        onPointerLeave={() => setHov(false)}
      >
        <icosahedronGeometry args={[1.3, 1]} />
        <meshBasicMaterial color={hov ? "#C4A882" : "#A79277"} wireframe />
      </mesh>
    </>
  );
}

/* ─── Glow ring ───────────────────────────────────────────────────────────── */
function GlowRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.z = s.clock.elapsedTime * 0.07;
    ref.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 0.5) * 0.02);
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.8]}>
      <torusGeometry args={[2.0, 0.006, 8, 64]} />
      <meshBasicMaterial color="#C4A882" transparent opacity={0.18} />
    </mesh>
  );
}

/* ─── Root ────────────────────────────────────────────────────────────────── */
export default function MapScene({
  onGlobeClick,
}: {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  onGlobeClick?: () => void;
  /** @deprecated kept for compat */ onStateChange?: (p: string, idx: number | null) => void;
}) {
  const [rippleTick, setRippleTick] = useState(0);

  const handleClick = () => {
    setRippleTick((n) => n + 1);
    onGlobeClick?.();
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <Globe onClick={handleClick} rippleTick={rippleTick} />
      <Particles />
      <GlowRing />
    </>
  );
}
