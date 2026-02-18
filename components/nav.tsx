"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav({ projectName }: { projectName: string }) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-border-default bg-bg-base/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-primary">
            SaShip
          </span>
          <span className="text-[10px] uppercase tracking-[0.15em] text-text-muted">
            / {projectName}
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-[11px] uppercase tracking-[0.12em] transition-colors ${
              pathname === "/"
                ? "text-text-primary font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Overview
          </Link>
          <Link
            href="/roadmap"
            className={`text-[11px] uppercase tracking-[0.12em] transition-colors ${
              pathname === "/roadmap"
                ? "text-text-primary font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Roadmap
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent border border-accent-text/50" style={{ animation: "pulse-dot 2s infinite" }} />
            <span className="text-[10px] uppercase tracking-[0.15em] text-accent-text">
              Live
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
