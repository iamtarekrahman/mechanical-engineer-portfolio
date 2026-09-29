import { SectionShell } from "./SectionShell";
import { TitleBlock } from "./TitleBlock";
import { DrawnTitleBlock } from "./DrawnTitleBlock";
import { Reveal } from "./Reveal";
import { AutoScroll } from "./AutoScroll";
import { experience } from "@/legacy/v1/data/content";

export function Experience() {
  return (
    <SectionShell
      id="experience"
      kicker="SUBMITTAL LOG"
      title="Experience"
      sheet="EXPERIENCE"
      intro="Roles logged as submittal revisions — most recent revision first."
    >
      <AutoScroll className="h-scroll h-scroll-equal sm:space-y-8">
        {experience.map((job) => (
          <Reveal key={job.rev}>
            <article className="ink-border bg-paper flex flex-col">
            {/* Title-block-style card header */}
            <div className="flex flex-col gap-4 border-b border-hairline p-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className={`mono-label ${
                      job.current ? "text-redline" : "text-blueline"
                    }`}
                  >
                    {job.rev}
                  </span>
                  {job.current ? (
                    <span className="mono-label rounded-full border border-redline px-2 py-0.5 text-redline">
                      CURRENT
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-2 font-display text-xl font-semibold text-ink">
                  {job.role}
                </h3>
                <p className="mt-1 font-body text-sm text-graphite">
                  {job.org} — {job.project}
                </p>
              </div>

              <div className="w-full shrink-0 sm:w-56">
                <DrawnTitleBlock>
                  <TitleBlock
                    dense
                    className="hairline-border"
                    fields={[
                      { label: "Period", value: job.period },
                      { label: "Rev", value: job.rev.replace("REV. ", "") },
                    ]}
                  />
                </DrawnTitleBlock>
              </div>
            </div>

            <ul className="space-y-3 p-4">
              {job.bullets.map((b, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="mt-2 h-px w-4 shrink-0 bg-blueline"
                    aria-hidden="true"
                  />
                  <span className="font-body text-[0.95rem] leading-relaxed text-ink">
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </article>
          </Reveal>
        ))}
      </AutoScroll>
    </SectionShell>
  );
}
