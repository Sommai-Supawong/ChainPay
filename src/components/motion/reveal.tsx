"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export const calmEase = [0.22, 1, 0.36, 1] as const;
export const revealViewport = { once: true, amount: 0.12 } as const;

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`cp-reveal ${className}`}
      // Keep server/client initial styles identical; CSS handles reduced motion before hydration.
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={revealViewport}
      transition={{
        duration: reduced ? 0 : 0.65,
        delay: reduced ? 0 : delay,
        ease: calmEase,
      }}
    >
      {children}
    </motion.div>
  );
}
