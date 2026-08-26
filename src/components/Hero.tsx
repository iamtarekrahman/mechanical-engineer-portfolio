"use client";

import { useState } from "react";
import { TitleBlock } from "./TitleBlock";
import { TypewriterLead } from "./TypewriterLead";
import { HudCorners } from "./HudCorners";
import { LinkedInIcon, EmailIcon, DownloadIcon } from "./icons";
import { SITE } from "@/data/content";
import { ResumeModal } from "./ResumeModal";

/** Today's date, formatted like a drawing sheet: e.g. 10 JUL 2026. */
function drawingDate() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = d
    .toLocaleString("en-US", { month: "short" })
    .toUpperCase();
  return `${day} ${month} ${d.getFullYear()}`;
}

export function Hero() {
  const [showResumeModal, setShowResumeModal] = useState(false);

  return (
    <header className="relative">
      <div className="mx-auto w-full max-w-5xl pb-16 pl-5 pr-14 pt-16 sm:px-8 sm:pt-24">
        {/* Sheet border framing the hero like a drawing plate */}
        <HudCorners>
        <div className="ink-border bg-paper px-5 py-10 sm:px-10 sm:py-14">
          {/* Corner title block */}
          <div className="mb-10 flex justify-end">
            <div className="w-full max-w-sm">
              <TitleBlock
                dense
                className="ink-border"
                fields={[
                  { label: "Drawn By", value: SITE.drawnBy },
                  { label: "Date", value: drawingDate() },
                  { label: "Scale", value: "NOT TO SCALE" },
                  { label: "Rev", value: SITE.siteRev, emphasis: true },
                ]}
              />
            </div>
          </div>

          <p className="mono-label text-blueline">PORTFOLIO / COVER SHEET</p>

          <h1 className="mt-3 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-ink sm:text-7xl">
            Tarek
            <br />
            Rahman
          </h1>

          <p className="mt-5 font-mono text-sm uppercase tracking-[0.14em] text-graphite sm:text-base">
            Assistant Mechanical Engineer
          </p>

          {/* Fixed-height typewriter box so typing/erasing never resizes the
              sheet. min-height is sized to fit the full sentence. */}
          <div className="mt-8 min-h-[13rem] max-w-xl sm:min-h-[12rem]">
            <TypewriterLead
              text="Specializing in technical procurement and vendor coordination for large-scale infrastructure projects, ensuring seamless compliance from submittal to delivery. Bridging design intent with execution across multidisciplinary teams through a foundation in mechanical engineering and data-driven operations."
              speed={26}
              className="text-left text-base leading-relaxed text-ink sm:text-lg"
            />
          </div>

          {/* Contact logos with embedded links — right-aligned, above address */}
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <button
              onClick={() => setShowResumeModal(true)}
              aria-label="View resume (PDF)"
              className="group inline-flex items-center gap-2 border border-blueline bg-[color-mix(in_srgb,var(--blueline)_10%,var(--paper))] px-3 py-2 text-blueline transition-colors hover:bg-blueline hover:text-paper"
            >
              <DownloadIcon size={18} />
              <span className="mono-label">Resume</span>
            </button>
            <a
              href={SITE.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="group inline-flex items-center gap-2 border border-hairline bg-paper px-3 py-2 text-ink transition-colors hover:border-blueline hover:text-blueline"
            >
              <LinkedInIcon size={18} className="text-blueline" />
              <span className="mono-label">LinkedIn</span>
            </a>
            <a
              href={`mailto:${SITE.email}`}
              aria-label={`Email ${SITE.email}`}
              className="group inline-flex items-center gap-2 border border-hairline bg-paper px-3 py-2 text-ink transition-colors hover:border-blueline hover:text-blueline"
            >
              <EmailIcon size={18} className="text-blueline" />
              <span className="mono-label">Email</span>
            </a>
          </div>

          {/* Dimension-line flourish (address) */}
          <div className="mt-4 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-hairline" />
            <span className="mono-label text-graphite">
              {SITE.location}
            </span>
            <span className="h-px w-10 bg-hairline" />
          </div>
        </div>
        </HudCorners>
      </div>

      {/* Resume Modal */}
      <ResumeModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
      />
    </header>
  );
}
