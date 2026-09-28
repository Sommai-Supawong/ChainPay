"use client";
import { T, useTranslation } from "@/i18n";
import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { api, friendlyError } from "@/lib/client-api";
import { contactSchema, type ContactInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  Field,
  GlassCard,
  LoadingState,
  WalletAddress,
} from "@/components/ui/primitives";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ContactModel } from "@/types/models";
export function ContactManager() {
  const t = useTranslation();
  const cache = useQueryClient(),
    [editing, setEditing] = useState<string | null>(null);
  const contacts = useQuery({
    queryKey: ["contacts"],
    queryFn: () => api<ContactModel[]>("contacts"),
  });
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", walletAddress: "", label: "" },
  });
  async function save(input: ContactInput) {
    try {
      await api(editing ? `contacts/${editing}` : "contacts", {
        method: editing ? "PATCH" : "POST",
        body: input,
      });
      await cache.invalidateQueries({ queryKey: ["contacts"] });
      form.reset();
      setEditing(null);
      toast.success(t("Contact saved"));
    } catch (error) {
      toast.error(t(friendlyError(error)));
    }
  }
  async function remove(id: string) {
    try {
      await api(`contacts/${id}`, { method: "DELETE" });
      await cache.invalidateQueries({ queryKey: ["contacts"] });
      toast.success(t("Contact removed"));
    } catch (error) {
      toast.error(t(friendlyError(error)));
    }
  }
  return (
    <div className="two-column">
      <GlassCard>
        <h2>{t(editing ? "Edit contact" : "Add a familiar face")}</h2>
        <form onSubmit={form.handleSubmit(save)} className="stack">
          <Field
            name="name"
            label="Name"
            error={form.formState.errors.name?.message}
          >
            <input
              id="name"
              {...form.register("name")}
              placeholder={t("Contact name")}
            />
          </Field>
          <Field
            name="walletAddress"
            label="Ethereum wallet"
            error={form.formState.errors.walletAddress?.message}
          >
            <input
              id="walletAddress"
              className="technical-text"
              {...form.register("walletAddress")}
              placeholder="0x…"
            />
          </Field>
          <Field
            name="label"
            label="Label (optional)"
            error={form.formState.errors.label?.message}
          >
            <input
              id="label"
              {...form.register("label")}
              placeholder={t("e.g. Designer")}
            />
          </Field>
          <Button disabled={form.formState.isSubmitting}>
            {t(form.formState.isSubmitting ? "Saving…" : "Save contact")}
          </Button>
          {editing && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditing(null);
                form.reset({ name: "", walletAddress: "", label: "" });
              }}
            >
              <T value="Cancel editing" />
            </Button>
          )}
        </form>
      </GlassCard>
      <GlassCard>
        <h2>
          <T value="Your contacts" />
        </h2>
        {contacts.isPending ? (
          <LoadingState text="Loading contacts…" />
        ) : contacts.error ? (
          <p className="error-banner" role="alert">
            {t(contacts.error.message)}
          </p>
        ) : !contacts.data?.length ? (
          <EmptyState
            title="Keep your people close"
            description="Save a wallet address for quicker, more familiar payments."
          />
        ) : (
          contacts.data.map((c) => (
            <div className="contact-row" key={c.id}>
              <div>
                <strong>{c.name}</strong>
                <p className="small muted">{c.label}</p>
                <WalletAddress address={c.walletAddress} />
              </div>
              <div className="button-row">
                <Button asChild variant="ghost" size="icon">
                  <Link
                    href={`/pay?to=${c.walletAddress}`}
                    aria-label={t("Pay {name}", { name: c.name })}
                  >
                    <ArrowUpRight size={17} />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("Edit {name}", { name: c.name })}
                  onClick={() => {
                    setEditing(c.id);
                    form.reset(c);
                  }}
                >
                  <Pencil size={16} />
                </Button>
                <ConfirmDialog
                  title={t("Remove {name}?", { name: c.name })}
                  description="You can add this contact again later."
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("Remove {name}", { name: c.name })}
                    >
                      <Trash2 size={16} />
                    </Button>
                  }
                  onConfirm={() => remove(c.id)}
                />
              </div>
            </div>
          ))
        )}
      </GlassCard>
    </div>
  );
}
