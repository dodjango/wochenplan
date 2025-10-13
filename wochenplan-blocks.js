// ========================================
// BLOCK-VERWALTUNG (Drag & Drop, Resize)
// ========================================

// ========================================
// TOOLTIP-SYSTEM
// ========================================

// Singleton Tooltip-Element
let tooltipElement = null;
let currentTooltipBlock = null;
let tooltipMouseMoveHandler = null;
let tooltipHideTimeout = null;
const TOOLTIP_OFFSET_X = 15;
const TOOLTIP_OFFSET_Y = 15;
const TOOLTIP_HIDE_DELAY = 200; // ms - Verzögerung vor dem Ausblenden auf Touch-Geräten

// Tooltip-Element erstellen (lazy initialization)
function getTooltipElement() {
    if (!tooltipElement) {
        tooltipElement = document.createElement('div');
        tooltipElement.className = 'block-tooltip';
        tooltipElement.setAttribute('role', 'tooltip');
        tooltipElement.setAttribute('aria-live', 'polite');
        document.body.appendChild(tooltipElement);
    }
    return tooltipElement;
}

// Tooltip-Inhalt generieren
function generateTooltipContent(block) {
    const tooltip = getTooltipElement();

    // ✅ NEU: Verwende startMinutes für exakte Zeitberechnung (mit Backward Compatibility)
    const blockStartMinutes = block.startMinutes !== undefined ? block.startMinutes : (block.timeIndex * timeSettings.timeStep);

    // Parse startTime aus Einstellungen (z.B. "06:00")
    const [dayStartHour, dayStartMinute] = timeSettings.startTime.split(':').map(Number);
    const dayStartMinutes = dayStartHour * 60 + dayStartMinute;

    // Berechne absolute Minuten ab Mitternacht
    const startMinutesFromMidnight = dayStartMinutes + blockStartMinutes;
    const endMinutesFromMidnight = startMinutesFromMidnight + block.duration;

    // Konvertiere zu Stunden und Minuten
    const startHour = Math.floor(startMinutesFromMidnight / 60);
    const startMin = startMinutesFromMidnight % 60;
    const endHour = Math.floor(endMinutesFromMidnight / 60);
    const endMin = endMinutesFromMidnight % 60;

    const startTime = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    // HTML-Content erstellen
    let content = `<div class="block-tooltip-name">${escapeHtml(block.activity.name)}</div>`;
    content += `<div class="block-tooltip-time">${startTime} - ${endTime} (${block.duration} Min)</div>`;

    if (block.activity.description && block.activity.description.trim()) {
        content += `<div class="block-tooltip-description">${escapeHtml(block.activity.description)}</div>`;
    }

    tooltip.innerHTML = content;
}

// HTML-Escape-Funktion für XSS-Schutz
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Tooltip-Position berechnen (mit Viewport-Kollisionsvermeidung)
function positionTooltip(mouseX, mouseY) {
    const tooltip = getTooltipElement();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = mouseX + TOOLTIP_OFFSET_X;
    let y = mouseY + TOOLTIP_OFFSET_Y;

    // Rechte Viewport-Grenze prüfen
    if (x + tooltipRect.width > viewportWidth - 10) {
        x = mouseX - tooltipRect.width - TOOLTIP_OFFSET_X;
    }

    // Untere Viewport-Grenze prüfen
    if (y + tooltipRect.height > viewportHeight - 10) {
        y = mouseY - tooltipRect.height - TOOLTIP_OFFSET_Y;
    }

    // Linke Viewport-Grenze prüfen
    if (x < 10) {
        x = 10;
    }

    // Obere Viewport-Grenze prüfen
    if (y < 10) {
        y = 10;
    }

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
}

// Tooltip anzeigen
function showTooltip(block, initialX, initialY) {
    // Bestehenden Hide-Timeout abbrechen
    if (tooltipHideTimeout) {
        clearTimeout(tooltipHideTimeout);
        tooltipHideTimeout = null;
    }

    currentTooltipBlock = block;
    const tooltip = getTooltipElement();

    // Content generieren
    generateTooltipContent(block);

    // Position setzen (muss nach Content-Generierung erfolgen für korrekte Größe)
    positionTooltip(initialX, initialY);

    // Sichtbar machen
    requestAnimationFrame(() => {
        tooltip.classList.add('visible');
    });
}

// Tooltip ausblenden
function hideTooltip() {
    const tooltip = getTooltipElement();
    tooltip.classList.remove('visible');
    currentTooltipBlock = null;

    // MouseMove-Handler entfernen
    if (tooltipMouseMoveHandler) {
        document.removeEventListener('mousemove', tooltipMouseMoveHandler);
        tooltipMouseMoveHandler = null;
    }
}

// Tooltip auf Mouse-Move aktualisieren
function updateTooltipPosition(e) {
    if (currentTooltipBlock) {
        positionTooltip(e.clientX, e.clientY);
    }
}

// Tooltip an Block anbinden
function attachTooltipToBlock(element, block) {
    // Desktop: Hover-basiert mit Cursor-Following
    element.addEventListener('mouseenter', (e) => {
        // Nicht anzeigen wenn gerade resized oder gedragged wird
        if (isResizing || element.classList.contains('dragging')) {
            return;
        }

        showTooltip(block, e.clientX, e.clientY);

        // MouseMove-Handler für Cursor-Following
        tooltipMouseMoveHandler = updateTooltipPosition;
        document.addEventListener('mousemove', tooltipMouseMoveHandler);
    });

    element.addEventListener('mouseleave', () => {
        hideTooltip();
    });

    // Touch-Geräte: Tap-to-Show mit Auto-Hide
    if ('ontouchstart' in window) {
        let touchTimeout = null;

        element.addEventListener('touchstart', (e) => {
            // Wenn bereits ein anderer Tooltip sichtbar ist, verstecke ihn
            if (currentTooltipBlock && currentTooltipBlock.id !== block.id) {
                hideTooltip();
            }

            // Touch-Position ermitteln
            const touch = e.touches[0];
            const touchX = touch.clientX;
            const touchY = touch.clientY;

            // Tooltip anzeigen
            showTooltip(block, touchX, touchY);

            // Auto-Hide nach 3 Sekunden
            if (touchTimeout) clearTimeout(touchTimeout);
            touchTimeout = setTimeout(() => {
                hideTooltip();
            }, 3000);
        }, { passive: true });

        // Bei Touch-Ende: verzögertes Ausblenden
        element.addEventListener('touchend', () => {
            tooltipHideTimeout = setTimeout(() => {
                hideTooltip();
            }, TOOLTIP_HIDE_DELAY);
        }, { passive: true });
    }
}

// Cleanup-Funktion (für Resize/Drag)
function cleanupTooltip() {
    if (currentTooltipBlock) {
        hideTooltip();
    }
}

// Geplanten Block hinzufügen
function addScheduledBlock(day, timeIndex, activity, duration) {
    const blockId = Date.now().toString();
    // WICHTIG: Duration kann in 5-Min-Schritten sein (nicht nur timeStep)
    const durationSlots = Math.ceil(duration / timeSettings.timeStep);

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
    // ✅ startMinutes: Exakte Startzeit in Minuten ab Tagesbeginn (für 5-Min-Präzision)
    const startMinutes = timeIndex * timeSettings.timeStep;

    const block = {
        id: blockId,
        day: day,
        timeIndex: timeIndex,
        startMinutes: startMinutes,  // NEU: Exakte Startzeit für 5-Min-Präzision
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

    // ✅ Entferne native Browser-Tooltip (wird durch unseren ersetzt)
    // element.title wird NICHT gesetzt - wir verwenden stattdessen unseren Custom-Tooltip

    // ✅ Grid-Position berechnen (5-Minuten-Grid!)
    const GRID_STEP = 5; // Grid hat 5-Minuten-Zeilen

    // Start: startMinutes → Grid Row (mit Backward Compatibility)
    // NEU: Verwende startMinutes wenn vorhanden, sonst berechne aus timeIndex
    const minutesSinceStart = block.startMinutes !== undefined ? block.startMinutes : (block.timeIndex * timeSettings.timeStep);
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

        // Tooltip verstecken während Drag
        cleanupTooltip();

        currentDraggedBlock = block;
        draggedActivity = null;
        e.dataTransfer.effectAllowed = 'move';

        // Canvas für Drag-Image
        const rect = element.getBoundingClientRect();
        const canvas = document.createElement('canvas');
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

        // ✅ KRITISCH: Greifpunkt-basiertes Drag-Image
        // Berechne wo im Block der Nutzer geklickt hat
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        // Drag-Image an GREIFSTELLE verankern (nicht mittig!)
        e.dataTransfer.setDragImage(canvas, offsetX, offsetY);

        setTimeout(() => element.classList.add('dragging'), 0);
    });

    element.addEventListener('dragend', (e) => {
        element.classList.remove('dragging');
        currentDraggedBlock = null;
        document.querySelectorAll('.drop-zone').forEach(cell => {
            cell.classList.remove('drop-zone');
        });

        // ✅ Preview entfernen beim Drag-Ende
        if (typeof removeDragPreview === 'function') {
            removeDragPreview();
        }
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

    // ✅ Custom Tooltip anbinden
    attachTooltipToBlock(element, block);

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

        // Tooltip verstecken während Resize
        cleanupTooltip();

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

    // ✅ KRITISCH: Resize snappt auf 5-Minuten (UNABHÄNGIG von timeStep)
    const GRID_ROW_HEIGHT = 20; // px pro 5-Min-Zeile (muss mit updateCalendarCSS() übereinstimmen!)
    const resizeStepHeight = GRID_ROW_HEIGHT; // 20px pro 5-Min-Schritt

    const deltaY = e.clientY - resizeStartY;
    const deltaResizeSteps = Math.round(deltaY / resizeStepHeight); // Anzahl 5-Min-Schritte

    let newDuration = resizeBlock.duration;
    let newTimeIndex = resizeBlock.timeIndex;

    if (resizeDirection === 'bottom') {
        // Bottom-Resize: Start bleibt fix, Ende wächst (in 5-Min-Schritten)
        newDuration = resizeBlock.duration + (deltaResizeSteps * RESIZE_STEP);
        const maxDuration = getMaxDuration(resizeBlock.day, newTimeIndex, resizeBlock.id);
        if (newDuration > maxDuration) {
            newDuration = maxDuration;
        }
    } else if (resizeDirection === 'top') {
        // Top-Resize: Ende bleibt fix, Start bewegt sich nach oben (in 5-Min-Schritten)
        // ✅ NEU: Verwende startMinutes für exakte Berechnung
        const originalStartMinutes = resizeBlock.startMinutes !== undefined ? resizeBlock.startMinutes : (resizeBlock.timeIndex * timeSettings.timeStep);
        const originalEndMinutes = originalStartMinutes + resizeBlock.duration;

        // Berechne neue Start-Position in 5-Min-Schritten
        const attemptedNewStartMinutes = originalStartMinutes + (deltaResizeSteps * RESIZE_STEP);

        // Runde auf 5-Min-Grenze (WICHTIG: VOR Kollisionsprüfung!)
        let newStartMinutesRounded = Math.round(attemptedNewStartMinutes / RESIZE_STEP) * RESIZE_STEP;

        // Konvertiere zu timeIndex für Kollisionsprüfung
        const attemptedNewTimeIndex = Math.floor(newStartMinutesRounded / timeSettings.timeStep);

        // Finde frühesten erlaubten Start (nach Kollisionen)
        let earliestValidStartMinutes = newStartMinutesRounded;

        // Prüfe jeden timeStep-Slot von attemptedNewTimeIndex bis zum aktuellen Start
        for (let checkIndex = attemptedNewTimeIndex; checkIndex < resizeBlock.timeIndex; checkIndex++) {
            const maxDurationFromHere = getMaxDuration(resizeBlock.day, checkIndex, resizeBlock.id);
            const requiredDuration = originalEndMinutes - (checkIndex * timeSettings.timeStep);

            if (maxDurationFromHere < requiredDuration) {
                // Kollision gefunden - finde wo der blockierende Block endet
                const collisionSlotIndex = checkIndex + Math.floor(maxDurationFromHere / timeSettings.timeStep);
                const blockingKey = `${resizeBlock.day}-${collisionSlotIndex}`;
                const blockingBlockId = scheduledBlocks[blockingKey];

                if (blockingBlockId) {
                    const blockingBlock = blockRegistry[blockingBlockId];
                    // ✅ NEU: Verwende startMinutes des blockierenden Blocks wenn verfügbar
                    const blockingStartMinutes = blockingBlock.startMinutes !== undefined ? blockingBlock.startMinutes : (blockingBlock.timeIndex * timeSettings.timeStep);
                    const blockingEndMinutes = blockingStartMinutes + blockingBlock.duration;
                    // Start NACH dem blockierenden Block (auf 5-Min-Grenze gerundet)
                    earliestValidStartMinutes = Math.ceil(blockingEndMinutes / RESIZE_STEP) * RESIZE_STEP;
                } else {
                    earliestValidStartMinutes = checkIndex * timeSettings.timeStep;
                }
                break;
            }
        }

        // ✅ KRITISCHE ÄNDERUNG: Behalte 5-Min-Präzision in startMinutes
        newStartMinutesRounded = Math.max(newStartMinutesRounded, earliestValidStartMinutes);

        // timeIndex NUR für Slot-Mapping berechnen (aufrunden für partielle Slots)
        newTimeIndex = Math.floor(newStartMinutesRounded / timeSettings.timeStep);

        // Neue Dauer berechnen (in 5-Min-Präzision)
        newDuration = originalEndMinutes - newStartMinutesRounded;

        // ✅ NEU: Speichere neue startMinutes temporär für handleResizeEnd
        resizeBlock.tempNewStartMinutes = newStartMinutesRounded;
    }

    // Minimum: 5 Minuten (RESIZE_STEP)
    if (newDuration < RESIZE_STEP) {
        newDuration = RESIZE_STEP;
        if (resizeDirection === 'top') {
            // Bei Top-Resize: Berechne neuen Start-Index basierend auf fixem Ende
            const originalEndMinutes = (resizeBlock.timeIndex * timeSettings.timeStep) + resizeBlock.duration;
            const newStartMinutes = originalEndMinutes - RESIZE_STEP;
            newTimeIndex = Math.floor(newStartMinutes / timeSettings.timeStep);
        }
    }

    // WICHTIG: Wenn resultierende Dauer kleiner als Minimum ist, Resize-Preview blockieren
    // Dies verhindert, dass eine invalide Kollisions-Position visuell angezeigt wird
    if (newDuration < RESIZE_STEP) {
        // Grid-Position auf ORIGINAL-Werte zurücksetzen
        const GRID_STEP = 5;
        const originalMinutesSinceStart = resizeBlock.timeIndex * timeSettings.timeStep;
        const originalGridRowStart = Math.floor(originalMinutesSinceStart / GRID_STEP) + 1;
        const originalDurationGridRows = Math.floor(resizeBlock.duration / GRID_STEP);
        const originalGridRowEnd = originalGridRowStart + originalDurationGridRows;
        element.style.gridRowStart = originalGridRowStart;
        element.style.gridRowEnd = originalGridRowEnd;
        return; // Keine visuelle Preview bei zu kleiner Dauer
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
    // ✅ NEU: Verwende tempNewStartMinutes bei Top-Resize, sonst berechne aus timeIndex
    let minutesSinceStart;
    if (resizeDirection === 'top' && resizeBlock.tempNewStartMinutes !== undefined) {
        minutesSinceStart = resizeBlock.tempNewStartMinutes;
    } else {
        minutesSinceStart = newTimeIndex * timeSettings.timeStep;
    }
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

    // Grid Row → Minuten seit Tagesbeginn (exakte 5-Min-Präzision!)
    const newStartMinutes = (gridRowStart - 1) * GRID_STEP;

    // Minuten → timeIndex (basierend auf timeStep, für Slot-Mapping)
    const newTimeIndex = Math.floor(newStartMinutes / timeSettings.timeStep);

    // Grid-Zeilen → Dauer in Minuten
    const durationGridRows = gridRowEnd - gridRowStart;
    const newDuration = durationGridRows * GRID_STEP;

    // Daten aktualisieren - ✅ NEU: Übergebe startMinutes
    updateBlockAfterResize(resizeBlock, newTimeIndex, newDuration, newStartMinutes);

    // Cleanup
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);

    // ✅ NEU: Cleanup temporäre Resize-Daten
    if (resizeBlock && resizeBlock.tempNewStartMinutes !== undefined) {
        delete resizeBlock.tempNewStartMinutes;
    }

    isResizing = false;
    resizeDirection = null;
    resizeBlock = null;
}

// Block-Daten nach Resize aktualisieren
// ✅ NEU: Akzeptiert startMinutes für 5-Min-Präzision
function updateBlockAfterResize(block, newTimeIndex, newDuration, newStartMinutes) {
    // WICHTIG: Da Duration jetzt in 5-Min-Schritten sein kann, müssen wir
    // Slots basierend auf timeStep berechnen (aufrunden für partielle Slots)
    const newDurationSlots = Math.ceil(newDuration / timeSettings.timeStep);
    const oldDurationSlots = Math.ceil(block.duration / timeSettings.timeStep);

    // Schritt 1: Alte Slots temporär freigeben
    const oldBlockedSlots = [];
    for (let i = 0; i < oldDurationSlots; i++) {
        const key = `${block.day}-${block.timeIndex + i}`;
        oldBlockedSlots.push(key);
        delete scheduledBlocks[key];
    }

    // Schritt 2: Kollisionsprüfung für neue Position
    // Berechne maximale Anzahl timeStep-Slots
    const [startHour, startMinute] = timeSettings.startTime.split(':').map(Number);
    const [endHour, endMinute] = timeSettings.endTime.split(':').map(Number);
    const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    const totalTimeStepSlots = Math.floor(totalMinutes / timeSettings.timeStep);

    for (let i = 0; i < newDurationSlots; i++) {
        const checkTimeIndex = newTimeIndex + i;

        // Prüfen ob außerhalb des Tagesbereichs
        if (checkTimeIndex >= totalTimeStepSlots) {
            // Wiederherstellen der alten Slots
            oldBlockedSlots.forEach(key => {
                scheduledBlocks[key] = block.id;
            });

            // Visuelle Position zurücksetzen
            const element = document.querySelector(`[data-block-id="${block.id}"]`);
            if (element) {
                const GRID_STEP = 5;
                const minutesSinceStart = block.timeIndex * timeSettings.timeStep;
                const gridRowStart = Math.floor(minutesSinceStart / GRID_STEP) + 1;
                const durationGridRows = Math.floor(block.duration / GRID_STEP);
                const gridRowEnd = gridRowStart + durationGridRows;
                element.style.gridRowStart = gridRowStart;
                element.style.gridRowEnd = gridRowEnd;
            }

            // Toast-Benachrichtigung
            if (typeof showToast === 'function') {
                showToast('Block passt nicht in den verfügbaren Zeitraum!', 'error', 3000);
            }
            return;
        }

        // Prüfen ob Slot bereits belegt ist (von einem anderen Block)
        const checkKey = `${block.day}-${checkTimeIndex}`;
        if (scheduledBlocks[checkKey]) {
            // Kollision erkannt! Wiederherstellen und abbrechen
            oldBlockedSlots.forEach(key => {
                scheduledBlocks[key] = block.id;
            });

            // Visuelle Position zurücksetzen
            const element = document.querySelector(`[data-block-id="${block.id}"]`);
            if (element) {
                const GRID_STEP = 5;
                const minutesSinceStart = block.timeIndex * timeSettings.timeStep;
                const gridRowStart = Math.floor(minutesSinceStart / GRID_STEP) + 1;
                const durationGridRows = Math.floor(block.duration / GRID_STEP);
                const gridRowEnd = gridRowStart + durationGridRows;
                element.style.gridRowStart = gridRowStart;
                element.style.gridRowEnd = gridRowEnd;
            }

            // Collision-Feedback mit visueller Hervorhebung
            const blockingBlockId = scheduledBlocks[checkKey];
            const blockingBlock = blockRegistry[blockingBlockId];
            if (typeof showCollisionFeedback === 'function' && blockingBlock) {
                showCollisionFeedback(blockingBlock, block.day, newTimeIndex);
            } else {
                if (typeof showToast === 'function') {
                    showToast('Dieser Zeitraum ist bereits belegt!', 'error', 3000);
                }
            }
            return;
        }
    }

    // Schritt 3: Keine Kollision - neue Slots belegen
    for (let i = 0; i < newDurationSlots; i++) {
        const key = `${block.day}-${newTimeIndex + i}`;
        scheduledBlocks[key] = block.id;
    }

    // Block-Objekt aktualisieren
    block.timeIndex = newTimeIndex;
    block.duration = newDuration;
    // ✅ NEU: Speichere startMinutes für 5-Min-Präzision
    block.startMinutes = newStartMinutes !== undefined ? newStartMinutes : (newTimeIndex * timeSettings.timeStep);

    // Block in Registry aktualisieren
    blockRegistry[block.id] = block;

    // ✅ Data-height Attribut aktualisieren für responsive Typography
    const element = document.querySelector(`[data-block-id="${block.id}"]`);
    if (element) {
        const blockHeightPx = (newDuration / 5) * 20; // 20px pro 5-Min-Zeile
        let heightCategory = 'large';
        if (blockHeightPx < 40) heightCategory = 'small';
        else if (blockHeightPx < 80) heightCategory = 'medium';
        element.setAttribute('data-height', heightCategory);
    }

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
    // WICHTIG: Duration kann in 5-Min-Schritten sein (nicht nur timeStep)
    const durationSlots = Math.ceil(block.duration / timeSettings.timeStep);

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
    // ✅ NEU: Aktualisiere startMinutes basierend auf neuem timeIndex
    block.startMinutes = newTimeIndex * timeSettings.timeStep;
    blockRegistry[block.id] = block;

    // ✅ CSS Grid Position im DOM aktualisieren (KEIN Re-Render!)
    const element = document.querySelector(`[data-block-id="${block.id}"]`);
    if (element) {
        const GRID_STEP = 5;

        // Neue Position berechnen - ✅ NEU: Verwende startMinutes
        const minutesSinceStart = block.startMinutes;
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

        // ✅ Data-height Attribut aktualisieren für responsive Typography
        const blockHeightPx = (block.duration / 5) * 20; // 20px pro 5-Min-Zeile
        let heightCategory = 'large';
        if (blockHeightPx < 40) heightCategory = 'small';
        else if (blockHeightPx < 80) heightCategory = 'medium';
        element.setAttribute('data-height', heightCategory);
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
