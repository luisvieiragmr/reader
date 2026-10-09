import { Skeleton } from "@/components/ui/skeleton";

export default function ReadLoading() {
  return (
    <main className="queue-shell flex min-h-dvh flex-col bg-[#0c0c0c] text-[#f4f4f4]">
      <header className="queue-topbar bg-[#0c0c0c]">
        <div className="queue-frame mx-auto flex h-12 w-full items-center justify-between px-[1.15rem] md:h-[4.5rem] md:px-[clamp(2.5rem,5vw,5.5rem)]">
          <span className="queue-nav-title text-[1.28rem] font-semibold tracking-tight text-[#f7f7f7] md:text-[1.85rem]">
            Queue
          </span>
        </div>
        <hr className="border-0 border-t border-white/12" />
      </header>
      <div className="article-measure w-full px-5 pb-28 pt-8 sm:px-0">
        <Skeleton className="mb-3 h-4 w-40 bg-white/8" />
        <Skeleton className="mb-4 h-12 w-full bg-white/8" />
        <Skeleton className="h-32 w-full bg-white/8" />
      </div>
    </main>
  );
}
