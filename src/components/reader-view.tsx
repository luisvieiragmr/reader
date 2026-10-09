"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { AppChrome } from "@/components/app-chrome";
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

function ReaderBody({ id }: { id: Id<"articles"> }) {
  const article = useQuery(api.articles.get, { id });

  if (article === undefined) {
    return (
      <div className="article-measure w-full px-5 pb-28 pt-8 sm:px-0 md:pb-36">
        <Skeleton className="mb-3 h-4 w-40 bg-white/8" />
        <Skeleton className="mb-4 h-12 w-full bg-white/8" />
        <Skeleton className="h-32 w-full bg-white/8" />
      </div>
    );
  }

  if (article === null) {
    return (
      <div className="article-measure w-full px-5 pb-28 pt-16 text-center md:pb-36">
        <h1 className="article-title mb-3">Article not found</h1>
        <p className="article-meta">It may have been removed from your queue.</p>
      </div>
    );
  }

  const byline = [article.author, article.source].filter(Boolean).join(" · ");

  return (
    <div className="article-measure w-full px-5 pb-28 pt-8 sm:px-0 md:pb-36 md:pt-10">
      {byline ? <p className="article-kicker mb-3">{byline}</p> : null}
      <h1 className="article-title">{article.title}</h1>
      <p className="article-meta mt-4">
        {formatMeta(article.wordCount, article.publishedAt)}
        {article.wordCount > 0 || article.publishedAt ? "   " : null}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/45 hover:text-white/70"
        >
          Original
        </a>
      </p>

      <article
        className="article-body mt-8"
        dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
      />
    </div>
  );
}

export function ReaderView({ id }: { id: Id<"articles"> }) {
  return (
    <AppChrome>
      <div className="article-shell flex flex-1 flex-col">
        <ReaderBody id={id} />
      </div>
    </AppChrome>
  );
}
