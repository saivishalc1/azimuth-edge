import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";
import { PlaceholderNote } from "@/components/Placeholder";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { VideoCard, VideoCardSkeleton } from "@/components/video/VideoCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { fetchPublishedVideos } from "@/lib/data";
import { academyFaq, programs } from "@/lib/site";

export const Route = createFileRoute("/academy")({
  head: () => ({
    meta: [
      { title: "Azimuth Real Estate Academy | Classes in Jersey City, NJ" },
      {
        name: "description",
        content:
          "Founded in 2019 in Jersey City, Azimuth Real Estate Academy teaches real estate the practical way — investing fundamentals, commercial basics, new agent launch, and exam prep.",
      },
      { property: "og:title", content: "Azimuth Real Estate Academy" },
      {
        property: "og:description",
        content: "Practical real estate education for investors and new agents, taught by John Khellah, MBA.",
      },
    ],
  }),
  component: Academy,
});

function Academy() {
  const lessons = useQuery({
    queryKey: ["videos", "lessons", 3],
    queryFn: () => fetchPublishedVideos({ category: "Lessons", sort: "newest", limit: 3 }),
  });

  return (
    <>
      <section className="gradient-navy text-primary-foreground">
        <div className="container-page max-w-4xl py-20">
          <p className="eyebrow">Azimuth Real Estate Academy · Est. 2019</p>
          <h1 className="heading-xl mt-4 text-primary-foreground">
            Real estate taught the practical way — classroom to real deals.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-primary-foreground/75">
            Founded in 2019 in Jersey City, the Academy exists because the licensing exam doesn't teach you the business.
            Classes are built around real transactions, real numbers, and the decisions agents and investors actually
            face.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild variant="gold" size="lg">
              <a href="#enroll">Ask About a Program</a>
            </Button>
            <Button asChild variant="onNavy" size="lg">
              <Link to="/videos">Browse the Video Library</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="Programs" title="Courses & programs" />
          <PlaceholderNote label="Placeholder programs — titles, length, format, and pricing to be confirmed" className="mt-5" />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {programs.map((program, i) => (
              <Reveal key={program.title} delay={i * 0.06}>
                <div className="surface-card flex h-full flex-col p-7">
                  <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    {program.format}
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold">{program.title}</h3>
                  <dl className="mt-4 flex-1 space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <dt>Length</dt>
                      <dd className="font-medium text-foreground">{program.length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Tuition</dt>
                      <dd className="font-medium text-brass">{program.price}</dd>
                    </div>
                  </dl>
                  <Button asChild variant="goldOutline" size="sm" className="mt-6">
                    <a href="#enroll">Ask About This Course</a>
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-card border-y border-border">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Learn on your schedule"
              title="Free lessons in the Video Library"
              description="Not ready for a class? Start with the lesson videos — no login required."
              className="max-w-xl"
            />
            <Link to="/videos" className="inline-flex items-center gap-2 text-sm font-semibold">
              Go to the library <ArrowRight className="size-4 text-brass" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {lessons.isLoading ? Array.from({ length: 3 }).map((_, i) => <VideoCardSkeleton key={i} />) : null}
            {lessons.isError ? <p className="text-sm text-destructive">Lessons couldn't be loaded right now.</p> : null}
            {lessons.data?.map((video) => <VideoCard key={video.id} video={video} />)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading eyebrow="FAQ" title="Questions we hear most" />
          <div>
            <PlaceholderNote label="Placeholder answers" className="mb-5" />
            <Accordion type="single" collapsible className="surface-card divide-y divide-border px-6">
              {academyFaq.map((item, i) => (
                <AccordionItem key={item.q} value={`item-${i}`} className="border-none">
                  <AccordionTrigger className="text-left font-display text-base font-semibold">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section id="enroll" className="section bg-card border-t border-border scroll-mt-24">
        <div className="container-page grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="Enrollment interest"
            title="Tell us what you want to learn"
            description="Share your goals and which program looks closest. John will reply with dates, format, and what to expect."
          />
          <LeadForm
            source="academy"
            extraFields={["program"]}
            programOptions={programs.map((p) => p.title)}
            submitLabel="Send enrollment interest"
          />
        </div>
      </section>
    </>
  );
}
