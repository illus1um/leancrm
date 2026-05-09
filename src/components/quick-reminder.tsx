"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createReminder } from "@/lib/actions/reminders";
import { formatRelative } from "@/lib/utils";

export type QuickReminder = {
  id: string;
  title: string;
  dueDate: string;
  status: string;
};

export function QuickReminder({
  link,
  reminders,
}: {
  link: { dealId?: string; contactId?: string; companyId?: string };
  reminders: QuickReminder[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    if (link.dealId) formData.set("dealId", link.dealId);
    if (link.contactId) formData.set("contactId", link.contactId);
    if (link.companyId) formData.set("companyId", link.companyId);
    const result = await createReminder(formData);
    setPending(false);
    if (result.ok) {
      setTitle("");
      setDueDate("");
      setOpen(false);
      router.refresh();
    } else {
      setError(result.fieldErrors?.title?.[0] ?? result.fieldErrors?.dueDate?.[0] ?? result.error);
    }
  }

  const now = new Date();
  return (
    <section>
      <header className="flex items-baseline justify-between">
        <h2 className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">
          Reminders
        </h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex cursor-pointer items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-accent"
        >
          <Plus className="h-3 w-3" strokeWidth={2.25} />
          {open ? "Close" : "Add"}
        </button>
      </header>

      {open ? (
        <form action={action} className="mt-3 grid gap-2 rounded-md border border-rule bg-paper-deep/40 p-3">
          <Label
            htmlFor="quick-title"
            className="text-[10px] uppercase tracking-[0.22em] text-ink-soft"
          >
            What to remember
          </Label>
          <Input
            id="quick-title"
            name="title"
            required
            maxLength={160}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Send the proposal"
          />
          <Label
            htmlFor="quick-date"
            className="mt-1 text-[10px] uppercase tracking-[0.22em] text-ink-soft"
          >
            By when
          </Label>
          <Input
            id="quick-date"
            name="dueDate"
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          {error ? (
            <p className="text-xs uppercase tracking-wider text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !title.trim() || !dueDate}>
              {pending ? "Saving…" : "Add"}
            </Button>
          </div>
        </form>
      ) : null}

      {reminders.length === 0 ? (
        <p className="mt-3 text-xs text-ink-soft">None linked yet.</p>
      ) : (
        <ul className="mt-3 grid gap-1.5">
          {reminders.map((r) => {
            const due = new Date(r.dueDate);
            const overdue = r.status === "OPEN" && due < now;
            return (
              <li
                key={r.id}
                className={`flex items-center justify-between gap-2 text-xs ${r.status === "COMPLETED" ? "opacity-60" : ""}`}
              >
                <span className={r.status === "COMPLETED" ? "line-through" : ""}>
                  {r.title}
                </span>
                <span
                  className={`shrink-0 text-[10px] uppercase tracking-[0.18em] tabular-nums ${overdue ? "text-destructive" : "text-ink-soft"}`}
                >
                  {overdue ? "Overdue · " : ""}
                  {formatRelative(due)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
