"use client";
import { useSyncExternalStore } from "react";

function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function useReducedMotion() {
  return useMedia("(prefers-reduced-motion: reduce)");
}

export function useIsCoarse() {
  return useMedia("(pointer: coarse)");
}
