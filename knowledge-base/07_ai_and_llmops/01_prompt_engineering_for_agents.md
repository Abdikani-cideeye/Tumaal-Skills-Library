# PROMPT ENGINEERING FOR AGENTS

## THE "PHASE 0" PRINCIPLE

- **ALWAYS** establish a "Phase 0" before writing any application code. Force the AI to generate a `SYSTEM_ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, or equivalent planning document that acts as the single source of truth.
- **NEVER** let the AI guess the design, architecture, or tech stack. If the AI deviates from the Phase 0 document, point it back and demand adherence.
- **ALWAYS** treat the Phase 0 document as a living contract. Update it when decisions change, but NEVER allow silent drift.

## ATOMIC PROMPTING AND ITERATION

- **NEVER** ask the AI to build an entire feature, page, or module in a single prompt. Monolithic prompts produce monolithic, untestable output.
- **ALWAYS** break development into atomic, verifiable phases:
  1. Phase 1: Global theme and design tokens.
  2. Phase 2: Layout shell and navigation.
  3. Phase 3: Individual sections/components.
  4. Phase 4: Data integration and state.
  5. Phase 5: Polish, animations, and edge cases.
- **ALWAYS** verify the output visually and technically (ensure it compiles, type-checks, and renders correctly) before moving to the next phase.

## CONTEXT ANCHORING

- **ALWAYS** anchor the AI's aesthetic context by explicitly naming world-class reference products (e.g., "Design this exactly like the Aman Resorts website" or "Follow the Apple product page layout"). AI models produce better output when given high-end reference points.
- **ALWAYS** use strict negative constraints in prompts: "CONSTRAINTS: NO generic chunky cards, NO heavy drop shadows, NO bright neon colors, NO elastic animations." Telling the AI what NOT to do is as important as telling it what to do.

## FORCE OVERRIDES

- **ALWAYS** be prepared to use "Force Override" prompts when the AI falls back to default UI library behaviors (unwanted gaps, rounded corners, default padding). Explicitly command the AI to strip default styles and apply custom rules.
- **ALWAYS** override default component library behaviors when they conflict with the intended design language.

## PROMPT STRUCTURE

- **ALWAYS** structure prompts with clear sections:
  1. **ROLE:** Who the AI is acting as.
  2. **CONTEXT:** What already exists (reference Phase 0 doc, existing code).
  3. **TASK:** What to build, precisely.
  4. **CONSTRAINTS:** What NOT to do.
  5. **OUTPUT FORMAT:** Expected deliverable format (code, markdown, JSON).
- **NEVER** write vague prompts like "make it look better" or "fix the layout." Be surgical and specific.

## TECHNOLOGY ANCHORING

- **ALWAYS** provide explicit constraints when starting a new session: the exact tech stack, preferred libraries, architectural boundaries, and styling approach.
- **NEVER** assume the AI remembers context from a previous session. Re-anchor on every new conversation.

## VERIFICATION PROTOCOL

- **ALWAYS** verify AI-generated code against these checks before accepting:
  1. Does it compile/type-check without errors?
  2. Does it follow the project's established patterns?
  3. Are there any security vulnerabilities?
  4. Does it handle edge cases (empty data, errors, loading)?
  5. Is the file under 200 lines?
