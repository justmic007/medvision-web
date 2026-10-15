"use client";

import { useEffect } from "react";
import { warmup } from "@/lib/api";

// Fires once when the app first loads: wakes the free-tier backend and preloads
// the model so the first analysis is fast. Fire-and-forget — failures are
// ignored (the analyze path loads the model on demand regardless). Renders
// nothing.
export function WarmupPing() {
  useEffect(() => {
    warmup().catch(() => {});
  }, []);
  return null;
}
