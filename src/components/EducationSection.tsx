import { SectionShell } from "./SectionShell";
import { education } from "@/data/content";
import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";

export function EducationSection() {
  const degree = education[0];
  return (
    <SectionShell id="education" kicker="Academic foundation" title="Education">
      <Reveal>
        <SpotlightCard
          as="div"
          variant="panel"
          className="content-panel education-panel"
        >
          <article className="degree-record">
            <div>
              <span className="eyebrow">{degree.period}</span>
              <h3>{degree.program}</h3>
              <p>{degree.institution}</p>
              <div className="quiet-tags">
                {degree.tags.slice(0, 6).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
            <div className="degree-score">
              <span className="eyebrow">CGPA</span>
              <strong>
                3.90<span>/ 4.00</span>
              </strong>
            </div>
          </article>
          <details className="archive-details earlier-education">
            <summary>
              Earlier education <span aria-hidden="true">+</span>
            </summary>
            <div>
              {education.slice(1).map((item) => (
                <article className="education-row" key={item.program}>
                  <span className="eyebrow">{item.period}</span>
                  <div>
                    <h4>{item.program}</h4>
                    <p>{item.institution}</p>
                  </div>
                  <span>{item.result}</span>
                </article>
              ))}
            </div>
          </details>
        </SpotlightCard>
      </Reveal>
    </SectionShell>
  );
}
