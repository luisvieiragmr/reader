"use client";

import { SignIn } from "@clerk/nextjs";

/**
 * Matter-dark signed-out home: brand + Clerk sign-in.
 * Queue content is never shown here.
 */
export function LoginSurface() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] px-5 py-12 text-[#f4f4f4]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(255,255,255,0.08),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.65)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.65)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
        <div className="text-center">
          <p className="text-[2.15rem] font-semibold tracking-tight text-[#f7f7f7] md:text-[2.75rem]">
            Queue
          </p>
          <p className="mt-2 text-[15px] leading-6 text-white/50 md:text-base">
            Sign in to open your saved articles.
          </p>
        </div>

        <SignIn
          routing="hash"
          forceRedirectUrl="/"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "w-full shadow-none",
              card: "border border-white/10 bg-[#141414] shadow-none",
            },
          }}
        />
      </div>
    </main>
  );
}
