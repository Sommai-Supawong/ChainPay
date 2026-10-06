"use client";
import { T, useErrorTranslation, useTranslation } from "@/i18n";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, friendlyError } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Field, GlassCard } from "@/components/ui/primitives";
import { escrowDraftSchema } from "@/lib/validation";
import { z } from "zod";
import type { EscrowModel } from "@/types/models";

type EscrowInput = z.input<typeof escrowDraftSchema>;

export function EscrowForm() {
  const t = useTranslation();
  const errorText = useErrorTranslation();
  const router = useRouter();

  const form = useForm<EscrowInput>({
    resolver: zodResolver(escrowDraftSchema),
    defaultValues: {
      title: "",
      freelancerAddress: "" as `0x${string}`,
      description: "",
      milestones: [{ title: "", amount: "", description: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "milestones",
  });

  async function submit(input: EscrowInput) {
    try {
      const row = await api<EscrowModel>("escrows", {
        method: "POST",
        body: input,
      });
      toast.success(t("Escrow contract created"));
      router.push(`/contracts/${row.id}`);
    } catch (error) {
      toast.error(errorText(friendlyError(error)));
    }
  }

  return (
    <GlassCard>
      <form className="stack" onSubmit={form.handleSubmit(submit)}>
        <Field name="title" label="Contract Title" error={form.formState.errors.title?.message as string}>
          <input id="title" placeholder={t("e.g. Website Development")} {...form.register("title")} />
        </Field>

        <Field name="freelancerAddress" label="Freelancer Wallet Address" error={form.formState.errors.freelancerAddress?.message as string}>
          <input id="freelancerAddress" className="technical-text" placeholder="0x..." {...form.register("freelancerAddress")} />
        </Field>

        <Field name="description" label="Description" error={form.formState.errors.description?.message as string}>
          <textarea id="description" placeholder={t("Project details...")} {...form.register("description")} />
        </Field>

        <div className="milestones-section" style={{ marginTop: "2rem" }}>
          <h3><T value="Milestones" /></h3>
          <div className="stack">
            {fields.map((field, index) => (
              <div key={field.id} className="card" style={{ padding: "1rem", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4><T value="Milestone {number}" values={{ number: index + 1 }} /></h4>
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" aria-label={t("Remove milestone")} onClick={() => remove(index)}>
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
                <Field name={`milestones.${index}.title`} label="Milestone Title" error={form.formState.errors.milestones?.[index]?.title?.message}>
                  <input placeholder={t("e.g. Design Phase")} {...form.register(`milestones.${index}.title` as const)} />
                </Field>
                <Field name={`milestones.${index}.amount`} label="Amount (ETH)" error={form.formState.errors.milestones?.[index]?.amount?.message}>
                  <input className="amount-input" placeholder="0.00" {...form.register(`milestones.${index}.amount` as const)} />
                </Field>
              </div>
            ))}
          </div>
          <Button type="button" variant="secondary" onClick={() => append({ title: "", amount: "", description: "" })} style={{ marginTop: "1rem" }}>
            <Plus size={16} /> <T value="Add milestone" />
          </Button>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <Button disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t("Creating contract…") : t("Create contract")}
            <ArrowUpRight size={17} />
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
