import { Certification } from "@/data/content";
import { IssuerMark } from "./IssuerMark";
import { TagRow } from "./Tag";
import { ExternalLinkIcon } from "./icons";

/**
 * A certification rendered as a "certified component" spec sheet: issuer mark
 * in the corner, title, issuer, issue date, a part-number-style credential ID,
 * a verify link, and a row of topic tags.
 */
export function CertCard({ cert }: { cert: Certification }) {
  const hasVerify = cert.verifyUrl && cert.verifyUrl !== "#";

  return (
    <article className="spec-card flex h-full flex-col bg-paper ink-border">
      {/* Header strip: mark + spec-sheet label */}
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
        {cert.logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cert.logoSrc}
            alt={`${cert.issuer} logo`}
            className="h-7 w-auto max-w-[7.5rem] object-contain object-left"
            draggable={false}
          />
        ) : (
          <div className="text-blueline">
            <IssuerMark mark={cert.mark} />
          </div>
        )}
        <span className="mono-label text-graphite">SPEC SHEET</span>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 py-4">
        <div>
          <h3 className="font-display text-lg font-semibold leading-snug text-ink">
            {cert.title}
          </h3>
          <p className="mt-1 font-body text-sm text-graphite">
            {cert.issuer}
            {cert.platform ? (
              <span className="text-graphite"> · via {cert.platform}</span>
            ) : null}
          </p>
        </div>

        {/* Datasheet fields */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-y border-hairline py-3">
          <div>
            <dt className="mono-label text-graphite">Issued</dt>
            <dd className="mt-0.5 font-mono text-sm text-ink">{cert.issued}</dd>
          </div>
          <div>
            <dt className="mono-label text-graphite">Cred. ID</dt>
            <dd className="mt-0.5 break-all font-mono text-sm text-ink">
              {cert.credentialId}
            </dd>
          </div>
        </dl>

        <TagRow tags={cert.tags} />

        <div className="mt-auto pt-1">
          {hasVerify ? (
            <a
              href={cert.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mono-label inline-flex items-center gap-1.5 text-blueline underline-offset-4 hover:underline"
            >
              Verify <ExternalLinkIcon />
            </a>
          ) : (
            <span className="mono-label inline-flex items-center gap-1.5 text-graphite">
              Verify — pending
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
