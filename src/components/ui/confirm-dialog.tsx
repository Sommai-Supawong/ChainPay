"use client";
import { T, useTranslation } from "@/i18n";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { Button } from "./button";
export function ConfirmDialog({
  title,
  description,
  trigger,
  onConfirm,
}: {
  title: string;
  description: string;
  trigger: React.ReactNode;
  onConfirm: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false);
  const t = useTranslation();
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title>{t(title)}</Dialog.Title>
          <Dialog.Description>{t(description)}</Dialog.Description>
          <div className="button-row">
            <Dialog.Close asChild>
              <Button variant="secondary" disabled={busy}>
                <T value="Keep it" />
              </Button>
            </Dialog.Close>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onConfirm();
                  setOpen(false);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? t("Please wait…") : t("Confirm")}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
