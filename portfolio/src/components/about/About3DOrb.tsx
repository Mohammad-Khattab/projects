"use client";

import { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function OrbMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const scrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => { scrollY.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.y = t * 0.3 + scrollY.current * 0.001;
    meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.4;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.2, 1]} />
      <meshBasicMaterial color="#A79277" wireframe />
    </mesh>
  );
}

function OrbCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.5], fov: 50 }}
      gl={{ alpha: true }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.5} />
      <OrbMesh />
    </Canvas>
  );
}

// No SSR — Three.js requires browser APIs
const DynamicOrbCanvas = dynamic(() => Promise.resolve(OrbCanvas), { ssr: false });

export default function About3DOrb() {
  return (
    <div style={{ width: "260px", height: "260px", flexShrink: 0, opacity: 0.85 }}>
      <DynamicOrbCanvas />
    </div>
  );
}
