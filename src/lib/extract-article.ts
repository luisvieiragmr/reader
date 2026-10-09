import { extract } from "@extractus/article-extractor";
import sanitizeHtml from "sanitize-html";

const USER_AGENT =
  "Mozilla/5.0 (compatible; Reader/0.1; +https://localhost) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const MAX_BODY_CHARS = 700_000;

export type ExtractedArticle = {
  url: string;
  title: string;
  author?: string;
  source?: string;
  publishedAt?: number;
  excerpt?: string;
  imageUrl?: string;
  bodyHtml: string;
  wordCount: number;
};

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("Paste a URL to save.");
  }
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    throw new Error("That does not look like a valid URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs can be saved.");
  }
  parsed.hash = "";
  return parsed.toString();
}

function sourceFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function countWords(html: string): number {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) {
    return 0;
  }
  return text.split(" ").length;
}

function sanitize(html: string): string {
  const clean = sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "hr",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "pre",
      "code",
      "ul",
      "ol",
      "li",
      "a",
      "em",
      "i",
      "strong",
      "b",
      "img",
      "figure",
      "figcaption",
      "span",
      "div",
      "sup",
      "sub",
    ],
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "title", "width", "height"],
      "*": ["id"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
  if (clean.length <= MAX_BODY_CHARS) {
    return clean;
  }
  return `${clean.slice(0, MAX_BODY_CHARS)}<p>…</p>`;
}

export async function extractArticle(rawUrl: string): Promise<ExtractedArticle> {
  const url = normalizeUrl(rawUrl);
  const article = await extract(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!article) {
    throw new Error("Could not extract article content from that URL.");
  }

  const title = article.title?.trim() || new URL(url).hostname;
  const bodyHtml = sanitize(article.content ?? "");
  if (!bodyHtml) {
    throw new Error("That page did not include readable article text.");
  }

  const publishedAt = article.published
    ? Date.parse(article.published)
    : undefined;

  const author = article.author?.trim() || undefined;
  const source = article.source?.trim() || sourceFromUrl(article.url || url);
  const excerpt = article.description?.trim() || undefined;
  const imageUrl = article.image?.trim() || undefined;

  return {
    url: article.url || url,
    title,
    author,
    source,
    publishedAt:
      publishedAt !== undefined && !Number.isNaN(publishedAt)
        ? publishedAt
        : undefined,
    excerpt,
    imageUrl,
    bodyHtml,
    wordCount: countWords(bodyHtml),
  };
}
