"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlignJustify, ChevronDown, Home, Plus, Search } from "lucide-react";
import { AddUrlForm } from "@/components/add-url-form";
import { cn } from "cn";

export type QueueTab = "home" | "search" | "list";

export function getQueueTab(tab: string | null): QueueTab {
  if (tab === "search" || tab === "list") {
    return tab;
  }
  return "home";
}

function tabHref(tab: QueueTab): string {
  return tab === "home" ? "/" : `/?tab=${tab}`;
}

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = getQueueTab(searchParams.get("tab"));
  const onQueue = pathname === "/";
  const [composerOpen, setComposerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  function goToTab(next: QueueTab) {
    setMenuOpen(false);
    if (next !== "home") {
      setComposerOpen(false);
    }
    router.push(tabHref(next));
  }

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
              onClick={() => {
                if (!onQueue) {
                  router.push("/");
                  return;
                }
                setMenuOpen((open) => !open);
              }}
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
                  onClick={() => goToTab("home")}
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
              if (!onQueue) {
                return;
              }
              if (tab !== "home") {
                router.push("/");
              }
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

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>

      <nav
        className="queue-tabbar fixed bottom-[1.1rem] left-1/2 z-20 flex w-[min(22.5rem,calc(100%-1.5rem))] -translate-x-1/2 items-center justify-around rounded-full bg-[rgb(38_38_38_/_92%)] py-[0.7rem] shadow-[0_8px_32px_rgb(0_0_0_/_35%)] md:bottom-7 md:w-[min(36rem,calc(100%-3rem))] md:py-4"
        aria-label="Primary"
      >
        <Link
          href="/"
          className={cn(
            "queue-tab relative flex h-8 w-[4.5rem] items-center justify-center text-[#cfcfcf] md:h-9 md:w-24",
            onQueue && tab === "home" && "is-active text-white",
          )}
          aria-current={onQueue && tab === "home" ? "page" : undefined}
          aria-label="Home"
        >
          {onQueue && tab === "home" ? (
            <span className="queue-tab-dot absolute top-[-0.2rem] size-[0.28rem] rounded-full bg-white" />
          ) : null}
          <Home
            className="size-5 md:size-6"
            strokeWidth={1.6}
            fill={onQueue && tab === "home" ? "currentColor" : "none"}
          />
        </Link>
        <Link
          href="/?tab=search"
          className={cn(
            "queue-tab relative flex h-8 w-[4.5rem] items-center justify-center text-[#cfcfcf] md:h-9 md:w-24",
            onQueue && tab === "search" && "is-active text-white",
          )}
          aria-current={onQueue && tab === "search" ? "page" : undefined}
          aria-label="Search"
        >
          <Search className="size-5 md:size-6" strokeWidth={1.6} />
        </Link>
        <Link
          href="/?tab=list"
          className={cn(
            "queue-tab relative flex h-8 w-[4.5rem] items-center justify-center text-[#cfcfcf] md:h-9 md:w-24",
            onQueue && tab === "list" && "is-active text-white",
          )}
          aria-current={onQueue && tab === "list" ? "page" : undefined}
          aria-label="Lists"
        >
          <AlignJustify className="size-5 md:size-6" strokeWidth={1.6} />
        </Link>
      </nav>
    </main>
  );
}
