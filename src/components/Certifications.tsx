import { SectionShell } from "./SectionShell";
import { CertCard } from "./CertCard";
import { DrawnTitleBlock } from "./DrawnTitleBlock";
import { certifications } from "@/data/content";

export function Certifications() {
  return (
    <SectionShell
      id="certifications"
      kicker="SPEC SHEETS"
      title="Certifications"
      sheet="CERTIFICATIONS"
      intro="Each certification treated as a certified component, with its own datasheet and verification."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((cert) => (
          <DrawnTitleBlock key={cert.credentialId} showDivider={false} className="h-full">
            <CertCard cert={cert} />
          </DrawnTitleBlock>
        ))}
      </div>
    </SectionShell>
  );
}
