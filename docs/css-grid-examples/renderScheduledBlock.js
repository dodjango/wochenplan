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

    // ✅ Direkt ins Grid einfügen (NICHT in cell)
    grid.appendChild(element);
}
