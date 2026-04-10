# Emils Dagbok

Dagboksapp för sexåringar. Lekfullt, papperslikt utseende med varm, inbjudande känsla.

## Målgrupp & design

- Användare: barn ~6 år som precis lärt sig skriva
- Allt UI-text på svenska
- Linjerat papper-tema: cream bakgrund (#FDF6E3), bruna toner, röd marginalstreck
- Handskriftsfont: Caveat (Google Fonts)
- Stora knappar med tydlig touch-feedback (scale-animationer via pointer events)
- Responsivt: portrait (telefon) och landscape (iPad) med anpassad layout

## Tech stack

- **Preact** + TypeScript
- **Vite** med vite-plugin-pwa
- Ren CSS (inga preprocessors eller CSS-in-JS)
- localStorage via utbytbar adapter (`src/storage/adapter.ts`) — förberett för Firebase

## Kommandon

- `npm run dev` — devserver (tillgänglig på nätverket för iPad-testning)
- `npm run build` — TypeScript-kompilering + Vite-build
- `npm run icons` — generera PWA-ikoner från `public/new-logo.png`

## Projektstruktur

```
src/
├── app.tsx              # Rot: växlar mellan login och dagbok
├── components/          # LoginScreen, DiaryPage, WeekStrip
├── lib/                 # date.ts (sv-SE datumformat), usePress.ts (touch-hook)
└── storage/adapter.ts   # localStorage-abstraktion (byt ut för backend)
```

## Viktiga konventioner

- Datum som ISO-nycklar (YYYY-MM-DD), all datumlogik i `src/lib/date.ts`
- Autospar med 500ms debounce
- Inga tester eller linter i v1 — TypeScript strict mode (`noUnusedLocals`, `noUnusedParameters`) ger grundläggande kvalitetskontroll
- Deploy via GitHub Actions till GitHub Pages (subpath `/emils-dagbok/`)
