"use client";
import { T, useTranslation } from "@/i18n";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { googleSignIn } from "@/lib/auth/firebase-client";
import { api, friendlyError } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
export function LoginButton() {
  const router = useRouter();
  const t = useTranslation();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      className="full-width"
      disabled={busy}
      aria-busy={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const idToken = await googleSignIn();
          await api("auth/session", { method: "POST", body: { idToken } });
          router.replace("/dashboard");
          router.refresh();
        } catch (error) {
          toast.error(t(friendlyError(error)));
          setBusy(false);
        }
      }}
    >
      <span className="google-g" aria-hidden="true">
        <T value="G" />
      </span>
      {busy ? t("Signing in…") : t("Continue with Google")}
    </Button>
  );
}
export function LogoutButton() {
  const router = useRouter();
  const t = useTranslation();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="ghost"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await api("auth/session", { method: "DELETE" });
          router.replace("/login");
          router.refresh();
        } catch (error) {
          toast.error(t(friendlyError(error)));
        } finally {
          setBusy(false);
        }
      }}
    >
      <LogOut size={17} />
      {busy ? t("Signing out…") : t("Sign out")}
    </Button>
  );
}
