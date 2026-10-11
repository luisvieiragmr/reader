"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
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
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
