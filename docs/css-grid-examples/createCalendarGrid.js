function createCalendarGrid() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    updateCalendarCSS();

    // Berechne Gesamtanzahl timeStep-Slots (für calendar-cells)
    const [startHour, startMinute] = timeSettings.startTime.split(':').map(Number);
    const [endHour, endMinute] = timeSettings.endTime.split(':').map(Number);
    const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    const totalTimeStepSlots = Math.floor(totalMinutes / timeSettings.timeStep);
    const cellsPerHour = 60 / timeSettings.timeStep; // z.B. 6 bei timeStep=10

    let globalTimeIndex = 0; // Läuft durch alle timeStep-Slots

    // Nur Stunden-Marker anzeigen
    timeSlots.forEach((hourTime, hourIndex) => {
        // Zeit-Spalte (Stunden-Marker)
        const timeCell = document.createElement('div');
        timeCell.className = 'time-slot';
        timeCell.textContent = hourTime;
        grid.appendChild(timeCell);

        // Calendar-cells für diese Stunde (basierend auf timeStep)
        for (let cellInHour = 0; cellInHour < cellsPerHour; cellInHour++) {
            if (globalTimeIndex >= totalTimeStepSlots) break;

            days.forEach((day) => {
                const cell = document.createElement('div');
                cell.className = 'calendar-cell';
                cell.dataset.day = day;
                cell.dataset.timeIndex = globalTimeIndex;

                // Drag & Drop Events (wie bisher)
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
                        const duration = timeSettings.timeStep;
                        addScheduledBlock(day, globalTimeIndex, draggedActivity, duration);
                    } else if (currentDraggedBlock) {
                        moveScheduledBlock(currentDraggedBlock, day, globalTimeIndex);
                    }

                    draggedActivity = null;
                    currentDraggedBlock = null;
                });

                grid.appendChild(cell);
            });

            globalTimeIndex++;
        }
    });
}
