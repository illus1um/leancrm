import { HeaderSkeleton, ListSkeleton, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8">
      <HeaderSkeleton />
      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-rule bg-paper-deep/40 p-4"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-7 w-12" />
            <Skeleton className="mt-1 h-3 w-24" />
          </div>
        ))}
      </section>
      <section className="mt-10">
        <Skeleton className="h-3 w-32" />
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-md border border-rule bg-paper-deep/30 p-4"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-8 w-10" />
              <Skeleton className="mt-1 h-3 w-16" />
            </div>
          ))}
        </div>
      </section>
      <section className="mt-10">
        <Skeleton className="h-3 w-40" />
        <div className="mt-3">
          <ListSkeleton rows={4} cols={2} />
        </div>
      </section>
    </div>
  );
}
