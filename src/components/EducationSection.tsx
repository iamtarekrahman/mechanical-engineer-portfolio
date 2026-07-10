import { SectionShell } from "./SectionShell";
import { EducationCard } from "./EducationCard";
import { DrawnTitleBlock } from "./DrawnTitleBlock";
import { education } from "@/data/content";

export function EducationSection() {
  return (
    <SectionShell
      id="education"
      kicker="SPEC SHEETS"
      title="Education"
      sheet="EDUCATION"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {education.map((item) => (
          <DrawnTitleBlock key={item.program} showDivider={false} className="h-full">
            <EducationCard item={item} />
          </DrawnTitleBlock>
        ))}
      </div>
    </SectionShell>
  );
}
