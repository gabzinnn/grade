---
name: Academic Tactility
colors:
  surface: '#fff8f6'
  surface-dim: '#ebd6cc'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1eb'
  surface-container: '#ffeae0'
  surface-container-high: '#fae4d9'
  surface-container-highest: '#f4ded4'
  on-surface: '#241913'
  on-surface-variant: '#574237'
  inverse-surface: '#3a2e27'
  inverse-on-surface: '#ffede5'
  outline: '#8b7265'
  outline-variant: '#dec1b1'
  surface-tint: '#9a4600'
  primary: '#9a4600'
  on-primary: '#ffffff'
  primary-container: '#f47b25'
  on-primary-container: '#592500'
  inverse-primary: '#ffb68d'
  secondary: '#675c55'
  on-secondary: '#ffffff'
  secondary-container: '#edddd3'
  on-secondary-container: '#6c6059'
  tertiary: '#00658f'
  on-tertiary: '#ffffff'
  tertiary-container: '#00a7e9'
  on-tertiary-container: '#003852'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbc9'
  primary-fixed-dim: '#ffb68d'
  on-primary-fixed: '#321200'
  on-primary-fixed-variant: '#763400'
  secondary-fixed: '#efdfd6'
  secondary-fixed-dim: '#d3c4ba'
  on-secondary-fixed: '#221a14'
  on-secondary-fixed-variant: '#4f453e'
  tertiary-fixed: '#c7e7ff'
  tertiary-fixed-dim: '#85cfff'
  on-tertiary-fixed: '#001e2e'
  on-tertiary-fixed-variant: '#004c6c'
  background: '#fff8f6'
  on-background: '#241913'
  surface-variant: '#f4ded4'
typography:
  wordmark:
    fontFamily: Quicksand
    fontSize: 22px
    fontWeight: '700'
    lineHeight: auto
  page-title:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  section-title:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
  data-display:
    fontFamily: Roboto Flex
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  page_padding: 32px
  card_padding: 24px
  stack_sm: 8px
  stack_md: 16px
  stack_lg: 24px
  gutter: 24px
---

## Brand & Style

The design system is built upon the "Well-made Paper Planner" narrative. It aims to evoke the focus and calm of physical stationary through a warm, high-quality material palette. The target audience is university students who require precision and clarity without the clinical coldness of traditional productivity software.

The style leans into **Minimalism** with a **Tactile** influence. It rejects digital-first trends like glassmorphism and gradients in favor of flat, layered surfaces that suggest the physical stacking of cardstock. Precision is maintained through strict typographic alignment and generous negative space, ensuring the UI feels intentional, reliable, and grounded.

## Colors

The palette is anchored in warm neutrals. The `canvas` color serves as the global backdrop, representing the desk or binder surface. `Surface` and `raised` represent different weights of paper stock. 

Action and emphasis are driven by the `Accent` (#F47B25), a vibrant yet earthy orange. For category-specific data (courses, projects), use the `category_hues`. Each category should implement a 10% opacity tint for background fills and a solid 3px left-edge stroke for immediate identification. 

Hairline borders should only be used where identical tones meet, utilizing `rgba(93, 64, 55, 0.12)`.

## Typography

This design system uses a functional mix of Inter for UI elements and Roboto (Condensed/Flex) for quantitative data. The wordmark uses Quicksand to provide a soft, welcoming entry point.

For the Portuguese (Brazil) localized UI, ensure that line heights accommodate diacritics (like ~ or ^) without clipping. The `label-caps` style is essential for organizing metadata in the planner view. Always use `data-display` for timestamps, grades, and credit counts to ensure vertical alignment and quick scanning.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop (centered, 12 columns) and a **Fluid Grid** on mobile. The "Paper Planner" feel is achieved through generous whitespace; never crowd the content.

- **Desktop:** 32px outer margins. Content is organized into cards with 24px internal padding.
- **Mobile:** 16px outer margins. Stacked layout preferred over complex side-by-side columns.
- **Rhythm:** Use an 8px base unit for all component spacing to ensure mathematical harmony.

## Elevation & Depth

Depth is communicated through tonal layering and soft, warm shadows. We avoid heavy blacks in favor of brown-tinted shadows `rgba(93, 64, 55, x)`.

1.  **Canvas (#FFF8DC):** The lowest layer.
2.  **Recess (#F6EFDA):** Used for inset areas like empty states or background tracks for progress bars.
3.  **Surface (#FFFCF4):** The primary card color. Uses the **Resting Shadow**.
4.  **Raised (#FFFFFF):** Used for active elements, modals, or items being dragged. Uses the **Floating Shadow**.

Shadow definitions:
- **Resting:** `0 1px 2px rgba(93,64,55,0.05), 0 4px 12px rgba(93,64,55,0.05)`
- **Floating:** `0 12px 32px rgba(93,64,55,0.14)`

## Shapes

The shape language is varied to distinguish between structural containers and interactive elements. 

- **Structural:** Cards and panels use a `16px` radius to feel substantial. Dialogs use a softer `20px` radius.
- **Interactive:** Buttons and inputs use a sharper `10px` radius to signify "action." 
- **Discrete:** Course blocks, calendar entries, and list items use a tighter `8px` radius.
- **Full:** Chips and avatars are always pill-shaped to contrast against the rectangular grid of the planner.

## Components

### Buttons & Inputs
- **Primary Button:** Solid `Accent` fill with `Raised` white text. 10px radius.
- **Secondary Button:** Hairline border `rgba(93,64,55,0.12)`, `Surface` background, `Text Secondary` label.
- **Inputs:** `Raised` background with a hairline border. Use `Text Tertiary` for placeholders. Focus state is a 2px `Accent` ring.

### Cards & Navigation
- **Cards:** White or Surface background, 16px radius, Resting Shadow. 24px internal padding.
- **Active Nav:** Indicated by the `Accent` color and a medium font weight. No heavy backgrounds; use subtle indicators like a 4px dot or a vertical line.

### Planners & Lists
- **Course Blocks:** 8px radius. Use the 3px left-edge colored stroke from the category hues. Use 10% opacity fill of the same hue for the background.
- **Checkboxes:** 4px radius (custom), `Accent` fill when checked.
- **Chips:** Full pill-shape, `Recess` background for inactive, `Accent` for active.

### Specific Components
- **Study Timer:** Large `Data-Display` typography.
- **Grade Tracker:** Use `Recess` background for progress bar tracks with solid status-colored fills.