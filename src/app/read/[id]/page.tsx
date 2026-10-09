"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { ReaderView } from "@/components/reader-view";
import type { Id } from "../../../../convex/_generated/dataModel";

function ReadPageInner() {
  const params = useParams<{ id: string }>();
  return <ReaderView id={params.id as Id<"articles">} />;
}

export default function ReadPage() {
  return (
    <Suspense fallback={null}>
      <ReadPageInner />
    </Suspense>
  );
}
