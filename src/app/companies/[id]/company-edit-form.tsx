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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteCompany, updateCompany } from "@/lib/actions/companies";
import { formatRelative } from "@/lib/utils";

type CompanyForm = {
  id: string;
  name: string;
  website: string | null;
  industry: string | null;
  notes: string | null;
  updatedAt: string;
};

export function CompanyEditForm({ company }: { company: CompanyForm }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<Date | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

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
    formData.set("id", company.id);
    const result = await updateCompany(formData);
    setPending(false);
    if (result.ok) {
      setSavedAt(new Date());
      router.refresh();
    } else {
      setError(result.fieldErrors ? null : result.error);
      setFieldErrors(result.fieldErrors ?? {});
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    const fd = new FormData();
    fd.set("id", company.id);
    await deleteCompany(fd);
    setDeleting(false);
    setConfirmOpen(false);
  }

  return (
    <form action={action} className="grid gap-6">
      <Field label="Name" id="name" error={fieldError("name")}>
        <Input
          id="name"
          name="name"
          defaultValue={company.name}
          required
          maxLength={120}
          aria-invalid={Boolean(fieldError("name")) || undefined}
          onInput={() => clearField("name")}
        />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Website" id="website" error={fieldError("website")}>
          <Input
            id="website"
            name="website"
            defaultValue={company.website ?? ""}
            maxLength={200}
            aria-invalid={Boolean(fieldError("website")) || undefined}
            onInput={() => clearField("website")}
          />
        </Field>
        <Field label="Industry" id="industry" error={fieldError("industry")}>
          <Input
            id="industry"
            name="industry"
            defaultValue={company.industry ?? ""}
            maxLength={80}
            aria-invalid={Boolean(fieldError("industry")) || undefined}
            onInput={() => clearField("industry")}
          />
        </Field>
      </div>
      <Field label="Notes" id="notes" error={fieldError("notes")}>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={company.notes ?? ""}
          maxLength={2000}
          aria-invalid={Boolean(fieldError("notes")) || undefined}
          onInput={() => clearField("notes")}
        />
      </Field>

      <div className="flex items-center gap-3 text-[12px] text-ink-soft">
        <span className="uppercase tracking-[0.18em]">
          Last edited {formatRelative(new Date(company.updatedAt))}
        </span>
        {savedAt ? (
          <span className="text-accent" role="status">
            · Saved {formatRelative(savedAt)}
          </span>
        ) : null}
        {error ? (
          <span className="uppercase tracking-wider text-destructive" role="alert">
            · {error}
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-rule pt-6">
        <Button
          type="button"
          variant="ghost"
          className="text-destructive hover:bg-destructive/5"
          onClick={() => setConfirmOpen(true)}
        >
          Delete company
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="border border-hairline bg-paper p-0 sm:max-w-md">
          <div className="border-b border-rule px-7 pb-5 pt-7">
            <p className="text-[10px] uppercase tracking-[0.22em] text-destructive">
              Permanent action
            </p>
            <DialogHeader className="mt-1.5 space-y-2">
              <DialogTitle className="text-2xl font-semibold leading-none tracking-tight">
                Delete this company?
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-relaxed text-ink-soft">
                <span className="text-ink">{company.name}</span> will be removed.
                Linked contacts and deals stay; only the company link is dropped.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="gap-2 px-7 pb-7 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              Keep it
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
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
