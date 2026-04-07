# Auswanderung — Design System

## Direction
Reisedokument-Ästhetik: warm, persönlich, präzise. Wie das Notizbuch eines erfahrenen Reisenden. Nicht kalt-technisch, nicht verspielt.

## Palette
- **Surface base:** `#f4f0e8` (Pergament)
- **Surface raised:** `#f8f5ef`
- **Surface overlay:** `#faf8f3`
- **Surface inset:** `#eee9df`
- **Ink primary:** `#1a1a17`
- **Ink secondary:** `#5c5a52`
- **Ink tertiary:** `#8a877d`
- **Ink muted:** `#b0ada5`
- **Accent (Passport):** `#1e3a5f`
- **Amber (Warning):** `#c47f17`
- **Burgundy (Critical):** `#7a2e3a`
- **Green (Success):** `#3d7a4a`

## Depth
Borders-only with `rgba` transparency. No shadows. Sachlich wie Linien im Reisepass.
- `--border: rgba(26, 26, 23, 0.1)`
- `--border-soft: rgba(26, 26, 23, 0.06)`
- `--border-emphasis: rgba(26, 26, 23, 0.18)`

## Typography
Inter — klar, sachlich. Tabular nums für Countdowns und Daten.
- Headlines: 22px / 700 / tracking -0.02em
- Section titles: 11px / 600 / uppercase / tracking 0.08em
- Body: 13–14px / 400–500
- Data: tabular-nums

## Spacing
8px base unit. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

## Border Radius
- Small (inputs, buttons, tags): 4px
- Medium (cards): 6px
- Large (modals): 10px

## Signature
Aufenthalts-Countdowns — die unsichtbare Uhr sichtbar machen. Große Tabular-Nums-Zahlen mit Farbcodierung (calm/warning/urgent).

## Key Patterns
- **Countdown card:** Label top, big number, unit below, detail line with border-top
- **Action item:** Checkbox + title + meta row (date + tag) + optional dependency italic
- **Checklist item:** Icon circle + name/note + edit button (hover) + status badge
- **Country card:** Flag + name header, stay-bar with fill color, rules as label/value rows
- **Timeline:** Vertical line with dots (completed/active/upcoming), date + title + desc + deps
- **Structure card:** Title + subtitle + label/value rows with soft border separators

## States
- Tags: `.critical` (burgundy), `.warning` (amber), `.info` (passport blue)
- Progress fills: passport blue, green when complete
- Checklist: `.present` (green icon + badge), `.missing` (amber badge)
