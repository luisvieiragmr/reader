"use client";

import { Suspense } from "react";
import { Show } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { LoginSurface } from "@/components/login-surface";
import { QueueView } from "@/components/queue-view";
import { Skeleton } from "@/components/ui/skeleton";

function AuthGateFallback() {
  return (
    <main className="flex min-h-dvh flex-col bg-[#0c0c0c] px-5 pt-16">
      <Skeleton className="mx-auto mb-6 h-10 w-40 rounded-lg bg-white/8" />
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <Skeleton className="h-12 rounded-xl bg-white/8" />
        <Skeleton className="h-12 rounded-xl bg-white/8" />
        <Skeleton className="h-12 rounded-xl bg-white/8" />
      </div>
    </main>
  );
}

function ConvexAuthMismatch() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#0c0c0c] px-6 text-center text-[#f4f4f4]">
      <p className="text-[1.35rem] font-semibold tracking-tight">Queue</p>
      <p className="mt-3 max-w-md text-[15px] leading-6 text-white/55">
        Signed in with Clerk, but Convex has not accepted the session token yet.
        Create the Clerk JWT template named{" "}
        <span className="text-white/80">convex</span> (or enable the Convex
        integration), then reload.
      </p>
    </main>
  );
}

export default function Home() {
  return (
    <>
      <Show when="signed-out">
        <LoginSurface />
      </Show>
      <Show when="signed-in">
        <AuthLoading>
          <AuthGateFallback />
        </AuthLoading>
        <Authenticated>
          <Suspense fallback={<AuthGateFallback />}>
            <QueueView />
          </Suspense>
        </Authenticated>
        <Unauthenticated>
          <ConvexAuthMismatch />
        </Unauthenticated>
      </Show>
    </>
  );
}
