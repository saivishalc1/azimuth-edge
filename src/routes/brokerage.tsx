import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Calculator, Compass, Store, TrendingUp } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";
import { PlaceholderNote } from "@/components/Placeholder";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchListings } from "@/lib/data";
import { counties, processSteps, services } from "@/lib/site";

export const Route = createFileRoute("/brokerage")({
  head: () => ({
    meta: [
      { title: "Commercial & Multifamily Brokerage in Northern NJ | Azimuth" },
      {
        name: "description",
        content:
          "Landlord representation, multifamily investment sales, commercial leasing, and valuation across Hudson, Bergen, Essex, and Passaic counties.",
      },
      { property: "og:title", content: "Azimuth Real Estate — Brokerage Services" },
      {
        property: "og:description",
        content: "Owner-side brokerage for commercial and multifamily property in Northern New Jersey.",
      },
    ],
  }),
  component: Brokerage,
});

const icons: Record<string, React.ReactNode> = {
  building: <Building2 className="size-5" />,
  trending: <TrendingUp className="size-5" />,
  store: <Store className="size-5" />,
  calculator: <Calculator className="size-5" />,
  compass: <Compass className="size-5" />,
};

function Brokerage() {
  const listings = useQuery({ queryKey: ["listings"], queryFn: fetchListings });

  return (
    <>
      <section className="gradient-navy text-primary-foreground">
        <div className="container-page max-w-4xl py-20">
          <p className="eyebrow">Azimuth Real Estate</p>
          <h1 className="heading-xl mt-4 text-primary-foreground">Owner-side brokerage, built on the numbers.</h1>
          <p className="mt-6 text-lg leading-relaxed text-primary-foreground/75">
            Representation for landlords, investors, and commercial owners across Northern New Jersey — from a single
            mixed-use building to a portfolio of multifamily assets.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="Services" title="What we do for owners" />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <Reveal key={service.title} delay={i * 0.06}>
                <div className="surface-card h-full p-7">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-navy text-brass">
                    {icons[service.icon]}
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold">{service.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{service.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-card border-y border-border">
        <div className="container-page">
          <SectionHeading eyebrow="How we work" title="Four steps, no surprises" />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => (
              <Reveal key={step.step} delay={i * 0.06}>
                <div className="h-full border-t-2 border-brass pt-5">
                  <span className="font-display text-3xl font-semibold text-brass">{step.step}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading eyebrow="Market focus" title="Northern New Jersey" description="Primary coverage area — editable as the footprint grows." />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {counties.map((county) => (
                <li key={county} className="surface-card px-5 py-4 text-sm font-medium">
                  {county}
                </li>
              ))}
            </ul>
            <PlaceholderNote label="Confirm coverage list" className="mt-6" />
          </div>

          <div>
            <SectionHeading eyebrow="Current listings" title="Available now" />
            <PlaceholderNote label="Placeholder listings — real offerings load from the database" className="mt-4" />
            <div className="mt-8 space-y-4">
              {listings.isLoading
                ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
                : null}
              {listings.isError ? (
                <p className="text-sm text-destructive">Listings couldn't be loaded right now.</p>
              ) : null}
              {listings.data?.length === 0 ? (
                <p className="surface-card p-6 text-sm text-muted-foreground">
                  No active listings are posted right now. Reach out for off-market opportunities.
                </p>
              ) : null}
              {listings.data?.map((listing) => (
                <article key={listing.id} className="surface-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="font-display text-base font-semibold">{listing.address}</h3>
                    <span className="rounded-full bg-navy px-3 py-1 text-xs font-semibold text-primary-foreground">
                      {listing.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{listing.description}</p>
                  <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">Type</dt>
                      <dd className="font-medium">{listing.property_type ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">Size</dt>
                      <dd className="font-medium">{listing.size ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">Price</dt>
                      <dd className="font-medium text-brass">{listing.price ?? "—"}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-card border-t border-border">
        <div className="container-page grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="Next step"
            title="Request a property consultation"
            description="Send the basics and John will follow up with an honest read on your options — hold, lease, reposition, or sell."
          />
          <LeadForm
            source="brokerage"
            extraFields={["property_address", "property_type"]}
            submitLabel="Request consultation"
          />
        </div>
      </section>
    </>
  );
}
