import { createFileRoute } from "@tanstack/react-router";
import { Clock, Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";
import { PlaceholderNote } from "@/components/Placeholder";
import { SectionHeading } from "@/components/SectionHeading";
import { site } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact John Khellah | Azimuth Real Estate, Jersey City" },
      {
        name: "description",
        content:
          "Call, email, or book a 15-minute consultation with John Khellah, MBA — Broker of Record at Azimuth Real Estate in Jersey City, New Jersey.",
      },
      { property: "og:title", content: "Contact Azimuth Real Estate" },
      {
        property: "og:description",
        content: "Talk to John Khellah about your property, your portfolio, or your real estate career.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <>
      <section className="gradient-navy text-primary-foreground">
        <div className="container-page max-w-3xl py-20">
          <p className="eyebrow">Contact</p>
          <h1 className="heading-xl mt-4 text-primary-foreground">Let's talk about your property or your career.</h1>
          <p className="mt-6 text-lg leading-relaxed text-primary-foreground/75">
            Whether you own a building in Hudson County or you just passed your licensing exam, start here.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-8">
            <div className="surface-card p-7">
              <h2 className="font-display text-lg font-semibold">Contact details</h2>
              <PlaceholderNote label="Confirm before launch" className="mt-3" />
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 text-brass" />
                  <a href={`tel:${site.phone.replace(/\D/g, "")}`}>{site.phone}</a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 text-brass" />
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 text-brass" />
                  <span>
                    <span className="block font-medium">Brokerage office</span>
                    <span className="text-muted-foreground">{site.officeAddress}</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 text-brass" />
                  <span>
                    <span className="block font-medium">Academy</span>
                    <span className="text-muted-foreground">{site.academyAddress}</span>
                  </span>
                </li>
              </ul>
            </div>

            <div className="surface-card p-7">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Clock className="size-4 text-brass" /> Business hours
              </h2>
              <ul className="mt-5 space-y-2 text-sm">
                {site.hours.map((row) => (
                  <li key={row.day} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{row.day}</span>
                    <span className="font-medium">{row.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="surface-card p-7">
              <h2 className="font-display text-lg font-semibold">Follow along</h2>
              <div className="mt-4 flex gap-2">
                <Social href={site.socials.instagram} label="Instagram">
                  <Instagram className="size-4" />
                </Social>
                <Social href={site.socials.linkedin} label="LinkedIn">
                  <Linkedin className="size-4" />
                </Social>
                <Social href={site.socials.facebook} label="Facebook">
                  <Facebook className="size-4" />
                </Social>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <LeadForm
              source="contact"
              title="Send a message"
              description="Tell John what you're working on. Replies usually come within one business day."
              submitLabel="Send message"
            />

            <div className="surface-card overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-border p-5">
                <h2 className="font-display text-lg font-semibold">Book a 15-minute call</h2>
                <PlaceholderNote label="Calendly embed" />
              </div>
              {/* PLACEHOLDER — replace this block with John's Calendly embed script/iframe. */}
              <div className="gradient-placeholder flex h-64 items-center justify-center text-center text-sm text-primary-foreground/85">
                Calendly scheduling embed goes here
              </div>
            </div>

            <div className="surface-card overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-border p-5">
                <h2 className="font-display text-lg font-semibold">Find the Academy</h2>
                <PlaceholderNote label="Google Map embed" />
              </div>
              {/* PLACEHOLDER — replace with a Google Maps iframe once the address is confirmed. */}
              <div className="gradient-placeholder flex h-64 items-center justify-center text-center text-sm text-primary-foreground/85">
                Map of {site.academyAddress}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="inline-flex size-10 items-center justify-center rounded-lg border border-border transition-colors hover:border-brass hover:text-brass"
    >
      {children}
    </a>
  );
}
