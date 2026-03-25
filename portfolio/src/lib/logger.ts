/**
 * Portfolio Logger
 * Structured console logging for every aspect of the site.
 * Groups: INIT | ANIM | INTERACT | SCROLL | 3D | NAV | PERF | ERROR
 */

const IS_DEV = process.env.NODE_ENV === "development";

type LogGroup =
  | "INIT"
  | "ANIM"
  | "INTERACT"
  | "SCROLL"
  | "3D"
  | "NAV"
  | "PERF"
  | "ERROR"
  | "CURSOR";

const GROUP_COLORS: Record<LogGroup, string> = {
  INIT:     "#C4A882",   // champagne gold
  ANIM:     "#A79277",   // donkey brown
  INTERACT: "#F5EFE6",   // ivory
  SCROLL:   "#8fb4c8",   // soft blue
  "3D":     "#b8a0c8",   // soft purple
  NAV:      "#90c890",   // soft green
  PERF:     "#e8c880",   // warm yellow
  ERROR:    "#e87878",   // soft red
  CURSOR:   "#88a8c8",   // slate
};

function timestamp(): string {
  return new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
}

export const log = {
  /**
   * General log — labelled by group
   */
  info(group: LogGroup, message: string, data?: unknown): void {
    if (!IS_DEV) return;
    const color = GROUP_COLORS[group];
    if (data !== undefined) {
      console.log(
        `%c[${timestamp()}] [${group}] ${message}`,
        `color:${color};font-weight:600;font-family:monospace`,
        data
      );
    } else {
      console.log(
        `%c[${timestamp()}] [${group}] ${message}`,
        `color:${color};font-weight:600;font-family:monospace`
      );
    }
  },

  /**
   * Error log — always shown even in prod
   */
  error(group: LogGroup, message: string, err?: unknown): void {
    console.error(
      `%c[${timestamp()}] [${group}] ❌ ${message}`,
      `color:${GROUP_COLORS.ERROR};font-weight:700;font-family:monospace`,
      err ?? ""
    );
  },

  /**
   * Performance measurement
   */
  perf(label: string, ms: number): void {
    if (!IS_DEV) return;
    const color = ms < 100 ? "#90c890" : ms < 500 ? "#e8c880" : "#e87878";
    console.log(
      `%c[${timestamp()}] [PERF] ${label}: ${ms.toFixed(1)}ms`,
      `color:${color};font-weight:600;font-family:monospace`
    );
  },

  /**
   * Group start — collapsible section
   */
  group(label: string): void {
    if (!IS_DEV) return;
    console.groupCollapsed(
      `%c▶ ${label}`,
      "color:#C4A882;font-weight:700;font-family:monospace"
    );
  },

  groupEnd(): void {
    if (!IS_DEV) return;
    console.groupEnd();
  },
};

/**
 * Measure and log how long an async operation takes.
 */
export async function measureAsync<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    log.perf(label, performance.now() - start);
    return result;
  } catch (err) {
    log.error("ERROR", `${label} failed`, err);
    throw err;
  }
}
