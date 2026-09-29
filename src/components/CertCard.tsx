"use client";

import Image from "next/image";
import { type Certification } from "@/data/content";
import { ExternalLinkIcon } from "./icons";
import { SpotlightCard } from "./SpotlightCard";

/** The issuer's original document, displayed without cropping or visual filters. */
export function CertCard({
  cert,
  number = "01",
}: {
  cert: Certification;
  number?: string;
}) {
  return (
    <SpotlightCard
      variant="panel"
      className="certificate-gallery-card"
      aria-labelledby="credential-heading"
    >
      <div className="certificate-mount">
        <div className="certificate-mount-label">
          <span>Original certificate</span>
          <span>No. {number}</span>
        </div>
        <div
          className="certificate-preview"
          onContextMenu={(event) => event.preventDefault()}
        >
          <Image
            src={cert.preview.src}
            width={cert.preview.width}
            height={cert.preview.height}
            alt={`Original ${cert.title} certificate issued by ${cert.issuer}`}
            quality={95}
            sizes="(max-width: 850px) calc(100vw - 96px), 740px"
            className="certificate-document-image"
            draggable={false}
            onDragStart={(event) => event.preventDefault()}
          />
        </div>
      </div>
      <div className="certificate-card-copy" data-highlight-scope={`credential-${cert.credentialId}`}>
        <p className="certificate-card-kind">{cert.kind}</p>
        <h3 id="credential-heading">{cert.title}</h3>
        <p className="certificate-card-issuer">
          {cert.issuer}
          {cert.platform && cert.platform !== cert.issuer && (
            <span> · {cert.platform}</span>
          )}
        </p>
        <dl className="certificate-card-metadata">
          <div>
            <dt>Issued</dt>
            <dd>{cert.issued}</dd>
          </div>
          {cert.expires && (
            <div>
              <dt>Expires</dt>
              <dd>{cert.expires}</dd>
            </div>
          )}
          <div>
            <dt>Credential ID</dt>
            <dd className="credential-id-value">
              <span>{cert.credentialId}</span>
              {cert.verifyUrl && (
                <a
                  className="credential-id-link"
                  href={cert.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Verify ${cert.title} credential (opens in a new tab)`}
                >
                  <ExternalLinkIcon />
                </a>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </SpotlightCard>
  );
}
