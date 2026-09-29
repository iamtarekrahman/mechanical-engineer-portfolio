import { SectionShell } from "./SectionShell";
import { ProjectNotebook } from "./ProjectNotebook";
import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";
import styles from "./ProjectNotebook.module.css";

export function FeaturedProject() {
  return (
    <SectionShell
      id="project"
      kicker="Project / Undergraduate thesis"
      title="The Tesla turbine."
      sheet="TESLA TURBINE"
      scale="UNDERGRADUATE THESIS"
    >
      <SpotlightCard
        as="div"
        variant="panel"
        className="content-panel project-panel"
      >
        <Reveal className={styles.introduction}>
          <p className="mono-label text-blueline">
            MECHANICAL DESIGN / EXPERIMENTAL STUDY
          </p>
          <p className={styles.projectSummary}>
            From CAD to a working prototype: my thesis at IUBAT explored how
            disk geometry affects turbine efficiency. I combined SolidWorks
            design, laser-cut fabrication, multi-pressure testing, and CFD in
            ANSYS Fluent to compare computational predictions with physical
            performance.
          </p>
        </Reveal>

        <ProjectNotebook />

        <dl className={styles.studyDetails}>
          <div>
            <dt>My contribution</dt>
            <dd>Design, fabrication, testing &amp; CFD</dd>
          </div>
          <div>
            <dt>Design focus</dt>
            <dd>Disk geometry &amp; spacing</dd>
          </div>
          <div>
            <dt>Methods</dt>
            <dd>Multi-pressure tests &amp; ANSYS Fluent</dd>
          </div>
          <div>
            <dt>Key finding</dt>
            <dd>1.0 mm disk gap</dd>
          </div>
        </dl>
        <div className={styles.perspective}>
          <span className="mono-label text-blueline">
            ENGINEERING PERSPECTIVE
          </span>
          <p>
            The study identified a narrow 1.0 mm disk gap as optimal for
            boundary-layer interaction and mechanical efficiency in the tested
            configurations, while validating real-world fluid losses.
          </p>
        </div>
      </SpotlightCard>
    </SectionShell>
  );
}
