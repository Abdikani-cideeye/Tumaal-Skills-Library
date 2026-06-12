# EDITORIAL MINIMALISM — DEFAULT DESIGN LANGUAGE

> **This is the default design mode.** All UI work MUST follow these rules unless the human operator explicitly activates an alternative mode by name.

## THE INVISIBLE CARD PATTERN

- **ALWAYS** eradicate "Boxitis." NEVER wrap every UI element in heavy cards with borders and drop shadows.
- **ALWAYS** favor "Unboxed" or "Invisible Card" designs where images and text sit directly on the background, separated purely by whitespace. This creates a breathable, premium editorial feel.
- **NEVER** use hard borders, heavy drop shadows, or visible boxed containers unless explicitly required for a data-heavy dashboard or table.
- **ALWAYS** use soft corners on images and subtle glassmorphism (backdrop blurs) for floating elements like navbars and dropdowns.

## MACRO WHITESPACE

- **ALWAYS** use extreme padding and gap spacing between major sections (e.g., `py-24`, `gap-16`, or equivalent 96px+ vertical spacing). Content MUST never feel cramped.
- **ALWAYS** design around the actual content length. If text is short, NEVER use wide, empty containers. Adjust container width to fit content naturally.
- **ALWAYS** restrict body text width (e.g., `max-w-2xl` or ~672px) to maintain optimal reading line lengths (45-75 characters per line).

## TYPOGRAPHY HIERARCHY

- **ALWAYS** establish a strict typography hierarchy. Pair an elegant display font for headings with a clean, highly legible sans-serif for body text. Use modern fonts (e.g., Inter, Outfit, Playfair Display) instead of browser defaults.
- **NEVER** rely on heavy font weights (e.g., `font-black`, `800+`) for large display headings. Let the size and natural elegance of the font carry the visual weight.
- **NEVER** use ALL CAPS for long headers or titles. Use Title Case with tight letter-spacing and `font-semibold` or `font-bold` for a premium SaaS aesthetic.
- **ALWAYS** ensure text overlays on images use subtle gradient scrims (darkening from bottom up) to guarantee WCAG-compliant contrast.

## COLOR PHILOSOPHY

- **NEVER** use pure black (`#000`) or pure white (`#FFF`) in dark mode. Enterprise dark mode requires depth. Use deep slate/zinc tones for backgrounds (e.g., `#0F172A`, `#1E293B`) and lighter tones for elevated surfaces.
- **NEVER** use generic, saturated primary colors (pure red, blue, green). Use curated, muted, harmonious color palettes with HSL-tuned values.
- **ALWAYS** maintain a maximum of 3 accent colors in any interface. A primary action color, a secondary/subtle color, and a destructive/warning color.

## MOTION AND INTERACTION

- **NEVER** use snappy, bouncy, or elastic animations for premium interfaces. Reserve spring animations for playful consumer apps only.
- **ALWAYS** use slow, deliberate, intentional motion (0.6s–1.2s durations with `ease-out` easing) for entrance animations and page transitions.
- **ALWAYS** trigger entrance animations based on scroll position (viewport intersection) rather than loading everything at once.
- **ALWAYS** implement subtle hover effects on interactive elements. Static interfaces feel dead.

## RESPONSIVE ANCHORING

- **NEVER** vertically center critical text over full-screen backgrounds without safe padding. On short viewports, centered text collides with headers.
- **ALWAYS** anchor text to bottom-left or bottom-center with strict `padding-top` guards on hero sections.
- **ALWAYS** test layouts at extreme viewport sizes (320px mobile, 2560px ultrawide) to ensure no content collision or orphaned whitespace.

## CONTENT-DRIVEN DESIGN

- **ALWAYS** prioritize immersive media. Photography and video are the product; the UI should be "invisible" and merely frame the content.
- **ALWAYS** center primary navigation links to create a balanced, symmetrical layout. Push utility icons (search, language, auth) to the far edges.
- **NEVER** overwhelm the user with utility buttons in the primary navigation if they distract from the core experience. Move utilities to icons or secondary menus.

## SMART FORMATTING

- **ALWAYS** implement smart number formatting. Display `$150` instead of `$150.00`, but keep `$150.50` when the fractional part is meaningful.
- **ALWAYS** format dates relative to the user's context (e.g., "2 hours ago", "Yesterday") for recent events, and absolute dates for historical data.
- **ALWAYS** dictate component widths by their content proportions. NEVER leave awkward, unbalanced empty space inside dropdowns, menus, or cards.
