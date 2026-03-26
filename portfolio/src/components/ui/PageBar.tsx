"use client";

import { useEffect, useState } from "react";

export default function PageBar() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 900);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="page-curtain" />
  );
}
