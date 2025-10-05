# 📅 Wochenplan App

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![Offline](https://img.shields.io/badge/Offline-Ready-green?style=flat)
![No Dependencies](https://img.shields.io/badge/Dependencies-None-blue?style=flat)

Eine intelligente HTML/JavaScript-basierte Anwendung zur wöchentlichen Planung von Kinderaktivitäten mit automatischer Terminoptimierung.

## 🚀 Schnellstart

1. 📂 `wochenplan.html` direkt im Browser öffnen (Doppelklick)
2. 🎯 "📋 Neuen Plan erstellen" oder "📂 Vorhandenen Plan laden" wählen
3. 🎯 Altersgruppe wählen und "🤖 Plan erstellen" klicken
4. ✨ Plan nach Bedarf anpassen per Drag & Drop

**✅ Keine Installation oder Webserver erforderlich** - funktioniert vollständig offline!

## 📋 Features

### ✨ Intelligenter Auto-Fill-Algorithmus (Vereinfacht & Optimiert)
- 👶 **Altersgerechte Planung:** Automatische Wochenpläne für 6-10, 11-14, 15-18 Jahre
- 📚 **5 Kern-Aktivitäten:** Schule, Hausaufgaben, Üben, Sport, ein zufälliges Musikinstrument
- 📊 **Offizielle Empfehlungen:** Basierend auf Kultusministerium, WHO und Lerntherapie-Experten
- 🔒 **Kollisionserkennung:** Verhindert Überschneidungen und Doppelbelegungen
- 🎵 **Instrumentauswahl:** Zufällige Wahl zwischen Klavier, Trompete oder Saxophon
- ✅ **Balance-Validator:** Zeigt Erfüllungsgrad der Wochenziele an

### 🎯 Aktivitäten-Management
**16 vordefinierte Aktivitäten mit Beschreibungen:**
- 🏫 **Schule:** Der reguläre Schulunterricht mit allen Fächern
- 📚 **Hausaufgaben:** Zeit für Schulaufgaben und Lernen für Tests
- 👩‍🏫 **Hausaufgabenbetreuung:** Betreute Hausaufgabenhilfe (alternativ zu AG)
- 🎨 **AG:** Arbeitsgemeinschaft - Sport, Basteln, Computer etc.
- 🎼 **Musikunterricht:** Klavier-, Trompeten- oder Saxophonunterricht (einheitlich lila)
- 🎹 **Instrument üben:** Zuhause üben der gelernten Stücke (einheitlich lila)
- ⚽ **Sport:** Sportverein - Fußball, Turnen, Schwimmen etc.
- 👫 **Freunde:** Zeit mit Freunden verbringen
- 🎮 **Freizeit:** Eigene Zeit für Hobbys und Entspannung
- 🐶 **Haustier:** Sich um die Haustiere kümmern - füttern, Gassi gehen, spielen
- 👵 **Oma besuchen:** Großeltern besuchen - zusammen spielen und Kuchen essen
- 📖 **Üben:** Extra lernen für die Schule

### ⚙️ Konfigurierbare Einstellungen
- ⏱️ **Flexibles Zeitraster:** 5, 10, 15 oder 30 Minuten
- 🕐 **Anpassbare Tageszeiten:** Start- und Endzeit frei wählbar
- 🔄 **Automatische Anpassung:** Kalender passt sich sofort an neue Einstellungen an

### 🎨 Benutzerfreundliche Oberfläche
- 👋 **Welcome Screen:** Professioneller Startbildschirm mit Beschreibung und klaren Optionen
- 🏠 **Logo-Navigation:** Zurück zum Startbildschirm über Logo-Button
- 📌 **Sticky Navigation:** Header, Buttons und Wochentagnamen bleiben beim Scrollen sichtbar
- 📜 **Natürliches Scrolling:** Flüssiges Seitenscrolling mit fixierten Navigationselementen
- 🖱️ **Drag & Drop:** Zeitblöcke einfach verschieben und skalieren
- 🔍 **Resize-Handles:** Blockdauer durch Ziehen anpassen
- 🚫 **Kollisionserkennung:** Überlappungen werden verhindert
- 🎨 **Farbkodierung:** Musikalische Aktivitäten einheitlich lila (#9b59b6)
- 💡 **Tooltips:** Beschreibende Texte beim Hover über Aktivitäten
- 📱 **Responsive Design:** Funktioniert perfekt auf Desktop, Tablet und Mobile
- 🔤 **Alphabetische Sortierung:** Aktivitätenliste übersichtlich sortiert
- 🎨 **Custom Scrollbars:** Elegant gestylte Scrollbalken in Kalender und Sidebar
- ✨ **Smooth Scrolling:** Sanfte Scroll-Animationen für bessere UX

### 💾 Datenmanagement
- 💿 **LocalStorage:** Alle Änderungen werden automatisch im Browser gespeichert
- 📋 **Plan-Verwaltung:** Mehrere benannte Pläne gleichzeitig im Browser speichern und verwalten
- 💾 **Speichern/Laden:** Intuitive Dialoge für schnellen Zugriff auf gespeicherte Pläne
- 📥 **Export/Import:** Pläne als JSON-Dateien für Backup und Teilen exportieren/importieren
- 🔄 **Auto-Migration:** Aktivitäten werden automatisch aktualisiert
- 📅 **Zeitstempel:** Zeigt Erstellungs- und Änderungsdatum für jeden Plan

## 🔧 Einstellungen

Über **⚙️ Einstellungen** können Sie anpassen:

- 🌅 **Tagesstart:** Wann der Kalender beginnt (z.B. 06:00)
- 🌙 **Tagesende:** Wann der Kalender endet (z.B. 22:00)
- ⏰ **Zeitraster:** Präzision in 5-30 Minuten Schritten

## 🤖 Auto-Fill Intelligenz (Vereinfachter Algorithmus)

### 📅 Was wird automatisch platziert?
Der Auto-Fill erstellt ein **Grundgerüst** mit 5 Kern-Aktivitäten:

**Automatisch platziert:**
- 🏫 **Schule** (Mo-Fr, 08:00): 5-7 Std je nach Alter
- 📚 **Hausaufgaben** (Mo-Fr, nach Schule): 45/90/120 Min (Kultusministerium-Empfehlung)
- 📖 **Üben** (Mo-Fr): 10/15/20 Min täglich (Lerntherapie-Empfehlung)
- ⚽ **Sport** (2-3× pro Woche): 180/180/270 Min (Sportverein-Praxis)
- 🎼 **Musikinstrument** (1× Unterricht + täglich Üben): Zufällig Klavier, Trompete oder Saxophon

**Manuell hinzufügen:**
- 🎨 AG, 👩‍🏫 Hausaufgabenbetreuung, 👫 Freunde, 👵 Oma besuchen, 🐶 Haustier, 🎮 Freizeit

### 🧠 Intelligente Regeln
- 🔒 **Kollisionsprüfung:** Keine Überlappungen möglich
- 🎵 **Ein Instrument:** System wählt zufällig zwischen 3 Instrumenten
- 📊 **Balance-Validator:** Zeigt Erfüllungsgrad der Wochenziele (Konsole)
- ⏰ **Keine Aktivitäten vor Schule:** Validierung verhindert Platzierung vor 08:00
- 📏 **Altersgerechte Zeiten:** Basiert auf offiziellen Empfehlungen

### 📊 Offizielle Empfehlungen (im Auto-Fill-Modal verlinkt)
- **Hausaufgaben** (Kultusministerium): 6-10 Jahre: 30-45 Min, 11-14 Jahre: 60-90 Min, 15-18 Jahre: 90-120 Min
- **Extra Üben** (Lerntherapie): 6-10 Jahre: 10 Min, 11-14 Jahre: 15 Min, 15-18 Jahre: 20 Min täglich
- **Sportverein** (Praxis Deutschland): 2× pro Woche (6-14 Jahre), 3× pro Woche (15-18 Jahre) - je 90 Min
- **Musikinstrument**: 10-20 Min (Grundschule), 20-30 Min (Mittelstufe), 30-45 Min (Oberstufe) täglich

## 🌐 Browser-Kompatibilität

- 🟢 **Chrome/Chromium** 60+
- 🟠 **Firefox** 55+
- 🔵 **Safari** 12+
- 🟣 **Microsoft Edge** 79+

## 🛠 Technische Details

- ⚡ **Keine Abhängigkeiten:** Vanilla JavaScript, HTML5, CSS3
- 📡 **Offline-fähig:** Funktioniert ohne Internetverbindung
- 🔧 **Modern APIs:** Drag & Drop, LocalStorage, File API, Blob API
- 📐 **CSS Grid:** Responsive Kalender-Layout mit dynamischen Zeilen
- 📄 **Modular:** HTML, CSS und JavaScript getrennt für bessere Wartbarkeit
- 🎨 **Optimiert:** Keine redundanten CSS-Klassen, generische Hilfsfunktionen
- 📌 **Sticky Positioning:** Moderne CSS-Technik für fixierte Navigation
- 🎯 **Z-Index-Hierarchie:** Korrekte Überlagerung von UI-Elementen beim Scrollen
- 📱 **Mobile-First:** Responsive mit 3 Breakpoints (1024px, 768px, 480px)

## 📖 Bedienung

### 📝 Neuen Plan erstellen
1. 👋 Beim ersten Start erscheint der **Welcome Screen** mit App-Beschreibung
2. 🆕 **"📋 Neuen Plan erstellen"** klicken (vom Welcome Screen oder über "Neuer Plan" Button)
3. ✍️ Plan-Namen eingeben
4. 🎯 Altersgruppe wählen und **🤖 Plan erstellen**
5. 📚 Empfehlungs-Links beachten (Hausaufgaben, Sport, Üben)
6. ➕ Weitere Aktivitäten manuell per Drag & Drop hinzufügen
7. 🏠 Über das Logo-Symbol oben links zurück zum Welcome Screen navigieren

### ✏️ Plan anpassen
- 🖱️ **Drag & Drop:** Blöcke mit der Maus verschieben
- 🔍 **Resize:** Blockränder ziehen zum Anpassen der Dauer
- ❌ **Löschen:** ×-Button auf Zeitblöcken (erscheint beim Hover)
- ➕ **Neue Aktivitäten:** Aus der Sidebar ziehen
- ✏️ **Aktivität bearbeiten:** Stift-Symbol in der Aktivitätenliste
- 🗑️ **Aktivität löschen:** Papierkorb-Symbol in der Aktivitätenliste

### 💾 Plan speichern/laden
- 💾 **Speichern:** Plan direkt im Browser speichern - Dialog öffnet sich, Namen eingeben, fertig!
  - Bestehende Pläne können unter demselben Namen überschrieben werden
  - Warnung erscheint bei bereits existierenden Plan-Namen
  - Erstellungs- und Änderungsdatum werden automatisch gespeichert
- 📂 **Laden:** Übersichtliche Liste aller gespeicherten Pläne
  - Zeigt Plan-Name und letztes Änderungsdatum
  - Ein Klick zum Laden
  - Löschen-Button für nicht mehr benötigte Pläne
- 📤 **Export:** Plan als JSON-Datei herunterladen (für Backup oder Teilen)
- 📥 **Import:** JSON-Datei von Computer oder anderen Quellen laden

## 🆘 Problemlösung

### ❓ Problem: Neue Aktivitäten werden nicht angezeigt
**✅ Lösung:** Browser-Cache leeren (Strg+Shift+R) oder die Seite neu laden (F5)

### ❓ Problem: Drag & Drop funktioniert nicht
**✅ Lösung:** Modernen Browser verwenden (Chrome, Firefox, Safari, Edge)

### ❓ Problem: Einstellungen werden nicht gespeichert
**✅ Lösung:** Cookies/LocalStorage für die Seite aktivieren

### ❓ Problem: Auto-Fill erstellt keine Blöcke
**✅ Lösung:** Browser-Konsole öffnen (F12) und Fehlermeldungen prüfen

### ❓ Problem: "Oma" heißt nicht "Oma besuchen"
**✅ Lösung:** Seite neu laden - Auto-Migration aktualisiert Aktivitätennamen automatisch

## 📄 JSON-Format (Export/Import)

```json
{
  "name": "Mein Wochenplan",
  "created": "2025-10-06T12:00:00.000Z",
  "activities": [
    {
      "name": "Schule",
      "color": "#5a6c7d",
      "description": "Der reguläre Schulunterricht mit allen Fächern"
    }
  ],
  "schedule": {
    "block-123": {
      "id": "block-123",
      "day": "monday",
      "timeIndex": 48,
      "activity": {
        "name": "Schule",
        "color": "#5a6c7d",
        "description": "Der reguläre Schulunterricht mit allen Fächern"
      },
      "duration": 300
    }
  }
}
```

**Hinweis:** Das LocalStorage-Format kann leicht abweichen, da dort zusätzlich `lastModified` und `blockRegistry` gespeichert werden.

## 🎯 Zielgruppe

Diese App ist ideal für:

- 👨‍👩‍👧 **Eltern:** Strukturierte Wochenplanung für Kinder
- 👨‍🏫 **Lehrer:** Visualisierung von Schülerterminen
- 👧 **Kinder:** Verständliche Darstellung ihrer Woche
- 🏢 **Betreuungseinrichtungen:** Optimierte Zeitpläne

---

**✨ Entwickelt für eine bessere Work-Life-Balance von Familien** 👨‍👩‍👧‍👦

![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=flat)
![Offline First](https://img.shields.io/badge/Offline-First-green?style=flat)
