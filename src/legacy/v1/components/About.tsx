import { SectionShell } from "./SectionShell";
import { SheetImage } from "./SheetImage";
import { ColorRevealImage } from "./ColorRevealImage";

export function About() {
  return (
    <SectionShell
      id="about"
      kicker="GENERAL NOTES"
      title="About"
      sheet="ABOUT"
      rev="01"
      variant="plain"
    >
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_16rem] md:gap-10">
        <div className="order-2 md:order-1">
          <div className="space-y-4 text-justify font-body text-[1.02rem] leading-relaxed text-ink">
            <p>
              I&apos;m a mechanical engineering graduate from IUBAT, working as
              an Assistant Mechanical Engineer at Hunan Construction Engineering
              Group (HCEG) on the Rajshahi WASA Surface Water Treatment Plant.
              Most of my day is submittal review: I take a manufacturer&apos;s
              technical package for equipment like pumps, valves, chlorination
              systems, and cranes, and check it line by line against consultant
              comments and international standards — BS, ISO, IEC — until every
              gap is closed.
            </p>
            <p>
              Before this I interned in maintenance and operations at Heidelberg
              Materials Bangladesh, rotating through maintenance, production, and
              quality control to see how a plant actually runs rather than how
              the manual says it should.
            </p>
            <p>
              For my thesis I built and tested a Tesla turbine prototype from
              scratch. Across all of it, the same habit keeps showing up: I treat
              every compliance comment and every experimental result as a small
              investigation, not a checkbox to clear.
            </p>
          </div>
        </div>

        {/* Photo ID box, styled like a drawing-sheet photo field */}
        <figure className="order-1 md:order-2">
          <div className="ink-border bg-white p-2">
            <div className="relative aspect-[4/5] w-full overflow-hidden border border-hairline bg-white">
              <ColorRevealImage
                src="/v1/images/profile-c.jpg"
                alt="Tarek Rahman"
                spotlightRadius={120}
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2 flex items-center justify-between gap-2 px-1 pb-0.5">
              <span className="mono-label shrink-0 text-graphite">ID PHOTO</span>
              <span className="signature whitespace-nowrap text-xl leading-none text-[#0891b2]">
                Tarek Rahman
              </span>
            </figcaption>
          </div>
        </figure>
      </div>
    </SectionShell>
  );
}
