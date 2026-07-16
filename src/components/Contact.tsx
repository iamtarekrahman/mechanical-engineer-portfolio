import { SectionShell } from "./SectionShell";
import { SITE } from "@/data/content";
import { ContactForm } from "./ContactForm";
import {
  ExternalLinkIcon,
  LocationIcon,
  EmailIcon,
  LinkedInIcon,
  ArrowUpIcon,
} from "./icons";

export function Contact() {
  return (
    <SectionShell
      id="contact"
      kicker="CONTACT / STAMP"
      title="Get in Touch"
      sheet="CONTACT"
      intro="Have a project in mind or need engineering support? Drop a message."
    >
      <ContactForm />

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        <div className="ink-border bg-paper p-4">
          <div className="flex items-center gap-2 text-blueline">
            <LocationIcon size={18} />
            <p className="mono-label text-graphite">Location</p>
          </div>
          <p className="mt-3 font-body text-[0.95rem] text-ink">
            {SITE.location}
          </p>
        </div>

        <div className="ink-border bg-paper p-4">
          <div className="flex items-center gap-2 text-blueline">
            <EmailIcon size={18} />
            <p className="mono-label text-graphite">Email</p>
          </div>
          <a
            href={`mailto:${SITE.email}`}
            className="mt-3 block break-all font-mono text-sm text-blueline underline-offset-4 hover:underline"
          >
            {SITE.email}
          </a>
        </div>

        <div className="ink-border bg-paper p-4">
          <div className="flex items-center gap-2 text-blueline">
            <LinkedInIcon size={18} />
            <p className="mono-label text-graphite">LinkedIn</p>
          </div>
          <a
            href={SITE.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 break-all font-mono text-sm text-blueline underline-offset-4 hover:underline"
          >
            {SITE.linkedin} <ExternalLinkIcon />
          </a>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center">
        <p className="mono-label text-graphite">
          DWG. {SITE.name.toUpperCase()} — REV {SITE.siteRev}
        </p>
        <p className="mono-label text-graphite">
          © {new Date().getFullYear()} {SITE.name}
        </p>
      </div>

      {/* Return to top */}
      <div className="mt-8 flex justify-center">
        <a
          href="#top"
          className="group inline-flex items-center gap-2 border border-hairline bg-paper px-4 py-2.5 text-ink transition-colors hover:border-blueline hover:text-blueline"
        >
          <ArrowUpIcon size={16} className="text-blueline" />
          <span className="mono-label">Return to Top</span>
        </a>
      </div>
    </SectionShell>
  );
}
