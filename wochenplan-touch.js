// ========================================
// TOUCH-EVENT-SUPPORT
// ========================================
// Parallele Touch-Events zu Mouse-Events für Mobile/Tablet
// Features: Long-Press (500ms) für Resize, Haptic Feedback, Touch-Drag

// Touch-State Management
let touchState = {
    isActive: false,
    mode: null, // 'drag' | 'resize-top' | 'resize-bottom'
    currentTarget: null,
    dragImage: null,
    startX: 0,
    startY: 0,
    longPressTimer: null,
    currentBlock: null,
    currentActivity: null
};

/**
 * Touch-Events Setup
 * Wird in init() aufgerufen
 */
function setupTouchEvents() {
    // Touch-Events für Aktivitäten (Sidebar)
    setupTouchForActivities();

    // Touch-Events für geplante Blöcke (Kalender)
    // Diese werden dynamisch in renderScheduledBlock() hinzugefügt
    setupTouchForScheduledBlocks();

    // Touch-Events für Kalender-Zellen (Drop-Zonen)
    setupTouchForCalendarCells();

    console.log('Touch-Events initialisiert');
}

/**
 * Touch-Events für Aktivitäten-Sidebar
 */
function setupTouchForActivities() {
    const activitiesList = document.getElementById('activitiesList');
    if (!activitiesList) return;

    // Delegation für dynamische Aktivitäten
    activitiesList.addEventListener('touchstart', handleActivityTouchStart, { passive: false });
    activitiesList.addEventListener('touchmove', handleActivityTouchMove, { passive: false });
    activitiesList.addEventListener('touchend', handleActivityTouchEnd, { passive: false });
}

function handleActivityTouchStart(e) {
    const activityItem = e.target.closest('.activity-item');
    if (!activityItem) return;

    e.preventDefault();

    const activityName = activityItem.dataset.activityName;
    const activity = activities.find(a => a.name === activityName);
    if (!activity) return;

    touchState.isActive = true;
    touchState.mode = 'drag';
    touchState.currentActivity = activity;
    touchState.currentTarget = activityItem;
    touchState.startX = e.touches[0].clientX;
    touchState.startY = e.touches[0].clientY;

    // Ghost-Image erstellen
    touchState.dragImage = createTouchDragImage(activity);
    document.body.appendChild(touchState.dragImage);

    // Haptic Feedback
    triggerHapticFeedback();

    // Original Element visuell abdunkeln
    activityItem.style.opacity = '0.5';
}

function handleActivityTouchMove(e) {
    if (!touchState.isActive || touchState.mode !== 'drag') return;

    e.preventDefault();

    const touch = e.touches[0];

    // Drag-Image bewegen
    if (touchState.dragImage) {
        touchState.dragImage.style.left = `${touch.clientX - 50}px`;
        touchState.dragImage.style.top = `${touch.clientY - 20}px`;
    }

    // Drop-Zone highlighten
    highlightDropZoneUnderTouch(touch);
}

function handleActivityTouchEnd(e) {
    if (!touchState.isActive || touchState.mode !== 'drag') return;

    e.preventDefault();

    const touch = e.changedTouches[0];
    const dropCell = getCalendarCellUnderTouch(touch);

    if (dropCell && touchState.currentActivity) {
        // Block platzieren
        const day = dropCell.dataset.day;
        const timeIndex = parseInt(dropCell.dataset.timeIndex);
        const duration = RESIZE_STEP; // Immer 5 Min Minimum

        addScheduledBlock(day, timeIndex, touchState.currentActivity, duration);
        triggerHapticFeedback();
    }

    // Cleanup
    cleanupTouchDrag();
}

/**
 * Touch-Events für geplante Blöcke
 */
function setupTouchForScheduledBlocks() {
    // Diese Funktion wird für jeden neuen Block in renderScheduledBlock() aufgerufen
    // Siehe addTouchEventsToScheduledBlock()
}

/**
 * Touch-Events zu einem geplanten Block hinzufügen
 * Wird in renderScheduledBlock() aufgerufen
 */
function addTouchEventsToScheduledBlock(element, block) {
    // Touchstart für Drag & Resize-Detection
    element.addEventListener('touchstart', (e) => {
        handleScheduledBlockTouchStart(e, element, block);
    }, { passive: false });

    element.addEventListener('touchmove', (e) => {
        handleScheduledBlockTouchMove(e, element, block);
    }, { passive: false });

    element.addEventListener('touchend', (e) => {
        handleScheduledBlockTouchEnd(e, element, block);
    }, { passive: false });

    // Resize-Handles für Touch
    const resizeHandleTop = element.querySelector('.resize-handle-top');
    const resizeHandleBottom = element.querySelector('.resize-handle-bottom');

    if (resizeHandleTop) {
        resizeHandleTop.addEventListener('touchstart', (e) => {
            handleResizeHandleTouchStart(e, element, block, 'top');
        }, { passive: false });
    }

    if (resizeHandleBottom) {
        resizeHandleBottom.addEventListener('touchstart', (e) => {
            handleResizeHandleTouchStart(e, element, block, 'bottom');
        }, { passive: false });
    }
}

function handleScheduledBlockTouchStart(e, element, block) {
    // Wenn auf Resize-Handle geklickt wurde, nicht als Drag starten
    if (e.target.classList.contains('resize-handle') ||
        e.target.classList.contains('resize-handle-top') ||
        e.target.classList.contains('resize-handle-bottom') ||
        e.target.classList.contains('remove-btn')) {
        return;
    }

    e.preventDefault();

    touchState.isActive = true;
    touchState.mode = 'drag';
    touchState.currentBlock = block;
    touchState.currentTarget = element;
    touchState.startX = e.touches[0].clientX;
    touchState.startY = e.touches[0].clientY;

    // Long-Press Timer für Resize-Mode (optional)
    touchState.longPressTimer = setTimeout(() => {
        // Long-Press erkannt - könnte für spezielle Features genutzt werden
        triggerHapticFeedback(20); // Längeres Feedback
    }, 500);

    // Ghost-Image erstellen
    touchState.dragImage = createTouchDragImageFromBlock(block, element);
    document.body.appendChild(touchState.dragImage);

    // Original Element visuell abdunkeln
    element.style.opacity = '0.5';

    triggerHapticFeedback();
}

function handleScheduledBlockTouchMove(e, element, block) {
    if (!touchState.isActive || touchState.mode !== 'drag') return;

    e.preventDefault();

    // Long-Press Timer abbrechen bei Bewegung
    if (touchState.longPressTimer) {
        clearTimeout(touchState.longPressTimer);
        touchState.longPressTimer = null;
    }

    const touch = e.touches[0];

    // Drag-Image bewegen
    if (touchState.dragImage) {
        touchState.dragImage.style.left = `${touch.clientX - 50}px`;
        touchState.dragImage.style.top = `${touch.clientY - 20}px`;
    }

    // Drop-Zone highlighten
    highlightDropZoneUnderTouch(touch);
}

function handleScheduledBlockTouchEnd(e, element, block) {
    if (!touchState.isActive || touchState.mode !== 'drag') return;

    e.preventDefault();

    // Long-Press Timer aufräumen
    if (touchState.longPressTimer) {
        clearTimeout(touchState.longPressTimer);
        touchState.longPressTimer = null;
    }

    const touch = e.changedTouches[0];
    const dropCell = getCalendarCellUnderTouch(touch);

    if (dropCell && touchState.currentBlock) {
        // Block verschieben
        const newDay = dropCell.dataset.day;
        const newTimeIndex = parseInt(dropCell.dataset.timeIndex);

        moveScheduledBlock(touchState.currentBlock, newDay, newTimeIndex);
        triggerHapticFeedback();
    }

    // Cleanup
    cleanupTouchDrag();
}

/**
 * Touch-Events für Resize-Handles
 */
function handleResizeHandleTouchStart(e, element, block, direction) {
    e.preventDefault();
    e.stopPropagation();

    touchState.isActive = true;
    touchState.mode = direction === 'top' ? 'resize-top' : 'resize-bottom';
    touchState.currentBlock = block;
    touchState.currentTarget = element;
    touchState.startY = e.touches[0].clientY;

    // Resize-State speichern
    touchState.resizeStartHeight = parseInt(element.style.height) || element.offsetHeight;
    touchState.resizeStartTimeIndex = block.timeIndex;
    touchState.resizeStartDuration = block.duration;

    element.classList.add('resizing');
    triggerHapticFeedback();

    // Touch-Move und Touch-End Events
    document.addEventListener('touchmove', handleResizeTouchMove, { passive: false });
    document.addEventListener('touchend', handleResizeTouchEnd, { passive: false });
}

function handleResizeTouchMove(e) {
    if (!touchState.isActive || (!touchState.mode.startsWith('resize-'))) return;

    e.preventDefault();

    const touch = e.touches[0];
    const deltaY = touch.clientY - touchState.startY;

    // ✅ KRITISCH: Touch-Resize snappt auf 5-Minuten (UNABHÄNGIG von timeStep)
    const GRID_ROW_HEIGHT = 20; // px pro 5-Min-Zeile
    const resizeStepHeight = GRID_ROW_HEIGHT; // 20px pro 5-Min-Schritt

    const deltaResizeSteps = Math.round(deltaY / resizeStepHeight); // Anzahl 5-Min-Schritte

    let newDuration = touchState.resizeStartDuration;
    let newTimeIndex = touchState.resizeStartTimeIndex;

    if (touchState.mode === 'resize-bottom') {
        // Bottom-Resize: Start bleibt fix, Ende wächst (in 5-Min-Schritten)
        newDuration = touchState.resizeStartDuration + (deltaResizeSteps * RESIZE_STEP);
    } else if (touchState.mode === 'resize-top') {
        // Top-Resize: Ende bleibt fix, Start bewegt sich (in 5-Min-Schritten)
        const durationChange = -deltaResizeSteps * RESIZE_STEP;
        newDuration = touchState.resizeStartDuration + durationChange;
        newTimeIndex = touchState.resizeStartTimeIndex + deltaResizeSteps;
    }

    // Minimum: 5 Minuten (RESIZE_STEP)
    if (newDuration < RESIZE_STEP) {
        newDuration = RESIZE_STEP;
        if (touchState.mode === 'resize-top') {
            newTimeIndex = touchState.resizeStartTimeIndex + Math.floor((touchState.resizeStartDuration - RESIZE_STEP) / RESIZE_STEP);
        }
    }

    // Visuelle Vorschau (Grid-basiert)
    const element = touchState.currentTarget;
    const GRID_STEP = 5;
    const durationGridRows = Math.floor(newDuration / GRID_STEP);

    // Setze Grid-Position statt Height
    const minutesSinceStart = newTimeIndex * timeSettings.timeStep;
    const gridRowStart = Math.floor(minutesSinceStart / GRID_STEP) + 1;
    const gridRowEnd = gridRowStart + durationGridRows;

    element.style.gridRowStart = gridRowStart;
    element.style.gridRowEnd = gridRowEnd;

    // Position aktualisieren bei top-resize
    if (touchState.mode === 'resize-top') {
        const cell = document.querySelector(`[data-day="${touchState.currentBlock.day}"][data-time-index="${newTimeIndex}"]`);
        if (cell && cell !== element.parentElement) {
            cell.appendChild(element);
        }
    }
}

function handleResizeTouchEnd(e) {
    if (!touchState.isActive || (!touchState.mode.startsWith('resize-'))) return;

    e.preventDefault();

    const element = touchState.currentTarget;
    element.classList.remove('resizing');

    // Finale Werte aus Grid-Position berechnen
    const GRID_STEP = 5;
    const gridRowStart = parseInt(element.style.gridRowStart);
    const gridRowEnd = parseInt(element.style.gridRowEnd);

    // Grid Row → Minuten seit Tagesbeginn
    const minutesSinceStart = (gridRowStart - 1) * GRID_STEP;

    // Minuten → timeIndex (basierend auf timeStep)
    const newTimeIndexFinal = Math.floor(minutesSinceStart / timeSettings.timeStep);

    // Grid-Zeilen → Dauer in Minuten
    const durationGridRows = gridRowEnd - gridRowStart;
    const newDuration = durationGridRows * GRID_STEP;

    // Daten aktualisieren (nutze berechnete Werte)
    updateBlockAfterResize(touchState.currentBlock, newTimeIndexFinal, newDuration);

    triggerHapticFeedback();

    // Cleanup
    document.removeEventListener('touchmove', handleResizeTouchMove);
    document.removeEventListener('touchend', handleResizeTouchEnd);

    touchState.isActive = false;
    touchState.mode = null;
    touchState.currentTarget = null;
}

/**
 * Touch-Events für Kalender-Zellen
 */
function setupTouchForCalendarCells() {
    // Wird über Event-Delegation in handleActivityTouchMove gehandhabt
}

// ========================================
// HILFSFUNKTIONEN
// ========================================

/**
 * Erstellt Ghost-Image für Activity-Drag
 */
function createTouchDragImage(activity) {
    const ghost = document.createElement('div');
    ghost.className = 'touch-drag-ghost';
    ghost.style.position = 'fixed';
    ghost.style.pointerEvents = 'none';
    ghost.style.zIndex = '10000';
    ghost.style.backgroundColor = activity.color;
    ghost.style.color = getContrastColor(activity.color);
    ghost.style.padding = '8px 16px';
    ghost.style.borderRadius = '8px';
    ghost.style.fontWeight = 'bold';
    ghost.style.fontSize = '14px';
    ghost.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    ghost.style.opacity = '0.9';
    ghost.textContent = activity.name;

    return ghost;
}

/**
 * Erstellt Ghost-Image für Block-Drag
 */
function createTouchDragImageFromBlock(block, element) {
    const ghost = document.createElement('div');
    ghost.className = 'touch-drag-ghost';
    ghost.style.position = 'fixed';
    ghost.style.pointerEvents = 'none';
    ghost.style.zIndex = '10000';
    ghost.style.backgroundColor = block.activity.color;
    ghost.style.color = getContrastColor(block.activity.color);
    ghost.style.padding = '8px 16px';
    ghost.style.borderRadius = '8px';
    ghost.style.fontWeight = 'bold';
    ghost.style.fontSize = '14px';
    ghost.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    ghost.style.opacity = '0.9';
    ghost.style.width = `${element.offsetWidth}px`;
    ghost.textContent = block.activity.name;

    return ghost;
}

/**
 * Findet Kalender-Zelle unter Touch-Point
 */
function getCalendarCellUnderTouch(touch) {
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return null;

    // Suche nach .calendar-cell
    return element.closest('.calendar-cell');
}

/**
 * Highlightet Drop-Zone unter Touch
 */
function highlightDropZoneUnderTouch(touch) {
    // Alle bestehenden Highlights entfernen
    document.querySelectorAll('.drop-zone').forEach(cell => {
        cell.classList.remove('drop-zone');
    });

    // Neue Highlight setzen
    const dropCell = getCalendarCellUnderTouch(touch);
    if (dropCell) {
        dropCell.classList.add('drop-zone');
    }
}

/**
 * Räumt Touch-Drag State auf
 */
function cleanupTouchDrag() {
    // Drag-Image entfernen
    if (touchState.dragImage) {
        touchState.dragImage.remove();
        touchState.dragImage = null;
    }

    // Original-Element wiederherstellen
    if (touchState.currentTarget) {
        touchState.currentTarget.style.opacity = '1';
    }

    // Drop-Zone-Highlights entfernen
    document.querySelectorAll('.drop-zone').forEach(cell => {
        cell.classList.remove('drop-zone');
    });

    // Long-Press Timer aufräumen
    if (touchState.longPressTimer) {
        clearTimeout(touchState.longPressTimer);
        touchState.longPressTimer = null;
    }

    // State zurücksetzen
    touchState.isActive = false;
    touchState.mode = null;
    touchState.currentTarget = null;
    touchState.currentBlock = null;
    touchState.currentActivity = null;
}

/**
 * Haptic Feedback (falls unterstützt)
 */
function triggerHapticFeedback(duration = 10) {
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}
