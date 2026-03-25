"use client";

const SKILLS_ROW1 = [
  "React", "Next.js", "TypeScript", "Node.js", "Three.js",
  "GSAP", "Tailwind CSS", "PostgreSQL", "Figma", "REST APIs",
  "React", "Next.js", "TypeScript", "Node.js", "Three.js",
  "GSAP", "Tailwind CSS", "PostgreSQL", "Figma", "REST APIs",
];

const SKILLS_ROW2 = [
  "UI Design", "Motion Design", "Framer", "Supabase", "Docker",
  "Git", "AWS", "Prisma", "GraphQL", "Design Systems",
  "UI Design", "Motion Design", "Framer", "Supabase", "Docker",
  "Git", "AWS", "Prisma", "GraphQL", "Design Systems",
];

function Row({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  return (
    <div
      style={{
        overflow: "hidden",
        padding: "0.6rem 0",
        borderTop: "1px solid var(--color-border)",
        borderBottom: reverse ? "1px solid var(--color-border)" : "none",
      }}
    >
      <div
        className={reverse ? "animate-marquee-reverse" : "animate-marquee"}
        style={{
          display: "flex",
          gap: "2.5rem",
          whiteSpace: "nowrap",
          width: "max-content",
        }}
      >
        {items.map((skill, i) => (
          <span
            key={i}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.7rem",
              fontWeight: 500,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: i % 3 === 0 ? "var(--color-gold)" : "var(--color-brown)",
              flexShrink: 0,
            }}
          >
            {skill}
            <span style={{ marginLeft: "2.5rem", color: "var(--color-border)" }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function MarqueeStrip() {
  return (
    <div style={{ margin: "3rem 0", userSelect: "none" }}>
      <Row items={SKILLS_ROW1} />
      <Row items={SKILLS_ROW2} reverse />
    </div>
  );
}
