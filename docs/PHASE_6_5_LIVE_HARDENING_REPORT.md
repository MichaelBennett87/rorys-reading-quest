# Phase 6.5 Live UX, Phonics, Data, and Content-Integrity Hardening Report

## Repository checkpoint

- Starting SHA: `bd28f537fad1f1c3a8759b8f6110e78de3324160`
- Branch: `master`
- Scope: live UX polish, phonics helper clarity, accuracy formatting, demo reward cleanup, semantic audit, and content-integrity fixes only.

## Defects corrected

- Parent dashboard accuracy values were being scaled twice.
- Production default rewards started with demo values.
- A bounded one-time cleanup now removes the known legacy demo seed from old saves when it is safe to do so.
- Lesson preview copy no longer refers to a later phase.
- The Word Forge `q-word-forge-oo-ea-checkpoint-b-6` prompt now uses a unique exemplar.
- Low-transfer prompt-exemplar items in the observed Word Forge lesson family were rewritten.
- Word Help now shows a staged support panel with visible pattern and chunk feedback.

## Verification

- `npm run lint`: pass
- `npm run typecheck`: pass
- `npm run test`: pass
- `npm run build`: pass
- `git diff --check`: pass

## Bundle snapshot

- Asset: `dist/assets/index-DMH8Hf8e.js`
- Raw size: `2,048.88 kB`
- Gzip size: `361.94 kB`
- Vite warning: present

## Remaining notes

- Browser speech remains browser-provided only.
- Dynamic content-pack loading remains deferred.
- Live deployment verification is handled after the commit and push step.