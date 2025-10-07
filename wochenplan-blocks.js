// ========================================
// BLOCK-VERWALTUNG (Drag & Drop, Resize)
// ========================================

// Geplanten Block hinzufügen
function addScheduledBlock(day, timeIndex, activity, duration) {
    const blockId = Date.now().toString();
    const durationSlots = duration / timeSettings.timeStep;

    // Prüfen ob genügend aufeinanderfolgende freie Slots verfügbar sind
    for (let i = 0; i < durationSlots; i++) {
        const checkTimeIndex = timeIndex + i;
        // Prüfen ob der Zeitindex im gültigen Bereich liegt
        if (checkTimeIndex >= timeSlots.length) {
            // ✅ NEU: Toast statt Alert
            if (typeof showToast === 'function') {
                showToast('Block passt nicht in den verfügbaren Zeitraum!', 'error', 3000);
            } else {
                alert('Block passt nicht in den verfügbaren Zeitraum!');
            }
            return;
        }

        const checkKey = `${day}-${checkTimeIndex}`;
        if (scheduledBlocks[checkKey]) {
            // ✅ NEU: Collision-Feedback statt Alert
            const blockingBlockId = scheduledBlocks[checkKey];
            const blockingBlock = blockRegistry[blockingBlockId];
            if (typeof showCollisionFeedback === 'function' && blockingBlock) {
                showCollisionFeedback(blockingBlock, day, timeIndex);
            } else {
                if (typeof showToast === 'function') {
                    showToast('Dieser Zeitraum ist bereits belegt!', 'error', 3000);
                } else {
                    alert('Dieser Zeitraum ist bereits belegt!');
                }
            }
            return;
        }
    }

    // Block erstellen
    const block = {
        id: blockId,
        day: day,
        timeIndex: timeIndex,
        activity: activity,
        duration: duration
    };

    // Block in Registry speichern
    blockRegistry[blockId] = block;

    // Zeitslots blockieren
    for (let i = 0; i < durationSlots; i++) {
        const key = `${day}-${timeIndex + i}`;
        scheduledBlocks[key] = blockId;
    }

    renderScheduledBlock(block);
    saveWeek(); // Auto-Save nach Hinzufügen
    hasUnsavedChanges = true;
}

// Helper: Zeitslots für einen Block blockieren (für Storage/Autofill)
function occupyTimeSlots(day, startMinutes, durationMinutes, blockId) {
    // startMinutes in timeIndex umrechnen
    const startTimeIndex = Math.floor(startMinutes / timeSettings.timeStep);
    const durationSlots = Math.ceil(durationMinutes / timeSettings.timeStep);

    // Alle Slots blockieren
    for (let i = 0; i < durationSlots; i++) {
        const key = `${day}-${startTimeIndex + i}`;
        scheduledBlocks[key] = blockId;
    }
}

// Geplanten Block darstellen
function renderScheduledBlock(block) {
    // ✅ Holt Grid-Container (nicht einzelne Zelle!)
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;

    const element = document.createElement('div');
    element.className = 'scheduled-block';
    element.style.backgroundColor = block.activity.color;
    element.style.color = getContrastColor(block.activity.color);
    element.textContent = block.activity.name;
    element.dataset.blockId = block.id;
    element.draggable = true;

    // ✅ Tooltip mit Zeitinformationen (wichtig für UX!)
    const startTime = timeSlots[Math.floor(block.timeIndex / (60 / timeSettings.timeStep))];
    const endTimeIndex = block.timeIndex + Math.floor(block.duration / timeSettings.timeStep);
    const endTime = timeSlots[Math.floor(endTimeIndex / (60 / timeSettings.timeStep))];
    element.title = `${block.activity.name}\n${startTime} - ${endTime} (${block.duration} Min)\n${block.activity.description || ''}`;

    // ✅ Grid-Position berechnen (5-Minuten-Grid!)
    const GRID_STEP = 5; // Grid hat 5-Minuten-Zeilen

    // Start: timeIndex → Minuten → Grid Row
    const minutesSinceStart = block.timeIndex * timeSettings.timeStep;
    const gridRowStart = Math.floor(minutesSinceStart / GRID_STEP) + 1;

    // Dauer: Minuten → Anzahl Grid-Zeilen
    const durationGridRows = Math.floor(block.duration / GRID_STEP);
    const gridRowEnd = gridRowStart + durationGridRows;

    // Spalte: +2 weil Spalte 1 ist die Zeitspalte
    const dayIndex = days.indexOf(block.day);
    const gridColumn = dayIndex + 2;

    // ✅ Grid-Position via CSS setzen
    element.style.gridRowStart = gridRowStart;
    element.style.gridRowEnd = gridRowEnd;
    element.style.gridColumn = gridColumn;

    // ✅ Data-Attribut für responsive Typography
    const blockHeightPx = (block.duration / 5) * 20; // 20px pro 5-Min-Zeile
    let heightCategory = 'large';
    if (blockHeightPx < 40) heightCategory = 'small';
    else if (blockHeightPx < 80) heightCategory = 'medium';
    element.setAttribute('data-height', heightCategory);

    // Löschen-Button (wie bisher)
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '×';
    removeBtn.onclick = (e) => {
        e.stopPropagation();
        removeScheduledBlock(block.id);
    };
    element.appendChild(removeBtn);

    // Resize-Handles (wie bisher)
    const resizeHandleTop = document.createElement('div');
    resizeHandleTop.className = 'resize-handle resize-handle-top';
    element.appendChild(resizeHandleTop);

    const resizeHandleBottom = document.createElement('div');
    resizeHandleBottom.className = 'resize-handle resize-handle-bottom';
    element.appendChild(resizeHandleBottom);

    setupResizeEvents(element, block, resizeHandleTop, 'top');
    setupResizeEvents(element, block, resizeHandleBottom, 'bottom');

    // Drag Events (wie bisher)
    element.addEventListener('dragstart', (e) => {
        if (isResizing) {
            e.preventDefault();
            return;
        }
        currentDraggedBlock = block;
        draggedActivity = null;
        e.dataTransfer.effectAllowed = 'move';

        // Canvas für Drag-Image (wie bisher)
        const canvas = document.createElement('canvas');
        const rect = element.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = block.activity.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(block.activity.name, canvas.width / 2, canvas.height / 2);

        e.dataTransfer.setDragImage(canvas, canvas.width / 2, canvas.height / 2);

        setTimeout(() => element.classList.add('dragging'), 0);
    });

    element.addEventListener('dragend', (e) => {
        element.classList.remove('dragging');
        currentDraggedBlock = null;
        document.querySelectorAll('.drop-zone').forEach(cell => {
            cell.classList.remove('drop-zone');
        });
    });

    // ✅ Keyboard-Fokus + ARIA
    if (typeof addKeyboardFocusToBlock === 'function') {
        addKeyboardFocusToBlock(element, block.id);
    }
    if (typeof updateAriaForBlock === 'function') {
        updateAriaForBlock(element, block);
    }

    // ✅ Touch-Events für Mobile/Tablet
    if (typeof addTouchEventsToScheduledBlock === 'function') {
        addTouchEventsToScheduledBlock(element, block);
    }

    // ✅ Direkt ins Grid einfügen (NICHT in cell)
    grid.appendChild(element);
}

// ========================================
// RESIZE-FUNKTIONALITÄT
// ========================================

// Resize Events einrichten
function setupResizeEvents(element, block, handle, direction) {
    handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Resize-Modus starten
        isResizing = true;
        resizeDirection = direction;
        resizeBlock = block;
        resizeStartY = e.clientY;
        resizeStartHeight = parseInt(element.style.height);
        resizeStartTimeIndex = block.timeIndex;

        element.classList.add('resizing');
        element.draggable = false;

        // Globale Event-Listener
        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeEnd);
    });
}

// Resize während Mausbewegung
function handleResizeMove(e) {
    if (!isResizing || !resizeBlock) return;

    const element = document.querySelector(`[data-block-id="${resizeBlock.id}"]`);
    if (!element) return;

    // ✅ WICHTIG: In Grid-Architektur ist die Slot-Höhe konstant
    const GRID_ROW_HEIGHT = 20; // px pro 5-Min-Zeile (muss mit updateCalendarCSS() übereinstimmen!)
    const timeStepRows = timeSettings.timeStep / 5; // z.B. 10/5 = 2 Zeilen pro timeStep
    const timeStepHeight = GRID_ROW_HEIGHT * timeStepRows; // z.B. 20 * 2 = 40px pro timeStep

    const deltaY = e.clientY - resizeStartY;
    const deltaSlots = Math.round(deltaY / timeStepHeight);

    let newDuration = resizeBlock.duration;
    let newTimeIndex = resizeBlock.timeIndex;

    if (resizeDirection === 'bottom') {
        newDuration = resizeBlock.duration + (deltaSlots * timeSettings.timeStep);
    } else if (resizeDirection === 'top') {
        const durationChange = -deltaSlots * timeSettings.timeStep;
        newDuration = resizeBlock.duration + durationChange;
        newTimeIndex = resizeBlock.timeIndex + deltaSlots;
    }

    // Minimum: Ein Zeitslot
    if (newDuration < timeSettings.timeStep) {
        newDuration = timeSettings.timeStep;
        if (resizeDirection === 'top') {
            newTimeIndex = resizeStartTimeIndex + Math.floor((resizeBlock.duration - timeSettings.timeStep) / timeSettings.timeStep);
        }
    }

    // Maximum: Bis zum Ende des Tages oder nächsten Block
    const maxDuration = getMaxDuration(resizeBlock.day, newTimeIndex, resizeBlock.id);
    if (newDuration > maxDuration) {
        newDuration = maxDuration;
    }

    // Prüfen ob neuer Zeitindex gültig ist
    // WICHTIG: timeSlots enthält nur Stunden! Wir brauchen die Anzahl der timeStep-Slots
    const [startHour, startMinute] = timeSettings.startTime.split(':').map(Number);
    const [endHour, endMinute] = timeSettings.endTime.split(':').map(Number);
    const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    const totalTimeStepSlots = Math.floor(totalMinutes / timeSettings.timeStep);

    if (newTimeIndex < 0 || newTimeIndex >= totalTimeStepSlots) {
        return;
    }

    // ✅ Visuelle Vorschau mit CSS Grid (5-Minuten-Grid!)
    const GRID_STEP = 5;

    // Berechne Grid-Position für neue Zeit
    const minutesSinceStart = newTimeIndex * timeSettings.timeStep;
    const gridRowStart = Math.floor(minutesSinceStart / GRID_STEP) + 1;

    // Berechne Grid-Zeilen für neue Dauer
    const durationGridRows = Math.floor(newDuration / GRID_STEP);
    const gridRowEnd = gridRowStart + durationGridRows;

    element.style.gridRowStart = gridRowStart;
    element.style.gridRowEnd = gridRowEnd;
}

// Resize beenden
function handleResizeEnd(e) {
    if (!isResizing || !resizeBlock) return;

    const element = document.querySelector(`[data-block-id="${resizeBlock.id}"]`);
    if (element) {
        element.classList.remove('resizing');
        element.draggable = true;
    }

    // ✅ Liest finale Werte aus CSS Grid Position
    const GRID_STEP = 5;
    const gridRowStart = parseInt(element.style.gridRowStart);
    const gridRowEnd = parseInt(element.style.gridRowEnd);

    // Grid Row → Minuten seit Tagesbeginn
    const minutesSinceStart = (gridRowStart - 1) * GRID_STEP;

    // Minuten → timeIndex (basierend auf timeStep)
    const newTimeIndex = Math.floor(minutesSinceStart / timeSettings.timeStep);

    // Grid-Zeilen → Dauer in Minuten
    const durationGridRows = gridRowEnd - gridRowStart;
    const newDuration = durationGridRows * GRID_STEP;

    // Daten aktualisieren
    updateBlockAfterResize(resizeBlock, newTimeIndex, newDuration);

    // Cleanup
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);

    isResizing = false;
    resizeDirection = null;
    resizeBlock = null;
}

// Block-Daten nach Resize aktualisieren
function updateBlockAfterResize(block, newTimeIndex, newDuration) {
    // Alte Slots freigeben
    const oldDurationSlots = block.duration / timeSettings.timeStep;
    for (let i = 0; i < oldDurationSlots; i++) {
        const key = `${block.day}-${block.timeIndex + i}`;
        delete scheduledBlocks[key];
    }

    // Neue Slots belegen
    const newDurationSlots = newDuration / timeSettings.timeStep;
    for (let i = 0; i < newDurationSlots; i++) {
        const key = `${block.day}-${newTimeIndex + i}`;
        scheduledBlocks[key] = block.id;
    }

    // Block-Objekt aktualisieren
    block.timeIndex = newTimeIndex;
    block.duration = newDuration;

    // Block in Registry aktualisieren
    blockRegistry[block.id] = block;

    console.log(`Block ${block.activity.name} resized: ${newDuration}min ab ${timeSlots[newTimeIndex]}`);
    saveWeek(); // Auto-Save nach Resize
    hasUnsavedChanges = true;
}

// Maximale Dauer berechnen (bis zum nächsten Block oder Ende des Tages)
function getMaxDuration(day, startTimeIndex, currentBlockId) {
    let maxSlots = timeSlots.length - startTimeIndex;

    // Prüfen bis zum nächsten Block (ab dem ersten Slot nach dem aktuellen Block)
    for (let i = 0; i < maxSlots; i++) {
        const checkKey = `${day}-${startTimeIndex + i}`;
        const blockingId = scheduledBlocks[checkKey];

        // Wenn ein anderer Block (nicht der aktuelle) gefunden wurde
        if (blockingId && blockingId !== currentBlockId) {
            maxSlots = i;
            break;
        }
    }

    return maxSlots * timeSettings.timeStep;
}

// ========================================
// DRAG & DROP
// ========================================

// Block verschieben
function moveScheduledBlock(block, newDay, newTimeIndex) {
    const durationSlots = block.duration / timeSettings.timeStep;

    // Alte Position aus scheduledBlocks freigeben
    const oldBlockedSlots = Object.keys(scheduledBlocks).filter(key => scheduledBlocks[key] === block.id);
    oldBlockedSlots.forEach(key => delete scheduledBlocks[key]);

    // Kollisionsprüfung (wie bisher)
    // WICHTIG: timeSlots enthält nur Stunden! Wir brauchen die Anzahl der timeStep-Slots
    const [startHour, startMinute] = timeSettings.startTime.split(':').map(Number);
    const [endHour, endMinute] = timeSettings.endTime.split(':').map(Number);
    const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    const totalTimeStepSlots = Math.floor(totalMinutes / timeSettings.timeStep);

    for (let i = 0; i < durationSlots; i++) {
        const checkTimeIndex = newTimeIndex + i;
        if (checkTimeIndex >= totalTimeStepSlots) {
            // ✅ Toast statt alert für bessere UX
            if (typeof showToast === 'function') {
                showToast('Block passt nicht in den verfügbaren Zeitraum!', 'error', 3000);
            } else {
                alert('Block passt nicht in den verfügbaren Zeitraum!');
            }
            // Wiederherstellen
            for (let j = 0; j < durationSlots; j++) {
                const restoreKey = `${block.day}-${block.timeIndex + j}`;
                scheduledBlocks[restoreKey] = block.id;
            }
            return;
        }

        const checkKey = `${newDay}-${checkTimeIndex}`;
        if (scheduledBlocks[checkKey]) {
            // ✅ Collision-Feedback mit visueller Hervorhebung
            const blockingBlockId = scheduledBlocks[checkKey];
            const blockingBlock = blockRegistry[blockingBlockId];
            if (typeof showCollisionFeedback === 'function' && blockingBlock) {
                showCollisionFeedback(blockingBlock, newDay, newTimeIndex);
            } else {
                if (typeof showToast === 'function') {
                    showToast('Dieser Zeitraum ist bereits belegt!', 'error', 3000);
                } else {
                    alert('Dieser Zeitraum ist bereits belegt!');
                }
            }
            // Wiederherstellen
            for (let j = 0; j < durationSlots; j++) {
                const restoreKey = `${block.day}-${block.timeIndex + j}`;
                scheduledBlocks[restoreKey] = block.id;
            }
            return;
        }
    }

    // Block an neue Position setzen
    for (let i = 0; i < durationSlots; i++) {
        const key = `${newDay}-${newTimeIndex + i}`;
        scheduledBlocks[key] = block.id;
    }

    // Block-Daten aktualisieren
    block.day = newDay;
    block.timeIndex = newTimeIndex;
    blockRegistry[block.id] = block;

    // ✅ CSS Grid Position im DOM aktualisieren (KEIN Re-Render!)
    const element = document.querySelector(`[data-block-id="${block.id}"]`);
    if (element) {
        const GRID_STEP = 5;

        // Neue Position berechnen
        const minutesSinceStart = newTimeIndex * timeSettings.timeStep;
        const gridRowStart = Math.floor(minutesSinceStart / GRID_STEP) + 1;

        // Dauer in Grid-Zeilen
        const durationGridRows = Math.floor(block.duration / GRID_STEP);
        const gridRowEnd = gridRowStart + durationGridRows;

        // Spalte
        const dayIndex = days.indexOf(newDay);
        const gridColumn = dayIndex + 2;

        element.style.gridRowStart = gridRowStart;
        element.style.gridRowEnd = gridRowEnd;
        element.style.gridColumn = gridColumn;
    }

    saveWeek();
    hasUnsavedChanges = true;
}

// Geplanten Block entfernen
function removeScheduledBlock(blockId, render = true) {
    // Blockierte Zeitslots finden und freigeben
    const blockedSlots = Object.keys(scheduledBlocks).filter(key => scheduledBlocks[key] === blockId);
    blockedSlots.forEach(key => delete scheduledBlocks[key]);

    // Block aus Registry entfernen
    delete blockRegistry[blockId];

    // Element immer aus DOM entfernen
    const element = document.querySelector(`[data-block-id="${blockId}"]`);
    if (element) {
        element.remove();
    }

    saveWeek(); // Auto-Save nach Löschen
    hasUnsavedChanges = true;
}
