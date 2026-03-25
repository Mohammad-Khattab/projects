"use client";

export default function ScrollCue() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "2.5rem",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
        zIndex: 10,
        opacity: 0.6,
      }}
    >
      {/* Label */}
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.6rem",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "var(--color-brown)",
          writingMode: "horizontal-tb",
        }}
      >
        Scroll
      </span>

      {/* Animated line */}
      <div
        style={{
          width: "1px",
          height: "48px",
          backgroundColor: "var(--color-border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="animate-scroll-cue"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1px",
            height: "100%",
            backgroundColor: "var(--color-gold)",
          }}
        />
      </div>
    </div>
  );
}
