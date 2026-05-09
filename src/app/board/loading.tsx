import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:py-14">
      <header className="mb-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid gap-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-14 w-3/4 sm:h-20" />
          <Skeleton className="h-3 w-2/3 max-w-md" />
        </div>
        <div className="flex gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="grid gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-14" />
            </div>
          ))}
        </div>
      </header>
      <Skeleton className="mb-4 h-9 w-full max-w-sm" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-rule bg-paper-deep/30 p-4"
          >
            <Skeleton className="h-3 w-20" />
            <div className="mt-4 grid gap-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
