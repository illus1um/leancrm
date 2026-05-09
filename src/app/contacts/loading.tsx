import { HeaderSkeleton, ListSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8">
      <HeaderSkeleton />
      <div className="mt-6">
        <ListSkeleton rows={6} cols={5} />
      </div>
    </div>
  );
}
