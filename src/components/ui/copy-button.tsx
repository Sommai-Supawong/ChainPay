"use client";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./button";
import { useTranslation } from "@/i18n";
export function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const t = useTranslation();
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={t(label || "Copy")}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          toast.success(t("Copied to clipboard"));
        } catch {
          toast.error(
            t("Copy is unavailable. Select and copy the text manually."),
          );
        }
      }}
    >
      <Copy size={15} aria-hidden="true" />
      {t(label)}
    </Button>
  );
}
