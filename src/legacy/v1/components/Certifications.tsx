import { SectionShell } from "./SectionShell";
import { CertCard } from "./CertCard";
import { DrawnTitleBlock } from "./DrawnTitleBlock";
import { AutoScroll } from "./AutoScroll";
import { certifications } from "@/legacy/v1/data/content";

export function Certifications() {
  return (
    <SectionShell
      id="certifications"
      kicker="SPEC SHEETS"
      title="Certifications"
      sheet="CERTIFICATIONS"
      variant="plain"
      intro="Each certification treated as a certified component, with its own datasheet and verification."
    >
      <AutoScroll className="h-scroll h-scroll-equal sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {certifications.map((cert) => (
          <DrawnTitleBlock key={cert.credentialId} showDivider={false} className="h-full">
            <CertCard cert={cert} />
          </DrawnTitleBlock>
        ))}
      </AutoScroll>
    </SectionShell>
  );
}
