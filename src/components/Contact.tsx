"use client";

import { useEffect, useRef, useState } from "react";
import { SectionShell } from "./SectionShell";
import { SITE } from "@/data/content";
import { ContactForm } from "./ContactForm";
import { SocialLinks } from "./SocialLinks";
import { SpotlightCard } from "./SpotlightCard";

export function Contact() {
  const [copyStatus, setCopyStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopyStatus("Email copied");
    } catch {
      setCopyStatus("Select the email address to copy it");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopyStatus(""), 3500);
  }
  return (
    <SectionShell
      id="contact"
      kicker="Start a conversation"
      title="Let’s talk engineering."
    >
      <SpotlightCard
        as="div"
        variant="panel"
        className="contact-grid content-panel"
      >
        <div>
          <p className="contact-lead">
            Good work starts with
            <br />a thoughtful conversation.
          </p>
          <div className="contact-links">
            <a className="contact-email" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
            <SocialLinks className="contact-social" />
            <div className="contact-options">
              <button type="button" className="copy-email" onClick={copyEmail}>
                Copy email <span aria-hidden="true">↗</span>
              </button>
            </div>
            <span role="status" className="form-status">
              {copyStatus}
            </span>
          </div>
          <p className="contact-location">
            BASED IN DHAKA, BANGLADESH
            <br />
            Engineering opportunities & technical conversations.
          </p>
        </div>
        <ContactForm />
      </SpotlightCard>
      <footer className="site-footer">
        <span className="footer-monogram" aria-hidden="true">
          tr.
        </span>
        <span>
          © {new Date().getFullYear()} {SITE.name}
          <br />
          Engineering portfolio · Revision {SITE.siteRev}
        </span>
        <a href="#top">Back to the drawing board ↑</a>
      </footer>
    </SectionShell>
  );
}
