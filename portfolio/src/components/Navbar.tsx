"use client";

import { useEffect, useRef, useState } from "react";
import { log } from "@/lib/logger";

const NAV_LINKS = [
  { label: "About",    href: "#about" },
  { label: "Work",     href: "#projects" },
  { label: "Contact",  href: "#contact" },
];

export default function Navbar() {
  const navRef    = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    log.info("INIT", "Navbar mounted");
    const onScroll = () => {
      const isScrolled = window.scrollY > 60;
      if (isScrolled !== scrolled) {
        log.info("NAV", isScrolled ? "Navbar: frosted glass ON" : "Navbar: transparent");
      }
      setScrolled(isScrolled);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      log.info("NAV", "Navbar unmounted");
      window.removeEventListener("scroll", onScroll);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    log.info("NAV", `Nav link clicked: ${href}`);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      ref={navRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "1.5rem 6vw",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "background 0.5s ease, border-color 0.5s ease, padding 0.3s ease",
        background: scrolled ? "rgba(28,20,16,0.92)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
      }}
    >
      {/* Logo / Name */}
      <a
        href="#hero"
        onClick={(e) => handleNav(e, "#hero")}
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.2rem",
          fontWeight: 400,
          fontStyle: "italic",
          color: "var(--color-ivory)",
          textDecoration: "none",
          letterSpacing: "0.02em",
          cursor: "none",
        }}
      >
        YN<span style={{ color: "var(--color-gold)" }}>.</span>
      </a>

      {/* Links */}
      <ul
        style={{
          display: "flex",
          gap: "2.5rem",
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
      >
        {NAV_LINKS.map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              onClick={(e) => handleNav(e, href)}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.65rem",
                fontWeight: 500,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "var(--color-brown)",
                textDecoration: "none",
                transition: "color 0.3s ease",
                cursor: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-ivory)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-brown)";
              }}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
