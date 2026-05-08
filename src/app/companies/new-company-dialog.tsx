"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { createCompany } from "@/lib/actions/companies";

export function NewCompanyDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const fieldError = (n: string) => fieldErrors[n]?.[0] ?? null;
  const clearField = (n: string) => {
    if (!fieldErrors[n]) return;
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[n];
      return next;
    });
  };

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    setFieldErrors({});
    const result = await createCompany(formData);
    setPending(false);
    if (result.ok) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.fieldErrors ? null : result.error);
      setFieldErrors(result.fieldErrors ?? {});
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setError(null);
          setFieldErrors({});
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>Add company</Button>
      </DialogTrigger>
      <DialogContent className="border border-hairline bg-paper p-0 sm:max-w-md">
        <div className="border-b border-rule px-7 pb-5 pt-7">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              New company
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed text-ink-soft">
              Group contacts and deals under one organization.
            </DialogDescription>
          </DialogHeader>
        </div>
        <form action={action} className="grid gap-5 px-7 pb-7 pt-5">
          <Field label="Name" id="name" error={fieldError("name")}>
            <Input
              id="name"
              name="name"
              required
              maxLength={120}
              aria-invalid={Boolean(fieldError("name")) || undefined}
              onInput={() => clearField("name")}
              placeholder="Aliya's Flowers"
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Website" id="website" error={fieldError("website")}>
              <Input
                id="website"
                name="website"
                maxLength={200}
                placeholder="aliyas-flowers.kz"
                aria-invalid={Boolean(fieldError("website")) || undefined}
                onInput={() => clearField("website")}
              />
            </Field>
            <Field label="Industry" id="industry" error={fieldError("industry")}>
              <Input
                id="industry"
                name="industry"
                maxLength={80}
                placeholder="Retail"
                aria-invalid={Boolean(fieldError("industry")) || undefined}
                onInput={() => clearField("industry")}
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
            />
          </Field>
          {error ? (
            <p className="text-xs uppercase tracking-wider text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save company"}
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
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label
        htmlFor={id}
        className="text-[10px] uppercase tracking-[0.22em] text-ink-soft"
      >
        {label}
      </Label>
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
