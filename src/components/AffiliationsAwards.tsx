import { SectionShell } from "./SectionShell";
import { Reveal } from "./Reveal";
import { affiliations, awards } from "@/data/content";

function StampIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" strokeDasharray="1.5 1.5" />
      <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2" />
    </svg>
  );
}

function AwardIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="9" r="5.5" />
      <path d="M9 13.5L7 21l5-3 5 3-2-7.5" />
    </svg>
  );
}

export function AffiliationsAwards() {
  return (
    <SectionShell
      id="affiliations"
      kicker="APPENDIX"
      title="Affiliations & Awards"
      sheet="APPENDIX"
      intro="Memberships, activities, and recognitions on file."
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        {/* Affiliations */}
        <div>
          <h3 className="mono-label mb-4 flex items-center gap-2 text-blueline">
            <span className="h-px w-6 bg-blueline" aria-hidden="true" />
            Affiliations & Activities
          </h3>
          <ul className="space-y-4">
            {affiliations.map((a, i) => (
              <Reveal key={a.name} delay={i * 0.04}>
                <li className="flex gap-3 bg-paper ink-border p-4">
                  <span className="mt-0.5 shrink-0 text-blueline">
                    <StampIcon />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-[0.98rem] font-semibold leading-snug text-ink">
                      {a.name}
                    </p>
                    <p className="mt-1 font-body text-sm text-graphite">
                      {a.detail}
                    </p>
                    {a.period ? (
                      <p className="mono-label mt-1.5 text-graphite">
                        {a.period}
                      </p>
                    ) : null}
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>

        {/* Awards */}
        <div>
          <h3 className="mono-label mb-4 flex items-center gap-2 text-redline">
            <span className="h-px w-6 bg-redline" aria-hidden="true" />
            Awards
          </h3>
          <ul className="space-y-4">
            {awards.map((aw, i) => (
              <Reveal key={aw.title} delay={i * 0.04}>
                <li className="relative overflow-hidden bg-paper ink-border p-4">
                  {/* Corner index like a plate callout */}
                  <span className="mono-label absolute right-3 top-3 text-hairline">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex gap-3">
                    <span className="mt-0.5 shrink-0 text-redline">
                      <AwardIcon />
                    </span>
                    <div className="min-w-0 pr-6">
                      <p className="font-display text-[0.98rem] font-semibold leading-snug text-ink">
                        {aw.title}
                      </p>
                      <p className="mt-1 font-body text-sm text-graphite">
                        {aw.detail}
                      </p>
                      <p className="mono-label mt-1.5 text-blueline">
                        {aw.where}
                      </p>
                    </div>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}
