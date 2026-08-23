import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-lg">
      <div className="container-page flex h-18 items-center justify-between gap-6 py-3">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          {/* PLACEHOLDER — replace with the real Azimuth logo asset */}
          <span
            aria-hidden
            className="gradient-navy flex size-10 items-center justify-center rounded-xl text-sm font-semibold text-primary-foreground"
          >
            AZ
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-semibold tracking-tight">Azimuth Real Estate</span>
            <span className="block text-xs text-muted-foreground">John Khellah, MBA</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              activeProps={{ className: "text-foreground after:scale-x-100" }}
              className="relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-brass after:transition-transform"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="gold" size="sm" className="hidden sm:inline-flex">
            <Link to="/contact">Book a Consultation</Link>
          </Button>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-border lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-background lg:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col py-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: link.to === "/" }}
                activeProps={{ className: "text-foreground" }}
                className="rounded-lg px-2 py-3 text-base font-medium text-muted-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild variant="gold" className="mt-2">
              <Link to="/contact" onClick={() => setOpen(false)}>
                Book a Consultation
              </Link>
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
