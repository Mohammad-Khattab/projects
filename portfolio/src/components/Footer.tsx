"use client";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        padding: "2rem 6vw",
        borderTop: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.65rem",
            fontWeight: 400,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--color-border)",
          }}
        >
          © {year} &nbsp;·&nbsp; Your Name &nbsp;·&nbsp; Built with care
        </span>

        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.85rem",
            fontStyle: "italic",
            fontWeight: 300,
            color: "var(--color-border)",
          }}
        >
          Full Stack Developer &amp; Designer
        </span>
      </div>
    </footer>
  );
}
