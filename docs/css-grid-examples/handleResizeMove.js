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
