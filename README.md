# 📅 Wochenplan App

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![Offline](https://img.shields.io/badge/Offline-Ready-green?style=flat)
![No Dependencies](https://img.shields.io/badge/Dependencies-None-blue?style=flat)

Eine intelligente HTML/JavaScript-basierte Anwendung zur wöchentlichen Planung von Kinderaktivitäten mit automatischer Terminoptimierung.

## 🚀 Schnellstart

1. 📂 `wochenplan.html` direkt im Browser öffnen (Doppelklick)
2. 🎯 Altersgruppe wählen und "🤖 Plan erstellen" klicken
3. ✨ Plan nach Bedarf anpassen per Drag & Drop

**✅ Keine Installation oder Webserver erforderlich** - funktioniert vollständig offline!

## 📋 Features

### ✨ Intelligenter Auto-Fill-Algorithmus
- 👶 **Altersgerechte Planung:** Automatische Wochenpläne für 6-10, 11-14, 15-18 Jahre
- ⏰ **Realistische Zeitverteilung:** Schule → Hausaufgabenbetreuung/AG → Hausaufgaben → Hobbys
- 🔒 **Konfliktlösung:** Verhindert Überschneidungen und unmögliche Kombinationen
- 🎵 **Instrumentauswahl:** Nur ein Instrument pro Kind (Klavier, Trompete oder Saxophon)

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
- 🖱️ **Drag & Drop:** Zeitblöcke einfach verschieben und skalieren
- 🔍 **Resize-Handles:** Blockdauer durch Ziehen anpassen
- 🚫 **Kollisionserkennung:** Überlappungen werden verhindert
- 🎨 **Farbkodierung:** Musikalische Aktivitäten einheitlich lila (#9b59b6)
- 💡 **Tooltips:** Beschreibende Texte beim Hover über Aktivitäten
- 📱 **Responsive Design:** Funktioniert auf Desktop und Tablet
- 🔤 **Alphabetische Sortierung:** Aktivitätenliste übersichtlich sortiert

### 💾 Datenmanagement
- 💿 **LocalStorage:** Alle Änderungen werden automatisch im Browser gespeichert
- 📥 **Export/Import:** Pläne als JSON-Dateien speichern und laden
- 📋 **Plan-Verwaltung:** Mehrere benannte Pläne verwalten
- 🔄 **Auto-Migration:** Aktivitäten werden automatisch aktualisiert

## 🔧 Einstellungen

Über **⚙️ Einstellungen** können Sie anpassen:

- 🌅 **Tagesstart:** Wann der Kalender beginnt (z.B. 06:00)
- 🌙 **Tagesende:** Wann der Kalender endet (z.B. 22:00)
- ⏰ **Zeitraster:** Präzision in 5-30 Minuten Schritten

## 🤖 Auto-Fill Intelligenz

### 📅 Realistische Tagesabläufe
Der Auto-Fill-Algorithmus erstellt realistische Wochenpläne:

**Typischer Schultag:**
- 🏫 08:00-13:00: Schule
- 👩‍🏫 13:30-15:00: Hausaufgabenbetreuung ODER 🎨 AG
- 📚 15:30-16:30: Hausaufgaben (nur ohne Betreuung)
- 🎼 17:00-18:00: Musikunterricht (falls vorhanden)
- 🎹 18:30-19:00: Instrument üben

### 🧠 Intelligente Regeln
- 🚫 **Keine Doppelbelegung:** Hausaufgaben und Hausaufgabenbetreuung schließen sich aus
- 🎵 **Nur ein Instrument:** System wählt automatisch Klavier, Trompete oder Saxophon
- ⏸️ **Realistische Pausen:** 15-30 Minuten zwischen Aktivitäten
- 📏 **Altersgerechte Dauer:** Längere Schulzeiten für ältere Kinder

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
- 📄 **Single File:** Gesamte App in einer HTML-Datei
- 🎨 **Optimiert:** Keine redundanten CSS-Klassen, generische Hilfsfunktionen

## 📖 Bedienung

### 📝 Neuen Plan erstellen
1. 🆕 **Neuer Plan** klicken
2. ✍️ Plan-Namen eingeben
3. 🎯 Altersgruppe wählen und **🤖 Plan erstellen**

### ✏️ Plan anpassen
- 🖱️ **Drag & Drop:** Blöcke mit der Maus verschieben
- 🔍 **Resize:** Blockränder ziehen zum Anpassen der Dauer
- ❌ **Löschen:** ×-Button auf Zeitblöcken (erscheint beim Hover)
- ➕ **Neue Aktivitäten:** Aus der Sidebar ziehen
- ✏️ **Aktivität bearbeiten:** Stift-Symbol in der Aktivitätenliste
- 🗑️ **Aktivität löschen:** Papierkorb-Symbol in der Aktivitätenliste

### 💾 Plan speichern/laden
- 💾 **Wochenplan speichern:** JSON-Datei herunterladen
- 📂 **Wochenplan laden:** JSON-Datei auswählen

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

## 📄 JSON-Format

```json
{
  "title": "Mein Wochenplan",
  "activities": [
    {
      "name": "Schule",
      "color": "#9b59b6",
      "description": "Der reguläre Schulunterricht..."
    }
  ],
  "schedule": {
    "monday": [
      {
        "activity": "Schule",
        "startTime": "08:00",
        "duration": 300
      }
    ]
  }
}
```

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
