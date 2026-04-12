# Textarea iPad Writing Experience — Design Spec

**Date:** 2026-04-12

## Problem

Two issues on iPad:

1. Tapping the text area always moves the cursor to the end of the text, not where the user tapped.
2. On tap (especially with long texts), content gets pushed behind the fixed header — requires dead scrolls to recover.

## Solution

### Option chosen: Always-visible textarea (Option B)

Since the display div renders only plain text (no special formatting), there is no visual difference between the div and the textarea. Removing the toggle simplifies the code and lets Safari handle cursor placement natively — which correctly positions the cursor at the tap point.

---

## Section 1: Remove display/textarea toggle

**Files:** `src/components/DiaryPage.tsx`, `src/components/DiaryPage.css`

- Delete the `diary-display` div and its `onClick` handler.
- Remove the `editing` state (`useState(false)`) and all `setEditing` calls. This includes:
  - `onBlur` on textarea: keep only `flushSave()`, remove `setEditing(false)`
  - `navigateTo`: remove `setEditing(false)`
  - `handleImported`: remove `setEditing(false)`
- Remove the `style={{ display: editing ? 'block' : 'none' }}` inline style from the textarea. The `.diary-textarea { display: block }` CSS rule already exists and stays — no CSS change needed here.
- Simplify the auto-resize `useEffect`: remove the `editing` dependency. Add `currentDate` as a dependency alongside `text` so the textarea resizes correctly when navigating to a date with existing text. The effect should always run (no guard on `editing`).

## Section 2: Fix scroll when keyboard appears

**Files:** `src/components/DiaryPage.tsx`

- Add a `useEffect` that registers a `visualViewport` resize listener on mount, removes it on unmount.
- When the listener fires, if `textareaRef.current` is the active element (`document.activeElement`), call `window.scrollTo(0, window.visualViewport.offsetTop)` — this sets the window scroll to the visual viewport's current offset, keeping the textarea visible above the keyboard. Use an absolute set, not a relative add, to avoid double-scroll.
- Fallback: if `visualViewport` is not available, call `textareaRef.current.scrollIntoView({ block: 'nearest' })`.
- Note: plain `scrollIntoView` is unreliable on iOS Safari when the keyboard shifts the visual viewport — the `visualViewport.offsetTop` approach is more robust.

## Section 3: CSS cleanup

**Files:** `src/components/DiaryPage.css`

- Split the grouped selector near the top of the editor section (`.diary-textarea, .diary-display { font-family, font-size, line-height, ... }`) — keep only `.diary-textarea`, remove `.diary-display` from it.
- Remove the `/* Display mode */` block: `.diary-display` and `.diary-display .diary-placeholder` rules (lines ~204–221).
- Also remove the `.diary-display` selector from the landscape `@media (orientation: landscape)` rule where it appears alongside `.diary-textarea` (e.g. `.diary-textarea, .diary-display { font-size: 1.7rem }`).
- No other CSS changes needed — `diary-textarea` already has correct font, line-height, padding, color, and background.

---

## Acceptance criteria

- Tapping anywhere in the text area places the cursor at the tapped position.
- On tap with a long text on iPad, content does not get pushed behind the header.
- The visual appearance of the writing area is unchanged.
- No `editing` state remains in `DiaryPage.tsx`.
- No `.diary-display` rules remain in `DiaryPage.css` (including in media queries).
- Textarea correctly expands to fit existing text on initial load and when navigating between dates.
