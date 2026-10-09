"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AppChrome, getQueueTab } from "@/components/app-chrome";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export function QueueView() {
  const articles = useQuery(api.articles.list);
  const searchParams = useSearchParams();
  const tab = getQueueTab(searchParams.get("tab"));
  const [query, setQuery] = useState("");

  const filtered = (articles ?? []).filter((article) => {
    if (tab !== "search" || !query.trim()) {
      return true;
    }
    const haystack =
      `${article.title} ${article.author ?? ""} ${article.source ?? ""}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <AppChrome>
      {tab === "search" ? (
        <div className="queue-frame mx-auto w-full px-[1.15rem] pt-4 md:px-[clamp(2.5rem,5vw,5.5rem)] md:pt-6">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the queue"
            aria-label="Search the queue"
            className="h-11 w-full rounded-full border border-white/10 bg-white/6 px-4 text-[15px] text-white outline-none placeholder:text-white/35 md:h-12 md:text-base"
          />
        </div>
      ) : null}

      <section
        className="queue-frame mx-auto w-full flex-1 px-[1.15rem] pb-28 pt-5 md:px-[clamp(2.5rem,5vw,5.5rem)] md:pb-36 md:pt-9"
        aria-label="Saved articles"
      >
        {articles === undefined ? (
          <div className="flex flex-col gap-5">
            <Skeleton className="h-12 rounded-xl bg-white/8 md:h-20" />
            <Skeleton className="h-12 rounded-xl bg-white/8 md:h-20" />
            <Skeleton className="h-12 rounded-xl bg-white/8 md:h-20" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="pt-6 text-[15px] leading-6 text-white/45 md:text-lg">
            {articles.length === 0
              ? "Nothing saved yet. Tap + to paste a URL."
              : "No matches in the queue."}
          </p>
        ) : (
          <>
            <p className="queue-section-label mb-1.5 text-[0.92rem] text-[#8d8d8d] md:mb-3 md:text-[1.15rem]">
              Older
            </p>
            <ul className="flex flex-col">
              {filtered.map((article) => (
                <li key={article._id}>
                  <Link
                    href={`/read/${article._id}`}
                    className="flex items-center gap-3 py-3.5 md:gap-5 md:py-6 xl:py-7"
                  >
                    {article.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.imageUrl}
                        alt=""
                        className="size-8 shrink-0 rounded-md object-cover md:size-14 xl:size-16"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-xs font-semibold text-white/80 md:size-14 md:text-base xl:size-16"
                      >
                        {article.title.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <span className="queue-item-title min-w-0 flex-1 text-[1.02rem] font-medium tracking-tight text-[#f3f3f3] md:text-[1.55rem] md:leading-snug xl:text-[1.75rem]">
                      {article.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </AppChrome>
  );
}
