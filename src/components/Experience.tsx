import { SectionShell } from "./SectionShell";
import { experience } from "@/data/content";
import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";

export function Experience() {
  return (
    <SectionShell
      id="experience"
      kicker="Professional practice"
      title="Work Experience"
      intro="Working where engineering documentation meets the equipment on site."
    >
      <div className="experience-timeline">
        {experience.map((job, index) => (
          <Reveal key={job.rev} delay={index * 0.07}>
            <SpotlightCard
              variant="panel"
              className="experience-entry content-panel"
            >
              <div className="experience-date">
                <span className="timeline-node" aria-hidden="true" />
                <span>{job.period}</span>
                {job.current && (
                  <span className="current-label">Current role</span>
                )}
              </div>
              <div className="experience-body">
                <p className="eyebrow">{job.org}</p>
                <h3>{job.role}</h3>
                <p className="experience-summary">{job.summary}</p>
                <div className="quiet-tags">
                  {job.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <details className="archive-details">
                  <summary>
                    Responsibilities & approach{" "}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <ul>
                    {job.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </details>
              </div>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
