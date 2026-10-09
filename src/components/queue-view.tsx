"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import {
  AlignJustify,
  ChevronDown,
  Home,
  Plus,
  Search,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { AddUrlForm } from "@/components/add-url-form";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";

export function QueueView() {
  const articles = useQuery(api.articles.list);
  const [composerOpen, setComposerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState<"home" | "search" | "list">("home");
  const [query, setQuery] = useState("");

  const filtered = (articles ?? []).filter((article) => {
    if (tab !== "search" || !query.trim()) {
      return true;
    }
    const haystack = `${article.title} ${article.author ?? ""} ${article.source ?? ""}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <main className="queue-shell flex min-h-dvh flex-col bg-[#0c0c0c] text-[#f4f4f4]">
      <header className="queue-topbar sticky top-0 z-10 bg-[#0c0c0c]">
        <div className="queue-frame mx-auto flex h-12 w-full items-center justify-between px-[1.15rem] md:h-[4.5rem] md:px-[clamp(2.5rem,5vw,5.5rem)]">
          <div className="relative">
            <button
              type="button"
              className="queue-nav-title inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-[1.28rem] font-semibold tracking-tight text-[#f7f7f7] hover:bg-white/6 md:text-[1.85rem]"
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              Queue
              <ChevronDown
                className={cn(
                  "size-4 text-white/55 md:size-5",
                  menuOpen && "rotate-180",
                )}
                strokeWidth={2}
              />
            </button>
            {menuOpen ? (
              <div
                role="listbox"
                className="absolute left-0 top-full z-20 mt-1 min-w-40 rounded-lg border border-white/10 bg-[#1a1a1a] py-1 shadow-lg"
              >
                <button
                  type="button"
                  role="option"
                  aria-selected
                  className="block w-full px-3 py-2 text-left text-sm text-white md:text-base"
                  onClick={() => setMenuOpen(false)}
                >
                  Queue
                </button>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full text-white/90 hover:bg-white/8 md:size-11"
            aria-label="Add article"
            onClick={() => {
              setComposerOpen((open) => !open);
              setTab("home");
            }}
          >
            <Plus className="size-5 md:size-6" strokeWidth={1.75} />
          </button>
        </div>
        <hr className="border-0 border-t border-white/12" />
        {composerOpen ? (
          <div className="queue-frame mx-auto w-full px-[1.15rem] py-3 md:px-[clamp(2.5rem,5vw,5.5rem)] md:py-4">
            <AddUrlForm onCancel={() => setComposerOpen(false)} />
          </div>
        ) : null}
      </header>

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

      <nav
        className="queue-tabbar fixed bottom-[1.1rem] left-1/2 z-20 flex w-[min(22.5rem,calc(100%-1.5rem))] -translate-x-1/2 items-center justify-around rounded-full bg-[rgb(38_38_38_/_92%)] py-[0.7rem] shadow-[0_8px_32px_rgb(0_0_0_/_35%)] md:bottom-7 md:w-[min(36rem,calc(100%-3rem))] md:py-4"
        aria-label="Primary"
      >
        <button
          type="button"
          className={cn(
            "queue-tab relative flex h-8 w-[4.5rem] items-center justify-center text-[#cfcfcf] md:h-9 md:w-24",
            tab === "home" && "is-active text-white",
          )}
          aria-current={tab === "home" ? "page" : undefined}
          aria-label="Home"
          onClick={() => {
            setTab("home");
            setQuery("");
          }}
        >
          {tab === "home" ? (
            <span className="queue-tab-dot absolute top-[-0.2rem] size-[0.28rem] rounded-full bg-white" />
          ) : null}
          <Home
            className="size-5 md:size-6"
            strokeWidth={1.6}
            fill={tab === "home" ? "currentColor" : "none"}
          />
        </button>
        <button
          type="button"
          className={cn(
            "queue-tab relative flex h-8 w-[4.5rem] items-center justify-center text-[#cfcfcf] md:h-9 md:w-24",
            tab === "search" && "is-active text-white",
          )}
          aria-current={tab === "search" ? "page" : undefined}
          aria-label="Search"
          onClick={() => setTab("search")}
        >
          <Search className="size-5 md:size-6" strokeWidth={1.6} />
        </button>
        <button
          type="button"
          className={cn(
            "queue-tab relative flex h-8 w-[4.5rem] items-center justify-center text-[#cfcfcf] md:h-9 md:w-24",
            tab === "list" && "is-active text-white",
          )}
          aria-current={tab === "list" ? "page" : undefined}
          aria-label="Lists"
          onClick={() => {
            setTab("list");
            setQuery("");
          }}
        >
          <AlignJustify className="size-5 md:size-6" strokeWidth={1.6} />
        </button>
      </nav>
    </main>
  );
}
