import { Center } from "@astryxdesign/core/Center";
import { VStack } from "@astryxdesign/core/VStack";
import { OAuthConsent, Show } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Authorize access — Queue",
  referrer: "strict-origin-when-cross-origin",
  robots: { index: false, follow: false },
};

export default function OAuthConsentPage() {
  return (
    <Center axis="both" padding={6} className="min-h-dvh">
      <VStack as="main" gap={4} hAlign="center" className="w-full max-w-sm">
        <Suspense fallback={null}>
          <Show when="signed-in">
            <OAuthConsent />
          </Show>
        </Suspense>
      </VStack>
    </Center>
  );
}
