"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ── Particle field ─────────────────────────────── */
function ParticleField() {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 180;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.012;
    ref.current.rotation.x = state.clock.elapsedTime * 0.006;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color="#F5EFE6"
        size={0.045}
        transparent
        opacity={0.45}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Torus knot ─────────────────────────────────── */
function TorusKnotMesh({
  mouse,
}: {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const targetY = t * 0.14 + mouse.current.x * 0.55;
    const targetX = Math.sin(t * 0.12) * 0.25 + mouse.current.y * 0.35;
    meshRef.current.rotation.y += (targetY - meshRef.current.rotation.y) * 0.04;
    meshRef.current.rotation.x += (targetX - meshRef.current.rotation.x) * 0.04;
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1.6, 0.42, 220, 20]} />
      <meshBasicMaterial color="#A79277" wireframe />
    </mesh>
  );
}

/* ── Ambient glow ring ──────────────────────────── */
function GlowRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.08;
    const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
    ref.current.scale.setScalar(scale);
  });
  return (
    <mesh ref={ref} position={[0, 0, -1]}>
      <torusGeometry args={[2.8, 0.008, 16, 120]} />
      <meshBasicMaterial color="#C4A882" transparent opacity={0.25} />
    </mesh>
  );
}

/* ── Scene wrapper ──────────────────────────────── */
function Scene({
  mouse,
}: {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <TorusKnotMesh mouse={mouse} />
      <ParticleField />
      <GlowRing />
    </>
  );
}

/* ── Canvas export ──────────────────────────────── */
export default function HeroCanvas() {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 55 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]}
    >
      <Scene mouse={mouse} />
    </Canvas>
  );
}
