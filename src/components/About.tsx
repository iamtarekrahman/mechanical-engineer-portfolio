import { ColorRevealImage } from "./ColorRevealImage";
import { SectionShell } from "./SectionShell";
import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";

export function About() {
  return (
    <SectionShell
      id="about"
      kicker="The person behind the drawings"
      title="Curiosity, put to work."
    >
      <SpotlightCard
        as="div"
        variant="panel"
        className="about-grid content-panel"
      >
        <figure className="portrait">
          <ColorRevealImage
            src="/images/profile-c.jpg"
            alt="Tarek Rahman"
            fadeDuration={10000}
            className="portrait-image"
          />
          <figcaption>
            <span>Tarek Rahman</span>
          </figcaption>
          <span className="portrait-note">
            Engineer. Investigator. Always learning.
          </span>
        </figure>
        <Reveal className="about-copy">
          <p className="about-lead">
            I like understanding how things work—and following the details until
            they do.
          </p>
          <p>
            I’m a mechanical engineering graduate from IUBAT, now working at
            Hunan Construction Engineering Group on the Rajshahi WASA Surface
            Water Treatment Plant.
          </p>
          <p>
            My work connects technical drawings, equipment documentation, and
            the practical demands of the site. I enjoy tracing a problem back to
            its cause and finding a clear way forward.
          </p>
          <p>
            From plant maintenance at Heidelberg Materials to building and
            testing my thesis prototype, curiosity has shaped how I approach
            engineering. There is always another detail worth understanding.
          </p>
          <div className="about-signoff">
            <span className="signature">Tarek Rahman</span>
            <span className="eyebrow">Drawn from experience.</span>
          </div>
        </Reveal>
      </SpotlightCard>
    </SectionShell>
  );
}
