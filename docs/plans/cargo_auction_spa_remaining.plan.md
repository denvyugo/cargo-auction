# Cargo Auction SPA — Remaining Work

Companion plan to [cargo_auction_spa_b0094012.plan.md](cargo_auction_spa_b0094012.plan.md),
which has full architecture, mermaid diagrams, routes table, and UI spec.
Read that file for design context. This plan covers only what is left to
build, based on an audit of the current tree, plus one bug found during
that audit (Task 1).

## Global Constraints

- Stack already in place: React 19, TanStack Query 5, TanStack Router
  (code-based, no `@tanstack/router-plugin`), react-hook-form + zod, MSW 2,
  openapi-fetch. Do not add new dependencies without asking.
- FSD layers: `app > pages > widgets > features > entities > shared`. A
  layer may only import from layers below it.
- Path alias `@/` → `src/` is already configured (`vite.config.ts`,
  `tsconfig.app.json`). Use it for all intra-`src` imports.
- Styling is plain CSS with BEM, one co-located `.css` file per component
  (see `src/shared/ui/*` for the pattern). No CSS-in-JS, no Tailwind.
- The generated types in `src/shared/api/api.ts` (from
  `data/openapi.auctions.v0.json`) are the single source of truth for every
  API/fixture shape. Never invent a field name — read the schema first.
- Verify each task with `npm run build` (tsc + vite build) and
  `npm run lint`; both must exit 0. `npm run dev` for manual smoke checks.
- Path-param `{auctionUuid}` in the API corresponds to `main.order_uid` in
  responses (the only UUID field in the schemas) — already handled
  correctly in `entities/auction/api/auction-api.ts`.

## Task 1: Fix MSW fixtures to match the generated schema

`src/shared/mocks/data/store.ts` and `src/shared/mocks/handlers/index.ts`
were written against an imagined shape instead of the real generated types
and currently fail `npm run build` with ~29 TS errors (e.g. `trading.your`
uses `with_vat`/`no_vat` but the real `AuctionShowTradingYour` schema has
`bet`/`last_bet`/`last_bet_with_vat`/`win`; routes are nested
`{ load, unload }` but the real shape is a flat `RoutePoint[]`; several
`AuctionShowCargo`/`AuctionShowPayment`/`BetItem` fields don't exist at
all).

Rewrite the fixture generator and handlers so every object satisfies the
real schemas. Read `src/shared/api/api.ts` directly for the exact shapes of
`AuctionListItem` (and its `*Main`/`*Organizer`/`*Route`/`*Cargo`/`*Trading`/
`*Payment` sub-schemas), `AuctionShowResponse` (and its `AuctionShowMain`/
`AuctionShowCargo`/`AuctionShowTrading`/`AuctionShowPayment`/`RoutePoint`/
`Contact`/`Assembly`/`AdmittedOrganization` sub-schemas), `BetItem`,
`BetListResponse`, and `SetBetRequest` — do not guess from memory.

Preserve the behavior already coded (delays, 404/422 handling, list↔detail
sync via `syncListItemFromDetail`), and preserve the fixture volume/shape
described in the original plan's "MSW mocks" section: ~30 auctions with
varied `auc_type`/`status`/routes, 0–5 bets per auction, `delay(300–600ms)`.

Acceptance: `npm run build` produces zero TS errors in
`src/shared/mocks/**`. `npm run lint` clean. No changes needed outside
`src/shared/mocks/`.

## Task 2: Wire up the app shell

Currently `src/main.tsx` still renders the Vite starter `src/App.tsx` —
nothing built so far (providers, router, MSW) is connected to anything.

1. `src/app/providers/` — a component that wraps children in
   `QueryClientProvider` (new `QueryClient` with sane defaults) — Router
   comes from step 2, compose them together in one `AppProviders` component
   or two nested provider components, your call.
2. `src/app/routes/` — code-based TanStack Router setup:
   - root route
   - `/` → redirect to `/auctions`
   - `/auctions` → lazy-loaded `pages/auctions-list`
   - `/auctions/$auctionUuid` → lazy-loaded `pages/auction-detail`, with a
     route `loader` that prefetches `getAuction` + `listBets` via
     `queryClient.ensureQueryData` using `auctionKeys.detail(uuid)` and
     `betKeys.list(uuid)` (from `entities/auction/api/queries` and
     `entities/bet/api/queries`)

   `pages/auctions-list` and `pages/auction-detail` don't exist yet — Tasks
   3 and 5 build them. For this task, it is fine to point the routes at
   minimal placeholder page components (e.g. a `<div>` per page) if that
   unblocks wiring; Tasks 3/5 will replace them. State clearly in your
   report whether you stubbed pages or waited/coordinated — either is
   acceptable, but say which.
3. `src/app/index.tsx` — bootstrap: an `enableMocking()` function that,
   only when `import.meta.env.DEV`, dynamically imports
   `@/shared/mocks/browser` and calls `worker.start({ onUnhandledRequest:
   'bypass' })`; after it resolves, `createRoot(...).render(<AppProviders
   />)` inside `<StrictMode>`.
4. Update `index.html`'s script tag to point at `/src/app/index.tsx`
   instead of `/src/main.tsx`.
5. Delete `src/main.tsx`, `src/App.tsx`, `src/App.css`, and the old
   `src/api/` directory (superseded by `src/shared/api/`, already migrated
   there — confirm nothing still imports from `@/api` or a relative
   `../api` path before deleting; `Grep` for `from '@/api'` and
   `from '../api'` / `from './api'` first).

Acceptance: `npm run dev` boots without console errors, MSW logs its
startup message, and navigating to `/` redirects to `/auctions`. `npm run
build` and `npm run lint` clean.

## Task 3: Auctions list page

Depends on Task 2 (router) and Task 1 (working fixtures).

1. `src/entities/auction/ui/AuctionCard.tsx` (+ co-located `.css`,
   BEM-prefixed `.auction-card`): presentational card showing route
   (`route.load.city` → `route.unload.city`), organizer name, `auc_type`
   label (`AUC_TYPE_LABELS`), current price (`trading.price.current`,
   formatted with `shared/lib/formatPrice`), status label
   (`STATUS_LABELS`), and a `Link` (TanStack Router) to
   `/auctions/$auctionUuid` using `main.order_uid`.
2. `src/widgets/auction-list/` — composes the list: `useAuctionList(page,
   perPage)` from `entities/auction/api/use-auction-queries`, reading
   `page` from the router search params (default `1`); renders 6×
   `SkeletonCard` (from `shared/ui/Skeleton`) while `isLoading`; renders
   `ErrorState` with retry on error; renders a grid of `AuctionCard` on
   success; renders `Pagination` (from `shared/ui/Pagination`) wired to
   `meta.current_page`/`meta.last_page`, updating the `page` search param
   via the router's navigate (not local state, so the URL stays
   shareable).
3. `src/pages/auctions-list/` — thin page component rendering the
   `auction-list` widget, used by the `/auctions` route from Task 2 (or,
   if Task 2 stubbed it, wire it in now).

Acceptance: `/auctions` shows a skeleton grid then real cards; changing
pages updates the URL and the list; `npm run build`/`lint` clean.

## Task 4: Prefetch-on-hover feature

Depends on Task 3 (AuctionCard exists).

`src/features/prefetch-auction-on-hover/` — a `usePrefetchAuction(uuid)`
hook returning an `onMouseEnter` handler that calls
`queryClient.prefetchQuery({ queryKey: auctionKeys.detail(uuid), queryFn:
() => fetchAuction(uuid), staleTime: 30_000 })`. Wire it onto each
`AuctionCard` in the `auction-list` widget (or inside `AuctionCard` itself —
either placement is fine, but a `feature` must not be imported by an
`entity`, so if `AuctionCard` lives in `entities/auction/ui` the hook call
needs to happen in the `widgets/auction-list` layer instead, passing the
handler down as a prop).

Acceptance: hovering a card in the browser (or observing the query cache)
triggers a background fetch for that auction's detail query key; a second
hover within 30s does not re-fetch. `npm run build`/`lint` clean.

## Task 5: Auction detail page

Depends on Task 2 (router/loader) and Task 1 (fixtures).

1. `src/widgets/auction-detail-card/` — renders the sections from
   `AuctionShowResponse`: main (`cargo_num`, `auc_type`), organizer, cargo
   (weight/volume), routes (`RoutePoint[]`, each with `location`/`cargo`/
   `contact`), trading (status, `start_time`/`stop_time`,
   `trading.price.current`, `trading.your`), payment. `SkeletonCard` while
   loading; `ErrorState` on a thrown `NotFoundError` (404) from
   `fetchAuction`.
2. `src/widgets/bets-panel/` — list/table of bets from `useBets(uuid)`:
   date (`created_at`), `contact_name`, `price_with_vat`/`price_no_vat`.
   If `hide_bets_history` is true on the auction detail, render a
   placeholder ("история ставок скрыта") instead of the list.
3. `src/features/place-bet/` — a form (react-hook-form + zod: `price:
   z.number().positive()`) using `shared/ui/Input` and `shared/ui/Button`;
   disabled entirely when `trading.can_set_bet === false`; on submit calls
   `useSetBet(uuid)` from `entities/bet/api/use-bet-queries` (already
   invalidates the right query keys on success); surface a validation
   error from a 422 response (`ValidationError`) in the form.
4. `src/pages/auction-detail/` — composes `auction-detail-card` +
   `bets-panel` (which itself renders `place-bet`), reading `auctionUuid`
   from the route params; used by the `/auctions/$auctionUuid` route from
   Task 2.

Acceptance: detail page renders all sections for a valid uuid; an unknown
uuid shows `ErrorState`; submitting a valid bid updates the bets list and
current price without a page reload; `npm run build`/`lint` clean.

## Task 6: Final polish and build verification

Depends on all prior tasks.

1. Confirm empty/error states: no auctions on a page past the last one,
   auction with zero bets, `hide_bets_history` placeholder — check each
   renders sensibly (adjust CSS/copy only if actually broken, not
   speculatively).
2. `Grep` the whole `src/` tree for any leftover import of the deleted
   `src/api/` or `src/App.tsx` — fix or report if found.
3. Run the readiness checklist from the original plan's "Проверка
   готовности" section and report the result of each line item.
4. `npm run lint` and `npm run build` must both exit 0 with no errors or
   new warnings beyond the pre-existing `mockServiceWorker.js` generated-file
   warning.

Acceptance: full checklist passes; both commands clean.
