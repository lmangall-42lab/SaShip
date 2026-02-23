"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function Nav({ projectName, lastSync }: { projectName: string; lastSync?: string }) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-border-default bg-bg-base/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex items-center gap-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-42lab.svg" alt="42Lab.co" width={140} height={28} className="rounded-l" />
            <span className="rounded-r bg-[#D4F53C] px-2 py-[5px] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1a1a1a]">
              SaShip
            </span>
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
          <Link
            href="/commits"
            className={`text-[11px] uppercase tracking-[0.12em] transition-colors ${
              pathname === "/commits"
                ? "text-text-primary font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Commits
          </Link>
          <Link
            href="/extras"
            className={`text-[11px] uppercase tracking-[0.12em] transition-colors ${
              pathname === "/extras"
                ? "text-text-primary font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Extras
          </Link>
          <Link
            href="/issues"
            className={`text-[11px] uppercase tracking-[0.12em] transition-colors ${
              pathname === "/issues"
                ? "text-text-primary font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Issues
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent border border-accent-text/50" style={{ animation: "pulse-dot 2s infinite" }} />
            <span className="text-[10px] uppercase tracking-[0.15em] text-accent-text">
              {lastSync ? `Synced ${timeAgo(lastSync)}` : "Live"}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
