import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * PLACEHOLDER WRAPPER.
 * Every piece of temporary content on this site is wrapped in one of these
 * components so it can be found and replaced quickly. Search for
 * "PlaceholderNote", "PlaceholderImage", or "PLACEHOLDER".
 */

export function PlaceholderNote({
  label = "Placeholder",
  children,
  className,
}: {
  label?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span
      data-placeholder
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-dashed border-brass/60 bg-brass/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-accent-foreground",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-brass" aria-hidden />
      {label}
      {children}
    </span>
  );
}

export function PlaceholderImage({
  label,
  aspect = "aspect-[4/5]",
  className,
}: {
  label: string;
  aspect?: string;
  className?: string;
}) {
  return (
    <div
      data-placeholder
      role="img"
      aria-label={`Placeholder: ${label}`}
      className={cn(
        "gradient-placeholder relative overflow-hidden rounded-2xl border border-dashed border-brass/40",
        aspect,
        className,
      )}
    >
      <div className="absolute inset-0 flex items-end p-5">
        <span className="rounded-full bg-navy/70 px-3 py-1.5 text-xs font-medium tracking-wide text-primary-foreground backdrop-blur">
          {label}
        </span>
      </div>
    </div>
  );
}
