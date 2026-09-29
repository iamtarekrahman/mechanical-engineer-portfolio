import { SectionShell } from "./SectionShell";
import { affiliations, extraCurricular, awards } from "@/data/content";
import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";

export function AffiliationsAwards() {
  return (
    <SectionShell
      id="affiliations"
      kicker="Beyond the day-to-day"
      title="Recognition & community."
    >
      <div className="recognition-grid">
        <Reveal>
          <SpotlightCard
            as="div"
            variant="panel"
            className="awards-list content-panel"
          >
            {awards.map((award, i) => (
              <article key={award.title}>
                <span className="award-number">0{i + 1}</span>
                <div>
                  <h3>{award.title}</h3>
                  <p>{award.detail}</p>
                  <span className="eyebrow">{award.where}</span>
                </div>
                <span className="award-star" aria-hidden="true">
                  ✳
                </span>
              </article>
            ))}
          </SpotlightCard>
        </Reveal>
        <Reveal delay={0.07}>
          <SpotlightCard
            as="aside"
            variant="panel"
            className="community-list content-panel"
          >
            <h3 className="eyebrow">Professional Engineering Memberships</h3>
            {affiliations.map((item) => (
              <div key={item.name}>
                <h4>{item.name}</h4>
                <p>{item.detail}</p>
                {item.membershipId && (
                  <p className="membership-id">
                    <span>Membership ID:</span> {item.membershipId}
                  </p>
                )}
                {item.period && (
                  <span className="eyebrow">Active: {item.period}</span>
                )}
              </div>
            ))}
          </SpotlightCard>
        </Reveal>
      </div>
      <section
        className="activity-section"
        aria-labelledby="activities-heading"
      >
        <h3 id="activities-heading" className="eyebrow">
          Research & extracurricular activities
        </h3>
        <div className="activity-grid">
          {extraCurricular.map((item, index) => (
            <Reveal key={item.name} delay={index * 0.07}>
              <SpotlightCard variant="panel" className="content-panel">
                <p className="activity-role">{item.detail}</p>
                <h4>{item.name}</h4>
                <span className="eyebrow">{item.period}</span>
                <p className="activity-description">{item.description}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </section>
    </SectionShell>
  );
}
