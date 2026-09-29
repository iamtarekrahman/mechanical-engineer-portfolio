import { ReactNode } from "react";

import { Reveal } from "./Reveal";

const sectionNumbers: Record<string, string> = {
  project: "01",
  experience: "02",
  certifications: "03",
  skills: "02.B",
  about: "04",
  education: "03.B",
  affiliations: "04.B",
  contact: "05",
};

export function SectionShell({
  id,
  kicker,
  title,
  intro,
  children,
  className = "",
}: {
  id: string;
  kicker: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  sheet?: string;
  scale?: string;
  rev?: string;
  variant?: "plate" | "plain";
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`archive-section ${["skills", "education", "affiliations"].includes(id) ? "archive-section--supporting" : ""} ${className}`}
      aria-labelledby={`${id}-heading`}
    >
      <div className="page-width">
        <Reveal>
          <header className="section-heading">
            <div className="section-heading-main">
              <p className="eyebrow">
                <span>{sectionNumbers[id] ?? "—"}</span> {kicker}
              </p>
              <h2 id={`${id}-heading`}>{title}</h2>
              {intro && <div className="section-intro">{intro}</div>}
            </div>
            <span className="section-cross" aria-hidden="true">
              +
            </span>
          </header>
        </Reveal>
        {children}
      </div>
    </section>
  );
}
