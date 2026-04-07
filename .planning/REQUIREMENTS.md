# Requirements: PT Command Center

**Defined:** 2026-04-07
**Core Value:** Viktor weiß jederzeit, wo er steht — was jetzt dran ist, wie lange er noch bleiben darf, und ob seine Firmenstruktur compliant ist.

## v1 Requirements

### Stability

- [ ] **STAB-01**: Alle Datums-Strings verwenden explizite Timezone-Behandlung (kein UTC-Offset-Bug aus anderen Zeitzonen)
- [ ] **STAB-02**: Supabase-Datenbank wird durch automatischen Ping vor Free-Tier-Pausing geschützt
- [ ] **STAB-03**: Fehlgeschlagene Dokument-Uploads zeigen dem User eine sichtbare Fehlermeldung
- [ ] **STAB-04**: Dokumente können nur nach Bestätigung gelöscht werden
- [ ] **STAB-05**: Checkbox-State wird sofort im UI aktualisiert (optimistic update), bei Fehler revert

### Structure

- [ ] **STRC-01**: app.js ist in separate View-Dateien aufgeteilt (eine pro View)
- [ ] **STRC-02**: Shared Date-Utilities (daysBetween, formatDate etc.) sind in lib/dates.js extrahiert
- [ ] **STRC-03**: Countdown-Daten kommen aus data.js/Supabase, nicht hardcoded in app.js

### Stay Tracking

- [ ] **STAY-01**: User kann Aufenthalte erfassen (Land, Einreise-Datum, Ausreise-Datum)
- [ ] **STAY-02**: User kann laufenden Aufenthalt markieren (kein Ausreise-Datum = "noch da")
- [ ] **STAY-03**: Aufenthaltstage werden automatisch berechnet und auf Länder-Karten angezeigt
- [ ] **STAY-04**: Aufenthalts-History ist chronologisch einsehbar
- [ ] **STAY-05**: Aufenthalte werden in Supabase persistiert (geräteübergreifend)

### Schengen Calculator

- [ ] **SCHEN-01**: 90/180-Tage Rolling Window wird aus Stay-Log berechnet (nur Schengen-Länder)
- [ ] **SCHEN-02**: Verbleibende Schengen-Tage werden prominent angezeigt
- [ ] **SCHEN-03**: Warnung bei <14 verbleibenden Schengen-Tagen
- [ ] **SCHEN-04**: Schengen-Länder sind korrekt markiert (inkl. EFTA-Staaten)

### Compliance & Deadlines

- [ ] **COMP-01**: Aktionen <7 Tage vor Fälligkeit und nicht abgehakt werden visuell als dringend markiert
- [ ] **COMP-02**: Fortschrittsbalken berechnen sich automatisch aus dem Verhältnis erledigter/offener Aktionen pro Phase
- [ ] **COMP-03**: User kann Notizen an Zeitstrahl-Meilensteine anhängen (persistiert in Supabase)
- [ ] **COMP-04**: Compliance-Kalender zeigt wiederkehrende Pflichten beider Firmen (LLC Annual Report, IHK-Beitrag, Berufshaftpflicht-Verlängerung)
- [ ] **COMP-05**: 183-Tage-Schwelle pro Land wird angezeigt (Steuerresidenz-Warnung)

### Kosten

- [ ] **COST-01**: User kann laufende Kosten erfassen (Firma, Bezeichnung, Betrag, Intervall)
- [ ] **COST-02**: Kosten werden nach Firma gruppiert angezeigt (Einzelunternehmen vs. LLC)
- [ ] **COST-03**: Monatliche und jährliche Gesamtkosten werden berechnet

## v2 Requirements

### Advanced Travel

- **TRAV-01**: Country Rotation Planner (Multi-Constraint-Optimierung über alle Länder)
- **TRAV-02**: Ghost Trips planen (zukünftige Aufenthalte simulieren, Schengen-Impact sehen)
- **TRAV-03**: Germany Exit Risk Dashboard (Auslöser für erweiterte beschränkte Steuerpflicht visualisieren)

### Notifications

- **NOTF-01**: Browser-Notifications bei kritischen Deadlines (wenn Tab/PWA aktiv)
- **NOTF-02**: Document-Expiry-Reminders (Reisepass, Ausweis ablaufend)

### Data Import

- **DATA-01**: Wise Business CSV-Import für Kosten
- **DATA-02**: Flugdaten-Import für automatische Stay-Einträge

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-User / Auth | Single-User-App, kein Bedarf |
| Mobile Native App | Web responsive reicht |
| Steuerberechnung | Keine Steuerberatung, nur Tracking |
| Automatische Visa-APIs | Regeln ändern sich, manuelle Pflege zuverlässiger |
| Build-Tooling (Webpack/Vite) | Vanilla JS Constraint, CDN-only |
| GPS Auto-Tracking | Braucht native App, manuell reicht |
| Push Notifications | Braucht Backend-Infrastruktur, GitHub Pages Limitation |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| STAB-01 | Phase 1 | Pending |
| STAB-02 | Phase 1 | Pending |
| STAB-03 | Phase 1 | Pending |
| STAB-04 | Phase 1 | Pending |
| STAB-05 | Phase 1 | Pending |
| STRC-01 | Phase 2 | Pending |
| STRC-02 | Phase 2 | Pending |
| STRC-03 | Phase 2 | Pending |
| STAY-01 | Phase 3 | Pending |
| STAY-02 | Phase 3 | Pending |
| STAY-03 | Phase 3 | Pending |
| STAY-04 | Phase 3 | Pending |
| STAY-05 | Phase 3 | Pending |
| SCHEN-01 | Phase 4 | Pending |
| SCHEN-02 | Phase 4 | Pending |
| SCHEN-03 | Phase 4 | Pending |
| SCHEN-04 | Phase 4 | Pending |
| COMP-01 | Phase 5 | Pending |
| COMP-02 | Phase 5 | Pending |
| COMP-03 | Phase 5 | Pending |
| COMP-04 | Phase 5 | Pending |
| COMP-05 | Phase 5 | Pending |
| COST-01 | Phase 6 | Pending |
| COST-02 | Phase 6 | Pending |
| COST-03 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-07*
*Last updated: 2026-04-07 after initial definition*
