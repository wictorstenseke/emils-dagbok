# Plan: Kids Diary PWA

> Source PRD: Kids Diary App

## Architectural decisions

- **Framework**: Preact + Vite
- **Styling**: Plain CSS / CSS modules
- **Storage**: `localStorage` via a storage adapter (`src/storage/adapter.ts`) — swap to Firebase by replacing the adapter only
- **Storage keys**: `diary:user` (profile + code), `diary:entries:{YYYY-MM-DD}` (entries)
- **Auth**: 5×5 tap-grid, 4-tap sequence, single user v1
- **Dev server**: `--host` flag for localhost + network (iPad access)
- **Tests**: skipped for v1

---

## Phase 1: Project scaffold + PWA shell

**User stories**: 17

### What to build

Vite + Preact project with PWA plugin (vite-plugin-pwa), service worker, manifest, offline support. Dev server configured with `--host`.

### Acceptance criteria

- [ ] `npm run dev` shows localhost AND network address
- [ ] App installable on iOS home screen
- [ ] Works offline after first load

---

## Phase 2: Login screen — tap-grid code

**User stories**: 2, 3, 4, 18

### What to build

Login screen: name input + 5×5 numbered grid (1–25). User taps 4 numbers; each tap shown as ● dot. Backspace button. Validates against stored code (default: 12→6→8→6). Session kept in localStorage. Profile stored via storage adapter.

### Acceptance criteria

- [ ] Tap 4 correct numbers → enters diary
- [ ] Tap wrong sequence → shake/error feedback
- [ ] Tapped numbers display as dots
- [ ] Backspace removes last tap
- [ ] Default code is 12, 6, 8, 6
- [ ] Name displayed after login

---

## Phase 3: Diary page — today's entry

**User stories**: 1, 5, 6, 7, 8, 9, 10, 16

### What to build

Full-screen notebook page. Header shows date + season + emoji. Body is a wide-ruled textarea overlaid on CSS ruled lines. Auto-save debounced ~500ms via storage adapter. Warm cream/ivory palette, handwriting font (Patrick Hand or Caveat from Google Fonts).

### Acceptance criteria

- [ ] Opens directly to today's page
- [ ] Date and season visible at top
- [ ] Page looks like lined notebook paper
- [ ] Text is large, comfortable to type
- [ ] Entry saves automatically; survives page reload

---

## Phase 4: Day navigation

**User stories**: 11, 12, 13, 14, 15

### What to build

Back/forward navigation buttons centered on the page sides. Back goes one day earlier (max 10 days back). Forward hidden and replaced with 🔒 when on today. Blank page shown for unwritten days. Midnight flip: current day always determined from device clock at render time.

### Acceptance criteria

- [ ] Back button goes to previous day
- [ ] Cannot go back more than 10 days (button disabled)
- [ ] 🔒 shown instead of forward button on today
- [ ] Unwritten days show blank entry
- [ ] Opening app after midnight shows new blank day
