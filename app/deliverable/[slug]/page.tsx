import { getAllDeliverables, getDeliverable } from "@/lib/mdx";
import { StatusBadge } from "@/components/status-badge";
import { EnvironmentBadge } from "@/components/environment-badge";
import { Changelog } from "@/components/changelog";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const deliverables = await getAllDeliverables();
  return deliverables.map((d) => ({ slug: d.slug }));
}

export default async function DeliverablePage({ params }: Props) {
  const { slug } = await params;
  const deliverable = await getDeliverable(slug);

  if (!deliverable) notFound();

  const { frontmatter, content } = deliverable;

  return (
    <div className="space-y-6 animate-enter">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-text-muted hover:text-text-primary transition-colors"
      >
        ← Back to Roadmap
      </Link>

      {/* Header */}
      <div className="border border-border-default bg-bg-panel">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="font-display text-[clamp(24px,4vw,40px)] font-bold uppercase leading-[0.9] tracking-tight text-neutral-900">
              {frontmatter.title}
            </h1>
            <EnvironmentBadge environment={frontmatter.environment} />
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status={frontmatter.status} />
            <span className="text-[10px] uppercase tracking-[0.15em] text-text-muted">
              Owner: {frontmatter.owner}
            </span>
          </div>
        </div>
        <div className="flex justify-between border-t border-border-default px-6 py-2">
          <span className="text-[10px] tracking-widest text-neutral-400">
            // DELIVERABLE: {slug.toUpperCase().replace(/-/g, "_")}
          </span>
          <span className="text-[10px] tracking-widest text-neutral-400">
            002
          </span>
        </div>
      </div>

      {/* Changelog */}
      <Changelog content={content} />
    </div>
  );
}
