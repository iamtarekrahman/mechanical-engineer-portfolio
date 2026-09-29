"use client";

import { useState, useEffect } from "react";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  const [selectedResume, setSelectedResume] = useState<"1page" | "2page" | null>(null);

  // Reset selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedResume(null);
    }
  }, [isOpen]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const resumePaths = {
    "1page": "/v1/Tarek%20Rahman%20Resume-1%20Page.pdf",
    "2page": "/v1/Tarek%20Rahman%20Resume-2%20Page.pdf",
  };

  const getEmbedUrl = (page: "1page" | "2page") => {
    // Use API route that serves PDF with Content-Disposition: inline header
    // This prevents IDM from intercepting the download
    // #view=Fit makes PDF fit entire page (both width and height) on load
    return `/v1/api/pdf?file=${page}#view=Fit`;
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className={`relative bg-paper border-2 border-blueline flex flex-col shadow-2xl ${
        !selectedResume
          ? 'w-full max-w-md' // Small window for selection
          : 'w-full h-full sm:h-[98vh] max-w-6xl' // Large window for PDF
      }`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-2 top-2 z-10 p-2 text-ink hover:text-blueline transition-colors bg-paper/90"
          aria-label="Close modal"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Content */}
        {!selectedResume ? (
          // Selection screen
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 min-h-[300px]">
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase text-ink mb-8 text-center">
              Select Resume Version
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <button
                onClick={() => setSelectedResume("1page")}
                className="flex-1 border-2 border-blueline bg-[color-mix(in_srgb,var(--blueline)_10%,var(--paper))] px-6 py-8 text-blueline transition-colors hover:bg-blueline hover:text-paper"
              >
                <div className="font-display text-4xl font-bold mb-2">1</div>
                <div className="mono-label">Page Resume</div>
              </button>
              <button
                onClick={() => setSelectedResume("2page")}
                className="flex-1 border-2 border-blueline bg-[color-mix(in_srgb,var(--blueline)_10%,var(--paper))] px-6 py-8 text-blueline transition-colors hover:bg-blueline hover:text-paper"
              >
                <div className="font-display text-4xl font-bold mb-2">2</div>
                <div className="mono-label">Pages Resume</div>
              </button>
            </div>
          </div>
        ) : (
          // PDF viewer screen
          <>
            <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900">
              <embed
                src={getEmbedUrl(selectedResume)}
                type="application/pdf"
                className="w-full h-full"
                aria-label={`Tarek Rahman Resume - ${selectedResume === "1page" ? "1 Page" : "2 Pages"}`}
              />
            </div>
            <div className="border-t-2 border-blueline bg-paper p-3 flex justify-center gap-4 flex-shrink-0">
              <button
                onClick={() => setSelectedResume(null)}
                className="border border-hairline bg-paper px-4 py-2 text-ink transition-colors hover:border-blueline hover:text-blueline mono-label"
              >
                ← Back
              </button>
              <a
                href={resumePaths[selectedResume]}
                download={`Tarek Rahman Resume${selectedResume === "2page" ? " - 2 Pages" : ""}.pdf`}
                className="inline-flex items-center gap-2 border-2 border-blueline bg-blueline px-4 py-2 text-paper transition-colors hover:bg-[color-mix(in_srgb,var(--blueline)_80%,black)] mono-label"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="square"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
