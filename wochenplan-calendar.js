// ========================================
// KALENDER & ZEITRASTER
// ========================================

// Zeitslots dynamisch generieren
function generateTimeSlots() {
    timeSlots = [];

    // Start- und Endzeit parsen
    const [startHour, startMinute] = timeSettings.startTime.split(':').map(Number);
    const [endHour, endMinute] = timeSettings.endTime.split(':').map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    // Zeitslots in gewähltem Raster generieren
    for (let totalMinutes = startTotalMinutes; totalMinutes <= endTotalMinutes; totalMinutes += timeSettings.timeStep) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        timeSlots.push(timeString);
    }

    console.log(`${timeSlots.length} Zeitslots generiert (${timeSettings.startTime} bis ${timeSettings.endTime}, ${timeSettings.timeStep}min Raster)`);
}

// Kalender-Raster erstellen
function createCalendarGrid() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    // CSS für variable Slot-Höhen aktualisieren
    updateCalendarCSS();

    timeSlots.forEach((time, timeIndex) => {
        // Zeit-Spalte mit expliziter Grid-Positionierung
        const timeCell = document.createElement('div');
        timeCell.className = 'time-slot';
        timeCell.textContent = time;

        // Zeit-Slot muss über mehrere Grid-Zeilen spannen (abhängig von timeStep)
        const GRID_STEP = 5; // 5-Minuten-Grid
        const gridRowStart = Math.floor((timeIndex * timeSettings.timeStep) / GRID_STEP) + 1;
        const timeStepRows = Math.floor(timeSettings.timeStep / GRID_STEP);
        const gridRowEnd = gridRowStart + timeStepRows;

        timeCell.style.gridColumn = '1'; // Erste Spalte
        timeCell.style.gridRowStart = gridRowStart;
        timeCell.style.gridRowEnd = gridRowEnd;

        grid.appendChild(timeCell);

        // Tages-Zellen mit expliziter Grid-Positionierung
        days.forEach((day, dayIndex) => {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            cell.dataset.day = day;
            cell.dataset.time = time;
            cell.dataset.timeIndex = timeIndex;

            // Calendar-Cell positionieren (gleiche Zeilen wie time-slot)
            const GRID_STEP = 5;
            const gridRowStart = Math.floor((timeIndex * timeSettings.timeStep) / GRID_STEP) + 1;
            const timeStepRows = Math.floor(timeSettings.timeStep / GRID_STEP);
            const gridRowEnd = gridRowStart + timeStepRows;
            const gridColumn = dayIndex + 2; // Spalten 2-8 für Mo-So

            cell.style.gridRowStart = gridRowStart;
            cell.style.gridRowEnd = gridRowEnd;
            cell.style.gridColumn = gridColumn;

            // Drag & Drop Events
            cell.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (currentDraggedBlock) {
                    e.dataTransfer.dropEffect = 'move';
                } else {
                    e.dataTransfer.dropEffect = 'copy';
                }
                cell.classList.add('drop-zone');

                // ✅ Drag-Preview anzeigen
                showDragPreview(day, timeIndex);
            });

            cell.addEventListener('dragleave', () => {
                cell.classList.remove('drop-zone');
                // Preview wird beim nächsten dragover aktualisiert (flackerfrei)
            });

            cell.addEventListener('drop', (e) => {
                e.preventDefault();
                cell.classList.remove('drop-zone');

                // ✅ Preview entfernen
                removeDragPreview();

                if (draggedActivity) {
                    // Neue Aktivität mit minimaler Rasterlänge hinzufügen
                    const duration = timeSettings.timeStep;
                    addScheduledBlock(day, timeIndex, draggedActivity, duration);
                } else if (currentDraggedBlock) {
                    // Bestehende Aktivität verschieben
                    moveScheduledBlock(currentDraggedBlock, day, timeIndex);
                }

                draggedActivity = null;
                currentDraggedBlock = null;
            });

            grid.appendChild(cell);
        });
    });
}

// Slot-Höhe basierend auf Zeitraster berechnen
function calculateSlotHeight() {
    // Grundhöhe: 30px für 10 Minuten
    const baseHeight = 30;
    const baseStep = 10;
    return (baseHeight * timeSettings.timeStep) / baseStep;
}

// TimeIndex in Minuten seit Tagesbeginn umrechnen
function timeIndexToMinutes(timeIndex) {
    return timeIndex * timeSettings.timeStep;
}

// CSS für variable Slot-Höhen dynamisch anpassen
function updateCalendarCSS() {
    const GRID_STEP = 5; // 5-Minuten-Grid
    const GRID_ROW_HEIGHT = 20; // px pro 5-Minuten-Zeile (optimiert für weniger Scrollen)

    // Gesamtanzahl 5-Minuten-Zeilen berechnen
    const [startHour, startMinute] = timeSettings.startTime.split(':').map(Number);
    const [endHour, endMinute] = timeSettings.endTime.split(':').map(Number);
    const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    const total5MinRows = Math.floor(totalMinutes / GRID_STEP);

    const existingStyle = document.getElementById('dynamic-calendar-style');
    if (existingStyle) {
        existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'dynamic-calendar-style';
    style.textContent = `
        .calendar-grid {
            grid-template-rows: repeat(${total5MinRows}, ${GRID_ROW_HEIGHT}px);
        }
        .calendar-cell {
            min-height: ${GRID_ROW_HEIGHT}px;
        }
        /* time-slot Höhe wird durch grid-row-start/end kontrolliert */
    `;
    document.head.appendChild(style);
}

// ========================================
// ZEITEINSTELLUNGEN MODAL
// ========================================

// Settings Modal Funktionen
function openSettingsModal() {
    // Aktuelle Werte ins Modal laden
    document.getElementById('startTime').value = timeSettings.startTime;
    document.getElementById('endTime').value = timeSettings.endTime;
    document.getElementById('timeStep').value = timeSettings.timeStep;
    document.getElementById('settingsModal').style.display = 'block';
}

function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
}

function applySettings() {
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const timeStep = parseInt(document.getElementById('timeStep').value);

    // Validierung
    if (!startTime || !endTime) {
        showToast('Bitte geben Sie gültige Start- und Endzeiten ein!', 'error', 3000);
        return;
    }

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    if (startTotalMinutes >= endTotalMinutes) {
        showToast('Die Startzeit muss vor der Endzeit liegen!', 'error', 3000);
        return;
    }

    if (confirm('Zeitplan-Änderungen anwenden? Bestehende Termine könnten außerhalb des neuen Zeitbereichs fallen!')) {
        // Neue Einstellungen speichern
        timeSettings.startTime = startTime;
        timeSettings.endTime = endTime;
        timeSettings.timeStep = timeStep;

        saveTimeSettings();

        // Kalender neu aufbauen
        generateTimeSlots();

        // Bestehende Blöcke prüfen und ggf. entfernen
        validateExistingBlocks();

        // UI neu aufbauen
        createCalendarGrid();

        closeSettingsModal();
        showToast('Zeitplan-Einstellungen wurden angewendet!', 'success', 3000);
    }
}

// Bestehende Blöcke gegen neue Zeiteinstellungen validieren
function validateExistingBlocks() {
    const blocksToRemove = [];

    Object.entries(scheduledBlocks).forEach(([key, blockId]) => {
        const [day, timeIndexStr] = key.split('-');
        const timeIndex = parseInt(timeIndexStr);

        // Prüfen ob timeIndex noch gültig ist
        if (timeIndex >= timeSlots.length) {
            blocksToRemove.push(blockId);
        }
    });

    // Ungültige Blöcke entfernen
    blocksToRemove.forEach(blockId => {
        removeScheduledBlock(blockId, false);
    });

    if (blocksToRemove.length > 0) {
        console.log(`${blocksToRemove.length} Blöcke außerhalb des neuen Zeitbereichs entfernt`);
    }
}

// ========================================
// DRAG-PREVIEW-SYSTEM
// ========================================

let currentDragPreview = null;

// Drag-Preview anzeigen
function showDragPreview(targetDay, targetTimeIndex) {
    // Bestimme Block-Daten basierend auf Drag-Typ
    let activity, duration, blockColor;

    if (currentDraggedBlock) {
        // Bestehenden Block verschieben
        activity = currentDraggedBlock.activity;
        duration = currentDraggedBlock.duration;
        blockColor = activity.color;
    } else if (draggedActivity) {
        // Neue Aktivität platzieren
        activity = draggedActivity;
        duration = timeSettings.timeStep;
        blockColor = activity.color;
    } else {
        // Kein Drag aktiv
        removeDragPreview();
        return;
    }

    // Prüfe ob Position gültig ist (Kollisionserkennung)
    const hasCollision = checkDragCollision(targetDay, targetTimeIndex, duration);

    // Alte Preview entfernen
    removeDragPreview();

    // Neue Preview erstellen
    const preview = document.createElement('div');
    preview.className = 'drag-preview';
    if (hasCollision) {
        preview.classList.add('collision');
    }

    // Grid-Position berechnen
    const GRID_STEP = 5;
    const minutesSinceStart = targetTimeIndex * timeSettings.timeStep;
    const gridRowStart = Math.floor(minutesSinceStart / GRID_STEP) + 1;
    const durationGridRows = Math.floor(duration / GRID_STEP);
    const gridRowEnd = gridRowStart + durationGridRows;
    const dayIndex = days.indexOf(targetDay);
    const gridColumn = dayIndex + 2;

    preview.style.gridRowStart = gridRowStart;
    preview.style.gridRowEnd = gridRowEnd;
    preview.style.gridColumn = gridColumn;
    preview.style.backgroundColor = blockColor;
    preview.style.pointerEvents = 'none'; // Nicht interagierbar
    preview.textContent = activity.name;

    // Preview ins Grid einfügen
    const grid = document.getElementById('calendarGrid');
    grid.appendChild(preview);

    currentDragPreview = preview;
}

// Drag-Preview entfernen
function removeDragPreview() {
    if (currentDragPreview) {
        currentDragPreview.remove();
        currentDragPreview = null;
    }
}

// Kollisionsprüfung für Drag-Preview
function checkDragCollision(targetDay, targetTimeIndex, duration) {
    const durationSlots = duration / timeSettings.timeStep;

    // Berechne max verfügbare Slots
    const [startHour, startMinute] = timeSettings.startTime.split(':').map(Number);
    const [endHour, endMinute] = timeSettings.endTime.split(':').map(Number);
    const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    const totalTimeStepSlots = Math.floor(totalMinutes / timeSettings.timeStep);

    // Prüfe alle benötigten Slots
    for (let i = 0; i < durationSlots; i++) {
        const checkTimeIndex = targetTimeIndex + i;

        // Außerhalb des Tagesbereichs?
        if (checkTimeIndex >= totalTimeStepSlots) {
            return true; // Kollision: Überschreitet Tagesende
        }

        // Slot bereits belegt?
        const checkKey = `${targetDay}-${checkTimeIndex}`;
        const blockingId = scheduledBlocks[checkKey];

        // Wenn ein Block gefunden wurde UND es nicht der aktuell verschobene Block ist
        if (blockingId && blockingId !== (currentDraggedBlock?.id)) {
            return true; // Kollision: Slot bereits belegt
        }
    }

    return false; // Keine Kollision
}
