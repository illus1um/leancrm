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
import { NativeSelect } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";
import { createContact } from "@/lib/actions/contacts";

type CompanyOption = { id: string; name: string };

export function NewContactDialog({ companies }: { companies: CompanyOption[] }) {
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
    const result = await createContact(formData);
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
        <Button>Add contact</Button>
      </DialogTrigger>
      <DialogContent className="border border-hairline bg-paper p-0 sm:max-w-md">
        <div className="border-b border-rule px-7 pb-5 pt-7">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              New contact
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed text-ink-soft">
              At minimum a name. Email or phone helps.
            </DialogDescription>
          </DialogHeader>
        </div>
        <form action={action} className="grid gap-5 px-7 pb-7 pt-5">
          <Field label="Full name" id="fullName" error={fieldError("fullName")}>
            <Input
              id="fullName"
              name="fullName"
              required
              maxLength={120}
              aria-invalid={Boolean(fieldError("fullName")) || undefined}
              onInput={() => clearField("fullName")}
              placeholder="Aliya N."
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email" id="email" error={fieldError("email")}>
              <Input
                id="email"
                name="email"
                type="email"
                maxLength={160}
                aria-invalid={Boolean(fieldError("email")) || undefined}
                onInput={() => clearField("email")}
                placeholder="aliya@flowers.kz"
              />
            </Field>
            <Field label="Phone" id="phone" error={fieldError("phone")}>
              <Input
                id="phone"
                name="phone"
                maxLength={40}
                aria-invalid={Boolean(fieldError("phone")) || undefined}
                onInput={() => clearField("phone")}
                placeholder="+7 ..."
              />
            </Field>
          </div>
          <Field label="Company" id="companyId" error={fieldError("companyId")}>
            <NativeSelect id="companyId" name="companyId" defaultValue="">
              <option value="">—</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Notes" id="notes" error={fieldError("notes")}>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              maxLength={2000}
              aria-invalid={Boolean(fieldError("notes")) || undefined}
              onInput={() => clearField("notes")}
              placeholder="Anything you'd otherwise forget."
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
              {pending ? "Saving…" : "Save contact"}
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
