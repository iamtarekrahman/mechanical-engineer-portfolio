import { SectionShell } from "./SectionShell";
import { EducationCard } from "./EducationCard";
import { DrawnTitleBlock } from "./DrawnTitleBlock";
import { AutoScroll } from "./AutoScroll";
import { education } from "@/data/content";

export function EducationSection() {
  return (
    <SectionShell
      id="education"
      kicker="SPEC SHEETS"
      title="Education"
      sheet="EDUCATION"
    >
      <AutoScroll className="h-scroll h-scroll-equal sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {education.map((item) => (
          <DrawnTitleBlock key={item.program} showDivider={false} className="h-full">
            <EducationCard item={item} />
          </DrawnTitleBlock>
        ))}
      </AutoScroll>
    </SectionShell>
  );
}
