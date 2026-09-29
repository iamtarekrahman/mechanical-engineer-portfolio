# Preserved V1 portfolio

Source commit: `7390c491fbf2af778704ae3a4643bd731b69b997`.

This is the V1 site previously served at `https://tarekrahman.vercel.app`, now
mounted at `/v1`. The production page's content and the ten archived public
assets were checked against that commit before copying.

Components, content, and CSS are copied from the commit, with only these routing
adjustments:

- Internal component/data imports point into `src/legacy/v1/`.
- Images, logos, and résumé downloads use `/v1/` asset paths.
- The résumé viewer uses `/v1/api/pdf`, which reads the frozen PDFs in `public/v1/`.
- The original page and root layout live in `src/app/(v1)/`; the layout imports
  this archive's CSS, uses its archived metadata assets, and declares `/v1` as
  its canonical and Open Graph URL.
- The PDF route explicitly uses dynamic rendering for its version query.

Original content, animations, layout, fonts, portrait behavior, section links,
and contact-form integration are retained. Theme preference storage is shared
with V2, but each version loads its own document and styles.

Treat this directory and `public/v1/` as the historical snapshot. Future V2
changes belong in the current components, data, and `(v2)` route group.
