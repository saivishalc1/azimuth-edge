import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { navLinks, site } from "@/lib/site";
import { PlaceholderNote } from "@/components/Placeholder";

export function Footer() {
  return (
    <footer className="gradient-navy mt-24 text-primary-foreground">
      <div className="container-page grid gap-12 py-16 md:grid-cols-3">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex size-10 items-center justify-center rounded-xl bg-brass text-sm font-semibold text-accent-foreground"
            >
              AZ
            </span>
            <span className="font-display text-base font-semibold">Azimuth Real Estate</span>
          </div>
          <p className="max-w-sm text-sm text-primary-foreground/70">
            Commercial real estate brokerage and education in Northern New Jersey. Led by John Khellah, MBA — Broker of
            Record and instructor.
          </p>
          <div className="flex gap-2">
            <SocialLink href={site.socials.instagram} label="Instagram">
              <Instagram className="size-4" />
            </SocialLink>
            <SocialLink href={site.socials.linkedin} label="LinkedIn">
              <Linkedin className="size-4" />
            </SocialLink>
            <SocialLink href={site.socials.facebook} label="Facebook">
              <Facebook className="size-4" />
            </SocialLink>
          </div>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-brass">Explore</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-primary-foreground/75 transition-colors hover:text-brass">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-brass">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-brass" />
              <a href={`tel:${site.phone.replace(/\D/g, "")}`}>{site.phone}</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-brass" />
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brass" />
              <span>{site.academyAddress}</span>
            </li>
          </ul>
          <PlaceholderNote label="Confirm contact details" className="mt-4 border-brass/50 bg-brass/15 text-brass" />
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container-page space-y-3 py-8 text-xs leading-relaxed text-primary-foreground/55">
          <p>{site.licenseDisclaimer}</p>
          <p>
            Equal Housing Opportunity. We are pledged to the letter and spirit of U.S. policy for the achievement of
            equal housing opportunity throughout the nation.
          </p>
          <p>© {new Date().getFullYear()} Azimuth Real Estate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-lg border border-primary-foreground/20 text-primary-foreground/80 transition-colors hover:border-brass hover:text-brass"
    >
      {children}
    </a>
  );
}
