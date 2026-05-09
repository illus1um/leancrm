"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";
import { ACTIVITY_TYPES, type ActivityType } from "@/lib/schemas";
import { createActivity } from "@/lib/actions/activities";
import { formatRelative } from "@/lib/utils";

export type Activity = {
  id: string;
  type: string;
  content: string;
  createdAt: string;
};

export type ActivityLink = {
  dealId?: string;
  contactId?: string;
  companyId?: string;
};

const TYPE_LABEL: Record<string, string> = {
  STAGE_CHANGE: "Stage change",
  NOTE: "Note",
  CALL: "Call",
  EMAIL: "Email",
  MEETING: "Meeting",
};

export function ActivityFeed({
  link,
  activities,
}: {
  link: ActivityLink;
  activities: Activity[];
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [content, setContent] = React.useState("");
  const [type, setType] = React.useState<ActivityType>("NOTE");

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    if (link.dealId) formData.set("dealId", link.dealId);
    if (link.contactId) formData.set("contactId", link.contactId);
    if (link.companyId) formData.set("companyId", link.companyId);
    const result = await createActivity(formData);
    setPending(false);
    if (result.ok) {
      setContent("");
      router.refresh();
    } else {
      setError(result.fieldErrors?.content?.[0] ?? result.error);
    }
  }

  return (
    <section className="border-t border-rule pt-8">
      <header className="mb-4 flex items-baseline justify-between">
        <h2 className="text-[10px] uppercase tracking-[0.25em] text-ink-soft">
          Activity
        </h2>
        <span className="text-[10px] uppercase tracking-[0.2em] text-ink-soft tabular-nums">
          {activities.length} {activities.length === 1 ? "entry" : "entries"}
        </span>
      </header>

      <form
        action={action}
        className="grid gap-3 rounded-md border border-rule bg-paper-deep/40 p-4"
      >
        <div className="grid grid-cols-[8rem_1fr] items-start gap-3">
          <div className="grid gap-1.5">
            <Label
              htmlFor="type"
              className="text-[10px] uppercase tracking-[0.22em] text-ink-soft"
            >
              Type
            </Label>
            <NativeSelect
              id="type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value as ActivityType)}
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABEL[t]}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="grid gap-1.5">
            <Label
              htmlFor="content"
              className="text-[10px] uppercase tracking-[0.22em] text-ink-soft"
            >
              Entry
            </Label>
            <Textarea
              id="content"
              name="content"
              rows={2}
              maxLength={2000}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What just happened?"
            />
          </div>
        </div>
        {error ? (
          <p className="text-xs uppercase tracking-wider text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end">
          <Button type="submit" disabled={pending || !content.trim()}>
            {pending ? "Logging…" : "Log activity"}
          </Button>
        </div>
      </form>

      {activities.length === 0 ? (
        <p className="mt-6 text-sm text-ink-soft">
          No activity yet. Stage moves will appear here automatically.
        </p>
      ) : (
        <ol className="mt-6 grid gap-4">
          {activities.map((a) => (
            <li
              key={a.id}
              className="grid grid-cols-[6rem_1fr] gap-4 border-b border-rule pb-3 last:border-b-0"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                  {TYPE_LABEL[a.type] ?? a.type}
                </p>
                <p className="text-[11px] tabular-nums text-ink-soft">
                  {formatRelative(new Date(a.createdAt))}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-ink">{a.content}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
