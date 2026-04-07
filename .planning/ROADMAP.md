# Roadmap: PT Command Center

## Overview

Das bestehende Dashboard (Countdown, Aktionsliste, Dokumententresor) wird zur vollständigen PT-Infrastruktur erweitert. Erst werden drei bestehende Bugs beseitigt und der Code aufgeteilt, dann folgen die neuen PT-Features in strikter Abhängigkeitsreihenfolge: Stay-Log → Schengen-Rechner → Compliance-Kalender → Kosten-Tracker.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Foundation Fixes** - Drei bestehende Bugs beseitigen, bevor PT-Features darauf aufgebaut werden
- [ ] **Phase 2: Code Structure** - app.js aufteilen in View-Dateien + lib/dates.js extrahieren
- [ ] **Phase 3: Stay Log** - Aufenthalte erfassen, Tage berechnen, History einsehen
- [ ] **Phase 4: Schengen Calculator** - 90/180-Tage Rolling-Window aus Stay-Log berechnen
- [ ] **Phase 5: Compliance & Deadlines** - Deadline-Warnungen, Fortschrittsbalken, Firmen-Compliance-Kalender
- [ ] **Phase 6: Costs** - Laufende Kosten beider Firmen erfassen und auswerten

## Phase Details

### Phase 1: Foundation Fixes
**Goal**: Die App verhält sich korrekt aus jeder Zeitzone, Supabase schläft nicht ein, und Upload-Fehler werden sichtbar kommuniziert
**Depends on**: Nichts (erster Phase)
**Requirements**: STAB-01, STAB-02, STAB-03, STAB-04, STAB-05
**Success Criteria** (what must be TRUE):
  1. Datums-Anzeigen auf der App sind von Bangkok (UTC+7) identisch mit von Berlin — kein Off-by-one-Day
  2. Nach 7+ Tagen ohne manuellen App-Aufruf ist Supabase immer noch erreichbar und zeigt Daten (GitHub Actions ping läuft)
  3. Wenn ein Dokument-Upload fehlschlägt, sieht der User eine sichtbare Fehlermeldung mit Retry-Option — der Dialog schließt sich nicht kommentarlos
  4. Beim Versuch ein Dokument zu löschen erscheint ein Bestätigungsdialog bevor die Datei entfernt wird
  5. Checkbox-Status im UI ändert sich sofort beim Klick, und kehrt sichtbar zum alten Zustand zurück wenn Supabase den Schreibvorgang ablehnt
**Plans**: TBD

Plans:
- [ ] 01-01: Timezone-Fix (UTC-Parse-Bug in Datums-Strings)
- [ ] 01-02: Supabase Keep-Alive (GitHub Actions ping workflow)
- [ ] 01-03: Upload-Fehler-Feedback + Delete-Confirmation + Optimistic Checkbox

### Phase 2: Code Structure
**Goal**: Der Code ist wartbar strukturiert — eine Datei pro View, DateUtils zentralisiert — bevor PT-Features hinzukommen
**Depends on**: Phase 1
**Requirements**: STRC-01, STRC-02, STRC-03
**Success Criteria** (what must be TRUE):
  1. Jeder View (cmd, countries, timeline, docs, company) hat eine eigene Datei unter views/ — app.js ist ein reiner Orchestrator unter ~100 Zeilen
  2. Datums-Hilfsfunktionen (daysBetween, formatDate usw.) existieren einmal in lib/dates.js und werden überall referenziert statt dupliziert
  3. Countdown-Daten (Abmeldung, LLC, Abflug) kommen aus data.js, nicht hardcoded aus app.js — eine Änderung in data.js reicht
**Plans**: TBD

Plans:
- [ ] 02-01: lib/dates.js extrahieren (DateUtils global)
- [ ] 02-02: views/ Verzeichnis anlegen, bestehende Logik aufteilen, app.js zu Orchestrator reduzieren
- [ ] 02-03: Countdown-Daten in data.js auslagern, Hardcoding in app.js entfernen

### Phase 3: Stay Log
**Goal**: Viktor kann Aufenthalte pro Land lückenlos erfassen und jederzeit sehen wie viele Tage er wo war
**Depends on**: Phase 2
**Requirements**: STAY-01, STAY-02, STAY-03, STAY-04, STAY-05
**Success Criteria** (what must be TRUE):
  1. Viktor kann einen neuen Aufenthalt mit Land, Einreisedatum und Ausreisedatum erfassen (Datepicker)
  2. Viktor kann einen laufenden Aufenthalt ohne Ausreisedatum markieren ("noch da") — Tage zählen täglich hoch
  3. Auf den Länderkarten steht die korrekte Anzahl Aufenthaltstage (aus Stay-Log berechnet, nicht statisch 0)
  4. Eine chronologische Aufenthalts-History ist einsehbar (wann wo, wie lange)
  5. Eingetragene Aufenthalte erscheinen auf einem anderen Gerät (Supabase-Sync)
**Plans**: TBD

Plans:
- [ ] 03-01: Supabase-Tabelle stay_log anlegen, db.js-Methoden schreiben
- [ ] 03-02: views/countries.js — Stay-CRUD-UI mit flatpickr, Tagesberechnung via DateUtils/Temporal
- [ ] 03-03: Aufenthalts-History-Ansicht, Sync-Verifikation

### Phase 4: Schengen Calculator
**Goal**: Viktor sieht jederzeit wie viele Schengen-Tage er noch hat — bevor er einen Flug nach Dortmund bucht
**Depends on**: Phase 3
**Requirements**: SCHEN-01, SCHEN-02, SCHEN-03, SCHEN-04
**Success Criteria** (what must be TRUE):
  1. Die verbleibenden Schengen-Tage (von aktuell bis 90 Tage sind ausgeschöpft im Rolling Window) werden prominent angezeigt
  2. Der berechnete Wert stimmt mit dem offiziellen EU-Schengen-Rechner überein (Testfälle: Aufenthalt der 180-Tage-Grenze überschreitet, laufender Aufenthalt ohne Ausreisedatum)
  3. Bei weniger als 14 verbleibenden Schengen-Tagen erscheint eine Warnung
  4. Alle EFTA-Staaten (Schweiz, Norwegen, Island, Liechtenstein) sind korrekt als Schengen markiert
**Plans**: TBD

Plans:
- [ ] 04-01: Schengen-Länder-Liste pflegen, Algorithmus mit Temporal API implementieren
- [ ] 04-02: views/schengen.js — Rolling-Window-UI, Warnschwelle <14 Tage
- [ ] 04-03: Algorithmus gegen EU-Rechner validieren (Testfälle aus Forschung)

### Phase 5: Compliance & Deadlines
**Goal**: Kritische Termine werden automatisch eskaliert, Fortschritt berechnet sich selbst, und wiederkehrende Firmenpflichten sind sichtbar
**Depends on**: Phase 3, Phase 4
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05
**Success Criteria** (what must be TRUE):
  1. Aktionen die in weniger als 7 Tagen fällig und noch nicht abgehakt sind, werden im Dashboard visuell als dringend hervorgehoben
  2. Der Fortschrittsbalken zeigt automatisch den Anteil erledigter Aktionen — er bleibt nicht statisch auf einem Wert stehen
  3. Viktor kann eine kurze Notiz an jeden Zeitstrahl-Meilenstein anhängen, die nach Reload noch da ist
  4. Ein Compliance-Kalender zeigt die nächste Fälligkeit für LLC Annual Report (Wyoming), IHK-Beitrag und Berufshaftpflicht-Verlängerung
  5. Auf der Länderseite erscheint eine Warnung wenn Viktor sich >150 Tage in einem Land aufhält (Näherung: 183-Tage-Schwelle naht)
**Plans**: TBD

Plans:
- [ ] 05-01: Deadline-Warnungs-Banner in cmd.js (aggregiert aus Aktionsliste)
- [ ] 05-02: Auto-Fortschrittsbalken aus erledigten/offenen Aktionen
- [ ] 05-03: Milestone-Notizen (Supabase milestone_notes Tabelle + UI)
- [ ] 05-04: Compliance-Kalender (statische Firmenpflichten) + 183-Tage-Warnung

### Phase 6: Costs
**Goal**: Viktor sieht auf einen Blick was Einzelunternehmen, LLC und PT-Infrastruktur monatlich und jährlich kosten
**Depends on**: Phase 5
**Requirements**: COST-01, COST-02, COST-03
**Success Criteria** (what must be TRUE):
  1. Viktor kann einen laufenden Kosteneintrag erfassen (Firma, Bezeichnung, Betrag, Intervall: monatlich/jährlich/einmalig)
  2. Kosten werden nach Firma gruppiert angezeigt: Einzelunternehmen, LLC, PT-Infrastruktur jeweils separat
  3. Monatliche und jährliche Gesamtkosten werden korrekt berechnet (ohne Floating-Point-Fehler bei Cent-Beträgen)
**Plans**: TBD

Plans:
- [ ] 06-01: Supabase-Tabelle costs anlegen, db.js-Methoden, currency.js einbinden
- [ ] 06-02: views/costs.js — Erfassungs-UI, Gruppierung nach Firma, Summenberechnung

## Progress

**Execution Order:** 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation Fixes | 0/3 | Not started | - |
| 2. Code Structure | 0/3 | Not started | - |
| 3. Stay Log | 0/3 | Not started | - |
| 4. Schengen Calculator | 0/3 | Not started | - |
| 5. Compliance & Deadlines | 0/4 | Not started | - |
| 6. Costs | 0/2 | Not started | - |
