"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Theme } from "@astryxdesign/core/theme";
import { LinkProvider } from "@astryxdesign/core/Link";
import { neutralTheme } from "@/themes/neutral/neutralTheme";
import { ConvexClientProvider } from "./ConvexClientProvider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isReader = pathname.startsWith("/read");

  return (
    <ConvexClientProvider>
      <Theme theme={neutralTheme} mode={isReader ? "light" : "dark"}>
        <LinkProvider component={Link}>
          <div className={isReader ? "light min-h-full" : "dark min-h-full"}>
            {children}
          </div>
        </LinkProvider>
      </Theme>
    </ConvexClientProvider>
  );
}
