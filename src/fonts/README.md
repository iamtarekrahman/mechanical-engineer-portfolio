# Bundled fonts

Both site versions load these Latin WOFF2 files with `next/font/local`. They are
unchanged copies of the Google Fonts files from the last successful site build.
Keeping them in the repository removes build-time Google Fonts requests and
preserves the existing typography.

Fraunces and IBM Plex Mono are defined once in `shared.ts`. Each root layout
defines its own body fonts so V2 does not load the V1-only faces.

| Family | Weights used | Styles | Source | License |
| --- | --- | --- | --- | --- |
| Fraunces | 400–700 (variable) | Normal, italic | [Google Fonts](https://github.com/google/fonts/tree/main/ofl/fraunces) | [SIL OFL 1.1](licenses/fraunces.txt) |
| Inter | 400–600 (variable) | Normal | [Google Fonts](https://github.com/google/fonts/tree/main/ofl/inter) | [SIL OFL 1.1](licenses/inter.txt) |
| IBM Plex Mono | 400, 500, 600 | Normal | [Google Fonts](https://github.com/google/fonts/tree/main/ofl/ibmplexmono) | [SIL OFL 1.1](licenses/ibm-plex-mono.txt) |
| Newsreader (V1) | 300–600 (variable) | Normal, italic | [Google Fonts](https://github.com/google/fonts/tree/main/ofl/newsreader) | [SIL OFL 1.1](licenses/newsreader.txt) |
| Special Elite (V1) | 400 | Normal | [Google Fonts](https://github.com/google/fonts/tree/main/apache/specialelite) | [Apache 2.0](licenses/special-elite.txt) |

The variable font files support a wider weight range than the site uses. Their
`next/font/local` declarations expose the ranges used by the existing designs.
