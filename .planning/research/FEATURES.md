# Feature Landscape: PT Dashboard / Personal Travel Management Tool

**Domain:** Personal perpetual traveler operations dashboard (single-user, not SaaS)
**Researched:** 2026-04-07
**Existing features:** Countdown timers, action checklists, timeline, country visa rules (static), company structure view, document vault

---

## What Already Exists (Baseline)

The current app covers:
- Countdown to departure (days until June 6)
- Phase-based action list with manual completion tracking
- Timeline/milestones with dependencies shown
- Static country cards: max stay, visa rules, tax notes per country
- Two-company structure view (Einzelunternehmen + LLC)
- Document upload vault (Supabase-backed)
- Open items list

What it does NOT do: track actual travel (where Viktor is, days used), calculate Schengen compliance dynamically, track deadlines recurring after emigration, cost tracking across companies, or any PT-specific monitoring.

---

## Table Stakes

Features that dedicated PT/nomad tools universally provide. Missing = product feels incomplete for post-emigration use.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Actual stay entry** (entry/exit dates per country) | Every nomad tracker has this — NomadTracker, TrackingDays, Flamingo all start here | Low | Manual entry preferred for single-user; GPS auto-track is SaaS complexity |
| **Days-in-country counter** (current trip, year-to-date) | Core output of all PT tools | Low | Derive from stay entries |
| **Schengen 90/180 calculator** (rolling window) | Every Schengen calculator app has this; Viktor will rotate through Schengen zones | Medium | Rolling 180-day window is non-trivial to implement correctly; must match official EC method |
| **183-day tax trigger warning** per country | All tax-focused trackers (NomadTracker, Flamingo, Domicile365) include this | Low | Hard threshold alert; simple once days-in-country exists |
| **Visa runway display** (days remaining before forced exit) | NomadTracker, Flamingo, TrackingDays all show this; prevents overstays | Low | Derived from max-stay + entry date |
| **Future trip simulation** ("ghost trips") | NomadTracker Pro, Schengen calculators all do this | Medium | "If I go to Portugal for 30 days in August, what happens to my Schengen balance?" |
| **Document expiry reminders** | Nomad Vault, NomadTracker — passport expiry reminders are table stakes | Low | Passport valid 2034, but KV, Berufshaftpflicht, LLC annual report all expire |
| **Travel history log** (all countries visited, date ranges) | All trackers maintain this for tax/immigration export | Low | Also needed for Schengen calculation input |

---

## Differentiators

Features specific to Viktor's situation that no generic PT app provides. High value precisely because they don't exist elsewhere in combined form.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Two-company compliance dashboard** | Track Einzelunternehmen (IHK, Berufshaftpflicht, Qonto activity) vs LLC (Wyoming annual report, Wise Business, EIN) deadlines in one view | Medium | No generic tool combines visa tracking with company compliance; this is Viktor-specific |
| **Fondsfinanz transition tracker** | Step-by-step checklist for the 5-step staggered migration (Bank → Adresse → Steuernummer) with per-step status | Low | Already partially in the app; needs to survive post-emigration as a persistent record |
| **Germany exit risk dashboard** | Track items that could trigger re-connection to Germany: Karina's address, mail forwarding gaps, German accounts, extended stay in Germany | Medium | "Rückfall-Risiko" — unique to this PT structure |
| **PT income routing visualization** | Show money flow: Fondsfinanz → LLC → Wise Business → personal spend; flag if routing breaks | Medium | Specific to the commission broker business model with two companies |
| **Schengen budget for Europe visits** | Viktor will want to visit Karina (Dortmund). Dashboard shows exactly how many Schengen days are available for the next 6-month window | Low | Derived from Schengen calculator but surface this as a named use case |
| **LLC annual compliance calendar** | Wyoming LLC requires annual report. Show recurring yearly deadlines (Wyoming filing, EIN renewal contexts, Wise Business review) | Low | Set-and-forget but critical; missing = LLC lapses |
| **Country rotation planner** | Given current Schengen balance + 183-day status per country, suggest a rotation that keeps Viktor compliant | High | Would be the crown jewel feature; complex because it's multi-constraint optimization |
| **"Am I still a PT?" status indicator** | Rolling check: is Viktor under 183 days everywhere? Is the Schengen budget safe? Are all company obligations current? Single-glance health status | Low | Synthesis feature; requires other data inputs to exist first |

---

## Anti-Features

Things to deliberately NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **GPS auto-tracking** | All apps that do this (NomadTracker, Flamingo) require mobile app infrastructure; not a web app feature; privacy concerns; single-user means manual entry is fine | Manual entry/exit date input |
| **Photo metadata scanning** for travel history backfill | NomadTracker and Flamingo offer this; requires native mobile app; complex AI pipeline; Viktor's history starts at emigration June 2026 so backfill isn't needed | Start fresh from departure date |
| **City/destination recommendation** | NomadList, Novad are dedicated tools for this; Viktor already knows where he wants to go; not the problem this app solves | Link to NomadList if needed |
| **Multi-user / team features** | This is a personal ops dashboard, not SaaS; adding sharing/permissions adds complexity with zero benefit | Single-user data model |
| **Currency/expense tracking** | TravelSpend, Expensify, and Wise Business itself handle this; Viktor's business finances are in Wise/Mercury which have their own reporting | Reference Wise Business dashboard |
| **Tax calculation** | Requires professional-grade tax logic; varies by treaty; legal liability; Viktor works with Finanznoma for this | Flag thresholds, link to advisor |
| **Visa application workflow** | Separate from tracking; country-specific form complexity; already handled by specialized services | Track deadlines only, not applications |
| **Social features / community** | NomadList has this; completely out of scope for a personal ops tool | N/A |

---

## Feature Dependencies

```
Stay entries (entry/exit dates)
  └── Days-in-country counter
       ├── 183-day tax trigger warning (per country)
       ├── Visa runway display (per visa/country)
       └── Schengen 90/180 calculator
            ├── Schengen budget for Europe visits
            └── Future trip simulation
                 └── Country rotation planner (highest complexity)

Document expiry reminders
  └── (standalone, no deps)

Two-company compliance dashboard
  └── LLC annual compliance calendar (subset of this)

"Am I still a PT?" status indicator
  └── Requires: 183-day data + Schengen data + company compliance data
```

---

## MVP Recommendation

The current app serves the **pre-emigration phase** well. The next milestone should add the **post-emigration PT layer** that activates on June 6, 2026.

**Prioritize (in order):**

1. **Stay entry + days counter** — unlocks everything else; can be built in a weekend
2. **Schengen 90/180 calculator** with rolling window — highest compliance risk, needs to be correct
3. **183-day warning per country** — simple threshold once days exist
4. **Visa runway display** — combine with existing static country data
5. **Document expiry reminders** — extend existing document vault with expiry dates + alerts
6. **Two-company compliance calendar** — recurring LLC/Einzelunternehmen deadlines (annual report, Berufshaftpflicht renewal, IHK)

**Defer:**
- Future trip simulation: wait until Viktor has real stay data to test against
- Country rotation planner: high complexity, nice-to-have, can be manual with Schengen calculator
- Germany exit risk dashboard: useful but research-intensive; defer until PT phase is active
- "Am I still a PT?" composite indicator: build after all inputs exist

---

## Phase-Specific Notes

### Immediate (before June 6, 2026)
The existing app is appropriate. No PT tracking features are needed yet — Viktor is still in Germany. Focus on the emigration checklist, not travel tracking.

### Phase: PT begins (June 6 onward)
- Stay entry becomes the first thing Viktor does after landing in Bangkok
- Schengen calculator matters the moment Viktor plans a return visit to see Karina
- LLC annual report deadline needs to be in the app before the first Wyoming filing date

### Phase: Ongoing PT operations
- 183-day tracking becomes critical once Viktor spends significant time in any one country
- Thailand's remittance-based tax rule (2024 change) means time-in-Thailand + money-sent-to-Thailand both matter; the app should track days in Thailand specifically with a remittance note, not a full tax engine

---

## Sources

- NomadTracker feature list: https://www.thenomadtracker.com/ (HIGH confidence — direct observation)
- NomadTracker.io features: https://www.nomadtracker.io/ (HIGH confidence — direct observation)
- TrackingDays features: https://www.trackingdays.com/ (HIGH confidence — direct observation)
- Flamingo.tax features: https://flamingo.tax/ (HIGH confidence — direct observation)
- Schengen calculator app comparison: https://www.daysmonitor.com/blog/best-schengen-calculator-apps/ (MEDIUM confidence — review article, 2026)
- NomadList/Nomads.com feature overview: https://nomads.com/ via ProductHunt reviews (MEDIUM confidence)
- Novad vs NomadList comparison: https://novad.app/vs/nomadlist (HIGH confidence — direct comparison page)
- nomad183tracker (open source reference): https://github.com/rouralberto/nomad183tracker (MEDIUM confidence)
- Existing app data model: /Users/viktor/Claude/auswanderung/data.js (HIGH confidence — direct read)
- Project context: /Users/viktor/Claude/auswanderung/CLAUDE.md (HIGH confidence — authoritative)
