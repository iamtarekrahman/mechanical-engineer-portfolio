export type Experience = {
  rev: string;
  role: string;
  org: string;
  project: string;
  location?: string;
  period: string;
  current?: boolean;
  bullets: string[];
};

export type Certification = {
  title: string;
  issuer: string;
  platform?: string;
  issued: string;
  credentialId: string;
  verifyUrl: string;
  /** Key used to pick a monochrome line-art logo mark. */
  mark:
    | "khalifa"
    | "colorado"
    | "dtu"
    | "autodesk"
    | "dassault"
    | "generic";
  /** Optional real brand logo (SVG in /public). Overrides `mark` when set. */
  logoSrc?: string;
  tags: string[];
};

export type Education = {
  program: string;
  institution: string;
  period: string;
  result: string;
  tags: string[];
};

export const SITE = {
  name: "Tarek Rahman",
  role: "Assistant Mechanical Engineer",
  location: "Uttara, Dhaka-1230, Bangladesh",
  email: "tarek737519@gmail.com",
  linkedin: "linkedin.com/in/iamtarekrahman",
  linkedinUrl: "https://www.linkedin.com/in/iamtarekrahman",
  /** Site revision. Bump only on an actual redesign. */
  siteRev: "01",
  drawnBy: "T. RAHMAN",
};

export const experience: Experience[] = [
  {
    rev: "REV. B",
    role: "Assistant Mechanical Engineer",
    org: "Hunan Construction Engineering Group (HCEG)",
    project: "Rajshahi WASA Surface Water Treatment Plant",
    period: "Jan 2026 — Present",
    current: true,
    bullets: [
      "Coordinate with equipment manufacturers, consultants, and senior engineers to prepare, revise, and track technical and material submittals — pumps, valves, chlorination systems, and cranes — for a large infrastructure project.",
      "Review vendor documentation against the Employer's Requirements and international standards (BS, ISO, IEC), resolving consultant non-compliance comments, verifying spare parts and performance data, and keeping accurate records across resubmission cycles.",
    ],
  },
  {
    rev: "REV. A",
    role: "Intern, Maintenance and Operations",
    org: "Heidelberg Materials Bangladesh PLC",
    project: "Mukterpur, Munshiganj",
    period: "Feb 2025 — May 2025",
    bullets: [
      "Rotated through maintenance, production, and quality control departments to build a working understanding of how the plant actually runs.",
      "Analyzed quality control data and worked with cross-functional teams to prepare performance reports, flag inefficiencies, and support equipment reliability improvements.",
    ],
  },
];

export const certifications: Certification[] = [
  {
    title: "Risk Management and Industrial Safety",
    issuer: "Khalifa University",
    platform: "Coursera",
    issued: "Jun 2026",
    credentialId: "XYKIEIMDLFIA",
    verifyUrl: "https://coursera.org/verify/XYKIEIMDLFIA",
    mark: "khalifa",
    tags: ["Industrial Safety", "Risk Assessment", "Hazard Analysis", "Compliance"],
  },
  {
    title: "Renewable Energy",
    issuer: "University of Colorado Boulder",
    platform: "Coursera",
    issued: "Jun 2026",
    credentialId: "EZSSNCP2PM3U",
    verifyUrl: "https://coursera.org/verify/specialization/EZSSNCP2PM3U",
    mark: "colorado",
    tags: ["Solar Energy", "Wind Energy", "Energy Systems", "Sustainability"],
  },
  {
    title: "Wind Energy",
    issuer: "Technical University of Denmark — DTU",
    platform: "Coursera",
    issued: "Jun 2026",
    credentialId: "Z3BSID5IDB25",
    verifyUrl: "https://coursera.org/verify/Z3BSID5IDB25",
    mark: "dtu",
    tags: ["Wind Turbine Design", "Aerodynamics", "Renewable Systems"],
  },
  {
    title: "Autodesk Certified Professional: AutoCAD for Design and Drafting",
    issuer: "Autodesk",
    platform: "Coursera",
    issued: "Jun 2026",
    credentialId: "FOE92N2S5Y9C",
    verifyUrl: "https://coursera.org/verify/FOE92N2S5Y9C",
    mark: "autodesk",
    logoSrc: "/logos/autocad_vector_logo.svg",
    tags: ["AutoCAD 2D", "AutoCAD 3D", "Technical Drafting", "Design Documentation"],
  },
  {
    title: "CSWA — Certified SOLIDWORKS Associate",
    issuer: "Dassault Systèmes",
    issued: "Jan 2025",
    credentialId: "C-7CWAKR3PD6",
    verifyUrl: "https://cv.virtualtester.com/qr/?b=SLDWRKS&i=C-7CWAKR3PD6",
    mark: "dassault",
    logoSrc: "/logos/solidworks-vector-logo.svg",
    tags: ["SOLIDWORKS", "Parametric Modeling", "Assembly Design"],
  },
];

export const education: Education[] = [
  {
    program: "BSc in Mechanical Engineering",
    institution:
      "IUBAT — International University of Business Agriculture and Technology",
    period: "2021 — 2025",
    result: "CGPA 3.90 / 4.00",
    tags: [
      "Thermodynamics",
      "Fluid Mechanics",
      "Machine Design",
      "Manufacturing Processes",
      "Materials Science",
      "Engineering Drawing",
      "SOLIDWORKS",
      "AutoCAD",
    ],
  },
  {
    program: "HSC — Science",
    institution: "Ibn Taimiya School and College",
    period: "2017 — 2019",
    result: "GPA 4.50 / 5.00",
    tags: ["Physics", "Chemistry", "Mathematics", "Biology"],
  },
  {
    program: "SSC — Science",
    institution: "Munshirhat High School",
    period: "2016 — 2017",
    result: "GPA 4.09 / 5.00",
    tags: ["Physics", "Chemistry", "Mathematics", "Biology"],
  },
];

export const skills: { group: string; items: string[] }[] = [
  {
    group: "Analytical & Documentation",
    items: [
      "Data Analysis & Reporting",
      "Record Keeping",
      "Inventory & Material Management",
      "Process Optimization",
    ],
  },
  {
    group: "Technical & Software",
    items: ["MS Office (Excel, Word, PowerPoint)", "SOLIDWORKS", "AutoCAD"],
  },
  {
    group: "Interpersonal",
    items: [
      "Vendor & Cross-functional Coordination",
      "Team Collaboration",
      "Problem-Solving",
      "Communication",
    ],
  },
  {
    group: "Languages",
    items: ["Bangla (Native)", "English (Fluent)"],
  },
];

export const affiliations: { name: string; detail: string; period?: string }[] = [
  {
    name: "American Society of Mechanical Engineers (ASME)",
    detail: "Member",
  },
  {
    name: "Institution of Mechanical Engineers (IMechE)",
    detail: "Member",
  },
];

export const extraCurricular: { name: string; detail: string; period?: string }[] = [
  {
    name: "NARP — Nayem's Association for Research and Publication",
    detail: "Researcher",
    period: "Mar 2026 — Present",
  },
  {
    name: "ISME — IUBAT Society of Mechanical Engineers",
    detail: "Co-Media & Communication Secretary",
    period: "May 2022 — May 2023",
  },
];

export const awards: { title: string; detail: string; where: string }[] = [
  {
    title: "Ahsanullah Scholarship",
    detail: "Merit-based · Summer 2023",
    where: "IUBAT",
  },
  {
    title: "Academic Excellence Award",
    detail: "Fall 2022 & Fall 2023",
    where: "IUBAT",
  },
  {
    title: "Photography Exhibition Recognition",
    detail:
      "Two photographs selected for the National Photography Exhibition & Competition, 2023",
    where: "Bangladesh Shilpakala Academy",
  },
];
