import { House, Layers3, ListChecks, ShieldCheck } from "lucide-react";

export const marketingNav = [
  { href: "#", label: "Home", shortLabel: "Home", icon: House, desktop: false },
  {
    href: "#features",
    label: "Product",
    shortLabel: "Features",
    icon: Layers3,
    desktop: true,
  },
  {
    href: "#how-it-works",
    label: "How it works",
    shortLabel: "How",
    icon: ListChecks,
    desktop: true,
  },
  {
    href: "#built-for-trust",
    label: "Security",
    shortLabel: "Trust",
    icon: ShieldCheck,
    desktop: true,
  },
] as const;
