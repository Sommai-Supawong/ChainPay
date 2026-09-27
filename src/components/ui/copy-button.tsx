"use client";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./button";
export function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          toast.success("Copied to clipboard");
        } catch {
          toast.error(
            "Copy is unavailable. Select and copy the text manually.",
          );
        }
      }}
    >
      <Copy size={15} />
      {label}
    </Button>
  );
}
