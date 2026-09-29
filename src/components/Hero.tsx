"use client";

import { useState } from "react";
import { SITE } from "@/data/content";
import { ResumeModal } from "./ResumeModal";
import { JetEngineWorkbench } from "./JetEngineWorkbench";
import { SocialLinks } from "./SocialLinks";

export function Hero() {
  const [resumeOpen, setResumeOpen] = useState(false);
  return (
    <header id="top" className="hero page-width">
      <div className="hero-overline">
        <span className="eyebrow">Portfolio / {SITE.siteRev}</span>
      </div>
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="hero-role">Assistant Mechanical Engineer</p>
          <h1>
            Tarek
            <br />
            <em>Rahman.</em>
          </h1>
          <p className="hero-statement">
            Precision in the details.
            <br />
            Purpose in the work.
          </p>
          <p className="hero-description">
            Working across equipment compliance, technical coordination, and
            mechanical design. From the drawing board to the details that make
            it work.
          </p>
          <div className="hero-actions">
            <a href="#project" className="draft-button draft-button--primary">
              Explore my project <span aria-hidden="true">↗</span>
            </a>
            <button
              type="button"
              className="draft-button"
              onClick={() => setResumeOpen(true)}
            >
              View résumé <span aria-hidden="true">↓</span>
            </button>
          </div>
          <SocialLinks className="hero-social" />
        </div>
        <div className="hero-drawing">
          <JetEngineWorkbench />
          <div className="drawing-register">
            <span>
              DISCIPLINE
              <br />
              <strong>Mechanical engineering</strong>
            </span>
            <span>
              APPROACH
              <br />
              <strong>Design · Review · Test</strong>
            </span>
            <span className="register-rev">
              REV
              <br />
              <strong>{SITE.siteRev}</strong>
            </span>
          </div>
        </div>
      </div>
      <div className="hero-footnote">
        <span className="current-work">
          <i aria-hidden="true" />
          Currently at HCEG
        </span>
        <span>Rajshahi WASA · Water treatment infrastructure</span>
        <a href="#project" aria-label="Scroll to the Tesla turbine project">
          Scroll to explore <span aria-hidden="true">↓</span>
        </a>
      </div>
      <ResumeModal isOpen={resumeOpen} onClose={() => setResumeOpen(false)} />
    </header>
  );
}
