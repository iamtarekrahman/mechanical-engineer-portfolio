import { ReactNode } from "react";
import { TitleBlock } from "./TitleBlock";
import { DrawnTitleBlock } from "./DrawnTitleBlock";
import { GlitchReveal } from "./GlitchReveal";
import { BorderBeam } from "./BorderBeam";
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
  /**
   * "plate" (default) pins the full drawing title block in the corner.
   * "plain" drops the boxed block for a light corner stamp (sheet + rev only)
   * so secondary sections breathe and the layout doesn't read as repetitive.
   */
  variant?: "plate" | "plain";
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
  variant = "plate",
  children,
}: SectionShellProps) {
  return (
    <section
      id={id}
      className="relative scroll-mt-20 overflow-x-clip border-t border-hairline py-14 sm:py-20"
      aria-labelledby={`${id}-heading`}
    >
      <BorderBeam />
      <div className="mx-auto w-full max-w-5xl pl-5 pr-14 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <GlitchReveal>
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
            </GlitchReveal>
          </div>

          <div className="w-full max-w-xs shrink-0 bg-paper md:w-72">
            {variant === "plate" ? (
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
            ) : (
              <div className="flex items-baseline justify-between gap-4 border-t border-hairline pt-2 md:justify-end md:border-t-0 md:pt-0 md:text-right">
                <span className="mono-label text-graphite">
                  {sheet ?? title.toUpperCase()}
                </span>
                <span className="mono-label text-blueline">
                  REV {rev ?? SITE.siteRev}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
