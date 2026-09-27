"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api, friendlyError } from "@/lib/client-api";
import { submitSchema } from "@/lib/validation";
export function RecoverPayment() {
  const router = useRouter(),
    [busy, setBusy] = useState(false);
  return (
    <Button
      variant="secondary"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const raw = sessionStorage.getItem("chainpay-submission");
          if (!raw) {
            toast.info("No unsaved transaction was found in this tab.");
            return;
          }
          const input = submitSchema.parse(JSON.parse(raw));
          await api("transactions", { method: "POST", body: input });
          sessionStorage.removeItem("chainpay-submission");
          router.push(`/tx/${input.hash}`);
        } catch (error) {
          toast.error(friendlyError(error));
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Recovering payment…" : "Recover my submitted payment"}
    </Button>
  );
}
