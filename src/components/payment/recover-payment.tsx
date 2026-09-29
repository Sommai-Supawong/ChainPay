"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api, friendlyError } from "@/lib/client-api";
import { submitSchema } from "@/lib/validation";
import { useErrorTranslation, useTranslation } from "@/i18n";
export function RecoverPayment() {
  const t = useTranslation();
  const errorText = useErrorTranslation();
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
            toast.info(t("No unsaved transaction was found in this tab."));
            return;
          }
          const input = submitSchema.parse(JSON.parse(raw));
          await api("transactions", { method: "POST", body: input });
          sessionStorage.removeItem("chainpay-submission");
          router.push(`/tx/${input.hash}`);
        } catch (error) {
          toast.error(
            `${errorText(friendlyError(error))} ${t("Your transaction was submitted successfully, but ChainPay has not saved it yet. Do not pay again. Recover this transaction using the existing hash.")}`,
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      {t(busy ? "Recovering payment…" : "Recover Transaction")}
    </Button>
  );
}
