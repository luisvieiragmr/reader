import { Skeleton } from "@/components/ui/skeleton";

export default function ReadLoading() {
  return (
    <main className="article-shell min-h-dvh px-5 py-8">
      <div className="article-measure">
        <Skeleton className="mb-8 h-8 w-20" />
        <Skeleton className="mb-3 h-4 w-40" />
        <Skeleton className="mb-4 h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </main>
  );
}
