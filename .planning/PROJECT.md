# PT Command Center

## What This Is

Ein persönliches Langzeit-Dashboard für Viktor Frickel — Perpetual Traveler, Versicherungsvermittler mit §34d-Zulassung, Zwei-Firmen-Modell (deutsches Einzelunternehmen + US-LLC Wyoming). Das Tool begleitet die Auswanderung aus Deutschland und dient danach dauerhaft als zweites Gehirn für das PT-Leben: Visa-Tracking, Aufgabensteuerung, Dokumentenverwaltung, Firmen-Compliance.

## Core Value

**Viktor weiß jederzeit, wo er steht — was jetzt dran ist, wie lange er noch bleiben darf, und ob seine Firmenstruktur compliant ist.**

## Requirements

### Validated

- ✓ Command Center mit Countdown-Karten (Abmeldung, LLC, Abflug) — existing
- ✓ Aktionsliste mit Checkboxen, persistiert in Supabase — existing
- ✓ Zeitstrahl mit Meilensteinen und Abhängigkeiten — existing
- ✓ Länder & Visa Übersicht mit Regeln (statisch) — existing
- ✓ Firmenstruktur-Darstellung (Einzelunternehmen + LLC) — existing
- ✓ Dokumenten-Tresor mit Upload, Kategorien, Pflichtdokument-Checkliste — existing
- ✓ Supabase-Backend für geräteübergreifenden Sync — existing
- ✓ GitHub Pages Deployment — existing

### Active

- [ ] Länder-Tracker: Ein-/Ausreise-Daten eingeben, Aufenthaltstage automatisch berechnen
- [ ] Schengen-Zähler: 90/180-Tage-Regel über mehrere Schengen-Länder kumuliert tracken
- [ ] Auto-Progress: Fortschrittsbalken aus erledigten Aktionen berechnen statt statisch
- [ ] Deadline-Warnungen: Termine <7 Tage + nicht abgehakt → visuell hervorheben
- [ ] Notizen pro Meilenstein: Kurze Notizen an Zeitstrahl-Einträge anhängen
- [ ] Kosten-Tracker: Laufende Kosten beider Firmen + PT-Infrastruktur überblicken
- [ ] Countdown-Daten aus data.js statt hardcoded in app.js
- [ ] Fehler-Feedback bei fehlgeschlagenem Upload
- [ ] Case-insensitive Keyword-Matching bei Dokumenten-Erkennung

### Out of Scope

- Multi-User / Authentifizierung — Single-User-App, Supabase RLS reicht
- Mobile Native App — Web-App reicht, responsive Design vorhanden
- Steuerberechnung — keine Steuerberatung, nur Tracking
- Automatische Visa-Daten aus APIs — manuelle Eingabe, Regeln ändern sich zu oft
- Build-Tooling (Webpack/Vite) — Vanilla JS bleibt, Komplexität vermeiden

## Context

- Viktor ist aktuell in Dortmund, Abmeldung geplant für 02.06.2026, Abflug 06.06.2026
- Erster Stopp Bangkok (1 Monat), danach PT-Rotation SEA/Europa/VAE
- Coaching über Finanznoma (Maurice), LLC-Gründung über Express-Verfahren
- Compliance-Wohnsitz Paraguay geplant ab November 2026
- App läuft als statische Site auf GitHub Pages mit Supabase (eu-central-1) Backend
- Codebase ist Vanilla JS/HTML/CSS — bewusste Entscheidung gegen Frameworks
- Bestehende Codebase-Analyse in `.planning/codebase/`

## Constraints

- **Tech Stack**: Vanilla JS, kein Framework, kein Build-Tool — App muss als statische Files deployen
- **Hosting**: GitHub Pages (kostenlos), Supabase Free Tier
- **Single User**: Keine Auth nötig, aber Daten dürfen nicht trivial löschbar sein
- **Mobile-friendly**: Muss auf Handy benutzbar sein (bereits responsive)
- **Offline-tolerant**: App soll rendern auch wenn Supabase nicht erreichbar ist

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vanilla JS statt Framework | Einfachheit, kein Build, sofort deploybar | ✓ Good |
| Supabase statt localStorage | Geräteübergreifender Sync | ✓ Good |
| Anon Key public | By-design für Supabase, RLS schützt | ✓ Good |
| Reisedokument-Ästhetik | Passt zum Thema, persönlich, nicht generisch | ✓ Good |
| Daten in data.js statt DB | Statische Projektdaten ändern sich selten, Code-Änderung reicht | — Pending |
| Länder-Aufenthalte in Supabase | Dynamische Daten die sich oft ändern, brauchen Sync | — Pending |

---
*Last updated: 2026-04-07 after initialization*
