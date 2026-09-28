import {
  Activity,
  ArrowUpRight,
  LayoutDashboard,
  ReceiptText,
  Settings2,
  ShieldCheck,
  UsersRound,
  Wallet,
} from "lucide-react";

export const appNav = [
  {
    href: "/dashboard",
    label: "Overview",
    shortLabel: "Home",
    icon: LayoutDashboard,
    mobile: true,
    secondaryOnly: false,
  },
  {
    href: "/pay",
    label: "Send payment",
    shortLabel: "Pay",
    icon: ArrowUpRight,
    mobile: true,
    secondaryOnly: false,
  },
  {
    href: "/requests",
    label: "Payment requests",
    shortLabel: "Request",
    icon: ReceiptText,
    mobile: true,
    secondaryOnly: false,
  },
  {
    href: "/activity",
    label: "Activity",
    shortLabel: "Activity",
    icon: Activity,
    mobile: true,
    secondaryOnly: false,
  },
  {
    href: "/wallets",
    label: "Wallets",
    shortLabel: "Wallets",
    icon: Wallet,
    mobile: false,
    secondaryOnly: false,
  },
  {
    href: "/contacts",
    label: "Contacts",
    shortLabel: "Contacts",
    icon: UsersRound,
    mobile: false,
    secondaryOnly: false,
  },
  {
    href: "/settings/profile",
    label: "Settings",
    shortLabel: "Settings",
    icon: Settings2,
    mobile: false,
    secondaryOnly: false,
  },
  {
    href: "/settings/security",
    label: "Security",
    shortLabel: "Security",
    icon: ShieldCheck,
    mobile: false,
    secondaryOnly: true,
  },
] as const;

export function appNavActive(href: string, path: string) {
  if (href === "/requests")
    return path === href || path.startsWith("/request/");
  return path === href;
}
