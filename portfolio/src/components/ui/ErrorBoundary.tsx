"use client";

import React from "react";
import { log } from "@/lib/logger";

interface Props { children: React.ReactNode; name?: string; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    log.error("ERROR", `ErrorBoundary caught in <${this.props.name ?? "unknown"}>`, {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "2rem",
            border: "1px solid #6B5140",
            color: "#A79277",
            fontFamily: "monospace",
            fontSize: "0.8rem",
            background: "#1C1410",
          }}
        >
          [{this.props.name ?? "Component"}] failed to render — check console.
        </div>
      );
    }
    return this.props.children;
  }
}
