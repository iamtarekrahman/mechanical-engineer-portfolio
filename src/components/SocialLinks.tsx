import { SITE } from "@/data/content";

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`social-links ${className}`}>
      <a
        className="social-link"
        href={SITE.linkedinUrl}
        target="_blank"
        rel="noreferrer"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M8 10v7m4-7v7m0-4a3 3 0 0 1 6 0v4" />
          <circle cx="8" cy="7" r=".9" fill="currentColor" stroke="none" />
        </svg>
        <span>LinkedIn</span>
        <span className="social-link-arrow" aria-hidden="true">
          ↗
        </span>
      </a>
      <a className="social-link" href={`mailto:${SITE.email}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
        <span>Email</span>
        <span className="social-link-arrow" aria-hidden="true">
          ↗
        </span>
      </a>
    </div>
  );
}
