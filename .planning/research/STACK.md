# Technology Stack — PT Dashboard: Date Math, Pickers, Currency, Notifications

**Project:** Auswanderung PT Dashboard (subsequent milestone)
**Researched:** 2026-04-07
**Scope:** Libraries for a Vanilla JS + Supabase app — no build tools, no framework, CDN-only

---

## Recommended Stack

### Date Math (Schengen 90/180 Rolling Window)

| Technology | Version | CDN URL | Why |
|------------|---------|---------|-----|
| **Temporal API (native)** | ES2026 built-in | — (no CDN needed) | Now natively available in Chrome 144+, Firefox 139+, Edge 144+. TC39 Stage 4 as of March 2026. Immutable date types, first-class duration/interval arithmetic. Eliminates dependency entirely for modern browsers. |
| **temporal-polyfill** (fallback) | 0.3.2 | `https://cdn.jsdelivr.net/npm/temporal-polyfill@0.3.2/global.min.js` | 19.8 KB gzip. Exposes `Temporal` globally when loaded via script tag. Required for Safari until Apple ships support. Maintained by FullCalendar team. |

**Rationale:** Temporal is the correct long-term answer for rolling window math. The Schengen 90/180 calculation requires counting discrete calendar days within a sliding 180-day lookback window — Temporal's `PlainDate`, `PlainDate.until()`, and `Temporal.PlainDate.compare()` handle this with precision and without DST ambiguities that plague the native `Date` object. Since the app targets a single user (Viktor) on modern browsers, native Temporal coverage is already ~95%+ of the relevant use case. The polyfill covers Safari as a safety net.

**What NOT to use:**
- `Day.js` — would work for this use case, but adds a dependency that Temporal makes unnecessary. Its CDN plugin loading (separate `<script>` per plugin) creates fragile ordering dependencies. Confidence: HIGH.
- `date-fns` — tree-shaking advantage disappears on CDN; you'd load the full bundle for what Temporal gives you for free. Confidence: HIGH.
- `Luxon` — 23 KB gzip, was the best choice pre-Temporal, now superseded. Only worth using if you need IANA timezone database manipulation beyond what `Intl` provides.
- `moment.js` — deprecated by its own maintainers. Do not use.

**Confidence:** HIGH — Temporal Stage 4 confirmed via Socket.dev announcement and MDN. Chrome 144 ship date confirmed via InfoQ. Polyfill CDN URL verified on jsDelivr.

---

### Calendar Date Picker (Trip Entry UI)

| Technology | Version | CDN URLs | Why |
|------------|---------|---------|-----|
| **flatpickr** | 4.6.13 | JS: `https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.js` CSS: `https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css` | Zero dependencies. Native Vanilla JS. Built-in date range mode (two dates, one picker). 16 KB JS + 3 KB CSS. Actively maintained. No jQuery, no React, no build step. |

**Rationale:** For entering country stays, you need: date range selection (entry date + exit date), mobile-friendly touch support, and keyboard accessibility. Flatpickr is the de-facto standard for dependency-free date picking — it covers all three. The `mode: "range"` option gives range picking without extra plugins.

**What NOT to use:**
- `vanillajs-datepicker` — range picking requires a separate `DateRangePicker` subclass; more complex setup for the same outcome.
- `MCDatepicker` — low adoption, sparse maintenance, no clear CDN path.
- `<input type="date">` native — no range mode, inconsistent cross-browser formatting, no visual calendar overlay.

**Confidence:** HIGH — CDN URL verified on jsDelivr. Version 4.6.13 confirmed as latest stable (released April 2024; no newer release found as of research date).

---

### Cost / Currency Handling

| Technology | Version | CDN URL | Why |
|------------|---------|---------|-----|
| **currency.js** | 2.0.3 | `https://unpkg.com/currency.js/dist/currency.min.js` | 1.14 KB. Handles floating-point rounding bugs (the classic `0.1 + 0.2` problem) by working in integer cents. Immutable instances. Supports any currency via config — create separate instances for EUR, THB, USD as needed. No conversion rates built in (correct: you handle rates separately via Supabase). |
| **`Intl.NumberFormat`** (native) | Browser built-in | — | Use for display formatting only. `new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })` covers locale-aware output without any library. |

**Rationale:** Cost tracking for a PT needs arithmetic (summing expenses, computing monthly averages) and display formatting. These are separate concerns: `currency.js` for safe arithmetic, `Intl.NumberFormat` for locale-aware display. The combination covers both at near-zero cost.

**What NOT to use:**
- `accounting.js` — unmaintained since 2014. Do not use.
- `autoNumeric` — designed for input masking, not arithmetic. Overkill and heavy for this use case.
- `Numeral.js` — archived/unmaintained. Do not use.
- Raw `parseFloat` arithmetic — floating-point errors will corrupt expense totals. Confirmed anti-pattern.

**Confidence:** HIGH — currency.js version and unpkg URL verified directly on currency.js.org. `Intl.NumberFormat` is a web standard, HIGH confidence.

---

### Deadline Warnings / Notifications

**Context:** The app is deployed on GitHub Pages (static hosting). True server-initiated push notifications (Web Push API) require a backend to call a push service — this is impossible on GitHub Pages without a separate server. This is a hard architectural constraint.

**Recommended approach — In-app alert banners (no push):**

| Technology | Version | Why |
|------------|---------|-----|
| **`Notification` API (native)** | Browser built-in | For browser-level OS notifications when the tab is open. Works on GitHub Pages. No library needed. Call `Notification.requestPermission()` then `new Notification(...)`. Shows system-level alerts. |
| **Custom DOM banners** | Vanilla JS | For in-app deadline warnings (e.g., "8 days left in Schengen"). Best UX for a dashboard — persistent, styled, dismissible. Zero dependencies. |
| **`localStorage` + page-load check** | Browser built-in | On every page load, run the deadline calculation. If a deadline is within the warning threshold (e.g., 14 days), show the banner. This replaces push notifications for a single-user personal tool. |

**Rationale for rejecting server push:** GitHub Pages cannot initiate a push. Supabase Edge Functions *could* send a push, but this requires: a VAPID key pair, a subscription endpoint stored per-device, and a backend trigger — substantial infrastructure for a single-user tool. The value-to-complexity ratio is poor. The Notification API (`new Notification(...)`) fires when the tab is open or the PWA is active, which covers the actual use case: Viktor opens his dashboard, sees the warning. He is not relying on passive background alerts.

**If push is later required:** Use Supabase Edge Functions + a VAPID-based Web Push server (e.g., the `web-push` npm package run inside a Supabase Edge Function). This is addable later without restructuring the frontend.

**Confidence:** MEDIUM — Push limitation on GitHub Pages confirmed by multiple sources. Notification API as alternative is a standard pattern. Single-user constraint makes this the correct tradeoff.

---

## Full CDN Load Order

Load in this order in `<head>` or before `</body>`:

```html
<!-- 1. Temporal polyfill (before any date logic) -->
<script src="https://cdn.jsdelivr.net/npm/temporal-polyfill@0.3.2/global.min.js"></script>

<!-- 2. flatpickr (date picker) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
<script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.js"></script>

<!-- 3. currency.js (cost arithmetic) -->
<script src="https://unpkg.com/currency.js/dist/currency.min.js"></script>

<!-- 4. Your app -->
<script src="app.js" type="module"></script>
```

Total external JS payload: ~21 KB gzip (polyfill 19.8 + flatpickr ~1 KB actual + currency.js 1.14 KB). Minimal.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Date math | Temporal + polyfill | Day.js | Day.js is now superseded by native Temporal; adds plugin fragility |
| Date math | Temporal + polyfill | Luxon | 23 KB, no advantage over Temporal |
| Date picker | flatpickr | vanillajs-datepicker | More complex range setup, same outcome |
| Date picker | flatpickr | Native `<input type="date">` | No range mode, poor UX consistency |
| Currency | currency.js + Intl | accounting.js | Unmaintained since 2014 |
| Currency | currency.js + Intl | autoNumeric | Input masking tool, not arithmetic library |
| Notifications | DOM banners + Notification API | Web Push | Requires backend — impossible on GitHub Pages |

---

## Schengen 90/180 Algorithm Note

No library implements the rolling window — this is custom logic regardless of date library. The algorithm:

1. For each date in question, look back exactly 180 calendar days.
2. Count how many of those 180 days appear in a stored list of Schengen stay intervals.
3. If count >= 90, the date is not available. Remaining = 90 - count.

With Temporal this is:

```javascript
function schengenDaysUsed(stays, referenceDate) {
  const windowStart = referenceDate.subtract({ days: 179 });
  let count = 0;
  for (const stay of stays) {
    const overlapStart = Temporal.PlainDate.compare(stay.entry, windowStart) >= 0
      ? stay.entry : windowStart;
    const overlapEnd = Temporal.PlainDate.compare(stay.exit, referenceDate) <= 0
      ? stay.exit : referenceDate;
    if (Temporal.PlainDate.compare(overlapStart, overlapEnd) <= 0) {
      count += overlapStart.until(overlapEnd).days + 1; // entry + exit both count
    }
  }
  return count;
}
```

This is implementable in pure Vanilla JS with Temporal. No external library handles Schengen logic specifically.

---

## Sources

- [pkgpulse.com — Best JavaScript Date Libraries 2026](https://www.pkgpulse.com/blog/best-javascript-date-libraries-2026)
- [Day.js CDN / Browser Installation](https://day.js.org/docs/en/installation/browser)
- [TC39 Advances Temporal to Stage 4 — Socket.dev](https://socket.dev/blog/tc39-advances-temporal-to-stage-4)
- [Chrome 144 Ships Temporal API — InfoQ](https://www.infoq.com/news/2026/02/chrome-temporal-date-api/)
- [Temporal MDN Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal)
- [temporal-polyfill (FullCalendar) — GitHub](https://github.com/fullcalendar/temporal-polyfill)
- [temporal-polyfill on jsDelivr](https://www.jsdelivr.com/package/npm/temporal-polyfill)
- [flatpickr official site](https://flatpickr.js.org/)
- [flatpickr on cdnjs](https://cdnjs.com/libraries/flatpickr)
- [currency.js official site](https://currency.js.org/)
- [Intl.NumberFormat — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [Push API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [PWA Push on GitHub Pages — limitation confirmed](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Re-engageable_Notifications_Push)
