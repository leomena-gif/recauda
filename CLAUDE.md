# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on localhost:3000
npm run dev:fresh    # Kill port 3000, clear .next cache, start fresh
npm run build        # Production build
npm run lint         # Run ESLint
```

No test suite exists yet (planned but not implemented).

## Architecture

**Recauda** is a Next.js 15 App Router application for event and seller management (raffles, food sales). Currently runs entirely on mock data — no backend API exists yet. All data lives in [src/mocks/data.ts](src/mocks/data.ts).

### Key Data Flow

All state is managed with React hooks (`useState`, `useMemo`, `useCallback`) — no global state manager. When API integration arrives, mock imports will be replaced with API calls at the page level.

```
User Action → Component/Page → Custom Hook → State Update → Re-render
```

### Core Data Models ([src/types/models.ts](src/types/models.ts))

- `Seller` — vendors assigned to events, with `assignedEvents: string[]`
- `Event` — either `type: 'raffle' | 'food_sale'`, tracks `totalNumbers`/`soldNumbers`
- `Buyer` — linked to a seller via `sellerId`, tracks purchase and delivery status

### Routing & Layout

[src/app/layout.tsx](src/app/layout.tsx) wraps all pages in `ConditionalLayout`, which conditionally renders `Header` (mobile hamburger) or `Sidebar` (desktop collapsible) based on the current route — login/create-account pages skip the nav.

Pages and their purpose:
- `/` — Events dashboard with Active/Completed/Cancelled filter tabs
- `/sellers-list` — Seller management with search, filter, inline editing
- `/buyers-list` — Buyer list filtered by event
- `/create-event` — Multi-step wizard (EventType → EventData → Confirm → Success)
- `/add-seller` — Multi-step wizard (SellerData → Confirm → Success)
- `/event-detail` — Assign numbers to buyers

### Wizard Pattern

Wizards in [src/components/wizard/](src/components/wizard/) follow a consistent pattern: a parent Wizard component holds `currentStep` state and renders step components (`*Step.tsx`) sequentially. `ProgressIndicator` and `ActionButtons` are shared across wizards.

The sales registration flow renders as a **bottom sheet on mobile** and a **modal on desktop**, controlled by `useMediaQuery`.

### Styling

- CSS Modules per component (`Component.module.css` co-located with `Component.tsx`)
- Global CSS variables in [src/app/globals.css](src/app/globals.css): dark mode by default, primary color `#5AC8FA`, spacing scale `--space-xs` through `--space-3xl`
- Utility classes (`.flex`, `.flex-between`, `.gap-*`, etc.) in [src/styles/utilities.css](src/styles/utilities.css)
- Button system via global classes: `btn btn-primary`, `btn btn-secondary` (quiet/text), `btn btn-tertiary` (outline) with modifiers `btn-sm`, `btn-lg`, `btn-full`, `btn-icon`
- Mobile-first; breakpoints at 640px, 1024px, 1280px, 1600px

### Shared Utilities

- [src/constants/index.ts](src/constants/index.ts) — `SNACKBAR_DURATION`, `STATUS_OPTIONS`, `EVENT_FILTER_OPTIONS`, `VALIDATION_RULES`
- [src/utils/validation.ts](src/utils/validation.ts) — `validateName()`, `validatePhone()`, `formatPhone()` (pure functions returning `string | undefined`)
- [src/hooks/useSnackbar.ts](src/hooks/useSnackbar.ts) — `{ isVisible, isClosing, showSnackbar, hideSnackbar }`
- [src/hooks/useMediaQuery.ts](src/hooks/useMediaQuery.ts) — responsive detection safe for SSR

## Conventions

- **Imports order:** external packages → internal (`@/`) → styles
- **Component structure:** State → Hooks → Computed values → Event handlers → Return/JSX
- No inline styles — use CSS Modules or utility classes
- No magic numbers — add to [src/constants/index.ts](src/constants/index.ts)
- Avoid `any` (ESLint warns on it)
- `console.log` is flagged; only `console.warn`/`console.error` are allowed
- All TODO API integration points are marked with `// TODO: Replace with API`
