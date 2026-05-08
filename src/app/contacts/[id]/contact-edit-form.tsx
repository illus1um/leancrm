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
import { NativeSelect } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";
import { deleteContact, updateContact } from "@/lib/actions/contacts";
import { formatRelative } from "@/lib/utils";

type ContactForm = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  companyId: string | null;
  updatedAt: string;
};

export function ContactEditForm({
  contact,
  companies,
}: {
  contact: ContactForm;
  companies: Array<{ id: string; name: string }>;
}) {
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
    formData.set("id", contact.id);
    const result = await updateContact(formData);
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
    fd.set("id", contact.id);
    await deleteContact(fd);
    setDeleting(false);
    setConfirmOpen(false);
  }

  return (
    <form action={action} className="grid gap-6">
      <Field label="Full name" id="fullName" error={fieldError("fullName")}>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={contact.fullName}
          required
          maxLength={120}
          aria-invalid={Boolean(fieldError("fullName")) || undefined}
          onInput={() => clearField("fullName")}
        />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Email" id="email" error={fieldError("email")}>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={contact.email ?? ""}
            maxLength={160}
            aria-invalid={Boolean(fieldError("email")) || undefined}
            onInput={() => clearField("email")}
          />
        </Field>
        <Field label="Phone" id="phone" error={fieldError("phone")}>
          <Input
            id="phone"
            name="phone"
            defaultValue={contact.phone ?? ""}
            maxLength={40}
            aria-invalid={Boolean(fieldError("phone")) || undefined}
            onInput={() => clearField("phone")}
          />
        </Field>
      </div>
      <Field label="Company" id="companyId" error={fieldError("companyId")}>
        <NativeSelect
          id="companyId"
          name="companyId"
          defaultValue={contact.companyId ?? ""}
        >
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
          rows={4}
          defaultValue={contact.notes ?? ""}
          maxLength={2000}
          aria-invalid={Boolean(fieldError("notes")) || undefined}
          onInput={() => clearField("notes")}
        />
      </Field>

      <div className="flex items-center gap-3 text-[12px] text-ink-soft">
        <span className="uppercase tracking-[0.18em]">
          Last edited {formatRelative(new Date(contact.updatedAt))}
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
          Delete contact
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
                Delete this contact?
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-relaxed text-ink-soft">
                <span className="text-ink">{contact.fullName}</span> will be removed.
                Linked deals will lose the contact reference but stay on the board.
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
