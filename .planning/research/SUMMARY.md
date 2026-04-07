# Project Research Summary

**Project:** PT Dashboard — Post-Emigration Travel & Compliance Tracking
**Domain:** Single-user personal operations dashboard (Vanilla JS, Supabase, GitHub Pages)
**Researched:** 2026-04-07
**Confidence:** HIGH

---

## Executive Summary

The existing dashboard covers the pre-emigration phase well: countdown timers, action checklists, document vault, company structure view. What it lacks entirely is the post-emigration PT layer — the tools Viktor needs from June 6 onward to stay compliant as a perpetual traveler. Research across all four dimensions converges on a single recommendation: extend the existing codebase incrementally, do not rewrite it, and build the PT tracking layer as a structured expansion of the current 3-file architecture.

The technology choices are clear and low-risk. The Temporal API (TC39 Stage 4, native in Chrome 144+) handles the rolling-window Schengen 90/180 calculation correctly without introducing a date library dependency. Flatpickr provides date range entry for stay logging. Currency.js handles expense arithmetic safely. No push notification infrastructure is needed — a page-load banner check covers the single-user use case entirely. Total new external payload: ~21 KB gzip.

The critical risks are not architectural — they are bugs and operational gaps that already exist in the codebase. A timezone parsing bug (`new Date("2026-06-02")` parsed as UTC) will show wrong dates from Bangkok. Supabase free tier will pause the database after 7 days of inactivity during travel. Upload failures are silently swallowed with no user feedback. All three of these must be fixed before any new PT features are added, or the new features will be built on a broken foundation.

---

## Key Findings

### Recommended Stack

The stack is largely already decided by the existing codebase constraints: no build tools, no framework, CDN-only, file:// local dev. The research confirms this is the correct approach to maintain and identifies the specific libraries that fit without breaking those constraints.

ES modules cannot be used without a local dev server due to CORS restrictions on `file://` — the IIFE globals pattern must be kept. The code should be split by view into separate files loaded via script tag order rather than migrating to ES modules.

**Core technologies:**
- **Temporal API + temporal-polyfill 0.3.2:** Date math (Schengen rolling window, visa runway, 183-day threshold) — only library that handles calendar-day arithmetic correctly without DST bugs; TC39 Stage 4
- **flatpickr 4.6.13:** Date range picker for stay entry UI — zero dependencies, native Vanilla JS, built-in range mode
- **currency.js 2.0.3 + Intl.NumberFormat:** Cost arithmetic and display — avoids floating-point rounding corruption in expense totals
- **DOM banners + localStorage + Notification API:** Deadline warnings — Web Push requires a backend, impossible on GitHub Pages; page-load check is sufficient for single-user tool
- **No ES modules:** IIFE globals pattern retained to preserve file:// local dev workflow

### Expected Features

The current app has zero PT tracking capability. Every competing tool (NomadTracker, Flamingo, TrackingDays) starts with stay entry as the foundation — everything else derives from it. The feature dependency chain is strict and must be respected in build order.

**Must have (table stakes):**
- Stay entry with entry/exit dates per country — foundation for all calculations
- Days-in-country counter (current trip, year-to-date) — derived from stay log
- Schengen 90/180 rolling window calculator — highest compliance risk for Karina visits
- 183-day tax trigger warning per country — hard threshold alert, simple once days exist
- Visa runway display (days remaining per visa) — prevents overstays
- Document expiry reminders — extend existing vault with expiry dates + alerts

**Should have (Viktor-specific differentiators):**
- Two-company compliance calendar (Wyoming annual report, Berufshaftpflicht, IHK)
- Schengen budget display for Europe visits (named use case: visiting Karina in Dortmund)
- Germany exit risk dashboard (track items that could re-trigger German tax residency)
- Future trip simulation / ghost trips

**Defer to later:**
- Country rotation planner (multi-constraint optimization, high complexity)
- PT income routing visualization
- "Am I still a PT?" composite health indicator (build after all inputs exist)

### Architecture Approach

The existing 3-file IIFE architecture (data.js, db.js, app.js) is sound but will become unmaintainable past ~800 lines. The correct expansion is a view-split: one file per view under `views/`, a shared `lib/dates.js` helper module, and `app.js` reduced to a ~80-line orchestrator. This preserves the IIFE globals pattern and file:// dev workflow while preventing the single-file growth problem.

**Major components:**
1. `lib/dates.js` — shared DateUtils global; must be extracted first before any date-heavy feature
2. `db.js` (extended) — new methods for stay_log, schengen_trips, costs, milestone_notes tables
3. `views/countries.js` — stay log CRUD + days-in-country display
4. `views/schengen.js` — Schengen 90/180 calculator as pure function with Temporal
5. `views/costs.js` — expense tracking with currency.js arithmetic
6. `views/cmd.js` (extended) — deadline warnings aggregating data from all sources

**New Supabase tables:** `stay_log`, `schengen_trips`, `costs`, `milestone_notes` — all using `date` type (not `timestamptz`) for calendar-day arithmetic.

### Critical Pitfalls

1. **Timezone UTC parse bug (exists now)** — `new Date("2026-06-02")` parsed as UTC midnight, shows one day earlier in Bangkok (UTC+7). Fix: use `new Date(str + 'T00:00:00')`. Must fix in Phase 1.

2. **Supabase free tier pauses after 7 days of inactivity** — silently returns empty data; Viktor won't know his Supabase is paused. Fix: GitHub Actions ping workflow (SELECT every 5 days) + visible "DB unavailable" error state.

3. **Upload failures silently swallowed** — `uploadDoc()` returns null, dialog closes anyway. Fix: check return value, show error + retry button before closing dialog.

4. **Static `daysUsed: 0` in DATA.countries is misleading** — Countries view shows 0 forever. Must build actual stay log or convert to static reference card.

5. **app.js will become unmaintainable without the view-split** — adding features to the existing 530-line IIFE will push past 900 lines. View-split is the first structural task.

---

## Implications for Roadmap

Based on research, the build must proceed in strict dependency order. Three existing bugs must be fixed first. The file structure must be refactored before adding major features. The Schengen calculator cannot be built without the shared DateUtils library. Deadline warnings must come last because they aggregate data from earlier phases.

### Phase 1: Foundation Fixes

**Rationale:** Three bugs in the existing codebase will corrupt PT features if built on top of them. 1-3 hour fixes that unblock everything else.
**Delivers:** Correct date display from any timezone, Supabase keep-alive (GitHub Actions), safe document upload with error feedback, RLS policies, delete confirmation
**Addresses:** Pitfalls 1 (timezone), 2 (DB pausing), 3 (silent upload), 8 (RLS), 9 (delete)
**Avoids:** Building PT features on broken timezone and silent-failure foundations

### Phase 2: Code Structure Refactor

**Rationale:** app.js must be split before adding PT features. Infrastructure, not features — but makes all subsequent phases maintainable.
**Delivers:** lib/dates.js (DateUtils), views/ directory with existing logic extracted, app.js as orchestrator, db.js with new table method stubs
**Implements:** View-split architecture from ARCHITECTURE.md
**Avoids:** app.js growing past 800 lines (Pitfall 7)

### Phase 3: Stay Log + Days Counter

**Rationale:** Foundational PT feature — everything else derives from it. Activates June 6 (first Bangkok entry).
**Delivers:** Entry/exit date CRUD per country (flatpickr range picker), days-in-country counters, travel history log, stay_log Supabase table
**Uses:** flatpickr 4.6.13, Temporal API, DateUtils
**Implements:** views/countries.js with CRUD extending existing country cards
**Avoids:** Keeping the misleading static daysUsed: 0 display (Pitfall 6)

### Phase 4: Schengen 90/180 Calculator

**Rationale:** Highest compliance risk feature. Becomes urgent the moment Viktor plans a Dortmund visit.
**Delivers:** Rolling 180-day window calculator, Schengen days remaining display, foundation for future trip simulation
**Uses:** Temporal API PlainDate + interval arithmetic, schengen_trips table
**Implements:** views/schengen.js as pure function
**Research flag:** Verify algorithm against EC official calculator with known test cases before trusting output

### Phase 5: Deadline Warnings + Compliance Calendar

**Rationale:** Aggregates data from all previous phases. Cannot be built until stay_log and schengen_trips exist.
**Delivers:** Deadline banners in cmd.js, two-company compliance calendar (Wyoming annual report, Berufshaftpflicht, IHK), document expiry reminders, 183-day warnings, visa runway display
**Uses:** localStorage + Notification API, DateUtils
**Implements:** Extended views/cmd.js

### Phase 6: Differentiator Features

**Rationale:** Viktor-specific features built after real data exists to validate against.
**Delivers:** Future trip simulation (ghost trips), cost tracker (currency.js), Germany exit risk dashboard
**Defers:** Country rotation planner (multi-constraint optimization — highest complexity, lowest urgency)

### Phase Ordering Rationale

- Phases 1-2 are pure preparation — no new user-visible features, but they prevent wasted rebuilding on a broken base
- Phase 3 (stay log) must precede Phase 4 (Schengen) — shared flatpickr/Temporal infrastructure; building together would entangle concerns
- Phase 5 (deadline warnings) must come last among core features — aggregates data that doesn't exist until Phases 3-4 are complete
- Phase 6 features explicitly wait for real stay data — future trip simulation is much easier to validate with real trips to test against

### Research Flags

Phases needing deeper research during planning:
- **Phase 4 (Schengen calculator):** Custom rolling-window logic not provided by any library. Validate algorithm against EC official calculator with 3-4 edge cases (stay straddling the 180-day boundary, exit_date = null for current stay) before relying on it.
- **Phase 5 (company compliance calendar):** Wyoming LLC annual report deadlines and exact renewal dates for Berufshaftpflicht and IHK fees must be confirmed from official sources. Static data but must be accurate.

Phases with standard patterns (no additional research needed):
- **Phase 1 (bug fixes):** All three fixes documented with exact code changes in PITFALLS.md.
- **Phase 2 (refactor):** File-split fully specified in ARCHITECTURE.md with exact structure and script load order.
- **Phase 3 (stay log CRUD):** Standard Supabase CRUD + flatpickr. Table schema defined in ARCHITECTURE.md.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Temporal Stage 4 confirmed TC39 + MDN. flatpickr CDN verified jsDelivr. currency.js verified on currency.js.org. Push limitation confirmed MDN. |
| Features | HIGH | Competitive landscape observed directly (NomadTracker, Flamingo, TrackingDays). Priority confirmed against Viktor's CLAUDE.md context. Dependency chain logically derived. |
| Architecture | HIGH | IIFE vs ES modules confirmed via MDN (CORS on file://). File-split derived from direct codebase analysis with line numbers. |
| Pitfalls | HIGH | Timezone bug confirmed by direct code inspection (specific lines in app.js). Supabase pausing from official docs. Upload failure path confirmed by direct inspection of db.js + app.js. |

**Overall confidence:** HIGH

### Gaps to Address

- **Schengen algorithm validation:** STACK.md and ARCHITECTURE.md have slightly different implementations (Temporal vs raw Date). Before shipping Phase 4, test both against EC official calculator and pick one canonical version. Temporal version preferred.

- **Thailand remittance rule:** Whether Wise Business card usage constitutes "remittance" under Thailand's 2024 tax rule change is unresolved. App should track days-in-Thailand with a note, not calculate Thai tax. Flag for Finanznoma.

- **Wise Business compliance risk at >10k/mo:** CLAUDE.md open item. Cannot be resolved in the app — surface as a note in the costs view.

- **Supabase Pro upgrade decision:** $25/mo eliminates pausing and adds PITR backups. GitHub Actions ping workaround is sufficient for Phase 1, but revisit after 3 months of PT use.

---

## Sources

### Primary (HIGH confidence)
- MDN Web Docs — Temporal API, Date.parse() UTC behavior, JavaScript Modules CORS
- Supabase official docs — free tier pausing, going-into-production guide
- TC39 / Socket.dev — Temporal Stage 4 advancement, March 2026
- InfoQ — Chrome 144 Temporal ship date, February 2026
- NomadTracker, Flamingo, TrackingDays — direct feature observation
- Existing codebase (app.js, db.js, data.js, CLAUDE.md) — direct inspection

### Secondary (MEDIUM confidence)
- temporal-polyfill GitHub (FullCalendar) — CDN availability and version confirmed
- jsDelivr CDN — flatpickr 4.6.13 latest stable
- daysmonitor.com — Schengen calculator app comparison, 2026
- DEV Community — Supabase pause prevention with GitHub Actions
- travisvn/supabase-pause-prevention — community solution, widely referenced

### Tertiary (pattern validation only)
- CSS-Tricks — Vanilla JS state management patterns
- Medium — modular Vanilla JS component patterns
- nomad183tracker (open source) — reference for 183-day tracking approach

---

*Research completed: 2026-04-07*
*Ready for roadmap: yes*
