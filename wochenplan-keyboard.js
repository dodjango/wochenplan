// ========================================
// TASTATUR-NAVIGATION & UNDO/REDO
// ========================================
// Features: Tab-Navigation, Pfeiltasten, Delete, Ctrl+Z/Y, Command-History

/**
 * Command-History für Undo/Redo
 * Implementiert das Command-Pattern für rückgängig machbare Operationen
 */
class CommandHistory {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.maxSize = 50;
    }

    /**
     * Führt einen Command aus und fügt ihn zur History hinzu
     * @param {Object} command - Command-Objekt mit execute() und undo() Methoden
     */
    execute(command) {
        // Alle Commands nach currentIndex entfernen (wenn mitten in History)
        this.history = this.history.slice(0, this.currentIndex + 1);

        // Command ausführen
        command.execute();

        // Zur History hinzufügen
        this.history.push(command);
        this.currentIndex++;

        // History-Größe limitieren
        if (this.history.length > this.maxSize) {
            this.history.shift();
            this.currentIndex--;
        }

        this.updateUndoRedoButtons();
    }

    /**
     * Letzten Command rückgängig machen
     */
    undo() {
        if (!this.canUndo()) {
            showToast('Nichts zum Rückgängig machen', 'info', 2000);
            return;
        }

        const command = this.history[this.currentIndex];
        command.undo();
        this.currentIndex--;

        this.updateUndoRedoButtons();

        // Announcement
        if (typeof announceToScreenReader === 'function') {
            announceToScreenReader('Rückgängig gemacht', 'polite');
        }
    }

    /**
     * Letzten rückgängig gemachten Command wiederholen
     */
    redo() {
        if (!this.canRedo()) {
            showToast('Nichts zum Wiederholen', 'info', 2000);
            return;
        }

        this.currentIndex++;
        const command = this.history[this.currentIndex];
        command.execute();

        this.updateUndoRedoButtons();

        // Announcement
        if (typeof announceToScreenReader === 'function') {
            announceToScreenReader('Wiederholt', 'polite');
        }
    }

    canUndo() {
        return this.currentIndex >= 0;
    }

    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    clear() {
        this.history = [];
        this.currentIndex = -1;
        this.updateUndoRedoButtons();
    }

    updateUndoRedoButtons() {
        // Optional: UI-Buttons für Undo/Redo aktualisieren
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');

        if (undoBtn) {
            undoBtn.disabled = !this.canUndo();
            undoBtn.title = this.canUndo()
                ? `Rückgängig: ${this.history[this.currentIndex].description}`
                : 'Nichts zum Rückgängig machen';
        }

        if (redoBtn) {
            redoBtn.disabled = !this.canRedo();
            redoBtn.title = this.canRedo()
                ? `Wiederholen: ${this.history[this.currentIndex + 1].description}`
                : 'Nichts zum Wiederholen';
        }
    }
}

// Globale Command-History Instanz
const commandHistory = new CommandHistory();

// ========================================
// COMMAND-OBJEKTE
// ========================================

/**
 * Command zum Hinzufügen eines Blocks
 */
class AddBlockCommand {
    constructor(day, timeIndex, activity, duration) {
        this.day = day;
        this.timeIndex = timeIndex;
        this.activity = activity;
        this.duration = duration;
        this.blockId = null;
        this.description = `${activity.name} hinzufügen`;
    }

    execute() {
        // Block hinzufügen (ohne Command-History!)
        const block = addScheduledBlockDirect(this.day, this.timeIndex, this.activity, this.duration);
        if (block) {
            this.blockId = block.id;
        }
    }

    undo() {
        if (this.blockId) {
            removeScheduledBlockDirect(this.blockId);
        }
    }
}

/**
 * Command zum Entfernen eines Blocks
 */
class RemoveBlockCommand {
    constructor(blockId) {
        this.blockId = blockId;
        this.blockData = { ...blockRegistry[blockId] }; // Kopie der Daten
        this.description = `${this.blockData.activity.name} löschen`;
    }

    execute() {
        removeScheduledBlockDirect(this.blockId);
    }

    undo() {
        // Block wiederherstellen
        const block = addScheduledBlockDirect(
            this.blockData.day,
            this.blockData.timeIndex,
            this.blockData.activity,
            this.blockData.duration
        );
        if (block) {
            // Ursprüngliche ID wiederherstellen
            const oldId = block.id;
            delete blockRegistry[oldId];
            blockRegistry[this.blockId] = { ...this.blockData, id: this.blockId };

            // Scheduled-Blocks aktualisieren
            Object.keys(scheduledBlocks).forEach(key => {
                if (scheduledBlocks[key] === oldId) {
                    scheduledBlocks[key] = this.blockId;
                }
            });

            // DOM aktualisieren
            const element = document.querySelector(`[data-block-id="${oldId}"]`);
            if (element) {
                element.dataset.blockId = this.blockId;
            }
        }
    }
}

/**
 * Command zum Verschieben eines Blocks
 */
class MoveBlockCommand {
    constructor(blockId, oldDay, oldTimeIndex, newDay, newTimeIndex) {
        this.blockId = blockId;
        this.oldDay = oldDay;
        this.oldTimeIndex = oldTimeIndex;
        this.newDay = newDay;
        this.newTimeIndex = newTimeIndex;
        const block = blockRegistry[blockId];
        this.description = `${block.activity.name} verschieben`;
    }

    execute() {
        const block = blockRegistry[this.blockId];
        moveScheduledBlockDirect(block, this.newDay, this.newTimeIndex);
    }

    undo() {
        const block = blockRegistry[this.blockId];
        moveScheduledBlockDirect(block, this.oldDay, this.oldTimeIndex);
    }
}

/**
 * Command zum Resize eines Blocks
 */
class ResizeBlockCommand {
    constructor(blockId, oldTimeIndex, oldDuration, newTimeIndex, newDuration) {
        this.blockId = blockId;
        this.oldTimeIndex = oldTimeIndex;
        this.oldDuration = oldDuration;
        this.newTimeIndex = newTimeIndex;
        this.newDuration = newDuration;
        const block = blockRegistry[blockId];
        this.description = `${block.activity.name} Größe ändern`;
    }

    execute() {
        const block = blockRegistry[this.blockId];
        updateBlockAfterResize(block, this.newTimeIndex, this.newDuration);
    }

    undo() {
        const block = blockRegistry[this.blockId];
        updateBlockAfterResize(block, this.oldTimeIndex, this.oldDuration);
    }
}

// ========================================
// DIREKTE OPERATIONEN (ohne Command-History)
// ========================================

// Diese Funktionen führen die Operationen direkt aus, ohne sie zur History hinzuzufügen
// Sie werden von Commands und Undo/Redo verwendet

function addScheduledBlockDirect(day, timeIndex, activity, duration) {
    // Original-Funktion ohne hasUnsavedChanges-Trigger und Command-History
    const blockId = Date.now().toString();
    const durationSlots = duration / timeSettings.timeStep;

    // Kollisionsprüfung
    for (let i = 0; i < durationSlots; i++) {
        const checkTimeIndex = timeIndex + i;
        const [startHour, startMinute] = timeSettings.startTime.split(':').map(Number);
        const [endHour, endMinute] = timeSettings.endTime.split(':').map(Number);
        const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
        const totalTimeStepSlots = Math.floor(totalMinutes / timeSettings.timeStep);

        if (checkTimeIndex >= totalTimeStepSlots) {
            return null;
        }

        const checkKey = `${day}-${checkTimeIndex}`;
        if (scheduledBlocks[checkKey]) {
            const blockingBlockId = scheduledBlocks[checkKey];
            const blockingBlock = blockRegistry[blockingBlockId];
            if (typeof showCollisionFeedback === 'function') {
                showCollisionFeedback(blockingBlock, day, timeIndex);
            }
            return null;
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

    blockRegistry[blockId] = block;

    for (let i = 0; i < durationSlots; i++) {
        const key = `${day}-${timeIndex + i}`;
        scheduledBlocks[key] = blockId;
    }

    renderScheduledBlock(block);
    saveWeek();

    return block;
}

function removeScheduledBlockDirect(blockId) {
    // Original-Funktion ohne hasUnsavedChanges-Trigger
    const blockedSlots = Object.keys(scheduledBlocks).filter(key => scheduledBlocks[key] === blockId);
    blockedSlots.forEach(key => delete scheduledBlocks[key]);

    delete blockRegistry[blockId];

    const element = document.querySelector(`[data-block-id="${blockId}"]`);
    if (element) {
        element.remove();
    }

    saveWeek();
}

function moveScheduledBlockDirect(block, newDay, newTimeIndex) {
    // Original-moveScheduledBlock Logik ohne Fehler-Alerts
    const durationSlots = block.duration / timeSettings.timeStep;

    const oldElement = document.querySelector(`[data-block-id="${block.id}"]`);
    if (oldElement) {
        oldElement.remove();
    }

    const oldBlockedSlots = Object.keys(scheduledBlocks).filter(key => scheduledBlocks[key] === block.id);
    oldBlockedSlots.forEach(key => delete scheduledBlocks[key]);

    // Kollisionsprüfung
    for (let i = 0; i < durationSlots; i++) {
        const checkTimeIndex = newTimeIndex + i;
        const checkKey = `${newDay}-${checkTimeIndex}`;
        if (scheduledBlocks[checkKey]) {
            // Bei Kollision: Block an alter Position wiederherstellen
            for (let j = 0; j < durationSlots; j++) {
                const restoreKey = `${block.day}-${block.timeIndex + j}`;
                scheduledBlocks[restoreKey] = block.id;
            }
            renderScheduledBlock(block);
            return false;
        }
    }

    // Block an neue Position setzen
    for (let i = 0; i < durationSlots; i++) {
        const key = `${newDay}-${newTimeIndex + i}`;
        scheduledBlocks[key] = block.id;
    }

    block.day = newDay;
    block.timeIndex = newTimeIndex;
    blockRegistry[block.id] = block;

    renderScheduledBlock(block);
    saveWeek();

    return true;
}

// ========================================
// TASTATUR-NAVIGATION
// ========================================

let currentFocusedBlockId = null;

/**
 * Tastatur-Navigation Setup
 * Wird in init() aufgerufen
 */
function setupKeyboardNavigation() {
    // Globale Tastatur-Events
    document.addEventListener('keydown', handleGlobalKeydown);

    console.log('Tastatur-Navigation initialisiert (Tab, Pfeile, Delete, Ctrl+Z/Y)');
}

function handleGlobalKeydown(e) {
    // Ctrl+Z / Cmd+Z: Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        commandHistory.undo();
        return;
    }

    // Ctrl+Y / Cmd+Shift+Z: Redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        commandHistory.redo();
        return;
    }

    // Nur wenn ein Block fokussiert ist
    if (!currentFocusedBlockId) return;

    const block = blockRegistry[currentFocusedBlockId];
    if (!block) return;

    switch (e.key) {
        case 'Delete':
        case 'Backspace':
            e.preventDefault();
            deleteBlockWithUndo(currentFocusedBlockId);
            break;

        case 'ArrowUp':
            e.preventDefault();
            moveBlockByKeyboard(block, 0, -1);
            break;

        case 'ArrowDown':
            e.preventDefault();
            moveBlockByKeyboard(block, 0, 1);
            break;

        case 'ArrowLeft':
            e.preventDefault();
            moveBlockByKeyboard(block, -1, 0);
            break;

        case 'ArrowRight':
            e.preventDefault();
            moveBlockByKeyboard(block, 1, 0);
            break;

        case 'Escape':
            e.preventDefault();
            unfocusBlock();
            break;
    }
}

/**
 * Block-Fokus hinzufügen (wird in renderScheduledBlock() aufgerufen)
 */
function addKeyboardFocusToBlock(element, blockId) {
    element.setAttribute('tabindex', '0');

    element.addEventListener('focus', () => {
        focusBlock(blockId);
    });

    element.addEventListener('blur', () => {
        // Nur unfocus wenn kein anderer Block sofort fokussiert wird
        setTimeout(() => {
            if (currentFocusedBlockId === blockId && document.activeElement !== element) {
                unfocusBlock();
            }
        }, 100);
    });

    // Keyboard-Aktivierung (Enter/Space)
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            focusBlock(blockId);
        }
    });
}

function focusBlock(blockId) {
    // Alten Fokus entfernen
    if (currentFocusedBlockId) {
        const oldElement = document.querySelector(`[data-block-id="${currentFocusedBlockId}"]`);
        if (oldElement) {
            oldElement.classList.remove('keyboard-focused');
        }
    }

    // Neuen Fokus setzen
    currentFocusedBlockId = blockId;
    const element = document.querySelector(`[data-block-id="${blockId}"]`);
    if (element) {
        element.classList.add('keyboard-focused');
        element.focus();

        // Screen-Reader Announcement
        const block = blockRegistry[blockId];
        if (block && typeof announceToScreenReader === 'function') {
            const dayName = getDayNameInGerman ? getDayNameInGerman(block.day) : block.day;
            announceToScreenReader(`${block.activity.name} fokussiert, ${dayName}`, 'polite');
        }
    }
}

function unfocusBlock() {
    if (currentFocusedBlockId) {
        const element = document.querySelector(`[data-block-id="${currentFocusedBlockId}"]`);
        if (element) {
            element.classList.remove('keyboard-focused');
            element.blur();
        }
    }
    currentFocusedBlockId = null;
}

function moveBlockByKeyboard(block, dayDelta, timeDelta) {
    // Neuen Tag berechnen
    const currentDayIndex = days.indexOf(block.day);
    const newDayIndex = currentDayIndex + dayDelta;

    if (newDayIndex < 0 || newDayIndex >= days.length) {
        showToast('Block kann nicht weiter verschoben werden', 'info', 2000);
        return;
    }

    const newDay = days[newDayIndex];
    const newTimeIndex = block.timeIndex + timeDelta;

    // Command erstellen und ausführen
    const command = new MoveBlockCommand(block.id, block.day, block.timeIndex, newDay, newTimeIndex);
    commandHistory.execute(command);

    // Fokus beibehalten
    setTimeout(() => {
        focusBlock(block.id);
    }, 100);
}

function deleteBlockWithUndo(blockId) {
    const block = blockRegistry[blockId];
    if (!block) return;

    const command = new RemoveBlockCommand(blockId);
    commandHistory.execute(command);

    // Fokus entfernen
    unfocusBlock();

    showToast(`${block.activity.name} gelöscht (Strg+Z zum Rückgängig machen)`, 'info', 3000);
}
