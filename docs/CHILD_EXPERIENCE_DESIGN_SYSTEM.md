# Child Experience Design System

## Purpose

Phase 6.5 gives the child-facing app a more playful, premium, tablet-friendly look without changing the learning model. The design system stays local, semantic, and accessible.

## Design tokens

Use CSS custom properties for the shared visual language:

- `--surface-app`
- `--surface-card`
- `--surface-card-glass`
- `--surface-elevated`
- `--text-primary`
- `--text-secondary`
- `--text-muted`
- `--color-success`
- `--color-warning`
- `--color-locked`
- `--color-action-primary`
- `--color-action-secondary`
- `--radius-card`
- `--radius-pill`
- `--shadow-soft`
- `--shadow-strong`
- `--space-1` through `--space-6`
- `--motion-fast`
- `--motion-medium`
- `--motion-slow`

## Child world identities

- Word Forge: warm amber and orange with spark and forge cues.
- Story Scouts: blue and indigo with map, book, and clue cues.
- Poetry Planet: violet and pink with star and moon cues.
- Information Detectives: teal and cyan with magnifier and clue cues.
- Context Cavern: emerald and green with crystal and cave cues.
- Compare Castle: royal blue and gold with castle and shield cues.

These identities are implemented through reusable world theme classes and data attributes on the production Home, World, Unit Select, Lesson Ready, and Lesson screens. They do not alter gating or selection behavior.

## Child shell

- Use larger cards, generous spacing, and clear primary actions.
- Keep the current quest obvious.
- Make rewards feel earned without overwhelming animation.
- Keep locked states readable and calm.
- Keep current-trail language child friendly.

The production shell now uses layered atmospheric backgrounds, dimensional rounded cards, larger visual badges, a prominent current quest, an adventure-style unit path, and responsive layouts from narrow phones through desktop widths.

## Lesson and support surfaces

- Lesson previews should read like mission cards.
- Passage cards should remain semantic and text-first.
- Word Help should stage the support steps visibly.
- Answer cards should expose selected, correct, incorrect, and disabled states without relying on color alone.
- Completion and progression-outcome screens should feel rewarding but still quiet enough for repeated use.

Selected answers use shape and labels in addition to color. Completion uses a bounded star reveal and reward summary, with animation disabled by `prefers-reduced-motion`.

## Parent shell

- Use a calmer analytics-style layout for adults.
- Prefer clear hierarchy, compact metrics, and readable empty states.
- Keep the parent area visually distinct from the child shell.

The implemented adult system uses navy and teal analytics surfaces, compact responsive metrics, scroll-safe tab navigation, readable session and review cards, calm empty states, and spacious PIN forms. Print rules remove navigation and decorative backgrounds while preserving readable summaries.

## Motion and accessibility

- Respect `prefers-reduced-motion`.
- Keep visible focus.
- Use semantic headings and buttons.
- Keep tap targets comfortable on tablets and phones.
- Do not make important state depend only on color.
- Do not use autoplay audio or remote media.

## Tone

Child-facing copy should sound confident, current, and supportive. Parent-facing copy should be concise, factual, and privacy-safe.
