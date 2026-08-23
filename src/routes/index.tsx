import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, GraduationCap, Mail, Phone, Building2 } from "lucide-react";
import { PlaceholderImage, PlaceholderNote } from "@/components/Placeholder";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { TrustStrip } from "@/components/TrustStrip";
import { VideoCard, VideoCardSkeleton } from "@/components/video/VideoCard";
import { Button } from "@/components/ui/button";
import { fetchFeaturedVideos } from "@/lib/data";
import { site, testimonials } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Commercial Brokerage & Real Estate Classes | Northern NJ" },
      {
        name: "description",
        content:
          "John Khellah, MBA — Broker of Record at Azimuth Real Estate in Jersey City. Multifamily brokerage for owners and practical real estate education for new agents.",
      },
      { property: "og:title", content: "Commercial Real Estate Brokerage & Education in Northern New Jersey" },
      {
        property: "og:description",
        content:
          "Helping owners maximize their properties and helping new agents and investors master the business.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = useQuery({ queryKey: ["featured-videos"], queryFn: () => fetchFeaturedVideos(4) });

  return (
    <>
      <section className="gradient-navy relative overflow-hidden text-primary-foreground">
        <div className="container-page grid items-center gap-14 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div>
            <p className="eyebrow">Azimuth Real Estate · Jersey City, NJ</p>
            <h1 className="heading-xl mt-5 text-primary-foreground">
              Commercial Real Estate Brokerage &amp; Education in Northern New Jersey.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-primary-foreground/75">
              John Khellah, MBA — Broker of Record at Azimuth Real Estate and real estate instructor. Helping owners
              maximize their properties and helping new agents and investors master the business.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link to="/contact">Work With John</Link>
              </Button>
              <Button asChild variant="onNavy" size="lg">
                <Link to="/videos">
                  Watch the Latest Videos <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            <PlaceholderImage label="Professional headshot of John Khellah" aspect="aspect-[4/5]" />
            <PlaceholderNote label="Headshot placeholder" className="border-brass/50 bg-brass/15 text-brass" />
          </div>
        </div>
      </section>

      <TrustStrip />

      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow="Two paths"
            title="Whether you own the building or want to learn the business."
            description="Azimuth serves property owners and future professionals with the same rigor."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <PathCard
                icon={<Building2 className="size-6" />}
                title="For Owners & Investors"
                body="Landlord representation, multifamily investment sales, commercial leasing, and valuation work across Hudson, Bergen, Essex, and Passaic counties. Clear math, disciplined negotiation."
                to="/brokerage"
                cta="Explore brokerage services"
              />
            </Reveal>
            <Reveal delay={0.1}>
              <PathCard
                icon={<GraduationCap className="size-6" />}
                title="For Students & New Agents"
                body="Azimuth Real Estate Academy teaches the practical side of the business — from classroom fundamentals to real deals — plus a growing free video library."
                to="/academy"
                cta="Explore the Academy"
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section bg-card border-y border-border">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Video library" title="Featured videos" className="max-w-xl" />
            <Link to="/videos" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              See all videos <ArrowRight className="size-4 text-brass" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.isLoading
              ? Array.from({ length: 4 }).map((_, i) => <VideoCardSkeleton key={i} />)
              : featured.data?.map((video) => <VideoCard key={video.id} video={video} />)}
            {featured.isError ? (
              <p className="text-sm text-destructive">Videos couldn't be loaded right now.</p>
            ) : null}
            {featured.data && featured.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No featured videos yet.</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <PlaceholderImage label="Property or classroom photography" aspect="aspect-[5/4]" />
          <div>
            <SectionHeading
              eyebrow="About John"
              title="An engineer who became a broker — and then a teacher."
              description="Math and computer science degrees, an MBA in finance, and a career in defense, supply chain, technology, and insurance before real estate. That background shows up in how every deal gets underwritten and how every class gets taught."
            />
            <Button asChild variant="goldOutline" className="mt-8">
              <Link to="/about">Read John's Story</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="section bg-card border-y border-border">
        <div className="container-page">
          <SectionHeading eyebrow="Testimonials" title="What clients and students say" align="center" />
          <PlaceholderNote label="Placeholder testimonials — replace with real quotes" className="mx-auto mt-6 block w-fit" />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <blockquote className="surface-card h-full p-7">
                  <p className="font-display text-lg leading-relaxed">“{t.quote}”</p>
                  <footer className="mt-6 text-sm">
                    <span className="font-semibold">{t.name}</span>
                    <span className="block text-muted-foreground">{t.detail}</span>
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="gradient-navy text-primary-foreground">
        <div className="container-page flex flex-col items-start gap-8 py-16 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="heading-lg text-primary-foreground">
              Ready to talk about your property or your career?
            </h2>
            <div className="mt-5 flex flex-wrap gap-6 text-sm text-primary-foreground/80">
              <a href={`tel:${site.phone.replace(/\D/g, "")}`} className="inline-flex items-center gap-2">
                <Phone className="size-4 text-brass" /> {site.phone}
              </a>
              <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2">
                <Mail className="size-4 text-brass" /> {site.email}
              </a>
            </div>
          </div>
          <Button asChild variant="gold" size="lg">
            <Link to="/contact">Book a Consultation</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function PathCard({
  icon,
  title,
  body,
  to,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  to: "/brokerage" | "/academy";
  cta: string;
}) {
  return (
    <div className="surface-card flex h-full flex-col p-8">
      <span className="flex size-12 items-center justify-center rounded-xl bg-navy text-brass">{icon}</span>
      <h3 className="mt-6 font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-4 flex-1 leading-relaxed text-muted-foreground">{body}</p>
      <Link to={to} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
        {cta} <ArrowRight className="size-4 text-brass" />
      </Link>
    </div>
  );
}
