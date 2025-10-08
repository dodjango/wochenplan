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
