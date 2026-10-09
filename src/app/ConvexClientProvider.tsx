"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
// Prerender still calls useQuery. Skipping ConvexProvider when the public URL
// is unset (Vercel builds without .env.local) crashes the page.
const convex = new ConvexReactClient(
  convexUrl && convexUrl.includes("://")
    ? convexUrl
    : "https://placeholder.convex.cloud",
);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
