---
name: Technical Blueprint Modernism
colors:
  surface: '#121318'
  surface-dim: '#121318'
  surface-bright: '#38393f'
  surface-container-lowest: '#0d0e13'
  surface-container-low: '#1a1b21'
  surface-container: '#1e1f25'
  surface-container-high: '#292a2f'
  surface-container-highest: '#34343a'
  on-surface: '#e3e1e9'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#e3e1e9'
  inverse-on-surface: '#2f3036'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#121318'
  on-background: '#e3e1e9'
  surface-variant: '#34343a'
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  code-snippet:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-mono-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is engineered for undergraduate engineering students who demand rigor, rapid information retrieval, and functional density. Combining Neo-Brutalist structural utility with the geometric discipline of Bauhaus modernism, the visual tone is uncompromisingly precise, energetic, and analytical. 

The aesthetic treats the interface like an interactive technical blueprint: crisp 1px borders, visible grid alignment coordinates, monospaced metadata callouts, and stark contrast. Rather than ornamental decoration, differentiation is achieved through structural color-coding across engineering disciplines (Computer Science, Artificial Intelligence & Machine Learning, Electronics & Communication, Electrical, Mechanical, and Civil Engineering) against a stark canvas.

## Colors

The core palette operates in high-contrast dark mode as the default foundation (`#090A0F`), accented with crisp hairline structural boundaries (`#262A36`) and clinical text tokens (`#F8FAFC`). 

Discipline-specific vibrant accents assign instant visual hierarchy across departments without visual drift:
- **Core Action & CSE:** Electric Cobalt (`#2563EB`)
- **AIML & Data:** Tech Violet (`#8B5CF6`)
- **ECE & Communications:** Neon Amber (`#F59E0B`)
- **EE & Power:** Signal Cyan (`#06B6D4`)
- **Mechanical:** Racing Vermilion (`#EF4444`)
- **Civil & Structural:** Emerald Field (`#10B981`)

Surfaces do not rely on subtle gray fills; instead, they employ pure obsidian canvas planes, high-contrast crisp white foregrounds, and deliberate tinted border states for focused tasks.

## Typography

The typographic hierarchy implements three distinct roles:
1. **Headlines (`Space Grotesk`):** Mathematical, geometric, and unapologetic. Large headings feature tight negative tracking to maintain punchy editorial weight reminiscent of Bauhaus posters.
2. **Body (`Hanken Grotesk`):** Highly legible, human, and balanced for parsing dense derivations, proofs, and engineering notes over long study sessions.
3. **Labels & Metadata (`JetBrains Mono`):** Applied to semester numbers, subject codes (e.g., `CS-302`), branch tags, revision timestamps, and equation identifiers.

Uppercase transformation is reserved strictly for monospaced micro-labels and department badges.

## Layout & Spacing

The layout follows a rigid 12-column modular grid anchored by an 8px base rhythmic grid. Columns and module borders align directly to visible hairline division axes.

- **Desktop (1024px+):** 12 columns, 32px gutters, 48px outer page margin. Multi-pane layouts preserve split-screen documentation viewing (e.g., syllabus tree alongside subject notes).
- **Tablet (768px - 1023px):** 8 columns, 24px gutters, 32px margins. Secondary navigation docks into collapsable technical trays.
- **Mobile (< 768px):** 4 columns, 16px gutters, 16px margins. Content stacks strictly along the vertical axis, with horizontal touch tracks for branch filter chips.

Spacers emphasize density and clear compartmentalization over expansive empty voids.

## Elevation & Depth

In line with Neo-Brutalist and Bauhaus principles, soft diffused drop shadows and faux blur effects are entirely rejected. Visual depth is established through:
- **Sharp Hard-Edged Offsets:** Interactive elements on focus or hover project a 2px or 4px solid shadow offset (`box-shadow: 3px 3px 0px 0px #2563EB`).
- **Hairline Framing:** High-contrast 1px borders (`#262A36` static; branch accent colors on active/hover) define discrete bounding boxes.
- **Technical Insets:** Depressed or pressed states negate the hard offset (`box-shadow: 0px 0px 0px 0px`) and introduce a recessed inner border.
- **Z-Index Layering via Grid Overlays:** Floating action bars and drawer panels feature opaque solid fills edged with crisp 1px borders, floating decisively above parent views.

## Shapes

The design system is strictly sharp-cornered (`0px` corner radius). Every container, input field, modal, badge, and button maintains hard 90-degree angles. This zero-radius mandate reinforces the architectural, blueprint-like foundation and eliminates generic SaaS fluidity in favor of technical authority.

## Components

### Buttons
- **Primary:** High-contrast background (Electric Cobalt `#2563EB` or stark White `#FFFFFF`), crisp black text, 1px solid border, 0px radius. Hover triggers a 3px hard-edge offset shadow. Active triggers a physical 2px translation downward.
- **Secondary / Ghost:** Transparent surface with 1px border (`#262A36`). Hover illuminates border to branch color with monospaced text.

### Chips & Engineering Tags
- Monospaced typography (`JetBrains Mono`, `label-mono-sm`), uppercase, 1px perimeter border.
- Branch tags include small colored square glyphs or branch prefixes (`[CSE]`, `[AIML]`, `[MECH]`).

### Cards & Module Containers
- 1px border framing on all sides. Includes an optional blueprint index header bar showing document metadata, file type (`.PDF`, `LATEX`), download counts, and unit classification (`UNIT 03: EIGENVALUES`).

### Form Inputs
- Flat dark surface (`#0D0F17`) with 1px border. On focus, the border turns Electric Cobalt with a zero-blur 1px outer hairline ring. Placeholders use muted monospaced text.

### Checkboxes & Radios
- Hard geometric squares (`16px x 16px`) with 1px borders. Checked state fills the box with the primary accent and displays a sharp, non-rounded cross or square glyph.

### Subject & Derivation Blocks
- Dedicated mathematical/technical callout blocks with left-hand vertical accent strips (3px solid width) matching the branch color, built-in LaTeX rendering containers, and code snippet copy utilities.