export type Experience = {
  rev: string;
  role: string;
  org: string;
  project: string;
  location?: string;
  period: string;
  current?: boolean;
  summary: string;
  tags: string[];
  bullets: string[];
};

export type Certification = {
  title: string;
  issuer: string;
  platform?: string;
  issued: string;
  expires?: string;
  credentialId: string;
  /** Component course shown only inside its specialization. */
  parentCredentialId?: string;
  verifyUrl?: string;
  category: "Design" | "Energy" | "Safety";
  kind: "Professional certification" | "Course certificate" | "Specialization certificate";
  /** Uncropped, lossless WebP preview of the supplied certificate image. */
  preview: { src: string; width: number; height: number };
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
  siteRev: "02",
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
    summary: "Technical submittals and vendor compliance for major water treatment equipment at the Rajshahi WASA Surface Water Treatment Plant.",
    tags: ["Equipment compliance", "BS · ISO · IEC", "Technical submittals"],
    bullets: [
      "Coordinating technical submittals for major water treatment infrastructure equipment, such as pumps, valves, chlorination systems, and cranes, while verifying vendor compliance along with equipment performance data and spare parts specifications.",
      "Reviewing diverse engineering documentation against Employer’s Requirements alongside international BS, ISO, and IEC standards to resolve consultant non-compliance comments throughout resubmission cycles.",
    ],
  },
  {
    rev: "REV. A",
    role: "Intern, Maintenance and Operations",
    org: "Heidelberg Materials Bangladesh PLC",
    project: "Mukterpur, Munshiganj",
    period: "Feb 2025 — May 2025",
    summary: "Dust control troubleshooting and preventive maintenance across plant maintenance sectors.",
    tags: ["Dust control", "Preventive maintenance", "Valve diagnostics"],
    bullets: [
      "Rotated across plant maintenance sectors to resolve dust control system failures. Investigated high pressure drops caused by abrasive dust wear on filter bags, tearing of diaphragm pulse valves, and clumping hopper blockages. Successfully implemented scheduled preventive inspections, diagnosed localized valve electrical failures, and optimized air lock rotary valves to eliminate raw material build-up.",
    ],
  },
];

// Details transcribed from the supplied issuer documents. Only viewing previews are published.
export const certifications: Certification[] = [
  {
    "title": "SOLIDWORKS Design Associate (CSWA)",
    "issuer": "Dassault Systèmes",
    "issued": "18 Jan 2025",
    "credentialId": "C-7CWAKR3PD6",
    "verifyUrl": "https://cv.virtualtester.com/qr/?b=SLDWRKS&i=C-7CWAKR3PD6",
    "category": "Design",
    "kind": "Professional certification",
    "preview": {
      "src": "/certificates/c-7cwakr3pd6.webp",
      "width": 2400,
      "height": 1697
    },
    "mark": "dassault",
    "tags": [
      "SOLIDWORKS",
      "Parametric modeling",
      "Assembly design"
    ]
  },
  {
    "title": "3DSwymer Associate",
    "issuer": "Dassault Systèmes",
    "issued": "7 Dec 2025",
    "credentialId": "C-74T53PLDXQ",
    "verifyUrl": "https://cv.virtualtester.com/qr/?b=SLDWRKS&i=C-74T53PLDXQ",
    "category": "Design",
    "kind": "Professional certification",
    "preview": {
      "src": "/certificates/c-74t53pldxq.webp",
      "width": 2400,
      "height": 1697
    },
    "mark": "dassault",
    "tags": [
      "3DEXPERIENCE",
      "Collaboration"
    ]
  },
  {
    "title": "Collaborative Designer for SOLIDWORKS Associate",
    "issuer": "Dassault Systèmes",
    "issued": "16 Dec 2025",
    "credentialId": "C-XBZG3UHAV7",
    "verifyUrl": "https://cv.virtualtester.com/qr/?b=SLDWRKS&i=C-XBZG3UHAV7",
    "category": "Design",
    "kind": "Professional certification",
    "preview": {
      "src": "/certificates/c-xbzg3uhav7.webp",
      "width": 2400,
      "height": 1697
    },
    "mark": "dassault",
    "tags": [
      "SOLIDWORKS",
      "3DEXPERIENCE",
      "Collaborative design"
    ]
  },
  {
    "title": "Renewable Energy Technology Fundamentals",
    "issuer": "University of Colorado Boulder",
    "platform": "Coursera",
    "issued": "24 Jun 2026",
    "credentialId": "3MPQ007CTAVY",
    "parentCredentialId": "EZSSNCP2PM3U",
    "verifyUrl": "https://coursera.org/verify/3MPQ007CTAVY",
    "category": "Energy",
    "kind": "Course certificate",
    "preview": {
      "src": "/certificates/3mpq007ctavy.webp",
      "width": 2400,
      "height": 1855
    },
    "mark": "colorado",
    "tags": [
      "Renewable energy",
      "Energy technologies"
    ]
  },
  {
    "title": "Renewable Power and Electricity Systems",
    "issuer": "University of Colorado Boulder",
    "platform": "Coursera",
    "issued": "29 Jun 2026",
    "credentialId": "46TZ9AXOSYR7",
    "parentCredentialId": "EZSSNCP2PM3U",
    "verifyUrl": "https://coursera.org/verify/46TZ9AXOSYR7",
    "category": "Energy",
    "kind": "Course certificate",
    "preview": {
      "src": "/certificates/46tz9axosyr7.webp",
      "width": 2400,
      "height": 1855
    },
    "mark": "colorado",
    "tags": [
      "Renewable power",
      "Electricity systems"
    ]
  },
  {
    "title": "Renewable Energy",
    "issuer": "University of Colorado Boulder",
    "platform": "Coursera",
    "issued": "30 Jun 2026",
    "credentialId": "EZSSNCP2PM3U",
    "verifyUrl": "https://coursera.org/verify/specialization/EZSSNCP2PM3U",
    "category": "Energy",
    "kind": "Specialization certificate",
    "preview": {
      "src": "/certificates/ezssncp2pm3u.webp",
      "width": 2400,
      "height": 1855
    },
    "mark": "colorado",
    "tags": [
      "Renewable energy",
      "Energy systems",
      "Energy projects"
    ]
  },
  {
    "title": "Autodesk Certified Professional: AutoCAD for Design and Drafting Exam Prep",
    "issuer": "Autodesk",
    "platform": "Coursera",
    "issued": "28 Jun 2026",
    "credentialId": "FOE92N2S5Y9C",
    "verifyUrl": "https://coursera.org/verify/FOE92N2S5Y9C",
    "category": "Design",
    "kind": "Course certificate",
    "preview": {
      "src": "/certificates/foe92n2s5y9c.webp",
      "width": 2400,
      "height": 1855
    },
    "mark": "autodesk",
    "tags": [
      "AutoCAD",
      "Technical drafting",
      "Exam preparation"
    ]
  },
  {
    "title": "Renewable Energy Projects",
    "issuer": "University of Colorado Boulder",
    "platform": "Coursera",
    "issued": "30 Jun 2026",
    "credentialId": "LQRF72B4F5XF",
    "parentCredentialId": "EZSSNCP2PM3U",
    "verifyUrl": "https://coursera.org/verify/LQRF72B4F5XF",
    "category": "Energy",
    "kind": "Course certificate",
    "preview": {
      "src": "/certificates/lqrf72b4f5xf.webp",
      "width": 2400,
      "height": 1855
    },
    "mark": "colorado",
    "tags": [
      "Renewable energy",
      "Project development"
    ]
  },
  {
    "title": "Renewable Energy Futures",
    "issuer": "University of Colorado Boulder",
    "platform": "Coursera",
    "issued": "30 Jun 2026",
    "credentialId": "OZQ2ZMU257RE",
    "parentCredentialId": "EZSSNCP2PM3U",
    "verifyUrl": "https://coursera.org/verify/OZQ2ZMU257RE",
    "category": "Energy",
    "kind": "Course certificate",
    "preview": {
      "src": "/certificates/ozq2zmu257re.webp",
      "width": 2400,
      "height": 1855
    },
    "mark": "colorado",
    "tags": [
      "Energy transition",
      "Renewable energy"
    ]
  },
  {
    "title": "Risk Management and Industrial Safety",
    "issuer": "Khalifa University",
    "platform": "Coursera",
    "issued": "27 Jun 2026",
    "credentialId": "XYKIEIMDLFIA",
    "verifyUrl": "https://coursera.org/verify/XYKIEIMDLFIA",
    "category": "Safety",
    "kind": "Course certificate",
    "preview": {
      "src": "/certificates/xykieimdlfia.webp",
      "width": 2400,
      "height": 1855
    },
    "mark": "khalifa",
    "tags": [
      "Industrial safety",
      "Risk management"
    ]
  },
  {
    "title": "Wind Energy",
    "issuer": "Technical University of Denmark (DTU)",
    "platform": "Coursera",
    "issued": "29 Jun 2026",
    "credentialId": "Z3BSID5IDB25",
    "verifyUrl": "https://coursera.org/verify/Z3BSID5IDB25",
    "category": "Energy",
    "kind": "Course certificate",
    "preview": {
      "src": "/certificates/z3bsid5idb25.webp",
      "width": 2400,
      "height": 1855
    },
    "mark": "dtu",
    "tags": [
      "Wind energy",
      "Wind turbines",
      "Aerodynamics"
    ]
  },
  {
    "title": "The COSHH Risk Assessor Certification™",
    "issuer": "The Knights of Safety Academy",
    "issued": "19 Jul 2026",
    "expires": "19 Jul 2027",
    "credentialId": "nxxdvfteic",
    "verifyUrl": "https://academy.theknightsofsafety.com/certificates/nxxdvfteic",
    "category": "Safety",
    "kind": "Course certificate",
    "preview": {
      "src": "/certificates/nxxdvfteic.webp",
      "width": 2400,
      "height": 1695
    },
    "mark": "generic",
    "tags": [
      "COSHH",
      "Chemical safety",
      "Risk assessment"
    ]
  }
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
    items: ["MS Office (Excel, Word, PowerPoint)", "SOLIDWORKS", "AutoCAD", "ANSYS Fluent"],
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

export const affiliations: { name: string; detail: string; membershipId?: string; period?: string }[] = [
  {
    name: "Energy Institute (EI)",
    detail: "Graduate Member",
    membershipId: "0093259",
  },
  {
    name: "International Association of Engineers (IAENG)",
    detail: "Member",
    membershipId: "583383",
  },
  {
    name: "Institution of Mechanical Engineers (IMechE)",
    detail: "Affiliate Graduate",
    membershipId: "80764897",
  },
  {
    name: "American Society of Mechanical Engineers (ASME)",
    detail: "Student Member",
    period: "2024–2025",
  },
];

export const extraCurricular: { name: string; detail: string; period: string; description: string }[] = [
  {
    name: "Nayem's Association for Research and Publication (NARP)",
    detail: "Researcher",
    period: "Jan 2026 — Present",
    description: "Conducting independent academic literature reviews and data analysis focused on mechanical systems. Collaborating with cross-functional research teams to draft, refine, and format technical manuscripts for peer-reviewed scientific journals.",
  },
  {
    name: "IUBAT Society of Mechanical Engineers (ISME)",
    detail: "Member",
    period: "2022–2023",
    description: "Contributed to the media and communications team by managing digital outreach channels, designing promotional materials for technical events, and coordinating logistics for departmental engineering seminars and webinars.",
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
