# Codebase-Struktur

**Analysis-Datum:** 2026-04-07

## Verzeichnis-Layout

```
auswanderung/
├── .git/                 # Git-Repository (Versionskontrolle)
├── .interface-design/    # Interface-Design-Dokumentation
│   └── system.md         # Design-System (Farben, Spacing, etc.)
├── .planning/            # GSD-Planning-Verzeichnis
│   └── codebase/         # Codebase-Analyse-Dokumente (dieses Verzeichnis)
├── dateien/              # Archivierte/Referenz-PDFs
│   └── index*.pdf        # Dokumente (nicht im App-Workflow)
├── CLAUDE.md             # Projekt-Kontext und Regeln
├── index.html            # Einstiegs-HTML-Datei
├── app.js                # Applikationslogik & UI-Rendering
├── data.js               # Statische Daten & Konfiguration
├── db.js                 # Supabase Database Layer
└── style.css             # Globales Styling
```

## Verzeichnis-Zwecke

**Wurzel (Projektroot):**
- Purpose: Hosting-Ready SPA — alle Dateien direkt servierbar
- Contains: HTML, JS, CSS, Dokumentation
- Key Files: `index.html` (Entry Point), `CLAUDE.md` (Kontext)

**.interface-design/:**
- Purpose: Design-System-Dokumentation (separate vom Code)
- Contains: `system.md` mit Design-Tokens, Palette, Komponenten-Spezifikationen
- Generated: Nein (manuell gepflegt)
- Committed: Ja

**.planning/codebase/:**
- Purpose: GSD-Codebase-Analyse (ARCHITECTURE.md, STRUCTURE.md, etc.)
- Generated: Ja (von GSD-Mapper-Befehl)
- Committed: Ja (Version der Analyse)

**dateien/:**
- Purpose: Archiv-PDFs (nicht im Live-App-Workflow)
- Contains: PDF-Dateien (wahrscheinlich historische Dokumente)
- Generated: Nein
- Committed: Ja (GitLFS oder große Dateien — Vorsicht bei Größe)

## Schlüsseldatei-Lokationen

**Entry Points:**
- `index.html`: Browser lädt diese Datei → lädt JS/CSS → startet App

**Konfiguration & Daten:**
- `data.js`: Zentrale Datendefinition (Phasen, Meilensteine, Aktionen, Länder, Struktur, Dokumente)
- `CLAUDE.md`: Projekt-Kontext (Viktor's Situation, Timeline, Setup-Regeln)

**Applikationslogik:**
- `app.js`: Alle UI-Rendering, Event-Handler, State-Management, Upload-Dialog

**Backend-Integration:**
- `db.js`: Supabase Client & CRUD-Operationen

**Styling:**
- `style.css`: Globale Styles, Design-Tokens, Responsive Layout

## Naming-Konventionen

**Dateien:**
- `index.html`: Standard HTML-Entry-Point
- `*.js`: Camelcase für Datenquellen (`app.js`, `data.js`, `db.js`)
- `style.css`: Singular, globale Styles
- `.md`: Dokumentation

**Verzeichnisse:**
- `.` prefix: Hidden/Meta-Verzeichnisse (`.git`, `.interface-design`, `.planning`)
- Lowercase: Public-Verzeichnisse (`dateien`)

**Funktionen (in .js):**
- `renderX()`: Template-Rendering (renderCommandCenter, renderTimeline, etc.)
- `formatX()`: Datenformatierung (formatDate, formatFileSize, etc.)
- `daysBetween()`: Utility-Funktionen
- `showUploadDialog()`: UI-Dialog
- `DB.loadX()`, `DB.saveX()`: Supabase-Operationen
- `isDocPresent()`: Boolean-Check

**HTML-Klassen (in index.html & style.css):**
- `.view`, `.active`: Ansicht-Switcher
- `.action-item`, `.action-check`: Action-Auflistung
- `.country-card`: Länder-Grid
- `.doc-card`, `.doc-dialog`: Dokument-Management
- `.nav`, `.nav-link`: Navigation
- BEM-ähnliche Struktur: `.block-element-modifier`

**IDs (in index.html):**
- `view-*`: Sichtbare Inhalts-Bereiche (view-command-center, view-timeline, etc.)
- `current*`: Dynamische Anzeigeelemente (currentDate, currentPhaseBadge)
- `*Actions`, `*Items`: Listen-Container (nextActions, openItems)
- `docFileInput`: Form-Input

## Wo man neuen Code hinzufügt

**Neue View (neuer Tab):**

1. `index.html`: Neuer `<main class="view" id="view-NAME">` Block hinzufügen
2. `app.js`: 
   - Neue `renderNAME()` Funktion schreiben
   - In der IIFE aufrufen (Line 545-549)
   - Nav-Link Click-Handler wertet automatisch `data-view="NAME"` aus
3. `data.js`: Neue Dateien unter DATA.properties hinzufügen (wenn nötig)

**Neue Aktion/Meilenstein:**

1. `data.js`: Objekt in `DATA.actions` oder `DATA.milestones` hinzufügen
2. `app.js`: `renderCommandCenter()` oder `renderTimeline()` reads automatisch und renders

**Neue Länder-Regel:**

1. `data.js`: Neues Objekt in `DATA.countries` hinzufügen
2. `renderCountries()` rendered automatisch

**Neue Dokument-Kategorie:**

1. `app.js`: Neues Objekt in `DOC_CATEGORIES` hinzufügen (Line 274-281)
2. `renderDocuments()` nutzt diese Liste für Filter

**Neue Supabase-Tabelle:**

1. `db.js`: Neue Funktionen schreiben (z.B. `DB.loadX()`, `DB.saveX()`)
2. `app.js`: In render-Funktionen aufrufen

**Styling für neue Komponenten:**

1. `style.css`: Neue `.component-class` Rules hinzufügen
2. Design-Tokens verwenden (--passport, --amber, --sp-4, etc.)
3. Mobile-first responsive

## Spezielle Verzeichnisse

**.git/:**
- Purpose: Version-Control-Metadaten
- Generated: Automatisch von `git init`
- Committed: Ja (nur Refs, nicht große Dateien)

**dateien/:**
- Purpose: Archivierte Dokumente
- Generated: Nein (manuell hinzugefügt)
- Committed: Ja — aber achten auf Dateigröße (GitLFS erwägen bei >100MB)

---

*Struktur-Analyse: 2026-04-07*
