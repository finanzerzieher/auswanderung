# Domain Pitfalls: Vanilla JS + Supabase PT Dashboard

**Domain:** Single-user personal tracking dashboard (Vanilla JS, Supabase free tier, GitHub Pages, travel/timezone context)
**Researched:** 2026-04-07
**Scope:** Pitfalls dimension only — feeds roadmap phase risk flags

---

## Critical Pitfalls

These mistakes cause broken data, data loss, or rewrites.

---

### Pitfall 1: Date-Only String Parsing Shifts Dates by One Day

**What goes wrong:** `new Date("2026-06-02")` is parsed as midnight UTC, not midnight local time. When Viktor accesses the app from Bangkok (UTC+7), this date becomes `2026-06-01 17:00:00 UTC+7` — one day earlier than intended. Every countdown, milestone date, and rendered date label will be off by one day when viewed east of UTC.

**Why it happens:** The ECMAScript spec explicitly treats ISO 8601 date-only strings (no time component) as UTC. Date-time strings without a timezone suffix are treated as local time. This asymmetry is a known historical spec error that cannot be changed for web compatibility. Source: [MDN Date.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse) — HIGH confidence.

**Where it exists in this codebase right now:**
- `renderCommandCenter()` lines 67–69: `new Date('2026-06-06')`, `new Date('2026-06-02')`, `new Date('2026-06-03')` — hardcoded dates parsed as UTC
- `formatDate(dateStr)` / `formatDateLong(dateStr)`: called with strings from `DATA.milestones[].date` (format `"2026-04-07"` — date-only, parsed as UTC)
- `TODAY` at line 6 uses `new Date()` without a string — correctly local time — but comparing it to UTC-parsed milestone dates creates mixed-timezone arithmetic in `daysBetween()`

**Consequences:** The app runs correctly in Dortmund (UTC+1, small offset). From Bangkok (UTC+7), every single date display and countdown is wrong by one day. The Abmeldung countdown shown as "57 Tage" could actually be "58 Tage" — a deadline-tracking app showing wrong deadlines.

**Prevention:**
- Parse date-only strings by appending `T00:00:00` (no timezone suffix) to force local-time interpretation: `new Date("2026-06-02T00:00:00")`
- Or use: `const [y,m,d] = str.split('-'); new Date(+y, +m-1, +d)` — zero-argument constructor for local midnight guaranteed
- Fix `daysBetween()` to floor both timestamps to midnight in local time before computing, not rely on `setHours(0,0,0,0)` on `TODAY` only
- `TODAY.setHours(0,0,0,0)` is correct for the "now" anchor; the fix is consistently making all milestone dates also represent local midnight

**Detection (warning signs):**
- Test the app with browser timezone set to UTC+7 or UTC+8 (Chrome DevTools → Sensors → override timezone)
- If any countdown shows N-1 instead of N relative to a German machine, the bug is present
- The bug is invisible to someone developing in UTC+1 (only 1 hour of drift, rarely crosses a day boundary)

**Phase to address:** Phase 1 — fix before any new date-dependent features are added. This is a structural correctness bug, not a visual one.

---

### Pitfall 2: Supabase Free Tier Pauses After 7 Days of Inactivity

**What goes wrong:** Supabase official docs state: "We may pause applications on the Free Plan that exhibit low activity in a 7-day period." When paused, all API calls fail silently. The app renders with empty data (actions unchecked, docs missing) and looks like a first-run state instead of showing an error.

**Why it happens:** The app's `loadCompleted()` and `loadDocs()` calls catch errors and return `{}` / `[]` respectively. If the DB is paused, the catch branch fires and the app renders with defaults — no indication anything is wrong. Source: [Supabase production docs](https://supabase.com/docs/guides/platform/going-into-prod) — HIGH confidence.

**Where it exists in this codebase right now:** `db.js` lines 27–30, 43–47, 70–88 — all catch blocks return empty results silently. `app.js` line 43: `console.warn` only. The user sees unchecked checkboxes and no documents when DB is paused.

**Consequences:** Viktor marks an action complete in Bangkok. The DB has been paused due to travel (no dashboard visits for 8 days). The check is silently discarded. He returns to the dashboard — action appears unchecked. He has no idea his state was lost. This is especially dangerous for the document store (uploaded PDFs appear gone).

**Prevention:**
- Add a ping mechanism: a GitHub Actions workflow that runs a lightweight SELECT query every 5 days keeps the project active. Multiple community solutions exist: [supabase-pause-prevention](https://github.com/travisvn/supabase-pause-prevention), [DEV guide with GitHub Actions](https://dev.to/jps27cse/how-to-prevent-your-supabase-project-database-from-being-paused-using-github-actions-3hel)
- Add a visible "DB unavailable" state in the UI when Supabase returns an error, so Viktor knows not to trust what he sees
- Consider: for a single-user PT dashboard, upgrading to Supabase Pro ($25/mo) eliminates the pausing entirely and adds PITR backups

**Detection (warning signs):** No visits to the dashboard for 7+ days (likely during intensive travel). After a Schengen run or long flight, first open of the app shows all actions unchecked.

**Phase to address:** Phase 1 — the ping workflow is a 15-minute task that prevents data integrity surprises during travel.

---

### Pitfall 3: Upload Errors Are Silently Swallowed — User Has No Feedback

**What goes wrong:** `DB.uploadDoc()` catches all errors and returns `null`. The calling code in `showUploadDialog()` (line 533) calls `await DB.uploadDoc(...)` but never checks the return value. When an upload fails (network drop, file size limit, paused DB, Supabase storage 400 error), the dialog closes, `renderDocuments()` runs, and the document simply doesn't appear. The user does not know whether it was uploaded or lost.

**Why it happens:** The pattern `catch (e) { console.warn('uploadDoc:', e); return null; }` is defensive coding that degrades gracefully for JS errors but is wrong UX for I/O failures. The upload dialog closes on the `overlay.remove()` call that follows regardless of success.

**Where it exists in this codebase right now:** `db.js` lines 117–118, `app.js` line 533–535.

**Consequences:** Viktor uploads his Abmeldebestätigung (critical document) from Bangkok airport on poor airport wifi. The upload times out. The dialog closes. He assumes it uploaded. He doesn't discover it's missing until he needs it months later.

**Prevention:** Check the return value of `uploadDoc()`. If `null`, do not close the dialog — instead show an error message inside the dialog with a retry button. Supabase storage throws typed errors; catch and display the message rather than swallowing it.

**Detection (warning signs):** Any upload on slow/mobile connections. The required docs checklist shows a document as "missing" after what appeared to be a successful upload dialog flow.

**Phase to address:** Phase 1 — document safety is the core value of the docs feature.

---

## Moderate Pitfalls

These degrade reliability or maintainability but don't cause silent data corruption.

---

### Pitfall 4: Static `progress` Values in `data.js` Will Never Update

**What goes wrong:** `DATA.phases[].progress` is hardcoded (e.g., `0.6` for "Vorbereitung"). The progress bars render from these static floats. As Viktor completes actions in Supabase, the `action_states` table knows how many are done — but `progress` is never recalculated. The "60% complete" display will stay at 60% forever unless someone edits `data.js`.

**Why it happens:** The `progress` field was likely added as a quick visualization placeholder. Computing it from `completed` counts in `DATA.actions` filtered by phase requires matching actions to phases — a join that doesn't currently exist in the data model.

**Prevention:** Either (a) compute progress dynamically from `DATA.actions.filter(a => a.phase === p.id && a.completed)` divided by total actions per phase, or (b) if the data model doesn't support per-phase action grouping, remove the progress bars until they can be computed truthfully. A progress bar stuck at 60% for months undermines trust in the dashboard.

**Detection:** Progress bar values do not change after checking off multiple actions.

**Phase to address:** Phase 2 — fix when adding any new action tracking or phase transition logic.

---

### Pitfall 5: Race Condition Between Supabase Load and First Render

**What goes wrong:** `app.js` calls `renderCommandCenter()` synchronously at line 545, then `DB.loadCompleted()` resolves asynchronously and calls `renderCommandCenter()` again if anything changed (line 40–43). The user sees unchecked checkboxes for ~300-800ms, then they flip to checked. On slow connections this is a visible flash of stale state.

**Why it happens:** The non-blocking load pattern is correct for avoiding a loading spinner, but the initial render uses `DATA.actions` which has all `completed: false` by default in `data.js`. The Supabase state then overwrites. If Viktor has bad connectivity and the load takes 5 seconds, he might click a checkbox, trigger `saveCompleted()` with `false→true`, and then the late-arriving Supabase response overwrites his change with the old value.

**Prevention:** Track whether the initial Supabase load has completed. Disable checkbox interaction until load resolves (add a CSS class to prevent clicks during the load window). This is especially important for a single-user app where the user's own interaction competes with their own stale state arriving from the network.

**Detection:** On mobile/slow connection, click a checkbox immediately after page load. Check whether it reverts after 1–2 seconds.

**Phase to address:** Phase 2 — add an "initializing" state to the action list that disables interaction until the first Supabase response arrives.

---

### Pitfall 6: Country Tracking Feature Is Dead Weight

**What goes wrong:** `renderCountries()` renders `DATA.countries` with hardcoded `daysUsed: 0` for every country. There is no mechanism to update `daysUsed`. The progress bars and "X übrig" values are permanently misleading (Thailand shows "0 von 60 Tage"). The Countries view exists as an unfulfilled promise.

**Why it happens:** The feature was designed but the tracking mechanism (entry/exit date recording and calculation) was never built.

**Consequences:** If Viktor relies on the country view to track visa days, he'll see incorrect data. More likely, he'll stop opening that view — but it adds confusion about what the app actually does.

**Prevention:** Either build actual entry/exit date tracking (requires Supabase table for travel logs + date arithmetic), or convert the Countries view to a static reference card that documents visa rules without pretending to track usage. The static reference version is genuinely useful; the fake dynamic version is harmful.

**Detection:** All countries show 0 days used after any period of travel.

**Phase to address:** Phase 2 — decide: build it or remove the fake state.

---

### Pitfall 7: `app.js` Will Become Unmaintainable Past ~800 Lines

**What goes wrong:** The IIFE pattern wrapping all logic in a single closure is fine at 530 lines. At 800-1000+ lines (likely after adding travel log, visa tracking, and notification features), finding where a bug lives requires reading hundreds of lines of unrelated code. Event listeners accumulate in the same scope. Functions reference each other implicitly through closure, making extraction difficult.

**Why it happens:** No build tools means no native module support (ES modules require either a bundler or `type="module"` on script tags). The current `<script src="...">` approach loads everything in global scope, which the IIFE was correctly used to contain.

**Prevention:** Switch to ES modules with `<script type="module" src="app.js">`. No build tools required — GitHub Pages serves `.js` files with any content. This allows: `import { DB } from './db.js'` instead of the implicit global `DB`, and splitting render functions into `render/commandCenter.js`, `render/documents.js` etc. Each file becomes independently readable. Migration cost: add `export const DB = { ... }` to `db.js`, add `import` statement to `app.js`, add `type="module"` to the script tag.

**Detection:** Time-to-locate a specific function exceeds 30 seconds. Two people cannot work on the file simultaneously without merge conflicts.

**Phase to address:** Phase 3 — do this before adding significant new features, not after.

---

## Minor Pitfalls

These cause inconvenience but are easily fixed when noticed.

---

### Pitfall 8: Supabase Anon Key Is Public in the Repository

**What goes wrong:** `db.js` hardcodes the Supabase anon key. The repo is likely public (GitHub Pages). The key is visible to anyone.

**Why it matters (and why it's minor):** Supabase explicitly designs the anon key to be public. The risk is not the key being visible — it's the absence of Row Level Security (RLS) policies on the tables. Without RLS, the anon key is effectively a full read/write credential to the database. Source: [Supabase security discussion #22028](https://github.com/orgs/supabase/discussions/22028) — HIGH confidence.

**Prevention:** For a single-user personal app with no auth, RLS policies should allow all operations unconditionally (`USING (true)` / `WITH CHECK (true)`). This sounds permissive but correctly scopes to "anyone with the key can do anything" — which is acceptable for personal use but should be explicit. The real risk is someone discovering the URL and uploading junk to the storage bucket or hitting the monthly bandwidth limit. Add a storage policy that limits to authenticated users if Viktor plans to add Supabase Auth later.

**Detection:** Go to Supabase dashboard → Table Editor → Policies. If no policies exist, RLS is likely disabled, meaning anyone with the key has unrestricted access.

**Phase to address:** Phase 1 — 10-minute task, do it immediately.

---

### Pitfall 9: Delete Document Has No Confirmation Step

**What goes wrong:** `doc-card-delete` fires `DB.deleteDoc()` immediately on click. There is no "Are you sure?" step. The delete is permanent (Supabase storage removal + DB row delete). A mis-tap on mobile deletes the Abmeldebestätigung.

**Prevention:** Add a `confirm()` dialog or an inline "click again to confirm" pattern before calling `DB.deleteDoc()`.

**Phase to address:** Phase 1 — one-line fix.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| Any new date display | Date-only string UTC parse (Pitfall 1) | Use `new Date(str + 'T00:00:00')` or constructor with parts |
| Travel log / entry dates | Timezone ambiguity compounding (Pitfall 1) | Store dates as ISO strings in UTC in Supabase; display in local |
| Visa day counter | Static `daysUsed` (Pitfall 6) | Build entry/exit log table in Supabase first |
| Phase progress display | Hardcoded `progress` values (Pitfall 4) | Compute from action completion ratio |
| Adding new render functions | Event listener accumulation (moderate, pattern from Pitfall 5) | Use event delegation on parent containers, not per-item listeners |
| Long travel / no dashboard use | DB pausing (Pitfall 2) | GitHub Actions ping workflow before any Bangkok features |
| Upload of LLC documents | Silent upload failure (Pitfall 3) | Error feedback in dialog before any new upload categories |
| Splitting app.js | Breaking global `DATA`/`DB` references | Convert to ES modules before extracting files |

---

## Sources

- MDN Web Docs — [Date.parse() UTC behavior for date-only strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse) — HIGH confidence (official spec)
- Supabase Docs — [Going into production: free tier inactivity pausing](https://supabase.com/docs/guides/platform/going-into-prod) — HIGH confidence (official docs, 7-day inactivity)
- Supabase GitHub Discussions — [Anon key + RLS safety #22028](https://github.com/orgs/supabase/discussions/22028) — HIGH confidence (official response)
- Supabase GitHub Discussions — [Table data lost after restore from paused state #39271](https://github.com/orgs/supabase/discussions/39271) — MEDIUM confidence (community report)
- Supabase GitHub Issues — [Storage silent failure on accented filenames #30616](https://github.com/supabase/supabase/issues/30616) — MEDIUM confidence (confirmed bug report)
- GitHub — [travisvn/supabase-pause-prevention](https://github.com/travisvn/supabase-pause-prevention) — MEDIUM confidence (community solution, widely referenced)
- DEV Community — [JavaScript Date timezone gotcha](https://dev.to/davo_man/the-javascript-date-time-zone-gotcha-that-trips-up-everyone-20lf) — MEDIUM confidence (verified against MDN spec)
- DEV Community — [Supabase pause prevention with GitHub Actions](https://dev.to/jps27cse/how-to-prevent-your-supabase-project-database-from-being-paused-using-github-actions-3hel) — MEDIUM confidence (community pattern)
- Codebase analysis of `/Users/viktor/Claude/auswanderung/app.js` and `db.js` — HIGH confidence (direct inspection)
