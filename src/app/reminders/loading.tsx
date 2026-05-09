import { HeaderSkeleton, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8">
      <HeaderSkeleton />
      <Skeleton className="mt-8 h-32 w-full rounded-md" />
      <div className="mt-10 grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
