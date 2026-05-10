"use client";

import { useEffect } from "react";

const TIMEOUT_MS = 2500;

export default function MaterialSymbolsReady() {
  useEffect(() => {
    const root = document.documentElement;
    let finished = false;

    const markReady = () => {
      if (finished) return;
      finished = true;
      root.classList.add("material-symbols-ready");
    };

    const timeoutId = window.setTimeout(markReady, TIMEOUT_MS);

    void document.fonts
      .load('24px "Material Symbols Outlined"')
      .then(() => {
        window.clearTimeout(timeoutId);
        markReady();
      })
      .catch(() => {
        window.clearTimeout(timeoutId);
        markReady();
      });

    return () => window.clearTimeout(timeoutId);
  }, []);

  return null;
}
