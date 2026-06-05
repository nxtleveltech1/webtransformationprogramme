# Old Mutual brand CI — digital implementation

Reference: **Interim CI Creative Standards** (22 May 2026, updated 25 May 2026).

This internal **Programme Control Platform** applies the digital subset of the deck. ATL-only rules (signpost, anchor tab, FAIS, OOH/TV/social specs) are **not applicable** unless we add customer-facing or export templates.

## Colour palette

| Token | Name | HEX | Usage |
|-------|------|-----|--------|
| `--brand-heritage` | OM Heritage Green | `#009677` | Primary actions, links, sidebar chrome, chart series 1 |
| `--brand-fresh` | OM Fresh Green | `#50B848` | Active nav indicator, progress fills, RAG green |
| `--brand-future` | OM Future Green | `#8DC63F` | Accents, chart series 3, badges |
| `--brand-white` | White | `#FFFFFF` | Cards, text on green |
| `--brand-cerise` | OM Cerise | `#ED0080` | Accent only (≤10%), chart series if needed |
| `--brand-naartjie` | OM Naartjie | `#F37021` | Chart series 5 |
| `--brand-sun` | OM Sun | `#FFF200` | Gradients only |
| `--brand-sky` | OM Sky | `#00C0E8` | Chart series 4 — **not for copy text** |

### Rules (slide 4)

- **~80%** of UI: primary greens + white.
- **≤10%** secondary colours combined; no solid secondary backgrounds; **no body/copy in secondary colours**.
- **Gradients:** Heritage→Future; Heritage→Future→Sun; Heritage→Fresh at 45° (TV end frame).

### CSS utilities

- `.bg-gradient-om-heritage-future` — 135°, Heritage → Future
- `.bg-gradient-om-heritage-fresh` — 45°, Heritage → Fresh
- `.bg-gradient-om-heritage-future-sun` — Heritage → Future → Sun

### Exceptions

- **RAG red/amber** are functional status colours, not brand secondaries.
- Shadcn `--secondary` is UI chrome (muted green tint), not OM secondary palette.

## Typography

- **Primary:** Montserrat (400, 500, 600, 700). Prefer **600–700** for headings and emphasis on digital.
- **Do not use** Montserrat Light on digital.
- **Fallback:** Century Gothic (see `--font-sans` in `globals.css`).

## Logo

- Lockup = anchor + wordmark; never separate, rotate, or use gradient on the anchor in the logo.
- Sidebar: `/brand/om-logo-heritage.png` (white reversed on dark sidebar via CSS filter).
- Favicon: `/brand/om-anchor-tick.svg` (Heritage `#009677`).

## Charts

Default series order: `chart-1` Heritage → `chart-2` Fresh → `chart-3` Future → `chart-4` Sky → `chart-5` Naartjie.

## Verification

```bash
# No secondary colour copy in src
rg "text-brand-(cerise|cyan|naartjie|sun)" src/

# No solid secondary fills
rg "bg-brand-(cerise|cyan|naartjie|sun)(?!/)" src/
```

## Brand asset source

Logos extracted from the CI PowerPoint into `public/brand/`. The full deck (~98MB) should stay outside git; local path:

`C:\Users\gambe\Downloads\INTERIM CI Creative Standards - 22 May2026 2.pptx`
