import { en } from "./en";
import { th } from "./th";
import type { Language } from "./types";

export function translate(
  language: Language,
  key: string,
  values?: Record<string, string | number>,
) {
  const message = language === "th" ? (th[key] ?? en(key)) : en(key);
  return values
    ? message.replace(/\{(\w+)\}/g, (match, name: string) =>
        values[name] === undefined ? match : String(values[name]),
      )
    : message;
}
