import { Education } from "@/legacy/v1/data/content";
import { TagRow } from "./Tag";

/**
 * Education rendered in the same spec-sheet language as certifications:
 * program title, institution, dates, result, and subject tags.
 */
export function EducationCard({ item }: { item: Education }) {
  return (
    <article className="spec-card flex h-full flex-col bg-paper ink-border">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
        <span className="mono-label text-blueline">SPEC SHEET</span>
        <span className="mono-label text-graphite">{item.period}</span>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 py-4">
        <div>
          <h3 className="font-display text-lg font-semibold leading-snug text-ink">
            {item.program}
          </h3>
          <p className="mt-1 font-body text-sm text-graphite">
            {item.institution}
          </p>
        </div>

        <dl className="border-y border-hairline py-3">
          <dt className="mono-label text-graphite">Result</dt>
          <dd className="mt-0.5 font-mono text-sm text-ink">{item.result}</dd>
        </dl>

        <TagRow tags={item.tags} />
      </div>
    </article>
  );
}
