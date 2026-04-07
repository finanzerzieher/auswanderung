# Codebase Concerns

**Analysis Date:** 2026-04-07

## Security Issues

**Exposed Supabase API Key:**
- Issue: Anon-Schlüssel ist hardcoded in `db.js` als Plaintext und somit in der Git-Historie und im Browser sichtbar
- Files: `db.js` (Zeilen 5–6)
- Impact: Jeder mit Zugang zum Repository oder der Browserkonsole kann auf die Supabase-Datenbank schreiben/löschen. Dokument-Storage könnte missbraucht werden.
- Fix approach: 
  - Supabase-Schlüssel sofort in Supabase Console rotieren
  - Auf `.env`-Datei migrieren (`.env` in `.gitignore`)
  - Falls möglich: Row-Level Security (RLS) auf allen Tabellen aktivieren
  - Alternative: Backend-Proxy für Database-Operationen statt direkter Client-Zugriff

**No Environment Configuration:**
- Issue: Keine `.env`-Datei oder Umgebungsvariablen-Handling vorhanden
- Files: `db.js`
- Impact: Secrets können nicht sicher verwaltet werden; Deployment wird schwierig
- Fix approach: Build-Prozess aufsetzen (z.B. mit Vite/Webpack), der `.env` lädt und nur öffentliche Keys ins Bundle schreibt

## Architectural Issues

**Silent Failures in Database Operations:**
- Issue: Alle `catch`-Blöcke in `db.js` geben nur `console.warn()` aus und fallbacks zurück (leere Arrays, null, leere Objects). Keine visuellen Indikatoren für Benutzer.
- Files: `db.js` (Zeilen 29, 38, 53, 65, 88, 117, 125)
- Impact: Benutzer weiß nicht, ob Daten wirklich gespeichert wurden oder ob die Aktion fehlgeschlagen ist. Checkboxen könnten nicht persistent werden.
- Fix approach:
  - User-Facing Error-UI (Toast/Banner) für kritische Fehler
  - Retry-Logic für transiente Fehler (Network-Timeout)
  - Lokale Persistierung (LocalStorage) als Backup, bis Sync erfolgreich ist

**No Optimistic Updates:**
- Issue: Beim Klick auf eine Checkbox wird das UI nicht sofort aktualisiert; es wartet auf die async Supabase-Operation
- Files: `app.js` (Zeilen 140–149)
- Impact: Schlechte UX bei Netzwerklatenz; Benutzer sieht Verzögerung beim Abhaken
- Fix approach: UI sofort ändern, dann async speichern; Bei Fehler revert

**Keyword Matching for Document Classification:**
- Issue: `isDocPresent()` nutzt einfaches String-Matching auf Dateinamen. Kann zu Fehlern führen bei typos oder mehrdeutigen Dateinamen.
- Files: `app.js` (Zeilen 300–303)
- Impact: "Personalausweis" könnte nicht erkannt werden als "perso-scan.pdf"; Benutzer muss manuell zuordnen
- Fix approach: Fuzzy Matching (z.B. Levenshtein-Distance) oder explizite User-Zuordnung erzwingen vor Upload

## Data Integrity & State Management

**Hardcoded Dates in app.js:**
- Issue: Departure/Deregister/LLC-Termine sind als JS-Literals hardcoded (Zeilen 66–68)
- Files: `app.js` (Zeilen 66–68)
- Impact: Bei Änderung des Abflugdatums muss Code angepasst werden. Keine Single Source of Truth.
- Fix approach: Alle kritischen Daten in `data.js` oder Backend (Supabase-Tabelle) verlagern

**Stale Data on Load:**
- Issue: `renderDocuments()` wird sofort mit leeren Arrays aufgerufen (Zeile 549), dann asynchron geladen (Lines 309–314). Zwischen diesen beiden Calls können Inhalte flackern.
- Files: `app.js` (Zeilen 305–316, 549)
- Impact: UI zeigt kurz leere Liste, dann gefüllte Liste. Verwirrend für Benutzer.
- Fix approach: Erst rendern wenn lokale/Cache-Daten vorhanden sind, nicht mit leeren Default-Werten

**No Offline Support:**
- Issue: Keine Service Workers, kein LocalStorage-Fallback. App funktioniert nicht ohne Internet.
- Files: Alle drei `.js`-Dateien
- Impact: Wenn Netzwerk ausfällt, kann Benutzer Checkboxen nicht abhaken oder Dokumente nicht sehen
- Fix approach: LocalStorage-Cache für Action-States und Dokument-Metadaten

## Performance Concerns

**DOM-Rerendering on Every Action:**
- Issue: `renderCommandCenter()` (Zeilen 65–175) wird bei jedem Checkbox-Click neu aufgerufen und regeneriert das gesamte DOM
- Files: `app.js` (Zeilen 65–175)
- Impact: Mit vielen Actions wird das langsam; auch Event-Listener werden nicht wiederverwendet
- Fix approach: Nur betroffene Action-Item updaten statt komplette Re-render

**Large String Concatenation in Renders:**
- Issue: Alle Render-Funktionen nutzen Template-Strings mit großen HTML-Blöcken (`innerHTML = ...map...join`). Bei vielen Items (z.B. >100 Dokumente) wird das ineffizient.
- Files: `app.js` (Zeilen 65, 179, 198, 234, 305)
- Impact: Jede Änderung triggert Browser-Layout-Neuberechnungen
- Fix approach: Virtual Scrolling oder Pagination für lange Listen implementieren

## Data Validation & Type Safety

**No Input Validation on Upload:**
- Issue: Upload-Dialog nimmt jeden Dateinamen an, erlaubt beliebig lange Strings
- Files: `app.js` (Zeilen 461–540)
- Impact: Sehr lange Dateinamen können UI brechen oder Storage-Limits überschreiten
- Fix approach: Längenlimit (z.B. 255 Zeichen) validieren vor Upload

**No File Type Enforcement:**
- Issue: `accept="image/*,.pdf"` ist nur HTML-Validierung; Server-seitig wird nicht geprüft
- Files: `index.html` (Zeile 97)
- Impact: Datei-Typ kann gefälscht werden; Malware könnte hochgeladen werden
- Fix approach: Supabase Storage RLS + MIME-Type-Validierung auf Supabase Functions

**No File Size Limit:**
- Issue: Keine Größenlimit-Validierung vor Upload
- Files: `app.js` (Zeilen 442–540)
- Impact: Sehr große Dateien (z.B. 100MB Video) können hochgeladen werden und Storage-Quota überlasten
- Fix approach: Client-seitig vor Upload prüfen; Server-seitig in RLS durchsetzen

## Error Handling & Recovery

**Supabase Client Initialization Failure:**
- Issue: Wenn `supabase.createClient()` fehlschlägt (Line 10), ist `sb = null`. Alle `if (!sb) return` Checks geben leere Werte zurück.
- Files: `db.js` (Zeilen 9–14)
- Impact: App funktioniert nicht, aber Fehler ist nicht offensichtlich. Benutzer sieht einfach keine Daten.
- Fix approach: Visible Error-Banner zeigen wenn Supabase nicht erreichbar ist; Retry-Logic

**Keyboard Navigation Bugs:**
- Issue: Upload-Dialog hat Keyboard-Handler (Lines 430–433, 538–540), aber kein Escape-Handler außer im Input-Element
- Files: `app.js` (Zeilen 430–433, 538–540)
- Impact: Benutzer kann Dialog nicht mit Escape schließen wenn Input nicht fokussiert ist
- Fix approach: Overlay-Click außerhalb auch zum Schließen nutzen

## Documentation & Maintainability

**No Code Comments on Complex Logic:**
- Issue: `daysBetween()` Funktion nutzt hardcoded Millisekunden ohne Erklärung
- Files: `app.js` (Zeilen 11–14)
- Impact: Wartbarkeit schwach; nicht klar warum genau diese Rechnung
- Fix approach: JSDoc-Kommentare hinzufügen

**Inconsistent Naming:**
- Issue: `REQUIRED_DOCS` ist großgeschrieben (Konstante), aber `DATA`, `DB` auch. Schwer zu unterscheiden vom normalen Code.
- Files: `app.js` (Line 283), `data.js` (Line 6), `db.js` (Line 16)
- Impact: Lesbarkeit der Codebasis
- Fix approach: Namespace-Konvention etablieren: `window.DATA`, `window.DB`, etc.

## Data Schema Issues (Supabase)

**No Migrations Tracked:**
- Issue: Keine Migration-Files vorhanden; Tabellen-Schema ist nicht versioniert
- Files: Keine Migrations-Dateien im Repo
- Impact: Wenn Schema geändert wird, ist unklar welche Änderungen gemacht wurden oder wie Rollback geht
- Fix approach: Supabase Migrations CLI nutzen (`supabase migration new`)

**Missing Timestamps:**
- Issue: `action_states` und `doc_notes` Tabellen haben `updated_at`, aber `documents` Tabelle nutzt `uploaded_at`. Inkonsistent.
- Files: `db.js` (Zeilen 37, 63, 112)
- Impact: Schwer zu debuggen welche Datensätze veraltet sind
- Fix approach: Standardisiert `created_at` und `updated_at` auf allen Tabellen

## Test & Validation Coverage

**No Tests:**
- Issue: Kein Test-Framework, keine Unit- oder Integration-Tests
- Files: Alle `.js`-Dateien
- Impact: Refactoring ist riskant; Bugs entstehen leicht unbemerkt
- Fix approach: Minimal: Unit-Tests für `daysBetween()`, `formatDate()`, `isDocPresent()` mit vitest oder jest

**No Form Validation:**
- Issue: `docDialogName` Input wird nicht auf XSS-Anfälligkeit prüft; wird direkt ins HTML geschrieben
- Files: `app.js` (Zeilen 461–540)
- Impact: Wenn Dateiname `<img src=x onerror=alert('XSS')>` enthält, wird Code ausgeführt
- Fix approach: HTML-Escaping nutzen (z.B. `DOMPurify` oder `textContent` statt `innerHTML`)

---

*Concerns audit: 2026-04-07*
