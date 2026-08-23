import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { PlaceholderImage, PlaceholderNote } from "@/components/Placeholder";
import { Button } from "@/components/ui/button";
import { credentials, timeline } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About John Khellah, MBA | Broker of Record, Jersey City" },
      {
        name: "description",
        content:
          "Jersey City native, mathematics and computer science graduate, Villanova MBA, licensed since 2012 — now Broker of Record at Azimuth Real Estate and a real estate instructor.",
      },
      { property: "og:title", content: "About John Khellah, MBA" },
      {
        property: "og:description",
        content: "From engineering and finance to commercial multifamily brokerage and teaching in Northern New Jersey.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="gradient-navy text-primary-foreground">
        <div className="container-page grid items-center gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            <PlaceholderImage label="Professional headshot of John Khellah" aspect="aspect-[4/5]" />
            <PlaceholderNote label="Headshot placeholder" className="border-brass/50 bg-brass/15 text-brass" />
          </div>
          <div>
            <p className="eyebrow">About</p>
            <h1 className="heading-xl mt-4 text-primary-foreground">John Khellah, MBA</h1>
            <p className="mt-6 text-lg leading-relaxed text-primary-foreground/75">
              Broker of Record at Azimuth Real Estate, founder and instructor at Azimuth Real Estate Academy, and
              instructor at Bergen Community College. Specializing in commercial multifamily investment property and
              landlord representation across Northern New Jersey.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-14 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6 text-base leading-relaxed text-foreground/85">
            <SectionHeading eyebrow="The long version" title="A Jersey City story that ran through math, finance, and back home." />
            <p>
              John Khellah is a Jersey City native. He earned a B.S. in Mathematics and a B.S. in Computer Science from
              Montclair State University, then an MBA with a concentration in finance from Villanova University. Before
              real estate, he spent years in defense, supply-chain, technology, and insurance organizations, working
              across accounting, IT, finance, and sales — a résumé that trained him to look at a building the way an
              analyst looks at a balance sheet.
            </p>
            <p>
              He has been licensed in real estate since May 2012. Along the way he served as a Commercial Agent at
              Coldwell Banker Realty and as Associate Broker at Group Twenty Six Real Estate, focusing on investment
              property throughout Hudson and Bergen counties. Today he is Broker of Record at Azimuth Real Estate,
              representing owners and investors in commercial multifamily sales, landlord representation, and commercial
              leasing.
            </p>
            <p>
              Teaching came next. In 2019 he founded Azimuth Real Estate Academy in Jersey City to teach the business the
              practical way — the parts that only show up in real transactions. He also instructs at Bergen Community
              College, where he works with students who are entering the field for the first time.
            </p>
            <p>
              His specialty is straightforward: commercial multifamily investment property and landlord representation
              in Northern New Jersey. Owners get analysis they can check line by line. Students get the same math,
              explained slowly.
            </p>
          </div>

          <aside className="surface-card h-fit p-8">
            <h2 className="font-display text-lg font-semibold">Why I teach</h2>
            <PlaceholderNote label="Pull-quote placeholder" className="mt-4" />
            <blockquote className="mt-5 border-l-2 border-brass pl-5 font-display text-lg leading-relaxed">
              “PLACEHOLDER QUOTE — John to provide two or three sentences on why teaching matters to him and what he
              wants students to walk away with.”
            </blockquote>
            <Button asChild variant="gold" className="mt-8 w-full">
              <Link to="/contact">Work With John</Link>
            </Button>
          </aside>
        </div>
      </section>

      <section className="section bg-card border-y border-border">
        <div className="container-page">
          <SectionHeading eyebrow="Timeline" title="Career milestones" />
          <ol className="mt-12 space-y-1 border-l border-border pl-6">
            {timeline.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.04}>
                <li className="relative pb-8">
                  <span className="absolute -left-[1.9rem] top-1.5 size-3 rounded-full border-2 border-brass bg-background" aria-hidden />
                  <p className="eyebrow">{item.year}</p>
                  <h3 className="mt-1 font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="Credentials" title="Education, licenses, affiliations" />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <CredCard title="Education" items={credentials.education} />
            <CredCard title="Licenses" items={credentials.licenses} />
            <CredCard title="Affiliations" items={credentials.affiliations} />
          </div>
        </div>
      </section>
    </>
  );
}

function CredCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="surface-card p-7">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brass" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
