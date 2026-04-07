# Architektur

**Analysis-Datum:** 2026-04-07

## Pattern-Übersicht

**Gesamtmuster:** Client-Side Single Page Application (SPA) mit Supabase Backend

**Charakteristiken:**
- Vanilla JavaScript (keine Framework-Dependencies außer Supabase SDK)
- Modularisierung durch drei dedizierte JS-Dateien
- Deklarative Daten-getriebene Rendering-Pipeline
- Asynchrone Persistenz ohne Blocking der UI
- Responsive Grid-basiertes Layout (CSS)

## Schichten

**Präsentationsschicht (UI & DOM):**
- Purpose: Rendering aller Views und Interaktionen
- Location: `index.html`, `style.css`, `app.js` (renderX-Funktionen)
- Contains: Navigation, View-Management, Event-Listener, HTML-Templating
- Depends on: Daten aus `DATA` und Persisted State aus `DB`
- Used by: Browser-Event-System

**Datenschicht (Application State):**
- Purpose: Zentrale Quelle für alle statischen und dynamischen Daten
- Location: `data.js`
- Contains: Phasen, Meilensteine, Aktionen, Länder, Firmenstruktur, Dokumente
- Depends on: Nichts (reine Daten)
- Used by: `app.js` für Rendering

**Persistenzschicht (Cloud Storage):**
- Purpose: Speicherung von Benutzerstate in Supabase (asynchron, non-blocking)
- Location: `db.js`
- Contains: Supabase Client-Initialisierung, CRUD für action_states, doc_notes, documents
- Depends on: Supabase HTTP API (extern)
- Used by: `app.js` beim Init (loadCompleted), bei Interaktionen (saveCompleted) und Document-Management (uploadDoc, deleteDoc)

## Datenfluss

**View-Rendering (Initial + User Interaction):**

1. App initialisiert → renderCommandCenter(), renderTimeline(), renderCountries(), renderStructure(), renderDocuments()
2. Diese Funktionen lesen DATA und bauen HTML-Strings (Template-Strings mit .map())
3. DOM wird mit .innerHTML aktualisiert
4. Event-Listener werden an neue DOM-Elemente gehängt
5. User interagiert (Checkbox klick, Datei-Upload, etc.)
6. Handler-Callback aktualisiert DATA und ruft DB.saveX() asynchron auf
7. Nach Speicherung: Neu-Render aufrufen

**Beispiel-Ablauf (Action abmachen):**
```
User klickt .action-check
→ Click-Handler in renderCommandCenter()
→ action.completed = !action.completed
→ DB.saveCompleted(id, completed) async → Supabase
→ renderCommandCenter() erneut
→ DOM wird mit neuem State aktualisiert
```

**State Management:**

- **Client-Memory:** DATA-Objekt (alle Termine, Aufgaben, Länder-Infos)
- **Persisted State:** Supabase Tables:
  - `action_states`: { id, completed, updated_at }
  - `doc_notes`: { id, note, updated_at }
  - `documents`: { id, name, category, file_type, file_size, storage_path, uploaded_at }
- **Storage:** Supabase `documents` Bucket für Datei-Uploads

**Init-Sequenz:**
1. HTML lädt style.css, data.js, db.js, app.js
2. `data.js` definiert globales DATA-Objekt
3. `db.js` initialisiert Supabase-Client
4. `app.js` IIFE startet:
   - Ruft alle render-Funktionen auf (instant mit DATA)
   - Lädt asynchron persisted state (action_states, doc_notes)
   - Mergt persisted state in DATA
   - Rerenderiert, falls Änderungen vorhanden
   - Bindet Event-Listener an

## Schlüssel-Abstraktionen

**Render-Funktionen:**
- Purpose: Deklarative Umwandlung von DATA → DOM
- Examples: `renderCommandCenter()`, `renderTimeline()`, `renderCountries()`, `renderStructure()`, `renderDocuments()`
- Pattern: Lesen DATA → HTML-Template-String mit .map() → innerHTML setzen → Event-Listener hinzufügen

**DB-Funktionen:**
- Purpose: Asynchrone Supabase-Operationen mit Error-Handling
- Examples: `DB.loadCompleted()`, `DB.saveCompleted()`, `DB.loadDocs()`, `DB.uploadDoc()`, `DB.deleteDoc()`
- Pattern: Try-catch wrapper um Supabase-Client-Calls → Fallbacks bei Offline

**Helfer-Funktionen:**
- Purpose: Utilitäten für Datenformatierung und Logik
- Examples: `daysBetween()`, `formatDate()`, `formatDateLong()`, `formatFileSize()`, `isDocPresent()`
- Pattern: Reine Funktionen, keine Seiteneffekte

## Entry Points

**HTML-Seite:**
- Location: `index.html`
- Triggers: Browser öffnet URL
- Responsibilities: DOM-Struktur, Meta-Tags, Script-Loading

**App-IIFE:**
- Location: `app.js` Line 5 (anonyme selbst-ausführende Funktion)
- Triggers: Wird beim Script-Load ausgeführt
- Responsibilities: Alle UI-Rendering, Event-Listener, State-Management

**View-Navigation:**
- Location: `app.js` Line 47-56 (nav-link Click-Handler)
- Triggers: User klickt Nav-Link
- Responsibilities: View switching via .active class Manipulation

## Error-Handling

**Strategie:** Graceful Degradation — kein Blocking bei Supabase-Fehler

**Patterns:**

- **DB-Fehler:** `try-catch` mit `console.warn()` + Rückgabewert (empty array/object), Rendering setzt fort mit lokalen Daten
  - Beispiel: `loadCompleted()` gibt `{}` zurück wenn Fehler → action_states lokal als uncompleted behandelt
  
- **Upload-Fehler:** `console.warn()` + keine Datei in UI → Benutzer kann erneut versuchen
  
- **Supabase-Init-Fehler:** `sb = null` → alle DB-Operationen skipp sich selbst (`if (!sb) return`)

- **Fehlende Daten:** `.find()` auf undefined checken mit `if (action)` bevor zugegriffen

## Querschnittliche Concerns

**Logging:** `console.log()` im Init + `console.warn()` bei Fehlern (keine structured logging)

**Validierung:** 
- File-Type-Check in Upload (`accept="image/*,.pdf"`)
- Category-Dropdown constrains Werte
- Name-Trimming und Fallback auf Original-Filename

**Authentifizierung:** 
- Keine Auth — Supabase-Anon-Key public
- Row-Level-Security (RLS) muss in Supabase konfiguriert sein (nicht im Code)
- Assumption: Datenbank Public-Read/Write oder geschützt via RLS

---

*Architektur-Analyse: 2026-04-07*
