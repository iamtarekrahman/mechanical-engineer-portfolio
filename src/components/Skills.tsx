import { SectionShell } from "./SectionShell";
import { Reveal } from "./Reveal";
import { skills } from "@/data/content";

/** Item code for a BOM-style row, e.g. "AD-01". */
function itemCode(groupIndex: number, itemIndex: number) {
  const prefix = ["AD", "TS", "IP", "LG"][groupIndex] ?? "IT";
  return `${prefix}-${String(itemIndex + 1).padStart(2, "0")}`;
}

export function Skills() {
  return (
    <SectionShell
      id="skills"
      kicker="BILL OF MATERIALS"
      title="Skills"
      sheet="SKILLS"
      intro="Capabilities itemized like a bill of materials — grouped, coded, and countable."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {skills.map((group, gi) => (
          <Reveal key={group.group} delay={gi * 0.05}>
            <div className="flex h-full flex-col bg-paper ink-border">
              {/* BOM header */}
              <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
                <h3 className="mono-label text-blueline">{group.group}</h3>
                <span className="mono-label text-graphite">
                  QTY {String(group.items.length).padStart(2, "0")}
                </span>
              </div>

              {/* BOM rows */}
              <ul className="divide-y divide-hairline">
                {group.items.map((item, ii) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[color-mix(in_srgb,var(--blueline)_4%,var(--paper))]"
                  >
                    <span className="mono-label w-14 shrink-0 text-graphite">
                      {itemCode(gi, ii)}
                    </span>
                    <span
                      className="h-1.5 w-1.5 shrink-0 rotate-45 border border-blueline"
                      aria-hidden="true"
                    />
                    <span className="hover-accent font-body text-[0.95rem] text-ink">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
