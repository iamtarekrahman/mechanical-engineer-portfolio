# Tarek Rahman — Engineering Portfolio

An engineering archive for Tarek Rahman, Assistant Mechanical Engineer.
Revision 02 combines warm drawing sheets, engraved credentials, a project
notebook, and a compact shader theme control.

## Run

Requires Node 18.18+.

```sh
npm install
npm run dev
npm run typecheck
npm run build
npm start
```

On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm`.

The app uses Next.js 14 App Router, React 18, TypeScript, and Tailwind CSS.
Typography is self-hosted through `next/font`: Fraunces, Inter, and IBM Plex Mono.

## Site versions

Both versions are served by this project and deploy together to Vercel:

- `/` — the current V2 portfolio.
- `/v1` — the preserved V1 portfolio from commit
  `7390c491fbf2af778704ae3a4643bd731b69b997`.

V1 is a source snapshot in `src/legacy/v1/` with its own images, logos, and
résumé PDFs in `public/v1/`. Its components import the archived content rather
than the current V2 files. The `/v1/api/pdf` endpoint serves the archived PDFs.

The two Next.js route groups, `src/app/(v2)/` and `src/app/(v1)/`, have separate
root layouts so their fonts and global CSS remain independent. Keep those
layouts separate; switching between versions performs a full document load.
V2 styles remain in `src/app/globals.css`; V1 styles live in
`src/legacy/v1/globals.css`.

The current V2 page is `src/app/(v2)/page.tsx`. Routine content and design edits
should use `src/components/` and `src/data/content.ts`, leaving the V1 snapshot
intact. Both versions have their own canonical URL.

After this change is committed and deployed through the existing Vercel project,
`https://tarekrahman.vercel.app` serves V2 and
`https://tarekrahman.vercel.app/v1` serves V1. No extra domain, project, rewrite,
or deployment environment variable is required.

## Interface

- Selecting portfolio text opens a five-color highlight toolbar. Click Highlight
  to apply the last chosen color (initially orange), or choose a new color.
  Hover over marked text to reveal its Clear button. Highlights reset on refresh;
  Tab and arrow keys operate the selection toolbar.
  Uses the CSS Custom Highlight API without changing the document's text markup.
- Slim vertical reveal tabs sit flush against the left and right viewport edges
  and open original Three.js renewable energy miniatures independently. Expanded
  models occupy the outer margins at 1680px+ with at least 650px height; smaller
  desktops and landscape devices scroll the chosen model into view below the hero.
  Both projects start closed and their 3D code loads only on first reveal.
  Hide project or Escape closes a scene, pauses its simulation, and preserves
  its settings for reopening. Portrait touch devices do not load them.
  Hold the wind button (pointer, touch, Space or Enter) to accelerate the turbine;
  its connected cottage brightens with output and fades as the blades coast.
  The two-storey solar home has rooftop photovoltaic cells, a visible fan, and
  separate light/fan switches. Light mode charges the battery; dark mode uses
  stored power. Battery charge and switches survive theme and orientation changes.
  All values are an illustrative simulation. One lazy-loaded WebGL context draws
  both models at up to 30fps, stopping when hidden/offscreen/idle. Reduced motion
  preserves energy controls with static rotors; an SVG fallback supports the same
  interactions without WebGL. Geometry is original and needs no Sketchfab assets.
- The opening is an interactive cutaway jet-engine workbench with six selectable
  assemblies, smooth explosion/reassembly, orbit/pan/zoom, wireframe, preset views,
  and an expanded dialog. When zoomed, the inline model extends beyond its frame
  on a transparent canvas above the page and workbench controls. Dragging stays
  within the drawing area, and the extra canvas does not block surrounding links.
  Overflow is limited on mobile; the expanded dialog keeps its bounded view.
  Floating part names start hidden; the Labels tool
  toggles them in either view. The casing lowers during separation. Fan, compressor,
  and turbine rotors animate with 0–3× speed control and pause/play; stators stay
  fixed. Original procedural geometry uses Three.js, loaded separately on demand.
  Rotation runs at 30fps and stops when hidden or offscreen. Paused assemblies
  render only on demand. Reduced motion starts the blades paused; a static
  assembly drawing is available when 3D cannot load.
- The portrait starts in monochrome. Drawing with a pointer or touch reveals
  the original, unfiltered colors for ten seconds before they fade back. A
  keyboard-accessible Reveal all button offers the same interaction.
- The Tesla turbine notebook has Design, Fabrication, and Testing pages,
  component annotations, image zoom, and an inspection lens supporting
  pointer, touch, and arrow-key navigation.
- Eight credentials appear in an archive of original certificate previews,
  with subject filters and keyboard navigation. Certificates appear directly
  in the page; Renewable Energy's four course certificates expand inline,
  for twelve documents total.
  Issuer verification links are included where printed on the documents.
- The shader theme switch uses raw WebGL with a functional CSS fallback.
  It follows system preferences until a choice is saved, syncs between tabs,
  and continuously animates its surface at up to 30fps without idle, viewport,
  or reduced-motion pause rules, as requested for this control. A moving CSS
  fallback keeps it animated if WebGL is unavailable or loses its context.
  Browsers may suspend background-tab rendering; animation resumes automatically.
- Experience is a timeline; capabilities link to supporting work.
  Education and recognition use compact records.
- Native modal dialogs handle focus trapping, Escape, and focus restoration.
  The résumé viewer includes both original PDF versions.
- The contact form uses the existing Web3Forms integration. Editable fields
  are disabled while sending; errors retain the draft. Email can also be copied.

## Content and assets

Most structured content is in `src/data/content.ts`. Biography and project
notes are in `About.tsx`, `FeaturedProject.tsx`, and `ProjectNotebook.tsx`.
The capability-to-evidence links are in `Skills.tsx`.

Existing assets:

- `public/images/profile-c.jpg`
- `public/images/tesla-turbine-cad.png`
- `public/images/tesla-turbine-setup.png`
- The one-page and two-page résumé PDFs in `public/`

Certificate previews are uncropped WebP images in `public/certificates/`.
Their `preview` fields specify the path, width, and height. A course's
`parentCredentialId` places it beneath its specialization. Titles, dates,
credential types, and expiry information follow the supplied documents.

Certificates are for viewing: do not add certificate PDFs or download links.
The inline previews discourage image saving through context-menu, drag,
and mobile callout restrictions. Browser-visible images can still be retrieved
or captured; these controls are not access protection.

The notebook uses existing imagery and factual project descriptions; it does
not display invented performance results or thesis measurements. The supplied
thesis findings cover SolidWorks design, laser-cut fabrication, multi-pressure
testing, 3D CFD modeling in ANSYS Fluent, and the optimal 1.0 mm disk gap in the
tested configurations.

## Styling

Shared colors, spacing, typography, buttons, navigation, and section layouts:
`src/app/globals.css`.

Feature styling:

- `src/components/certificates.css`
- `src/components/ProjectNotebook.module.css`
- `src/components/theme-toggle.css`
- `src/components/JetEngineWorkbench.module.css`
- `src/components/color-reveal.css`
- `src/components/EnergyGarden.module.css`

The main palette variables are `--paper`, `--surface`, `--ink`,
`--graphite`, `--blueline`, `--brass`, and `--hairline`.

ThreeUI Community's MIT-licensed shader and engraving geometry are adapted
locally. The engine geometry is original and includes no Sketchfab assets.
Attribution is in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Verification

`npm run typecheck` and `npm run build` validate the application.
`node --test tests/energy-simulation.test.cjs` checks wind acceleration/coasting,
solar charging, battery depletion/recovery, reduced motion, and timing behavior.

For a production build alongside a running development server, the optional
`PORTFOLIO_VERIFY_BUILD=1` environment variable uses `.next-verify/`:

```powershell
$env:PORTFOLIO_VERIFY_BUILD = "1"
npm.cmd run build
npm.cmd run start -- -p 3002
```

With that server running, verify both site versions, separate font bundles,
archived asset bytes, and both PDF endpoints:

```powershell
$env:PORTFOLIO_TEST_URL = "http://localhost:3002"
node --test tests/site-versions.integration.test.cjs
```

The same check can target a Vercel preview URL. It makes read-only requests and
does not submit the contact form.

Browser checks should cover phone widths from 320px, both themes, saved/system
theme changes, reduced motion, WebGL failure, certificate and notebook keyboard
navigation, modal focus, both PDFs, and contact success/error responses.
Intercept the Web3Forms request when testing to avoid sending real messages.
