export interface Project {
  id: number;
  title: string;
  tags: string[];
  description: string;
  accent: string;
  year: string;
  link?: string;
}

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: "MMKL Dashboard",
    tags: ["Next.js", "TypeScript", "React", "Tailwind"],
    description:
      "A real-time analytics and management dashboard with a dark editorial design system. Modular architecture, smooth animations, and full component library built from scratch.",
    accent: "linear-gradient(135deg, #2A1F18 0%, #3d2a1e 100%)",
    year: "2025",
  },
  {
    id: 2,
    title: "MMKL Snake 3D",
    tags: ["Three.js", "JavaScript", "WebGL", "Node.js"],
    description:
      "A fully 3D Snake game running in the browser. WebGL rendering, dynamic lighting, smooth camera follow, and a custom game server built with Node.js.",
    accent: "linear-gradient(135deg, #1C1410 0%, #2e1f16 100%)",
    year: "2025",
  },
  {
    id: 3,
    title: "GJU Study Hub",
    tags: ["Next.js", "TypeScript", "AI", "Scraping"],
    description:
      "An AI-powered study companion for GJU students. Aggregates course materials, generates smart notes, and provides a clean interface for academic resource management.",
    accent: "linear-gradient(135deg, #241810 0%, #3a2618 100%)",
    year: "2025",
  },
  {
    id: 4,
    title: "This Portfolio",
    tags: ["Next.js", "Three.js", "GSAP", "Framer Motion"],
    description:
      "The portfolio you're looking at. Built with luxury aesthetics, 3D WebGL elements, custom cursor, GSAP character animations, and a fully custom design system.",
    accent: "linear-gradient(135deg, #1C1410 0%, #2A1F18 100%)",
    year: "2026",
  },
];
