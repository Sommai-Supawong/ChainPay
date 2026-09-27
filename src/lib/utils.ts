import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEther, parseEther } from "viem";
export const cn = (...values: ClassValue[]) => twMerge(clsx(values));
export const shortAddress = (value: string) =>
  value.length > 16 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
export function eth(value: string) {
  return formatEther(parseEther(value));
}
export function effectiveRequestStatus(
  status: string,
  expiresAt: Date | string | null,
  now = new Date(),
) {
  return (status === "active" || status === "draft") &&
    expiresAt &&
    new Date(expiresAt) <= now
    ? "expired"
    : status;
}
export function canPayRequest(
  status: string,
  expiresAt: Date | string | null,
  now = new Date(),
) {
  return effectiveRequestStatus(status, expiresAt, now) === "active";
}
