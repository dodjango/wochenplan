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
