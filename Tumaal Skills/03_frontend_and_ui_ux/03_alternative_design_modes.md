# ALTERNATIVE DESIGN MODES — OPT-IN ONLY

> **WARNING:** These design modes are NOT the default. NEVER use any of these unless the human operator explicitly requests one by name (e.g., "Use Bento Box layout" or "Apply Glassmorphism"). When not activated, ALL UI work follows `02_editorial_minimalism_default.md`.

---

## MODE: BENTO BOX LAYOUT

**Activation phrase:** "Use Bento Box layout" or "Bento grid"

### Rules When Active
- **ALWAYS** use a CSS Grid with asymmetric cell sizes (mix of 1×1, 2×1, 1×2, 2×2 cells) to create visual interest.
- **ALWAYS** maintain consistent gap spacing between all grid cells (8px–16px). The gaps ARE the visual borders.
- **ALWAYS** use rounded corners (`border-radius: 16px–24px`) on all grid cells for a soft, modern feel.
- **ALWAYS** vary content types across cells: mix statistics, charts, images, text blocks, and CTAs. NEVER fill every cell with the same content type.
- **ALWAYS** use a muted, cohesive background color for all cells. Reserve one or two cells for a bold accent color to create a focal point.
- **NEVER** exceed 8 cells in a single viewport. Bento grids become overwhelming beyond this threshold.
- **ALWAYS** collapse to a single-column stack on mobile. Bento grids MUST degrade gracefully.

---

## MODE: GLASSMORPHISM / SPATIAL UI

**Activation phrase:** "Use Glassmorphism" or "Spatial UI"

### Rules When Active
- **ALWAYS** apply `backdrop-filter: blur(12px–20px)` with semi-transparent backgrounds (`rgba(255,255,255,0.1)` for dark mode, `rgba(255,255,255,0.6)` for light mode) on elevated surfaces.
- **ALWAYS** add a subtle border (`1px solid rgba(255,255,255,0.15)`) to frosted glass surfaces to define edges.
- **ALWAYS** use a rich, gradient or textured background behind glass elements. Glassmorphism is meaningless over flat solid colors.
- **ALWAYS** layer elements at different z-depths with varying blur intensities to create a sense of spatial hierarchy.
- **NEVER** apply glass effects to more than 3 layers simultaneously. Excessive layering destroys readability.
- **NEVER** use glassmorphism on text-heavy content areas. Body text MUST sit on opaque or near-opaque surfaces for WCAG compliance.
- **ALWAYS** test glass surfaces against both light and dark backgrounds to ensure contrast remains accessible.
- **ALWAYS** pair glassmorphism with soft, ambient shadows (`box-shadow` with large spread and low opacity) instead of hard drop shadows.

---

## MODE: NEO-BRUTALISM

**Activation phrase:** "Use Neo-Brutalism" or "Brutalist design"

### Rules When Active
- **ALWAYS** use thick, solid black borders (`2px–4px solid #000`) on all interactive elements (buttons, cards, inputs).
- **ALWAYS** use hard, offset box shadows (`4px 4px 0px #000`) instead of blurred shadows. The offset creates the signature "stacked paper" effect.
- **ALWAYS** use bold, saturated accent colors (bright yellow, electric blue, hot pink) against white or off-white backgrounds.
- **ALWAYS** use a monospace or display typeface for headings. Pair with a clean sans-serif for body text.
- **NEVER** use gradients, blurs, or subtle transparency. Neo-Brutalism is deliberately blunt and tactile.
- **NEVER** round corners excessively. Use `border-radius: 0px–8px` maximum. Sharp or barely rounded corners are canonical.
- **ALWAYS** exaggerate interactive feedback: buttons should visibly depress (translate + shadow removal) on click.
- **ALWAYS** maintain generous whitespace even in brutalist layouts. Brutalism is bold, not cramped.

---

## SWITCHING BACK TO DEFAULT

- When the human operator says "Reset design" or "Back to default," immediately revert ALL styling decisions to the rules in `02_editorial_minimalism_default.md`.
- **NEVER** mix design modes. A single interface MUST use exactly one design mode at a time.
