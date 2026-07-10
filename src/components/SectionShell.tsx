import { ReactNode } from "react";
import { TitleBlock } from "./TitleBlock";
import { DrawnTitleBlock } from "./DrawnTitleBlock";
import { SITE } from "@/data/content";

type SectionShellProps = {
  id: string;
  /** Mono submittal-vocabulary label, e.g. "SUBMITTAL", "SPEC SHEET". */
  kicker: string;
  title: string;
  /** Optional short prose intro under the heading. */
  intro?: ReactNode;
  /** Values for the corner title block. Falls back to a sensible default. */
  scale?: string;
  rev?: string;
  sheet?: string;
  children: ReactNode;
};

/**
 * A major section wrapped like a drawing sheet: a mono kicker, a display
 * heading, and a title block pinned to the top-right corner.
 */
export function SectionShell({
  id,
  kicker,
  title,
  intro,
  scale = "NOT TO SCALE",
  rev,
  sheet,
  children,
}: SectionShellProps) {
  return (
    <section
      id={id}
      className="scroll-mt-20 border-t border-hairline py-14 sm:py-20"
      aria-labelledby={`${id}-heading`}
    >
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <p className="mono-label text-blueline">{kicker}</p>
            <h2
              id={`${id}-heading`}
              className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
            >
              {title}
            </h2>
            {intro ? (
              <p className="mt-4 max-w-prose font-body text-[0.98rem] leading-relaxed text-graphite">
                {intro}
              </p>
            ) : null}
          </div>

          <div className="w-full max-w-xs shrink-0 bg-paper md:w-72">
            <DrawnTitleBlock>
              <TitleBlock
                dense
                className="ink-border"
                fields={[
                  { label: "Sheet", value: sheet ?? title.toUpperCase() },
                  { label: "Drawn By", value: SITE.drawnBy },
                  { label: "Scale", value: scale },
                  { label: "Rev", value: rev ?? SITE.siteRev },
                ]}
              />
            </DrawnTitleBlock>
          </div>
        </div>

        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
