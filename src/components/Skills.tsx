import { SectionShell } from "./SectionShell";
import { skills } from "@/data/content";
import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";
import styles from "./Skills.module.css";

const inventoryIcons: Record<string, ReactNode> = {
  "Analytical & Documentation": (
    <>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" />
      <path d="M14 3v6h6M8 17v-3m4 3v-5m4 5v-2" />
    </>
  ),
  "Technical & Software": (
    <>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8m-4-4v4M9 8l-2 2 2 2m6-4 2 2-2 2" />
    </>
  ),
  Interpersonal: (
    <>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-2a6 6 0 0 1 12 0v2M16 4a3 3 0 0 1 0 6m2 5a5 5 0 0 1 3 4v2" />
    </>
  ),
  Languages: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </>
  ),
};

const capabilities = [
  {
    number: "A",
    title: "Design & drafting",
    description:
      "Turning an engineering idea into geometry, assemblies, and clear technical drawings.",
    tools: ["SOLIDWORKS", "AutoCAD", "Parametric modeling"],
    links: [
      { href: "#project", label: "Tesla turbine project" },
      { href: "#certifications", label: "CSWA credential" },
    ],
  },
  {
    number: "B",
    title: "Equipment & compliance",
    description:
      "Reviewing manufacturer documentation, resolving comments, and coordinating technical submittals.",
    tools: ["Equipment review", "BS · ISO · IEC", "Vendor coordination"],
    links: [{ href: "#experience", label: "Current engineering role" }],
  },
  {
    number: "C",
    title: "Analysis & documentation",
    description:
      "Combining CFD, prototype testing, and technical documentation to compare model predictions with physical performance.",
    tools: [
      "ANSYS Fluent",
      "Excel",
      "Technical reporting",
      "Test documentation",
    ],
    links: [
      { href: "#project", label: "Experimental approach" },
      { href: "#experience", label: "Plant experience" },
    ],
  },
];

export function Skills() {
  return (
    <SectionShell
      id="skills"
      kicker="Working capabilities"
      title="A practical toolkit."
      intro="Skills connected to the work, with room to keep learning."
    >
      <div className={styles.grid}>
        {capabilities.map((item, index) => (
          <Reveal
            className={styles.reveal}
            delay={index * 0.075}
            key={item.number}
          >
            <SpotlightCard className={styles.card}>
              <header className={styles.header}>
                <span className={styles.letter} aria-hidden="true">
                  {item.number}
                </span>
                <h3>{item.title}</h3>
              </header>
              <p className={styles.description}>{item.description}</p>
              <div className={styles.tags}>
                {item.tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
              <div className={styles.links}>
                {item.links.map((link) => (
                  <a className="text-link" href={link.href} key={link.href}>
                    {link.label} <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
      <details className={styles.inventory}>
        <summary>
          Full skills inventory <span aria-hidden="true">+</span>
        </summary>
        <div className={styles.inventoryGrid}>
          {skills.map((group) => (
            <div key={group.group}>
              <SpotlightCard
                as="h4"
                variant="heading"
                accent="teal"
                className={styles.inventoryHeading}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  {inventoryIcons[group.group]}
                </svg>
                <span>{group.group}</span>
              </SpotlightCard>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </SectionShell>
  );
}
