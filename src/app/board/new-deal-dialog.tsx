"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";
import { DEAL_STAGES, STAGE_LABELS, type DealStage } from "@/lib/stages";
import { createDeal } from "@/lib/actions/deals";

export function NewDealDialog({ defaultStage }: { defaultStage: DealStage }) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  function reset() {
    setError(null);
    setFieldErrors({});
  }

  async function action(formData: FormData) {
    setPending(true);
    reset();
    const result = await createDeal(formData);
    setPending(false);
    if (result.ok) {
      setOpen(false);
    } else {
      setError(result.fieldErrors ? null : result.error);
      setFieldErrors(result.fieldErrors ?? {});
    }
  }

  function fieldError(name: string): string | null {
    return fieldErrors[name]?.[0] ?? null;
  }

  function clearField(name: string) {
    if (!fieldErrors[name]) return;
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Add deal in ${STAGE_LABELS[defaultStage]}`}
          className="group inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-hairline/60 text-ink-soft transition-colors hover:border-accent hover:bg-accent hover:text-paper focus-ink"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </DialogTrigger>
      <DialogContent className="border border-hairline bg-paper p-0 shadow-[0_24px_48px_-12px_rgba(40,30,20,0.25)] sm:max-w-md">
        <div className="border-b border-rule px-7 pb-5 pt-7">
          <p className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
            New entry · {STAGE_LABELS[defaultStage]}
          </p>
          <DialogHeader className="mt-1.5 space-y-2">
            <DialogTitle className="text-2xl font-semibold leading-none tracking-tight">
              Open a deal.
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed text-ink-soft">
              The only required field is the title. Everything else can wait until you
              have a clearer picture.
            </DialogDescription>
          </DialogHeader>
        </div>
        <form action={action} className="grid gap-4 px-7 pb-7 pt-5">
          <Field label="Title" id="title" error={fieldError("title")}>
            <Input
              id="title"
              name="title"
              required
              maxLength={120}
              aria-invalid={Boolean(fieldError("title")) || undefined}
              onInput={() => clearField("title")}
              placeholder="Wedding bouquet — recurring monthly order"
              autoFocus
            />
          </Field>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Field label="Amount" id="amount" error={fieldError("amount")}>
              <Input
                id="amount"
                name="amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                aria-invalid={Boolean(fieldError("amount")) || undefined}
                onInput={() => clearField("amount")}
                placeholder="0"
                className="tabular-nums"
              />
            </Field>
            <Field label="Stage" id="stage" error={fieldError("stage")}>
              <NativeSelect
                id="stage"
                name="stage"
                defaultValue={defaultStage}
                aria-invalid={Boolean(fieldError("stage")) || undefined}
                className="min-w-32"
              >
                {DEAL_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABELS[s]}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact" id="contactName" error={fieldError("contactName")}>
              <Input
                id="contactName"
                name="contactName"
                maxLength={120}
                aria-invalid={Boolean(fieldError("contactName")) || undefined}
                onInput={() => clearField("contactName")}
                placeholder="Aliya N."
              />
            </Field>
            <Field label="Company" id="companyName" error={fieldError("companyName")}>
              <Input
                id="companyName"
                name="companyName"
                maxLength={120}
                aria-invalid={Boolean(fieldError("companyName")) || undefined}
                onInput={() => clearField("companyName")}
                placeholder="Aliya's Flowers"
              />
            </Field>
          </div>
          <Field label="Notes" id="notes" error={fieldError("notes")}>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              maxLength={2000}
              aria-invalid={Boolean(fieldError("notes")) || undefined}
              onInput={() => clearField("notes")}
              placeholder="Anything to remember about this deal."
              className="text-[14px]"
            />
          </Field>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter className="mt-2 gap-2 border-t border-rule pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Discard
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Filing…" : "Add to board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs leading-tight text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
