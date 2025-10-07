// ========================================
// ACCESSIBILITY & SCREEN-READER SUPPORT
// ========================================
// ARIA-Labels, Live-Regions, Screen-Reader-Announcements
// WCAG 2.1 AA/AAA Compliance

/**
 * Screen-Reader-Announcer-Klasse
 * Verwaltet ARIA-Live-Region für Announcements
 */
class ScreenReaderAnnouncer {
    constructor() {
        this.liveRegion = null;
        this.init();
    }

    init() {
        // Live-Region erstellen falls nicht vorhanden
        this.liveRegion = document.getElementById('screen-reader-announcements');

        if (!this.liveRegion) {
            this.liveRegion = document.createElement('div');
            this.liveRegion.id = 'screen-reader-announcements';
            this.liveRegion.setAttribute('role', 'status');
            this.liveRegion.setAttribute('aria-live', 'polite');
            this.liveRegion.setAttribute('aria-atomic', 'true');
            this.liveRegion.className = 'sr-only';
            document.body.appendChild(this.liveRegion);
        }
    }

    /**
     * Announcement für Screen-Reader
     * @param {string} message - Die anzusagende Nachricht
     * @param {string} priority - 'polite' (Standard) oder 'assertive' (dringend)
     */
    announce(message, priority = 'polite') {
        // Live-Region leeren
        this.liveRegion.textContent = '';

        // Priorität setzen
        this.liveRegion.setAttribute('aria-live', priority);

        // Kurze Verzögerung, damit Screen-Reader die Änderung erkennt
        setTimeout(() => {
            this.liveRegion.textContent = message;
        }, 100);

        // Nach 5 Sekunden leeren
        setTimeout(() => {
            this.liveRegion.textContent = '';
        }, 5000);
    }
}

// Globale Instanz
const screenReaderAnnouncer = new ScreenReaderAnnouncer();

/**
 * Shortcut-Funktion für Screen-Reader-Announcements
 * @param {string} message - Die anzusagende Nachricht
 * @param {string} priority - 'polite' oder 'assertive'
 */
function announceToScreenReader(message, priority = 'polite') {
    screenReaderAnnouncer.announce(message, priority);
}

/**
 * ARIA-Labels für die gesamte Anwendung setzen
 * Wird in init() aufgerufen
 */
function setupAriaLabels() {
    // Haupt-Navigation
    const nav = document.querySelector('.controls');
    if (nav) {
        nav.setAttribute('role', 'navigation');
        nav.setAttribute('aria-label', 'Hauptnavigation');
    }

    // Kalender-Container
    const calendar = document.querySelector('.calendar');
    if (calendar) {
        calendar.setAttribute('role', 'application');
        calendar.setAttribute('aria-label', 'Wochenplan-Kalender');
        calendar.setAttribute('aria-describedby', 'calendar-instructions');

        // Unsichtbare Anleitung für Screen-Reader
        let instructions = document.getElementById('calendar-instructions');
        if (!instructions) {
            instructions = document.createElement('div');
            instructions.id = 'calendar-instructions';
            instructions.className = 'sr-only';
            instructions.textContent = 'Nutzen Sie Tab und Pfeiltasten zur Navigation. Entf zum Löschen. Strg+Z zum Rückgängig machen.';
            calendar.appendChild(instructions);
        }
    }

    // Aktivitäten-Liste
    const activitiesList = document.getElementById('activitiesList');
    if (activitiesList) {
        activitiesList.setAttribute('role', 'list');
        activitiesList.setAttribute('aria-label', 'Verfügbare Aktivitäten');
    }

    // Kalender-Grid
    const calendarGrid = document.getElementById('calendarGrid');
    if (calendarGrid) {
        calendarGrid.setAttribute('role', 'grid');
        calendarGrid.setAttribute('aria-label', 'Wochenplan-Raster');
        calendarGrid.setAttribute('aria-rowcount', timeSlots ? timeSlots.length : 'unknown');
        calendarGrid.setAttribute('aria-colcount', '8'); // Zeit + 7 Tage
    }

    // Buttons
    document.querySelectorAll('button').forEach(button => {
        if (!button.hasAttribute('aria-label') && !button.textContent.trim()) {
            // Buttons ohne Text bekommen Label aus benachbartem Text oder class
            const label = inferAriaLabelForButton(button);
            if (label) {
                button.setAttribute('aria-label', label);
            }
        }
    });

    console.log('ARIA-Labels wurden initialisiert');
}

/**
 * ARIA-Attribute für einen Block-Element setzen/aktualisieren
 * @param {HTMLElement} blockElement - Das Block-DOM-Element
 * @param {Object} blockData - Das Block-Daten-Objekt
 */
function updateAriaForBlock(blockElement, blockData) {
    if (!blockElement || !blockData) return;

    const startTime = calculateStartTime(blockData);
    const endTime = calculateEndTime(blockData);
    const dayName = getDayNameInGerman(blockData.day);

    // ARIA-Label mit vollständiger Information
    const ariaLabel = `${blockData.activity.name}, ${dayName}, ${startTime} bis ${endTime}, ${blockData.duration} Minuten. ${blockData.activity.description || ''}`;
    blockElement.setAttribute('aria-label', ariaLabel);

    // Role
    blockElement.setAttribute('role', 'button');
    blockElement.setAttribute('tabindex', '0');

    // Drag & Drop ARIA
    blockElement.setAttribute('aria-grabbed', 'false');

    // Zusätzliche Beschreibung
    if (blockData.activity.description) {
        blockElement.setAttribute('aria-describedby', `desc-${blockData.id}`);

        // Versteckte Beschreibung
        let descElement = document.getElementById(`desc-${blockData.id}`);
        if (!descElement) {
            descElement = document.createElement('div');
            descElement.id = `desc-${blockData.id}`;
            descElement.className = 'sr-only';
            descElement.textContent = blockData.activity.description;
            blockElement.appendChild(descElement);
        }
    }
}

/**
 * ARIA-Attribute für Kalender-Zellen setzen
 */
function updateAriaForCalendarCells() {
    const cells = document.querySelectorAll('.calendar-cell');

    cells.forEach(cell => {
        const day = cell.dataset.day;
        const time = cell.dataset.time;
        const timeIndex = cell.dataset.timeIndex;

        if (day && time) {
            const dayName = getDayNameInGerman(day);
            cell.setAttribute('role', 'gridcell');
            cell.setAttribute('aria-label', `${dayName}, ${time}`);
            cell.setAttribute('tabindex', '-1');
        }
    });
}

/**
 * Announcement beim Hinzufügen eines Blocks
 */
function announceBlockAdded(block) {
    const dayName = getDayNameInGerman(block.day);
    const startTime = calculateStartTime(block);
    const message = `${block.activity.name} hinzugefügt am ${dayName} um ${startTime}, ${block.duration} Minuten.`;
    announceToScreenReader(message, 'polite');
}

/**
 * Announcement beim Verschieben eines Blocks
 */
function announceBlockMoved(block, oldDay, newDay) {
    const oldDayName = getDayNameInGerman(oldDay);
    const newDayName = getDayNameInGerman(newDay);
    const startTime = calculateStartTime(block);
    const message = `${block.activity.name} verschoben von ${oldDayName} nach ${newDayName}, ${startTime}.`;
    announceToScreenReader(message, 'polite');
}

/**
 * Announcement beim Löschen eines Blocks
 */
function announceBlockRemoved(blockName) {
    const message = `${blockName} wurde entfernt.`;
    announceToScreenReader(message, 'polite');
}

/**
 * Announcement beim Resize eines Blocks
 */
function announceBlockResized(block, oldDuration, newDuration) {
    const message = `${block.activity.name} Dauer geändert von ${oldDuration} auf ${newDuration} Minuten.`;
    announceToScreenReader(message, 'polite');
}

// ========================================
// HILFSFUNKTIONEN
// ========================================

function calculateStartTime(block) {
    if (!timeSlots || !block) return '00:00';
    const index = Math.floor(block.timeIndex / (60 / timeSettings.timeStep));
    return timeSlots[index] || '00:00';
}

function calculateEndTime(block) {
    if (!timeSlots || !block) return '00:00';
    const endTimeIndex = block.timeIndex + Math.floor(block.duration / timeSettings.timeStep);
    const index = Math.floor(endTimeIndex / (60 / timeSettings.timeStep));
    return timeSlots[index] || '00:00';
}

function getDayNameInGerman(dayKey) {
    const dayNames = {
        'monday': 'Montag',
        'tuesday': 'Dienstag',
        'wednesday': 'Mittwoch',
        'thursday': 'Donnerstag',
        'friday': 'Freitag',
        'saturday': 'Samstag',
        'sunday': 'Sonntag'
    };
    return dayNames[dayKey] || dayKey;
}

function inferAriaLabelForButton(button) {
    // Versuche Label aus Kontext zu bestimmen
    if (button.classList.contains('remove-btn')) return 'Block löschen';
    if (button.classList.contains('toast-close')) return 'Nachricht schließen';
    if (button.classList.contains('close')) return 'Schließen';

    // Aus benachbartem Text
    const parent = button.parentElement;
    if (parent) {
        const text = parent.textContent.replace(button.textContent, '').trim();
        if (text) return text;
    }

    return null;
}
