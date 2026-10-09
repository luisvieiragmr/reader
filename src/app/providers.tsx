"use client";

import Link from "next/link";
import { Theme } from "@astryxdesign/core/theme";
import { LinkProvider } from "@astryxdesign/core/Link";
import { neutralTheme } from "@/themes/neutral/neutralTheme";
import { ConvexClientProvider } from "./ConvexClientProvider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <Theme theme={neutralTheme} mode="dark">
        <LinkProvider component={Link}>
          <div className="dark min-h-full bg-[#0c0c0c] text-[#f4f4f4]">
            {children}
          </div>
        </LinkProvider>
      </Theme>
    </ConvexClientProvider>
  );
}
