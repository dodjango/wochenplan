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
            alert('Block passt nicht in den verfügbaren Zeitraum!');
            return;
        }

        const checkKey = `${day}-${checkTimeIndex}`;
        if (scheduledBlocks[checkKey]) {
            alert('Dieser Zeitraum ist bereits belegt!');
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

// Geplanten Block darstellen
function renderScheduledBlock(block) {
    const cell = document.querySelector(`[data-day="${block.day}"][data-time-index="${block.timeIndex}"]`);
    if (!cell) return;

    const element = document.createElement('div');
    element.className = 'scheduled-block';
    element.style.backgroundColor = block.activity.color;
    element.style.color = getContrastColor(block.activity.color);
    element.textContent = block.activity.name;
    element.dataset.blockId = block.id;
    element.draggable = true;
    element.title = block.activity.description || block.activity.name;

    const durationSlots = block.duration / timeSettings.timeStep;
    const slotHeight = calculateSlotHeight();
    element.style.height = `${durationSlots * slotHeight - 4}px`;
    element.style.top = '2px';

    // Löschen-Button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '×';
    removeBtn.onclick = (e) => {
        e.stopPropagation();
        removeScheduledBlock(block.id);
    };
    element.appendChild(removeBtn);

    // Resize-Handles hinzufügen
    const resizeHandleTop = document.createElement('div');
    resizeHandleTop.className = 'resize-handle resize-handle-top';
    element.appendChild(resizeHandleTop);

    const resizeHandleBottom = document.createElement('div');
    resizeHandleBottom.className = 'resize-handle resize-handle-bottom';
    element.appendChild(resizeHandleBottom);

    // Resize Events
    setupResizeEvents(element, block, resizeHandleTop, 'top');
    setupResizeEvents(element, block, resizeHandleBottom, 'bottom');

    // Drag Events für Verschieben
    element.addEventListener('dragstart', (e) => {
        if (isResizing) {
            e.preventDefault();
            return;
        }
        currentDraggedBlock = block;
        draggedActivity = null;
        e.dataTransfer.effectAllowed = 'move';

        // Canvas für vollständiges Drag-Image erstellen
        const canvas = document.createElement('canvas');
        const rect = element.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');

        // Block-Hintergrund zeichnen
        ctx.fillStyle = block.activity.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Text zeichnen
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(block.activity.name, canvas.width / 2, canvas.height / 2);

        // Canvas als Drag-Image setzen
        e.dataTransfer.setDragImage(canvas, canvas.width / 2, canvas.height / 2);

        // Original-Block wird unsichtbar, nur Rahmen bleibt
        setTimeout(() => element.classList.add('dragging'), 0);
    });

    element.addEventListener('dragend', (e) => {
        element.classList.remove('dragging');
        currentDraggedBlock = null;
        document.querySelectorAll('.drop-zone').forEach(cell => {
            cell.classList.remove('drop-zone');
        });
    });

    cell.appendChild(element);
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

    const slotHeight = calculateSlotHeight();
    const deltaY = e.clientY - resizeStartY;
    const deltaSlots = Math.round(deltaY / slotHeight);

    let newDuration = resizeBlock.duration;
    let newTimeIndex = resizeBlock.timeIndex;

    if (resizeDirection === 'bottom') {
        // Unten vergrößern/verkleinern
        newDuration = resizeBlock.duration + (deltaSlots * timeSettings.timeStep);
    } else if (resizeDirection === 'top') {
        // Oben vergrößern/verkleinern
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
    if (newTimeIndex < 0 || newTimeIndex >= timeSlots.length) {
        return;
    }

    // Visuelle Vorschau aktualisieren
    const durationSlots = newDuration / timeSettings.timeStep;
    const newHeight = durationSlots * slotHeight - 4;
    element.style.height = `${newHeight}px`;

    // Position aktualisieren wenn oben resized wird
    if (resizeDirection === 'top') {
        const cell = document.querySelector(`[data-day="${resizeBlock.day}"][data-time-index="${newTimeIndex}"]`);
        if (cell) {
            // Element verschieben
            const oldParent = element.parentElement;
            if (oldParent !== cell) {
                cell.appendChild(element);
            }
        }
    }
}

// Resize beenden
function handleResizeEnd(e) {
    if (!isResizing || !resizeBlock) return;

    const element = document.querySelector(`[data-block-id="${resizeBlock.id}"]`);
    if (element) {
        element.classList.remove('resizing');
        element.draggable = true;
    }

    // Finale Werte berechnen
    const slotHeight = calculateSlotHeight();
    const currentHeight = parseInt(element.style.height);
    const newDurationSlots = Math.round((currentHeight + 4) / slotHeight);
    const newDuration = newDurationSlots * timeSettings.timeStep;

    let newTimeIndex = resizeBlock.timeIndex;
    if (resizeDirection === 'top') {
        const cell = element.parentElement;
        newTimeIndex = parseInt(cell.dataset.timeIndex);
    }

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

    // Zuerst das alte DOM-Element entfernen
    const oldElement = document.querySelector(`[data-block-id="${block.id}"]`);
    if (oldElement) {
        oldElement.remove();
    }

    // Alte Position aus scheduledBlocks freigeben
    const oldBlockedSlots = Object.keys(scheduledBlocks).filter(key => scheduledBlocks[key] === block.id);
    oldBlockedSlots.forEach(key => delete scheduledBlocks[key]);

    // Prüfen ob neue Position vollständig frei ist
    for (let i = 0; i < durationSlots; i++) {
        const checkTimeIndex = newTimeIndex + i;
        // Prüfen ob der Zeitindex im gültigen Bereich liegt
        if (checkTimeIndex >= timeSlots.length) {
            alert('Block passt nicht in den verfügbaren Zeitraum!');

            // Bei Fehler: Block an alter Position wiederherstellen
            for (let j = 0; j < durationSlots; j++) {
                const restoreKey = `${block.day}-${block.timeIndex + j}`;
                scheduledBlocks[restoreKey] = block.id;
            }
            renderScheduledBlock(block);
            return;
        }

        const checkKey = `${newDay}-${checkTimeIndex}`;
        if (scheduledBlocks[checkKey]) {
            alert('Dieser Zeitraum ist bereits belegt!');

            // Bei Fehler: Block an alter Position wiederherstellen
            for (let j = 0; j < durationSlots; j++) {
                const restoreKey = `${block.day}-${block.timeIndex + j}`;
                scheduledBlocks[restoreKey] = block.id;
            }
            renderScheduledBlock(block);
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

    // Block in Registry aktualisieren
    blockRegistry[block.id] = block;

    // Block an neuer Position rendern
    renderScheduledBlock(block);
    saveWeek(); // Auto-Save nach Verschieben
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
