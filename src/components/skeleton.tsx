import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-sm bg-[color-mix(in_oklab,var(--paper-deep)_60%,var(--rule))]",
        className
      )}
    />
  );
}

export function ListSkeleton({
  rows = 5,
  cols = 3,
}: {
  rows?: number;
  cols?: number;
}) {
  const widths = ["w-2/3", "w-1/2", "w-1/3", "w-3/4", "w-1/4"];
  return (
    <div className="overflow-hidden rounded-md border border-rule bg-paper-deep/40">
      <ul className="divide-y divide-rule">
        {Array.from({ length: rows }).map((_, r) => (
          <li
            key={r}
            className="grid items-center gap-4 px-5 py-3.5"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className={cn("h-4", widths[(r + c) % widths.length])}
              />
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HeaderSkeleton({ withStats = false }: { withStats?: boolean }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
      <div className="grid gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-3 w-40" />
      </div>
      {withStats ? (
        <div className="flex gap-8">
          <div className="grid gap-1">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-7 w-12" />
          </div>
          <div className="grid gap-1">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
      ) : null}
    </header>
  );
}
