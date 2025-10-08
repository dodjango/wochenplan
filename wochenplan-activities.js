// ========================================
// AKTIVITÄTEN-VERWALTUNG
// ========================================

// Aktivitäten-Blöcke erstellen
function createActivityBlocks() {
    const container = document.getElementById('activityBlocks');
    container.innerHTML = '';

    // Alphabetisch sortierte Kopie erstellen
    const sortedActivities = [...activities].sort((a, b) =>
        a.name.localeCompare(b.name, 'de')
    );

    sortedActivities.forEach((activity) => {
        // Original-Index finden für Edit/Delete
        const originalIndex = activities.findIndex(a => a.name === activity.name);

        // Container für Aktivität mit Controls
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';

        // Drag-Block
        const block = document.createElement('div');
        block.className = 'activity-block';
        block.style.backgroundColor = activity.color;
        block.style.color = getContrastColor(activity.color);
        block.textContent = activity.name;
        block.draggable = true;
        block.dataset.activity = activity.name;
        block.dataset.activityColor = activity.color;
        block.title = activity.description || activity.name;

        block.addEventListener('dragstart', (e) => {
            draggedActivity = {
                name: activity.name,
                color: activity.color,
                description: activity.description
            };
            e.dataTransfer.effectAllowed = 'copy';
        });

        // Control-Buttons als Overlay
        const controls = document.createElement('div');
        controls.className = 'activity-controls';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-small btn-edit';
        editBtn.textContent = '✏️';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            editActivity(originalIndex);
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-small btn-delete';
        deleteBtn.textContent = '🗑️';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteActivity(originalIndex);
        };

        controls.appendChild(editBtn);
        controls.appendChild(deleteBtn);

        block.appendChild(controls);
        activityItem.appendChild(block);
        container.appendChild(activityItem);
    });
}

// Kontrastfarbe berechnen
function getContrastColor(hexColor) {
    // Hex zu RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Helligkeit berechnen
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
}

// ========================================
// AKTIVITÄTEN CRUD-OPERATIONEN
// ========================================

// Aktivität bearbeiten
function editActivity(index) {
    openActivityModal(index);
}

// Aktivität löschen
function deleteActivity(index) {
    const activity = activities[index];
    if (confirm(`Aktivität "${activity.name}" wirklich löschen?`)) {
        activities.splice(index, 1);
        saveActivities();
        createActivityBlocks();
    }
}

// Modal-Funktionen
function openActivityModal(editIndex = null) {
    const modal = document.getElementById('activityModal');
    const title = document.getElementById('modalTitle');
    const nameInput = document.getElementById('activityName');
    const colorInput = document.getElementById('activityColor');
    const descriptionInput = document.getElementById('activityDescription');

    if (editIndex !== null) {
        // Bearbeiten
        currentEditingActivity = editIndex;
        title.textContent = 'Aktivität bearbeiten';
        nameInput.value = activities[editIndex].name;
        colorInput.value = activities[editIndex].color;
        descriptionInput.value = activities[editIndex].description || '';
    } else {
        // Neu erstellen
        currentEditingActivity = null;
        title.textContent = 'Neue Aktivität';
        nameInput.value = '';
        colorInput.value = '#4CAF50';
        descriptionInput.value = '';
    }

    modal.style.display = 'block';
    nameInput.focus();
}

function closeActivityModal() {
    document.getElementById('activityModal').style.display = 'none';
    currentEditingActivity = null;
}

// Form-Handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('activityForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('activityName').value.trim();
            const color = document.getElementById('activityColor').value;
            const description = document.getElementById('activityDescription').value.trim();

            if (!name) {
                showToast('Bitte geben Sie einen Namen ein!', 'error', 3000);
                return;
            }

            // Prüfen ob Name bereits existiert (außer bei Bearbeitung)
            const existingIndex = activities.findIndex(a => a.name.toLowerCase() === name.toLowerCase());
            if (existingIndex !== -1 && existingIndex !== currentEditingActivity) {
                showToast('Eine Aktivität mit diesem Namen existiert bereits!', 'error', 3000);
                return;
            }

            const activityData = { name, color, description };

            if (currentEditingActivity !== null) {
                // Bearbeiten
                activities[currentEditingActivity] = activityData;
            } else {
                // Neu hinzufügen
                activities.push(activityData);
            }

            saveActivities();
            createActivityBlocks();
            closeActivityModal();
        });
    }
});
