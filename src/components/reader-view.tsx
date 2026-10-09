"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(value?: number): string | null {
  if (!value) {
    return null;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatMeta(wordCount: number, publishedAt?: number): string {
  const parts: string[] = [];
  const date = formatDate(publishedAt);
  if (date) {
    parts.push(date);
  }
  if (wordCount > 0) {
    parts.push(`${wordCount.toLocaleString()} words`);
  }
  return parts.join("   ");
}

export function ReaderView({ id }: { id: Id<"articles"> }) {
  const article = useQuery(api.articles.get, { id });

  if (article === undefined) {
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

  if (article === null) {
    return (
      <main className="article-shell flex min-h-dvh items-center justify-center px-5">
        <div className="article-measure text-center">
          <h1 className="article-title mb-3">Article not found</h1>
          <p className="article-meta mb-6">
            It may have been removed from your queue.
          </p>
          <Button asChild>
            <Link href="/">Back to Queue</Link>
          </Button>
        </div>
      </main>
    );
  }

  const byline = [article.author, article.source].filter(Boolean).join(" · ");

  return (
    <main className="article-shell min-h-dvh">
      <div className="article-measure px-5 pb-24 pt-4 sm:px-0 sm:pt-8">
        <header className="mb-8 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/">← Queue</Link>
          </Button>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-black/45 hover:text-black/70"
          >
            Original
          </a>
        </header>

        {byline ? <p className="article-kicker mb-3">{byline}</p> : null}
        <h1 className="article-title">{article.title}</h1>
        <p className="article-meta mt-4">
          {formatMeta(article.wordCount, article.publishedAt)}
        </p>

        <article
          className="article-body mt-8"
          dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
        />
      </div>
    </main>
  );
}
