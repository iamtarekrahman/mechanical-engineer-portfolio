"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { certifications, type Certification } from "@/data/content";
import { CertCard } from "./CertCard";
import { SectionShell } from "./SectionShell";
import { ExternalLinkIcon } from "./icons";
import "./certificates.css";

const categories = ["All", "Design", "Energy", "Safety"] as const;
type Category = (typeof categories)[number];
// Component courses live beneath their specialization, keeping the main index concise.
const archive = certifications.filter((cert) => !cert.parentCredentialId);
const coursesFor = (cert: Certification) => certifications.filter((course) => course.parentCredentialId === cert.credentialId);

function Arrow({ reverse = false }: { reverse?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={reverse ? "M19 12H5m6-6-6 6 6 6" : "M5 12h14m-6-6 6 6-6 6"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Certifications() {
  const [category, setCategory] = useState<Category>("All");
  const [selectedId, setSelectedId] = useState(archive[0].credentialId);
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});
  const indexList = useRef<HTMLDivElement>(null);
  const visible = archive.filter((item) => category === "All" || item.category === category);
  const selected = Math.max(0, visible.findIndex((item) => item.credentialId === selectedId));
  const cert = visible[selected];
  const courses = coursesFor(cert);
  const number = String(selected + 1).padStart(2, "0");

  // Reveal the active row inside the index without moving the page itself.
  useEffect(() => {
    const row = tabs.current[cert.credentialId];
    const list = indexList.current;
    if (!row || !list || !list.clientHeight) return;
    const rowBounds = row.getBoundingClientRect();
    const listBounds = list.getBoundingClientRect();
    if (rowBounds.top < listBounds.top) list.scrollTop += rowBounds.top - listBounds.top;
    else if (rowBounds.bottom > listBounds.bottom) list.scrollTop += rowBounds.bottom - listBounds.bottom;
  }, [cert.credentialId, category]);

  function navigate(index: number, focus = false) {
    const next = visible[(index + visible.length) % visible.length];
    setSelectedId(next.credentialId);
    if (focus) tabs.current[next.credentialId]?.focus({ preventScroll: true });
  }

  function filter(next: Category) {
    setCategory(next);
    if (next !== "All" && cert.category !== next) {
      setSelectedId(archive.find((item) => item.category === next)!.credentialId);
    }
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowDown": case "ArrowRight": next = index + 1; break;
      case "ArrowUp": case "ArrowLeft": next = index - 1; break;
      case "Home": next = 0; break;
      case "End": next = visible.length - 1; break;
      default: return;
    }
    event.preventDefault();
    navigate(next, true);
  }

  const pagination = (placement: "mobile" | "desktop") => (
    <div className={`credential-pagination credential-pagination--${placement}`}>
      <span aria-hidden="true">{number} <span className="credential-pagination-divider">/</span> {String(visible.length).padStart(2, "0")}</span>
      <div>
        <button type="button" onClick={() => navigate(selected - 1)} aria-label="Previous credential"><Arrow reverse /></button>
        <button type="button" onClick={() => navigate(selected + 1)} aria-label="Next credential"><Arrow /></button>
      </div>
    </div>
  );

  function coursePath(parent: Certification) {
    const children = coursesFor(parent);
    if (!children.length) return null;
    return (
      <div className="credential-course-path">
        <header><p>THE LEARNING PATH</p><h4>Four courses. One specialization.</h4><p>Explore the individual certificates that make up Renewable Energy.</p></header>
        <ol>
          {children.map((course, index) => (
            <li key={course.credentialId}>
              <details className="credential-course">
                <summary id={`credential-course-${course.credentialId}`}>
                  <span className="credential-course-number">{String(index + 1).padStart(2, "0")}</span>
                  <span><strong>{course.title}</strong><small>Course certificate · {course.issued}</small></span>
                  <svg className="credential-course-toggle" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </summary>
                <div className="credential-course-document" role="region" aria-labelledby={`credential-course-${course.credentialId}`}>
                  <div className="certificate-preview" onContextMenu={(event) => event.preventDefault()}>
                    <Image src={course.preview.src} width={course.preview.width} height={course.preview.height} alt={`Original ${course.title} certificate issued by ${course.issuer}`} quality={95} sizes="(max-width: 850px) calc(100vw - 96px), 740px" className="certificate-document-image" draggable={false} onDragStart={(event) => event.preventDefault()} />
                  </div>
                  <p>{course.issuer} · {course.platform}</p>
                  <dl className="credential-course-metadata"><div>
                    <dt>Credential ID</dt>
                    <dd className="credential-id-value">
                      <span>{course.credentialId}</span>
                      {course.verifyUrl && <a className="credential-id-link" href={course.verifyUrl} target="_blank" rel="noopener noreferrer" aria-label={`Verify ${course.title} credential (opens in a new tab)`}><ExternalLinkIcon /></a>}
                    </dd>
                  </div></dl>
                </div>
              </details>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <SectionShell id="certifications" kicker="THE CREDENTIAL ARCHIVE" title="Learning, put into practice." sheet="CREDENTIALS" variant="plain" intro="Professional qualifications and continued learning in design, energy, and safety. Explore the original certificates behind my work.">
      <div className="credential-filters" role="group" aria-label="Filter certificates by subject">
        {categories.map((item) => (
          <button key={item} type="button" aria-pressed={category === item} onClick={() => filter(item)}>
            {item} <span>{item === "All" ? archive.length : archive.filter((entry) => entry.category === item).length}</span>
          </button>
        ))}
      </div>
      <div className="credential-mobile-picker">
        <label htmlFor="credential-select">Choose a certificate</label>
        <select id="credential-select" value={cert.credentialId} onChange={(event) => setSelectedId(event.target.value)}>
          {visible.map((item, index) => <option key={item.credentialId} value={item.credentialId}>{String(index + 1).padStart(2, "0")} — {item.title}{coursesFor(item).length ? " (4 courses)" : ""}</option>)}
        </select>
      </div>

      <div className="credential-archive">
        <div className="credential-index">
          <div className="credential-index-heading"><p>Certificate index</p><span>{String(visible.length).padStart(2, "0")}</span></div>
          <div ref={indexList} className="credential-index-list" role="tablist" aria-label="Choose a credential" aria-orientation="vertical">
            {visible.map((item, index) => (
              <button key={item.credentialId} ref={(element) => { tabs.current[item.credentialId] = element; }} type="button" role="tab" id={`credential-tab-${item.credentialId}`} aria-selected={selected === index} aria-controls="credential-active" tabIndex={selected === index ? 0 : -1} className="credential-index-item" onClick={() => navigate(index)} onKeyDown={(event) => onTabKeyDown(event, index)}>
                <span className="credential-index-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="credential-index-copy"><span className="credential-index-title">{item.title}</span><span className="credential-index-issuer">{item.issuer}</span>{coursesFor(item).length > 0 && <span className="credential-index-bundle">Specialization + 4 course certificates</span>}</span>
                <span className="credential-index-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
          {pagination("desktop")}
          <p className="credential-index-note">{archive.length} credentials · {certifications.length} original documents. Renewable Energy includes four individual course certificates.</p>
        </div>

        <div className="credential-stage">
          <div id="credential-active" role="tabpanel" aria-labelledby="credential-heading" tabIndex={0}>
            <CertCard key={cert.credentialId} cert={cert} number={number} />
          </div>
          {pagination("mobile")}
          {courses.length > 0 && coursePath(cert)}
        </div>
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">Showing {selected + 1} of {visible.length} {category === "All" ? "credentials" : `${category.toLowerCase()} credentials`}: {cert.title}{courses.length ? ", with four course certificates below" : ""}</p>

    </SectionShell>
  );
}
