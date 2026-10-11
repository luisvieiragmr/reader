"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { Show } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { LoginSurface } from "@/components/login-surface";
import { ReaderView } from "@/components/reader-view";
import { Skeleton } from "@/components/ui/skeleton";
import type { Id } from "../../../../convex/_generated/dataModel";

function ReadPageInner() {
  const params = useParams<{ id: string }>();
  return <ReaderView id={params.id as Id<"articles">} />;
}

function ReadFallback() {
  return (
    <main className="flex min-h-dvh flex-col bg-[#0c0c0c] px-5 pt-16">
      <Skeleton className="mx-auto mb-6 h-10 w-40 rounded-lg bg-white/8" />
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <Skeleton className="h-8 w-2/3 rounded-xl bg-white/8" />
        <Skeleton className="h-40 rounded-xl bg-white/8" />
      </div>
    </main>
  );
}

export default function ReadPage() {
  return (
    <>
      <Show when="signed-out">
        <LoginSurface />
      </Show>
      <Show when="signed-in">
        <AuthLoading>
          <ReadFallback />
        </AuthLoading>
        <Authenticated>
          <Suspense fallback={<ReadFallback />}>
            <ReadPageInner />
          </Suspense>
        </Authenticated>
        <Unauthenticated>
          <LoginSurface />
        </Unauthenticated>
      </Show>
    </>
  );
}
