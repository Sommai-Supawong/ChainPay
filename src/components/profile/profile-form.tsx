"use client";
import { T, useTranslation } from "@/i18n";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { profileSchema } from "@/lib/validation";
import { api, friendlyError } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/primitives";
export function ProfileForm({
  displayName,
  accountType,
  email,
}: {
  displayName: string;
  accountType: "personal" | "merchant";
  email: string;
}) {
  const t = useTranslation();
  const router = useRouter();
  const form = useForm<z.input<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName, accountType },
  });
  return (
    <form
      className="stack"
      onSubmit={form.handleSubmit(async (input) => {
        try {
          await api("profile", { method: "PATCH", body: input });
          toast.success(t("Profile updated"));
          router.refresh();
        } catch (error) {
          toast.error(t(friendlyError(error)));
        }
      })}
    >
      <Field
        name="displayName"
        label="Display name"
        error={form.formState.errors.displayName?.message}
        hint="This name appears on your public payment requests."
      >
        <input id="displayName" {...form.register("displayName")} />
      </Field>
      <Field name="email" label="Google account">
        <input id="email" value={email} disabled />
        <p className="small muted">
          <T value="Managed by your Google account." />
        </p>
      </Field>
      <Field name="accountType" label="Account type">
        <select id="accountType" {...form.register("accountType")}>
          <option value="personal">
            <T value="Personal" />
          </option>
          <option value="merchant">
            <T value="Merchant" />
          </option>
        </select>
      </Field>
      <Button disabled={form.formState.isSubmitting}>
        {t(form.formState.isSubmitting ? "Saving…" : "Save profile")}
      </Button>
    </form>
  );
}
