# Architecture Patterns

**Domain:** Personal PT dashboard — Vanilla JS SPA, Supabase backend, GitHub Pages
**Researched:** 2026-04-07
**Mode:** Architecture dimension — extending existing 3-file SPA with 4-6 new features

---

## Current State Assessment

The existing codebase is a single IIFE in `app.js` (~530 lines) with:

- `data.js` — static `DATA` object (global, no export)
- `db.js` — `DB` object with Supabase methods (global, no export)
- `app.js` — all render functions inside one IIFE, all wired at bottom

The pattern works and is clean. The problem that grows with new features: all render logic, DOM constants, event listeners, and helper functions live in one file. At 530 lines with 5 views, adding 4-6 features will push `app.js` past 900-1000 lines where cognitive overhead becomes the main drag.

**The IIFE approach does NOT need to be abandoned.** It needs to be split.

---

## Recommended Architecture

### Module Strategy: Stay on IIFE, Split by View

Do NOT migrate to ES modules (`type="module"`). Reason: ES modules require either a local web server to avoid CORS errors on `file://`, or a full GitHub Pages deploy cycle to test locally. The current dev workflow (open `index.html` directly in browser) would break. The IIFE pattern already works correctly and ships zero risk.

**Confidence: HIGH** — MDN explicitly states `file://` + ES modules = CORS errors. GitHub Pages serves correct MIME types, but local dev breaks. (Source: MDN Web Docs — JavaScript Modules)

**The correct move:** Split `app.js` into one file per view/feature using the same IIFE-as-module pattern, with explicit globals as the communication contract.

### File Structure After Expansion

```
index.html          ← load order matters; script tags replace imports
style.css
data.js             ← static DATA object (unchanged)
db.js               ← DB object, extend with new table methods
app.js              ← init only: wires navigation, calls render functions
views/
  cmd.js            ← renderCommandCenter() — existing, extracted
  timeline.js       ← renderTimeline() — existing, extracted
  countries.js      ← renderCountries() + stay CRUD — NEW logic here
  structure.js      ← renderStructure() — existing, extracted
  documents.js      ← renderDocuments() + upload flow — existing, extracted
  schengen.js       ← Schengen calculator — NEW
  costs.js          ← cost tracker — NEW
lib/
  dates.js          ← shared date helpers: daysBetween, formatDate, etc.
  ui.js             ← shared UI helpers: dialogs, loaders, toasts
```

`app.js` becomes an orchestrator of ~80 lines:

```javascript
(function () {
  // navigation wiring
  // call each view's init/render
  renderCommandCenter();
  renderTimeline();
  renderCountries();
  renderStructure();
  renderDocuments();
  renderSchengen();
  renderCosts();
})();
```

Each view file exposes its render function as a global (same pattern as `DB` and `DATA`):

```javascript
// views/schengen.js
var SchengenView = (function () {
  function render() { /* ... */ }
  return { render };
})();
```

### Script Load Order in index.html

```html
<!-- Libraries -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>

<!-- Data layer (no dependencies) -->
<script src="lib/dates.js"></script>
<script src="lib/ui.js"></script>
<script src="data.js"></script>
<script src="db.js"></script>

<!-- Views (depend on DATA, DB, lib) -->
<script src="views/cmd.js"></script>
<script src="views/timeline.js"></script>
<script src="views/countries.js"></script>
<script src="views/structure.js"></script>
<script src="views/documents.js"></script>
<script src="views/schengen.js"></script>
<script src="views/costs.js"></script>

<!-- Orchestrator (depends on everything) -->
<script src="app.js"></script>
```

This replaces `import/export` with load order — the same mental model, no tooling needed.

---

## Component Boundaries

| File | Responsibility | Reads from | Writes to |
|------|---------------|------------|-----------|
| `data.js` | Static application data | — | `DATA` global |
| `db.js` | All Supabase operations | `sb` client | `DB` global |
| `lib/dates.js` | Date math, formatting | — | `DateUtils` global |
| `lib/ui.js` | Dialogs, toasts, loading states | DOM | — |
| `views/cmd.js` | Command center render | `DATA`, `DB` | DOM |
| `views/timeline.js` | Timeline render | `DATA`, `DB` | DOM |
| `views/countries.js` | Country cards + stay log CRUD | `DATA`, `DB` | DOM |
| `views/schengen.js` | 90/180-day calculator | `DB`, `DateUtils` | DOM |
| `views/costs.js` | Cost tracker CRUD + summary | `DB`, `DateUtils` | DOM |
| `views/documents.js` | Doc upload, checklist | `DATA`, `DB` | DOM |
| `app.js` | Navigation, init, orchestration | All views | DOM |

**Rule:** Views never call other views. Views never write to `DATA`. Only `db.js` touches Supabase.

---

## Data Flow

```
User interaction
      |
      v
View file (event listener)
      |
      v
DB method (db.js) ← async, try/catch, graceful fallback
      |
      v
Supabase
      |
      v
DB method returns data
      |
      v
View re-renders (call own render function)
```

Static data flows: `DATA` (data.js) → view render functions → DOM. No two-way binding. No reactive proxy needed at this scale. Re-render on mutation is sufficient.

---

## New Supabase Tables

### stay_log (country stay tracking)
```sql
CREATE TABLE stay_log (
  id          text PRIMARY KEY,         -- nanoid or timestamp-based
  country     text NOT NULL,            -- 'TH', 'MY', 'GE', etc.
  entry_date  date NOT NULL,
  exit_date   date,                     -- NULL = currently in country
  notes       text,
  created_at  timestamptz DEFAULT now()
);
```

**Why `date` not `timestamptz`:** Stay tracking cares about calendar days, not clock time. Date arithmetic with `date` type is exact and avoids timezone edge cases.

### schengen_trips (Schengen 90/180 calculator)
```sql
CREATE TABLE schengen_trips (
  id          text PRIMARY KEY,
  entry_date  date NOT NULL,
  exit_date   date NOT NULL,
  country     text,                     -- optional: which Schengen country
  notes       text,
  created_at  timestamptz DEFAULT now()
);
```

The calculator logic runs client-side. The table is only for data persistence. Query all trips ordered by entry_date, compute rolling 180-day windows in JS.

### costs (cost tracker)
```sql
CREATE TABLE costs (
  id          text PRIMARY KEY,
  amount      numeric(10,2) NOT NULL,
  currency    text NOT NULL DEFAULT 'EUR',
  category    text NOT NULL,            -- 'accommodation', 'food', 'transport', 'admin', 'other'
  description text,
  date        date NOT NULL,
  country     text,                     -- where the expense occurred
  created_at  timestamptz DEFAULT now()
);
```

### milestones_notes (notes on timeline milestones)
```sql
CREATE TABLE milestone_notes (
  milestone_id  text PRIMARY KEY,      -- matches milestones[].date+title slug
  note          text,
  updated_at    timestamptz DEFAULT now()
);
```

Same upsert pattern as `doc_notes` — proven, consistent.

---

## Patterns to Follow

### Pattern 1: Extract Helper Module First
**What:** Before adding new view logic, extract `daysBetween`, `formatDate`, `formatDateLong` from `app.js` into `lib/dates.js`.
**When:** First step of any milestone adding date-heavy features.
**Why:** Schengen calculator and stay tracker both need these. Shared library prevents drift.

```javascript
// lib/dates.js
var DateUtils = (function () {
  function daysBetween(a, b) {
    return Math.ceil((new Date(b) - new Date(a)) / 86400000);
  }
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }
  // ... etc
  return { daysBetween, formatDate, formatDateLong };
})();
```

### Pattern 2: DB Method Per Feature
**What:** Add all Supabase operations for a new feature as methods on the existing `DB` object in `db.js`.
**When:** Every new table.
**Why:** `db.js` is the single seam for all persistence. Debugging is localized. Graceful fallback (`if (!sb) return []`) is already established there.

```javascript
// In db.js, extend DB object:
// stays
async loadStays() { ... },
async saveStay(stay) { ... },
async deleteStay(id) { ... },

// costs
async loadCosts() { ... },
async saveCost(cost) { ... },
async deleteCost(id) { ... },
```

### Pattern 3: Render-on-Write
**What:** After every CRUD operation, call the view's own render function.
**When:** All mutations in all view files.
**Why:** The current codebase already does this (`renderDocuments()` calls itself after upload). No state sync bugs. Simple to reason about.

Do NOT introduce a reactive proxy, store, or pub/sub at this scale. The overhead of a custom state manager exceeds the problem it solves for a single-user dashboard.

### Pattern 4: Schengen Calculator as Pure Function
**What:** The 90/180-day calculation is a pure JS function. No DOM until the answer is ready.
**When:** Building the Schengen view.

```javascript
// Pure calculation — easy to test manually in console
function schengenDaysUsed(trips, referenceDate) {
  const ref = new Date(referenceDate);
  const windowStart = new Date(ref);
  windowStart.setDate(windowStart.getDate() - 180);

  return trips.reduce((total, trip) => {
    const entry = new Date(trip.entry_date);
    const exit = new Date(trip.exit_date);
    const overlapStart = entry < windowStart ? windowStart : entry;
    const overlapEnd = exit > ref ? ref : exit;
    if (overlapEnd > overlapStart) {
      total += DateUtils.daysBetween(overlapStart, overlapEnd) + 1;
    }
    return total;
  }, 0);
}
```

### Pattern 5: ID Generation Consistent with Existing Pattern
**What:** Use the same ID generation already in `db.js` for new tables.
**When:** All new `insert` operations.

```javascript
const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
```

This avoids introducing a UUID library or nanoid dependency. No external package needed.

---

## Build Order (Feature Dependencies)

This is the sequence new features must be implemented in because each depends on what comes before:

```
1. lib/dates.js (extract from app.js)
        |
        v
2. stay_log table + views/countries.js CRUD
   (extends existing country card UI, uses DateUtils)
        |
        v
3. schengen_trips table + views/schengen.js
   (depends on DateUtils, independent of stay_log)
        |
        v
4. costs table + views/costs.js
   (independent, but benefits from country data being settled)
        |
        v
5. milestone_notes + views/timeline.js note inline editing
   (same upsert pattern as doc_notes, lowest risk last)
        |
        v
6. Deadline warnings in views/cmd.js
   (reads stay_log + schengen data to surface alerts; must come last)
```

**Why this order:**
- DateUtils must exist before any date-heavy feature is written
- Stay log informs what countries are active, which the Schengen view can reference
- Costs is fully independent and can slot in anywhere after step 2
- Deadline warnings aggregate data from other features, so they must come last

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Migrating to ES Modules Mid-Project
**What:** Switching from IIFE globals to `import`/`export` without a build tool.
**Why bad:** Breaks local file:// testing immediately (CORS). Requires either a dev server (`python -m http.server`) or committing to GitHub Pages as the only dev environment. Risk outweighs benefit for a personal tool.
**Instead:** IIFE pattern + load order. Same encapsulation, zero tooling change.

### Anti-Pattern 2: Growing app.js Past 700 Lines
**What:** Adding new render functions to the existing `app.js` IIFE.
**Why bad:** Single file becomes the merge target for everything. All features become entangled. The existing `renderDocuments` is 130 lines — adding four more features of similar depth = unmaintainable.
**Instead:** One file per view. Extract at the start of each feature phase.

### Anti-Pattern 3: Mutating DATA Directly for New Features
**What:** Adding `daysUsed` or cost totals as properties on `DATA.countries` from multiple view files.
**Why bad:** `data.js` becomes a write target for multiple consumers. Side effects become invisible. `data.js` should be read-only static seed data.
**Instead:** New Supabase tables for mutable state. Views read from DB, not from `DATA` mutations.

### Anti-Pattern 4: Inline Date Math Per Feature
**What:** Copy-pasting `daysBetween` and `formatDate` into each new view file.
**Why bad:** Three copies of date logic diverge. Timezone handling is subtle (the current code uses `setHours(0,0,0,0)` for consistency — easy to miss in a copy).
**Instead:** Extract to `lib/dates.js` in the first feature phase. All views import via global.

### Anti-Pattern 5: Storing Stay Dates in DATA.countries.daysUsed
**What:** The current `daysUsed: 0` in `DATA.countries` is a static placeholder. Updating it in memory on load and not persisting it.
**Why bad:** Page refresh loses all state. The pattern does not scale to a log of entries/exits.
**Instead:** `stay_log` table in Supabase. `countries.js` loads and aggregates totals on render.

---

## Scalability Considerations

This is a single-user personal dashboard. Scalability is not the concern. Maintainability over a 3-6 month active use period is.

| Concern | Current (3 files) | After expansion (8-10 files) | Mitigation |
|---------|-------------------|------------------------------|------------|
| File count | 3 JS files | ~10 JS files | Logical grouping, consistent naming |
| Load time | Negligible | Negligible (all <30KB) | No action needed |
| Global namespace | DATA, DB, iife | DATA, DB, DateUtils, 6 view objects | Acceptable at this scale |
| Local dev | Opens in browser | Same — IIFE means no server needed | IIFE strategy confirmed correct |
| Debugging | One file | File per feature | Much better — easier to isolate |

---

## Sources

- MDN Web Docs — JavaScript Modules (CORS/file:// constraint, GitHub Pages MIME types): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules — HIGH confidence (official)
- modern-web.dev — Going Buildless ES Modules (no bare imports, path requirements): https://modern-web.dev/guides/going-buildless/es-modules/ — HIGH confidence (official Web Dev community docs)
- CSS-Tricks — Build a State Management System with Vanilla JavaScript (Proxy/pub-sub pattern): https://css-tricks.com/build-a-state-management-system-with-vanilla-javascript/ — MEDIUM confidence (well-sourced community article)
- Medium — Building Modular Web Apps with Vanilla JavaScript (component/view split): https://devdecodes.medium.com/building-modular-web-apps-with-vanilla-javascript-no-frameworks-needed-631710bae703 — MEDIUM confidence
- Existing codebase analysis (data.js, db.js, app.js, index.html) — HIGH confidence (direct observation)
