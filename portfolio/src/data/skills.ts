export interface Skill {
  id: string;
  name: string;
  level: number; // 1–5
}

export interface SkillCategory {
  id: string;
  label: string;
  icon: string;
  skills: Skill[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "frontend",
    label: "Frontend",
    icon: "◈",
    skills: [
      { id: "nextjs",    name: "Next.js",      level: 4 },
      { id: "react",     name: "React",         level: 4 },
      { id: "threejs",   name: "Three.js",      level: 4 },
      { id: "gsap",      name: "GSAP",          level: 4 },
      { id: "tailwind",  name: "Tailwind CSS",  level: 4 },
      { id: "typescript",name: "TypeScript",    level: 3 },
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    icon: "⬡",
    skills: [
      { id: "pm",        name: "Project Mgmt",      level: 4 },
      { id: "process",   name: "Process Design",    level: 3 },
      { id: "stats",     name: "Statistical Reasoning", level: 4 },
      { id: "research",  name: "Research Methods",  level: 4 },
      { id: "data",      name: "Data Analysis",     level: 3 },
    ],
  },
  {
    id: "programming",
    label: "Programming",
    icon: "◎",
    skills: [
      { id: "python",    name: "Python",        level: 3 },
      { id: "c",         name: "C Language",    level: 3 },
      { id: "ai",        name: "AI Prompting",  level: 4 },
      { id: "git",       name: "Git",           level: 4 },
      { id: "vercel",    name: "Vercel",        level: 4 },
    ],
  },
  {
    id: "design",
    label: "Design",
    icon: "◇",
    skills: [
      { id: "uiux",      name: "UI / UX",         level: 4 },
      { id: "figma",     name: "Figma",            level: 3 },
      { id: "motion",    name: "Motion Design",    level: 4 },
      { id: "systems",   name: "Design Systems",   level: 4 },
      { id: "present",   name: "Presentations",    level: 5 },
    ],
  },
  {
    id: "soft",
    label: "Soft Skills",
    icon: "◆",
    skills: [
      { id: "leadership",    name: "Leadership",       level: 4 },
      { id: "communication", name: "Communication",    level: 5 },
      { id: "critical",      name: "Critical Thinking",level: 5 },
      { id: "problem",       name: "Problem Solving",  level: 5 },
      { id: "empathy",       name: "Empathy & EQ",     level: 5 },
    ],
  },
];
