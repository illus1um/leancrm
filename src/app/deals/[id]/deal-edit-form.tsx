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
import { DEAL_STAGES, STAGE_CLASS, STAGE_LABELS, type DealStage } from "@/lib/stages";
import { deleteDeal, updateDeal } from "@/lib/actions/deals";
import { formatRelative } from "@/lib/utils";

type DealForm = {
  id: string;
  title: string;
  amount: number | null;
  stage: DealStage;
  contactId: string | null;
  companyId: string | null;
  notes: string | null;
  updatedAt: string;
};

type Picker = { id: string; name: string };

export function DealEditForm({
  deal,
  contacts,
  companies,
}: {
  deal: DealForm;
  contacts: Picker[];
  companies: Picker[];
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<Date | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [stage, setStage] = React.useState<DealStage>(deal.stage);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const fieldError = (name: string) => fieldErrors[name]?.[0] ?? null;
  const clearField = (name: string) => {
    if (!fieldErrors[name]) return;
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  async function confirmDelete() {
    setDeleting(true);
    const fd = new FormData();
    fd.set("id", deal.id);
    await deleteDeal(fd);
    // deleteDeal redirects, so this is mostly a fallback
    setDeleting(false);
    setConfirmOpen(false);
  }

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    setFieldErrors({});
    formData.set("id", deal.id);
    const result = await updateDeal(formData);
    setPending(false);
    if (result.ok) {
      setSavedAt(new Date());
      router.refresh();
    } else {
      setError(result.fieldErrors ? null : result.error);
      setFieldErrors(result.fieldErrors ?? {});
    }
  }

  return (
    <form action={action} className="grid gap-7">
      <FieldRow label="Title" id="title" error={fieldError("title")}>
        <Input
          id="title"
          name="title"
          defaultValue={deal.title}
          required
          maxLength={120}
          aria-invalid={Boolean(fieldError("title")) || undefined}
          onInput={() => clearField("title")}
        />
      </FieldRow>

      <div className="grid gap-7 sm:grid-cols-[1fr_1fr]">
        <FieldRow label="Amount (USD)" id="amount" error={fieldError("amount")}>
          <Input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            defaultValue={deal.amount ?? ""}
            aria-invalid={Boolean(fieldError("amount")) || undefined}
            onInput={() => clearField("amount")}
            className="tabular-nums"
          />
        </FieldRow>
        <FieldRow label="Stage" id="stage" error={fieldError("stage")}>
          <div className={`flex items-center gap-3 ${STAGE_CLASS[stage]}`}>
            <NativeSelect
              id="stage"
              name="stage"
              value={stage}
              onChange={(e) => setStage(e.target.value as DealStage)}
              aria-invalid={Boolean(fieldError("stage")) || undefined}
              className="flex-1"
            >
              {DEAL_STAGES.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABELS[s]}
                </option>
              ))}
            </NativeSelect>
            <span
              className="hidden h-8 rounded-sm border border-hairline/50 px-3 leading-8 text-[10px] uppercase tracking-[0.2em] sm:inline-block"
              style={{
                background: "var(--stage-bg)",
                color: "var(--stage-fg)",
              }}
            >
              {STAGE_LABELS[stage]}
            </span>
          </div>
        </FieldRow>
      </div>

      <div className="grid gap-7 sm:grid-cols-[1fr_1fr]">
        <FieldRow label="Contact" id="contactId" error={fieldError("contactId")}>
          <NativeSelect
            id="contactId"
            name="contactId"
            defaultValue={deal.contactId ?? ""}
          >
            <option value="">—</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
        </FieldRow>
        <FieldRow label="Company" id="companyId" error={fieldError("companyId")}>
          <NativeSelect
            id="companyId"
            name="companyId"
            defaultValue={deal.companyId ?? ""}
          >
            <option value="">—</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
        </FieldRow>
      </div>

      <FieldRow
        label="Notes"
        id="notes"
        hint="In your own voice."
        error={fieldError("notes")}
      >
        <Textarea
          id="notes"
          name="notes"
          rows={6}
          defaultValue={deal.notes ?? ""}
          maxLength={2000}
          aria-invalid={Boolean(fieldError("notes")) || undefined}
          onInput={() => clearField("notes")}
          placeholder="A line about the conversation. The stuff you'd otherwise forget by Monday."
          className="text-[14px] leading-relaxed"
        />
      </FieldRow>

      <div className="flex items-center gap-3 text-[12px] text-ink-soft">
        <span className="uppercase tracking-[0.18em]">
          Last edited {formatRelative(new Date(deal.updatedAt))}
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
          Discard this deal
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/board")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Filing…" : "Save changes"}
          </Button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="border border-hairline bg-paper p-0 shadow-[0_24px_48px_-12px_rgba(40,30,20,0.25)] sm:max-w-md">
          <div className="border-b border-rule px-7 pb-5 pt-7">
            <p className="text-[10px] uppercase tracking-[0.22em] text-destructive">
              Permanent action
            </p>
            <DialogHeader className="mt-1.5 space-y-2">
              <DialogTitle className="text-2xl font-semibold leading-none tracking-tight">
                Discard this deal?
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-relaxed text-ink-soft">
                <span className="text-ink">{deal.title}</span> will be removed from
                the board, along with its notes and history. This cannot be undone.
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
              {deleting ? "Discarding…" : "Yes, discard"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}

function FieldRow({
  label,
  id,
  hint,
  error,
  children,
}: {
  label: string;
  id: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between">
        <Label
          htmlFor={id}
          className="text-[10px] uppercase tracking-[0.22em] text-ink-soft"
        >
          {label}
        </Label>
        {hint ? (
          <span className="text-xs text-ink-soft">{hint}</span>
        ) : null}
      </div>
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
