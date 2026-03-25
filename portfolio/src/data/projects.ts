export interface Project {
  id: number;
  title: string;
  tags: string[];
  description: string;
  accent: string;   // gradient color for card header
  year: string;
  link?: string;
}

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Obsidian Dashboard",
    tags: ["Next.js", "TypeScript", "Prisma", "UI Design"],
    description:
      "A real-time analytics dashboard with a dark editorial aesthetic. Built with streaming data, complex chart compositions, and a custom design system from scratch.",
    accent: "linear-gradient(135deg, #2A1F18 0%, #3d2a1e 100%)",
    year: "2025",
  },
  {
    id: 2,
    title: "Studio Collective",
    tags: ["React", "Three.js", "GSAP", "Figma"],
    description:
      "An immersive portfolio site for a creative studio. Features full-screen 3D transitions, magnetic cursor interactions, and a custom page transition engine.",
    accent: "linear-gradient(135deg, #1C1410 0%, #2e1f16 100%)",
    year: "2025",
  },
  {
    id: 3,
    title: "Meridian API",
    tags: ["Node.js", "PostgreSQL", "Docker", "REST"],
    description:
      "A production-grade REST API handling 50k+ daily requests. Clean architecture, full test coverage, and developer-first documentation that teams actually enjoy reading.",
    accent: "linear-gradient(135deg, #241810 0%, #3a2618 100%)",
    year: "2024",
  },
];
