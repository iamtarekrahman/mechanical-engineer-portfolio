# Tarek Rahman — Portfolio

A personal portfolio for Tarek Rahman (Assistant Mechanical Engineer), designed
to read like an engineering drawing sheet: "Blueprint / Schematic" visual
language with title blocks, a faint graph-paper grid, submittal-log experience
entries, and spec-sheet cards for certifications and education.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (v3, no component library — full control over the design)
- Fonts via `next/font`: Space Grotesk (display), Inter (body), IBM Plex Mono (labels)
- Deployable to **Vercel** with zero config

## Run locally

Requires Node 18.18+ (Node 24 works).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

> On Windows PowerShell, if `npm` is blocked by execution policy, call the CLI
> directly: `& "C:\Program Files\nodejs\npm.cmd" run dev`.

## Editing content

All copy lives in one place: **`src/data/content.ts`** (bio blocks are in the
section components). Update roles, certifications, education, skills, awards,
etc. there.

- **Site revision (REV in the hero):** `SITE.siteRev` in `src/data/content.ts`.
  This is the *site's own* revision number — it starts at `01` and should only
  be bumped when the site is actually redesigned.

## Photos

Drop real images into `public/images/` (see `public/images/README.md`):

- `public/images/profile.jpg` — personal / ID photo (portrait, ~4:5).
- `public/images/tesla-turbine.jpg` — Tesla turbine prototype (landscape, ~4:3).

Until a file exists, a blueprint hatched placeholder is shown in its slot. No
code change is needed — drop the file in and rebuild/refresh.

## Certification logos

Issuer logos are currently monochrome line-art placeholder marks
(`src/components/IssuerMark.tsx`), drawn in the blueprint palette. Swap in real
brand SVGs there later, keyed by each certification's `mark` field.

## Design tokens

Defined as CSS variables in `src/app/globals.css` and mapped into Tailwind
(`tailwind.config.ts`):

| Token         | Value     | Use                              |
| ------------- | --------- | -------------------------------- |
| `--paper`     | `#FAFAF7` | Background                        |
| `--ink`       | `#1A2B3C` | Primary text                     |
| `--blueline`  | `#2E5C8A` | Accent                           |
| `--redline`   | `#B8492E` | Emphasis (sparing)               |
| `--graphite`  | `#6B7280` | Secondary text, dimension lines  |
| `--hairline`  | `#C8CDD3` | Rules, faint background grid      |

## Accessibility & responsiveness

- Responsive down to 375px.
- Visible keyboard focus states (`:focus-visible`).
- `prefers-reduced-motion` is respected globally (ready for animation added later).

## Notes

- No scroll animation yet — this pass is structure, content, and static design.
- `_prev_attempt/` holds components from an earlier scaffold attempt in this
  folder. They are not part of the build (excluded in `tsconfig.json` and
  `.gitignore`) and can be deleted if unwanted.

## Deploy to Vercel

Import the repo in Vercel (or run `vercel`). Framework preset **Next.js** is
detected automatically; no environment variables are required.
