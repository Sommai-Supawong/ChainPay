"use client";

import { motion, useReducedMotion } from "motion/react";
import { calmEase, revealViewport } from "./reveal";
import { useTranslation } from "@/i18n";

export function TextEmerge({
  lines,
  as = "h2",
  className = "",
  delay = 0,
}: {
  lines: string[];
  as?: "h1" | "h2";
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const t = useTranslation();
  const Heading = as === "h1" ? motion.h1 : motion.h2;
  return (
    <Heading
      className={className}
      aria-label={lines.map((line) => t(line)).join(" ")}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduced ? 0 : 0.11,
            delayChildren: reduced ? 0 : delay,
          },
        },
      }}
    >
      {lines.map((line) => (
        <motion.span
          key={line}
          aria-hidden="true"
          className="cp-text-line"
          variants={{
            hidden: {
              opacity: 0,
              // Reduced-motion CSS overrides these deterministic initial styles.
              y: 24,
              filter: "blur(5px)",
            },
            visible: { opacity: 1, y: 0, filter: "blur(0px)" },
          }}
          transition={{ duration: reduced ? 0 : 0.7, ease: calmEase }}
        >
          {t(line)}
        </motion.span>
      ))}
    </Heading>
  );
}
