import { SectionShell } from "./SectionShell";
import { SheetImage } from "./SheetImage";
import { TitleBlock } from "./TitleBlock";

export function FeaturedProject() {
  return (
    <SectionShell
      id="project"
      kicker="DRAWING — FEATURED"
      title="Featured Project"
      sheet="TESLA TURBINE"
      scale="1:1 PROTOTYPE"
    >
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="font-display text-2xl font-semibold text-ink">
            Tesla Turbine
          </h3>
          <p className="mt-1 font-mono text-sm text-graphite">
            Undergraduate Thesis · IUBAT
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
          <figure className="ink-border bg-paper p-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden border border-hairline bg-[color-mix(in_srgb,var(--blueline)_6%,var(--paper))]">
              <SheetImage
                src="/images/tesla-turbine-cad.png"
                alt="CAD model of the Tesla turbine prototype"
                placeholderLabel="FIG. 1 — CAD MODEL"
                fit="contain"
                whiteBackground
              />
            </div>
            <figcaption className="mt-2 flex items-center justify-between px-1 pb-0.5">
              <span className="mono-label text-graphite">FIG. 1 — CAD MODEL</span>
              <span className="mono-label text-ink">IUBAT</span>
            </figcaption>
          </figure>

          <figure className="ink-border bg-paper p-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden border border-hairline bg-[color-mix(in_srgb,var(--blueline)_6%,var(--paper))]">
              <SheetImage
                src="/images/tesla-turbine-setup.png"
                alt="Experimental test setup for the Tesla turbine prototype"
                placeholderLabel="FIG. 2 — EXPERIMENTAL SETUP"
                fit="contain"
                whiteBackground
              />
            </div>
            <figcaption className="mt-2 flex items-center justify-between px-1 pb-0.5">
              <span className="mono-label text-graphite">
                FIG. 2 — EXPERIMENTAL SETUP
              </span>
              <span className="mono-label text-ink">IUBAT</span>
            </figcaption>
          </figure>
        </div>

        <p className="font-body text-[0.98rem] leading-relaxed text-ink">
          Designed, fabricated, and experimentally tested a Tesla turbine
          prototype to evaluate torque, power, and efficiency under varying
          operating conditions and studied how velocity, disk gap, and disk
          thickness affected performance.
        </p>

        <TitleBlock
          dense
          className="ink-border"
          fields={[
            { label: "Type", value: "Bladeless boundary-layer turbine" },
            { label: "Method", value: "Design · Fabrication · Test" },
            { label: "Measured", value: "Torque · Power · Efficiency" },
            { label: "Variables", value: "Velocity · Gap · Thickness" },
          ]}
        />
      </div>
    </SectionShell>
  );
}
