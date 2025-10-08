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
        .time-slot {
            min-height: ${GRID_ROW_HEIGHT * 12}px; /* 12 Zeilen = 1 Stunde */
        }
    `;
    document.head.appendChild(style);
}
