"use client";

import { useState } from "react";
import { Modal } from "./Modal";

export function ResumeModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [version, setVersion] = useState<"1page" | "2page">("1page");
  const file = `/Tarek%20Rahman%20Resume-${version === "1page" ? "1" : "2"}%20Page.pdf`;
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Tarek Rahman · Résumé"
      className="resume-modal"
    >
      <div className="resume-toolbar">
        <div
          className="segmented-control"
          role="group"
          aria-label="Résumé version"
        >
          <button
            type="button"
            aria-pressed={version === "1page"}
            onClick={() => setVersion("1page")}
          >
            One page
          </button>
          <button
            type="button"
            aria-pressed={version === "2page"}
            onClick={() => setVersion("2page")}
          >
            Two pages
          </button>
        </div>
        <a href={file} download className="draft-button">
          Download PDF <span aria-hidden="true">↓</span>
        </a>
      </div>
      <object
        key={version}
        data={`/api/pdf?file=${version}#view=FitH`}
        type="application/pdf"
        className="resume-document"
        aria-label={`${version === "1page" ? "One" : "Two"} page résumé`}
      >
        <p className="resume-fallback">
          Your browser can open the résumé in a new tab.{" "}
          <a href={file} target="_blank" rel="noreferrer" className="text-link">
            Open PDF ↗
          </a>
        </p>
      </object>
      <p className="resume-footer">
        Prefer a separate window?{" "}
        <a href={file} target="_blank" rel="noreferrer" className="text-link">
          Open résumé ↗
        </a>
      </p>
    </Modal>
  );
}
