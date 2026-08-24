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

## Phase 6.6 dark-first implementation

Dark is the fixed default product appearance. The implementation uses deep navy, midnight blue, charcoal, and blue-gray layers rather than pure black. Shared CSS tokens control canvas surfaces, glass panels, raised cards, text, focus, success, warning, locked states, radii, shadows, spacing, and motion.

World accents remain semantic and decorative rather than the only state signal:

- Word Forge uses molten orange, amber, and ember glow.
- Story Scouts uses electric blue and indigo.
- Poetry Planet uses magenta, violet, and cosmic pink.
- Information Detectives uses cyan, turquoise, and teal.
- Context Cavern uses emerald, jade, and crystal green.
- Compare Castle uses royal blue, gold, and deep violet.

The child shell applies these identities to hero rewards, current quests, world cards, unit nodes, mission previews, lesson surfaces, answer states, Word Help, completion medals, and progression outcomes. The parent shell deliberately avoids game styling and uses quieter navy/slate surfaces, teal and blue accents, compact tabs, and strong numerical hierarchy. Print styles continue to force a light, ink-safe presentation.

The optional Dark/Light preference was not added. Dark remains deterministic and default without introducing a new persisted preference. `prefers-reduced-motion` still disables nonessential movement, and no sound autoplays.

## Phase 7C3 protected journey recovery

Home still exposes exactly Start Journey and Parent Area, world cards remain display-only, and progression outcomes expose one child-facing action. Start Journey and Continue Journey now share an authoritative current-state transition: unfinished work resumes, completed or incompatible stale state is reconciled automatically, and a coming-soon message appears only for genuine current content-needed. No conflict menu, world selector, unit selector, or lesson selector is introduced.
