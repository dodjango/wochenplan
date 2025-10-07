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
            });

            cell.addEventListener('dragleave', () => {
                cell.classList.remove('drop-zone');
            });

            cell.addEventListener('drop', (e) => {
                e.preventDefault();
                cell.classList.remove('drop-zone');

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
        alert('Bitte geben Sie gültige Start- und Endzeiten ein!');
        return;
    }

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    if (startTotalMinutes >= endTotalMinutes) {
        alert('Die Startzeit muss vor der Endzeit liegen!');
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
        alert('Zeitplan-Einstellungen wurden angewendet!');
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
