---
name: Trace Luxury Archive
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#debfc2'
  on-secondary: '#3f2b2e'
  secondary-container: '#574144'
  on-secondary-container: '#cbaeb1'
  tertiary: '#d0cdcd'
  on-tertiary: '#303030'
  tertiary-container: '#b4b2b2'
  on-tertiary-container: '#454545'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#fbdbde'
  secondary-fixed-dim: '#debfc2'
  on-secondary-fixed: '#281719'
  on-secondary-fixed-variant: '#574144'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  noir: '#0A0A0A'
  charcoal: '#1A1A1A'
  alabaster: '#F2F2F2'
  muted-gold: '#C5A059'
  pale-rose: '#E8D3D1'
  border-grey: '#2D2D2D'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '300'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '300'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
  title-lg:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-main:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Source Serif 4
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 2rem
  margin-x: 4rem
  stack-sm: 0.5rem
  stack-md: 1.5rem
  stack-lg: 3rem
---

## Brand & Style

The design system for **trace** embodies the intersection of elite academic management and high-end editorial aesthetics. It targets institutional leaders and academic coordinators who require a tool that feels less like a spreadsheet and more like a curated fashion archive or a premium architecture portfolio.

The chosen style is **Minimalist / Editorial**, characterized by:
- **Atmospheric Depth:** A "Lights Out" dark mode that uses absolute blacks to create a void-like canvas where content takes center stage.
- **Precision & Authority:** High-contrast serif typography and razor-thin borders evoke a sense of permanence and meticulous record-keeping.
- **Luxury Constraints:** Sparse use of color and generous whitespace (negative space) are used as status symbols, signaling that the information is high-value and deserves room to breathe.
- **Functional Sophistication:** While the look is "expensive," the underlying logic remains strictly systematic, ensuring that complex data like grade consolidation and teacher honorariums are processed with clinical clarity.

## Colors

The palette is rooted in a "Noir" foundation to provide a high-end, immersive environment.

- **Primary (Muted Gold):** Used sparingly for interactive highlights, brand accents, and critical status indicators. It should never dominate the screen.
- **Secondary (Pale Rose):** Used for subtle accents or to distinguish secondary data sets (e.g., specific student status or soft warnings).
- **Backgrounds:** The base layer is `#0A0A0A`. Containers and cards use `#1A1A1A` (Charcoal) to create subtle separation.
- **Typography:** Primary text uses `Alabaster` for high-end readability without the harshness of pure white. Secondary text uses a mid-tone grey.
- **Borders:** Subtle 1px borders in `border-grey` or very low-opacity `muted-gold` define the structure without adding visual weight.

## Typography

This system uses an editorial typographic approach, relying almost exclusively on **Source Serif 4** for both headlines and body text to achieve a "literary" feel.

- **Headlines:** Use light weights (300) for large display text to emphasize the elegant curves of the serif.
- **Body:** Standardized on Source Serif 4 for a warm, academic reading experience.
- **Labels:** We introduce **Inter** for small UI labels, buttons, and metadata to provide a functional contrast to the serif body.
- **Data:** For grades, IDs, and financial audits, a monospaced font (JetBrains Mono) is used to ensure tabular alignment and technical precision.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. On desktop, the main content is constrained to a 1440px max-width, centered, to maintain the "archival" feel and prevent long line lengths.

- **Grid:** A 12-column grid is used for dashboard layouts.
- **Margins:** Large horizontal margins (64px+) on desktop create the necessary "luxury" whitespace.
- **Rhythm:** A 8px base unit drives all spacing. Vertical "stack" spacing is intentionally generous to prevent the UI from feeling cluttered with student data.
- **Mobile:** Margins reduce to 16px, and the grid collapses to a single column. Serif typography scales down to maintain legibility.

## Elevation & Depth

In this dark-mode luxury system, depth is achieved through **Tonal Layering and Outlines** rather than heavy shadows.

- **Tiers:** The background is `#0A0A0A`. Primary containers (Cards) are `#1A1A1A`. 
- **Borders:** Instead of shadows, use 1px solid borders (`#2D2D2D`) to define boundaries.
- **Gold Accents:** For high-priority active states (e.g., a selected student record), use a 1px `muted-gold` border.
- **Glassmorphism:** Navigation sidebars or top bars may use a subtle backdrop blur (20px) with a 60% opaque `charcoal` background to suggest layers of data.

## Shapes

The shape language is sophisticated and controlled. Elements use **Rounded (0.5rem)** corners to soften the "Noir" aesthetic, preventing it from feeling too aggressive or brutalist.

- **Standard Elements:** Inputs, cards, and buttons use a 8px (0.5rem) radius.
- **Large Containers:** Modals or large data sections use 16px (1rem) for a more distinct "object" feel.
- **Interactive Triggers:** Small chips or tags may use pill-shaping (full round) to distinguish them from structural containers.

## Components

- **Buttons:**
    - *Primary:* Muted Gold background, Noir text, bold Inter labels.
    - *Secondary:* Ghost style with 1px Alabaster border and Alabaster text.
- **Inputs:** 1px `border-grey` outline, Noir background. On focus, the border transitions to Muted Gold. Error states use a Pale Rose border.
- **Cards:** Background of Charcoal (`#1A1A1A`), 1px `border-grey`. No shadow. Title in Source Serif 4.
- **Lists:** Clean rows separated by 1px horizontal lines. High-end data density with ample vertical padding (16px+).
- **Chips:** Small, uppercase Inter labels. Backgrounds are tonal (e.g., 10% opacity of the status color).
- **Academic Tracking (Special):** Student grades should be presented in "Data Mono," wrapped in subtle 1px frames to look like a printed transcript or ledger.