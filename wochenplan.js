// Aktivitäten-Verwaltung
let activities = [];
let currentEditingActivity = null;

// Zeiteinstellungen
let timeSettings = {
    startTime: "06:00",
    endTime: "22:00",
    timeStep: 10
};

// Standard-Aktivitäten mit ageDefaults
const defaultActivities = [
    {
        name: "Schule",
        color: "#5a6c7d",
        description: "Der reguläre Schulunterricht mit allen Fächern wie Deutsch, Mathe, Sachkunde und mehr",
        ageDefaults: {
            "6-10": {
                dailyMinutes: 300,
                weeklyMinutes: 1500,
                preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
                preferredTimes: ["08:00"],
                priority: 1
            },
            "11-14": {
                dailyMinutes: 360,
                weeklyMinutes: 1800,
                preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
                preferredTimes: ["08:00"],
                priority: 1
            },
            "15-18": {
                dailyMinutes: 420,
                weeklyMinutes: 2100,
                preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
                preferredTimes: ["08:00"],
                priority: 1
            }
        }
    },
    {
        name: "Hausaufgaben",
        color: "#4ecdc4",
        description: "Zeit für Schulaufgaben machen und für Tests oder Klassenarbeiten lernen",
        ageDefaults: {
            "6-10": {
                dailyMinutes: 60,
                weeklyMinutes: 300,
                preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
                preferredTimes: ["15:00", "16:00"],
                priority: 2
            },
            "11-14": {
                dailyMinutes: 90,
                weeklyMinutes: 450,
                preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
                preferredTimes: ["15:30", "16:30"],
                priority: 2
            },
            "15-18": {
                dailyMinutes: 120,
                weeklyMinutes: 600,
                preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
                preferredTimes: ["16:00", "17:00"],
                priority: 2
            }
        }
    },
    {
        name: "Hausaufgabenbetreuung",
        color: "#2ecc71",
        description: "Hausaufgaben werden gemeinsam mit anderen Kindern und einer Betreuerin gemacht",
        ageDefaults: {
            "6-10": {
                dailyMinutes: 90,
                weeklyMinutes: 450,
                preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
                preferredTimes: ["14:00", "15:00"],
                priority: 3
            },
            "11-14": {
                dailyMinutes: 0,
                weeklyMinutes: 0,
                preferredDays: [],
                preferredTimes: [],
                priority: 10
            }
        }
    },
    {
        name: "Trompetenunterricht",
        color: "#9b59b6",
        description: "Musikstunde mit dem Trompetenlehrer - neue Lieder und Techniken lernen",
        ageDefaults: {
            "6-10": {
                dailyMinutes: 0,
                weeklyMinutes: 60,
                preferredDays: ["tuesday", "thursday"],
                preferredTimes: ["16:00", "17:00"],
                priority: 4
            },
            "11-14": {
                dailyMinutes: 0,
                weeklyMinutes: 90,
                preferredDays: ["tuesday", "thursday"],
                preferredTimes: ["17:00", "18:00"],
                priority: 4
            },
            "15-18": {
                dailyMinutes: 0,
                weeklyMinutes: 90,
                preferredDays: ["tuesday", "thursday"],
                preferredTimes: ["18:00", "19:00"],
                priority: 4
            }
        }
    },
    {
        name: "Trompete",
        color: "#9b59b6",
        description: "Zuhause Trompete üben - die gelernten Lieder spielen und besser werden",
        ageDefaults: {
            "6-10": {
                dailyMinutes: 20,
                weeklyMinutes: 100,
                preferredDays: ["monday", "wednesday", "friday"],
                preferredTimes: ["17:00", "18:00"],
                priority: 5
            },
            "11-14": {
                dailyMinutes: 30,
                weeklyMinutes: 150,
                preferredDays: ["monday", "wednesday", "friday"],
                preferredTimes: ["17:30", "18:30"],
                priority: 5
            },
            "15-18": {
                dailyMinutes: 45,
                weeklyMinutes: 225,
                preferredDays: ["monday", "wednesday", "friday"],
                preferredTimes: ["19:00", "20:00"],
                priority: 5
            }
        }
    },
    {
        name: "Saxophonunterricht",
        color: "#9b59b6",
        description: "Musikstunde mit dem Saxophonlehrer - neue Lieder und Techniken lernen",
        ageDefaults: {
            "11-14": {
                dailyMinutes: 0,
                weeklyMinutes: 60,
                preferredDays: ["monday", "wednesday"],
                preferredTimes: ["17:00", "18:00"],
                priority: 4
            },
            "15-18": {
                dailyMinutes: 0,
                weeklyMinutes: 90,
                preferredDays: ["monday", "wednesday"],
                preferredTimes: ["18:00", "19:00"],
                priority: 4
            }
        }
    },
    {
        name: "Saxophon",
        color: "#9b59b6",
        description: "Zuhause Saxophon üben - die gelernten Lieder spielen und besser werden",
        ageDefaults: {
            "11-14": {
                dailyMinutes: 30,
                weeklyMinutes: 150,
                preferredDays: ["tuesday", "thursday", "saturday"],
                preferredTimes: ["17:00", "18:00"],
                priority: 5
            },
            "15-18": {
                dailyMinutes: 45,
                weeklyMinutes: 225,
                preferredDays: ["tuesday", "thursday", "saturday"],
                preferredTimes: ["19:00", "20:00"],
                priority: 5
            }
        }
    },
    {
        name: "AG",
        color: "#e74c3c",
        description: "Arbeitsgemeinschaft in der Schule - Sport, Basteln, Computer oder andere spannende Aktivitäten",
        ageDefaults: {
            "6-10": {
                dailyMinutes: 0,
                weeklyMinutes: 120,
                preferredDays: ["wednesday", "friday"],
                preferredTimes: ["15:00", "16:00"],
                priority: 6
            },
            "11-14": {
                dailyMinutes: 0,
                weeklyMinutes: 180,
                preferredDays: ["monday", "wednesday", "friday"],
                preferredTimes: ["15:00", "16:00"],
                priority: 6
            },
            "15-18": {
                dailyMinutes: 0,
                weeklyMinutes: 180,
                preferredDays: ["monday", "wednesday", "friday"],
                preferredTimes: ["16:00", "17:00"],
                priority: 6
            }
        }
    },
    {
        name: "Üben",
        color: "#45b7d1",
        description: "Extra lernen für die Schule - für Tests üben oder schwierige Aufgaben wiederholen",
        ageDefaults: {
            "6-10": {
                dailyMinutes: 20,
                weeklyMinutes: 100,
                preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
                preferredTimes: ["16:30", "17:30"],
                priority: 7
            },
            "11-14": {
                dailyMinutes: 30,
                weeklyMinutes: 150,
                preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
                preferredTimes: ["17:00", "18:00"],
                priority: 7
            },
            "15-18": {
                dailyMinutes: 45,
                weeklyMinutes: 225,
                preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
                preferredTimes: ["18:30", "19:30"],
                priority: 7
            }
        }
    },
    {
        name: "Haustier",
        color: "#8b4513",
        description: "Sich um die Haustiere kümmern - füttern, Gassi gehen, spielen und kuscheln",
        ageDefaults: {
            "6-10": {
                dailyMinutes: 20,
                weeklyMinutes: 140,
                preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
                preferredTimes: ["07:00", "17:00"],
                priority: 9
            },
            "11-14": {
                dailyMinutes: 30,
                weeklyMinutes: 210,
                preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
                preferredTimes: ["07:00", "18:00"],
                priority: 9
            },
            "15-18": {
                dailyMinutes: 30,
                weeklyMinutes: 210,
                preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
                preferredTimes: ["07:00", "19:00"],
                priority: 9
            }
        }
    },
    {
        name: "Oma besuchen",
        color: "#ff69b4",
        description: "Oma und Opa besuchen - zusammen spielen, Geschichten hören und Kuchen essen",
        ageDefaults: {
            "6-10": {
                dailyMinutes: 0,
                weeklyMinutes: 120,
                preferredDays: ["saturday", "sunday"],
                preferredTimes: ["14:00", "15:00"],
                priority: 8
            },
            "11-14": {
                dailyMinutes: 0,
                weeklyMinutes: 90,
                preferredDays: ["saturday", "sunday"],
                preferredTimes: ["15:00", "16:00"],
                priority: 8
            },
            "15-18": {
                dailyMinutes: 0,
                weeklyMinutes: 60,
                preferredDays: ["saturday", "sunday"],
                preferredTimes: ["16:00", "17:00"],
                priority: 8
            }
        }
    },
    {
        name: "Klavierunterricht",
        color: "#9b59b6",
        description: "Musikstunde mit dem Klavierlehrer - neue Lieder und Fingertechniken lernen",
        ageDefaults: {
            "6-10": {
                dailyMinutes: 0,
                weeklyMinutes: 45,
                preferredDays: ["tuesday", "thursday"],
                preferredTimes: ["16:00", "17:00"],
                priority: 4
            },
            "11-14": {
                dailyMinutes: 0,
                weeklyMinutes: 60,
                preferredDays: ["tuesday", "thursday"],
                preferredTimes: ["17:00", "18:00"],
                priority: 4
            },
            "15-18": {
                dailyMinutes: 0,
                weeklyMinutes: 90,
                preferredDays: ["tuesday", "thursday"],
                preferredTimes: ["18:00", "19:00"],
                priority: 4
            }
        }
    },
    {
        name: "Klavier",
        color: "#9b59b6",
        description: "Zuhause Klavier üben - die gelernten Stücke spielen und Finger trainieren",
        ageDefaults: {
            "6-10": {
                dailyMinutes: 15,
                weeklyMinutes: 75,
                preferredDays: ["monday", "wednesday", "friday"],
                preferredTimes: ["17:00", "18:00"],
                priority: 5
            },
            "11-14": {
                dailyMinutes: 25,
                weeklyMinutes: 125,
                preferredDays: ["monday", "wednesday", "friday"],
                preferredTimes: ["17:30", "18:30"],
                priority: 5
            },
            "15-18": {
                dailyMinutes: 40,
                weeklyMinutes: 200,
                preferredDays: ["monday", "wednesday", "friday"],
                preferredTimes: ["19:00", "20:00"],
                priority: 5
            }
        }
    },
    {
        name: "Sport",
        color: "#27ae60",
        description: "Sportverein oder Sportgruppe - Fußball, Turnen, Schwimmen oder andere Sportarten",
        ageDefaults: {
            "6-10": {
                dailyMinutes: 0,
                weeklyMinutes: 90,
                preferredDays: ["wednesday", "friday"],
                preferredTimes: ["16:00", "17:00"],
                priority: 6
            },
            "11-14": {
                dailyMinutes: 0,
                weeklyMinutes: 180,
                preferredDays: ["tuesday", "thursday", "saturday"],
                preferredTimes: ["16:00", "17:00"],
                priority: 6
            },
            "15-18": {
                dailyMinutes: 0,
                weeklyMinutes: 180,
                preferredDays: ["tuesday", "thursday", "saturday"],
                preferredTimes: ["17:00", "18:00"],
                priority: 6
            }
        }
    },
    {
        name: "Freunde",
        color: "#f39c12",
        description: "Zeit mit Freunden verbringen - spielen, reden oder gemeinsam etwas unternehmen",
        ageDefaults: {
            "6-10": {
                dailyMinutes: 0,
                weeklyMinutes: 180,
                preferredDays: ["wednesday", "saturday", "sunday"],
                preferredTimes: ["15:00", "16:00"],
                priority: 7
            },
            "11-14": {
                dailyMinutes: 0,
                weeklyMinutes: 240,
                preferredDays: ["friday", "saturday", "sunday"],
                preferredTimes: ["16:00", "17:00"],
                priority: 7
            },
            "15-18": {
                dailyMinutes: 0,
                weeklyMinutes: 300,
                preferredDays: ["friday", "saturday", "sunday"],
                preferredTimes: ["17:00", "18:00"],
                priority: 7
            }
        }
    },
    {
        name: "Freizeit",
        color: "#3498db",
        description: "Eigene Zeit für Hobbys, Lesen, Spielen oder einfach mal entspannen",
        ageDefaults: {
            "6-10": {
                dailyMinutes: 60,
                weeklyMinutes: 420,
                preferredDays: ["saturday", "sunday"],
                preferredTimes: ["10:00", "14:00"],
                priority: 8
            },
            "11-14": {
                dailyMinutes: 90,
                weeklyMinutes: 630,
                preferredDays: ["saturday", "sunday"],
                preferredTimes: ["10:00", "15:00"],
                priority: 8
            },
            "15-18": {
                dailyMinutes: 120,
                weeklyMinutes: 840,
                preferredDays: ["saturday", "sunday"],
                preferredTimes: ["11:00", "16:00"],
                priority: 8
            }
        }
    }
];

// Zeitraster - wird dynamisch generiert
let timeSlots = [];

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
let scheduledBlocks = {};
let draggedElement = null;
let draggedActivity = null;
let currentDraggedBlock = null;
let currentPlanName = 'Neuer Wochenplan';

// Resize-Variablen
let isResizing = false;
let resizeDirection = null; // 'top' oder 'bottom'
let resizeBlock = null;
let resizeStartY = 0;
let resizeStartHeight = 0;
let resizeStartTimeIndex = 0;

// Initialisierung
function init() {
    // Einmalige Bereinigung alter Datenformate
    cleanupLegacyData();

    loadTimeSettings();
    generateTimeSlots();
    loadActivities();
    createActivityBlocks();
    createCalendarGrid();
    loadWeek();
}

// Zeiteinstellungen laden
function loadTimeSettings() {
    const saved = localStorage.getItem('timeSettings');
    if (saved) {
        timeSettings = { ...timeSettings, ...JSON.parse(saved) };
    }
    console.log('Zeiteinstellungen geladen:', timeSettings);
}

// Zeiteinstellungen speichern
function saveTimeSettings() {
    localStorage.setItem('timeSettings', JSON.stringify(timeSettings));
    console.log('Zeiteinstellungen gespeichert:', timeSettings);
}

// Zeitslots dynamisch generieren
function generateTimeSlots() {
    timeSlots = [];

    // Start- und Endzeit parsen
    const [startHour, startMinute] = timeSettings.startTime.split(':').map(Number);
    const [endHour, endMinute] = timeSettings.endTime.split(':').map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    // Zeitslots in gewähltem Raster generieren
    for (let totalMinutes = startTotalMinutes; totalMinutes <= endTotalMinutes; totalMinutes += timeSettings.timeStep) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        timeSlots.push(timeString);
    }

    console.log(`${timeSlots.length} Zeitslots generiert (${timeSettings.startTime} bis ${timeSettings.endTime}, ${timeSettings.timeStep}min Raster)`);
}

// Bereinigung alter Datenformate
function cleanupLegacyData() {
    // Prüfen ob bereits bereinigt wurde
    if (localStorage.getItem('dataCleanupDone')) {
        return;
    }

    console.log('Führe einmalige Datenbereinigung durch...');

    // Alte Wochenplan-Daten löschen falls im alten Format
    const oldWeekPlan = localStorage.getItem('wochenplan');
    if (oldWeekPlan) {
        try {
            const data = JSON.parse(oldWeekPlan);
            const firstBlock = Object.values(data)[0];
            if (firstBlock && !firstBlock.activity) {
                localStorage.removeItem('wochenplan');
                console.log('Alte Wochenplan-Daten entfernt');
            }
        } catch (error) {
            localStorage.removeItem('wochenplan');
            console.log('Korrupte Wochenplan-Daten entfernt');
        }
    }

    // Bereinigung als erledigt markieren
    localStorage.setItem('dataCleanupDone', 'true');
    console.log('Datenbereinigung abgeschlossen');
}

// Aktivitäten laden - vollständig ohne externe Dateien
function loadActivities() {
    const saved = localStorage.getItem('activities');
    if (saved) {
        const savedActivities = JSON.parse(saved);

        // Merge mit defaults (Updates und Migrationen)
        const mergedActivities = mergeWithAgeDefaults(savedActivities);

        // Fehlende Aktivitäten aus defaultActivities hinzufügen
        const existingNames = mergedActivities.map(a => a.name);
        const missingActivities = defaultActivities.filter(def =>
            !existingNames.includes(def.name)
        );

        activities = [...mergedActivities, ...missingActivities];

        if (missingActivities.length > 0) {
            console.log(`${missingActivities.length} neue Aktivitäten hinzugefügt:`, missingActivities.map(a => a.name));
        }
        console.log('Aktivitäten aus LocalStorage geladen und aktualisiert');
    } else {
        // Erste Nutzung: Standard-Aktivitäten
        activities = [...defaultActivities];
        console.log('Standard-Aktivitäten geladen');
    }

    saveActivities();
}

// Bestehende Aktivitäten mit ageDefaults und Beschreibungen aus defaultActivities ergänzen
function mergeWithAgeDefaults(savedActivities) {
    return savedActivities.map(savedActivity => {
        // Migration: "Oma" -> "Oma besuchen"
        let activityName = savedActivity.name;
        if (activityName === "Oma") {
            activityName = "Oma besuchen";
        }

        // Suche entsprechende Aktivität in defaultActivities für ageDefaults und Beschreibung
        const defaultActivity = defaultActivities.find(def => def.name === activityName);

        if (defaultActivity) {
            // Merge: Behalte gespeicherte Daten, ergänze um ageDefaults, description und color aus defaults
            return {
                ...savedActivity,
                name: defaultActivity.name,  // Name aus defaults übernehmen (für Migrationen)
                color: defaultActivity.color,  // Farbe immer aus defaults übernehmen
                ageDefaults: defaultActivity.ageDefaults,
                description: savedActivity.description || defaultActivity.description
            };
        }

        // Keine defaults verfügbar für diese Aktivität
        return savedActivity;
    });
}

// Aktivitäten speichern - in LocalStorage (JSON-Datei kann nicht direkt geschrieben werden)
function saveActivities() {
    localStorage.setItem('activities', JSON.stringify(activities, null, 2));
    console.log('Aktivitäten in LocalStorage gespeichert. Verwenden Sie "JSON exportieren" um die aktivitaeten.json zu aktualisieren.');
}


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

// Kalender-Raster erstellen
function createCalendarGrid() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    // CSS für variable Slot-Höhen aktualisieren
    updateCalendarCSS();

    timeSlots.forEach((time, timeIndex) => {
        // Zeit-Spalte
        const timeCell = document.createElement('div');
        timeCell.className = 'time-slot';
        timeCell.textContent = time;
        grid.appendChild(timeCell);

        // Tages-Zellen
        days.forEach((day, dayIndex) => {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            cell.dataset.day = day;
            cell.dataset.time = time;
            cell.dataset.timeIndex = timeIndex;

            // Drag & Drop Events
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
                    // Neue Aktivität mit minimaler Rasterlänge hinzufügen
                    const duration = timeSettings.timeStep;
                    addScheduledBlock(day, timeIndex, draggedActivity, duration);
                } else if (currentDraggedBlock) {
                    // Bestehende Aktivität verschieben
                    moveScheduledBlock(currentDraggedBlock, day, timeIndex);
                }

                draggedActivity = null;
                currentDraggedBlock = null;
            });

            grid.appendChild(cell);
        });
    });
}

// Geplanten Block hinzufügen
function addScheduledBlock(day, timeIndex, activity, duration) {
    const blockId = Date.now().toString();
    const durationSlots = duration / timeSettings.timeStep;

    // Prüfen ob genügend aufeinanderfolgende freie Slots verfügbar sind
    for (let i = 0; i < durationSlots; i++) {
        const checkTimeIndex = timeIndex + i;
        // Prüfen ob der Zeitindex im gültigen Bereich liegt
        if (checkTimeIndex >= timeSlots.length) {
            alert('Block passt nicht in den verfügbaren Zeitraum!');
            return;
        }

        const checkKey = `${day}-${checkTimeIndex}`;
        if (scheduledBlocks[checkKey]) {
            alert('Dieser Zeitraum ist bereits belegt!');
            return;
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

    // Zeitslots blockieren
    for (let i = 0; i < durationSlots; i++) {
        const key = `${day}-${timeIndex + i}`;
        scheduledBlocks[key] = blockId;
    }

    renderScheduledBlock(block);
}

// Geplanten Block darstellen
function renderScheduledBlock(block) {
    const cell = document.querySelector(`[data-day="${block.day}"][data-time-index="${block.timeIndex}"]`);
    if (!cell) return;

    const element = document.createElement('div');
    element.className = 'scheduled-block';
    element.style.backgroundColor = block.activity.color;
    element.style.color = getContrastColor(block.activity.color);
    element.textContent = block.activity.name;
    element.dataset.blockId = block.id;
    element.draggable = true;
    element.title = block.activity.description || block.activity.name;

    const durationSlots = block.duration / timeSettings.timeStep;
    const slotHeight = calculateSlotHeight();
    element.style.height = `${durationSlots * slotHeight - 4}px`;
    element.style.top = '2px';

    // Löschen-Button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '×';
    removeBtn.onclick = (e) => {
        e.stopPropagation();
        removeScheduledBlock(block.id);
    };
    element.appendChild(removeBtn);

    // Resize-Handles hinzufügen
    const resizeHandleTop = document.createElement('div');
    resizeHandleTop.className = 'resize-handle resize-handle-top';
    element.appendChild(resizeHandleTop);

    const resizeHandleBottom = document.createElement('div');
    resizeHandleBottom.className = 'resize-handle resize-handle-bottom';
    element.appendChild(resizeHandleBottom);

    // Resize Events
    setupResizeEvents(element, block, resizeHandleTop, 'top');
    setupResizeEvents(element, block, resizeHandleBottom, 'bottom');

    // Drag Events für Verschieben
    element.addEventListener('dragstart', (e) => {
        if (isResizing) {
            e.preventDefault();
            return;
        }
        currentDraggedBlock = block;
        draggedActivity = null;
        e.dataTransfer.effectAllowed = 'move';

        // Canvas für vollständiges Drag-Image erstellen
        const canvas = document.createElement('canvas');
        const rect = element.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');

        // Block-Hintergrund zeichnen
        ctx.fillStyle = activity.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Text zeichnen
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(activity.name, canvas.width / 2, canvas.height / 2);

        // Canvas als Drag-Image setzen
        e.dataTransfer.setDragImage(canvas, canvas.width / 2, canvas.height / 2);

        // Original-Block wird unsichtbar, nur Rahmen bleibt
        setTimeout(() => element.classList.add('dragging'), 0);
    });

    element.addEventListener('dragend', (e) => {
        element.classList.remove('dragging');
        currentDraggedBlock = null;
        document.querySelectorAll('.drop-zone').forEach(cell => {
            cell.classList.remove('drop-zone');
        });
    });

    cell.appendChild(element);
}

// Resize Events einrichten
function setupResizeEvents(element, block, handle, direction) {
    handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();

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

    const slotHeight = calculateSlotHeight();
    const deltaY = e.clientY - resizeStartY;
    const deltaSlots = Math.round(deltaY / slotHeight);

    let newDuration = resizeBlock.duration;
    let newTimeIndex = resizeBlock.timeIndex;

    if (resizeDirection === 'bottom') {
        // Unten vergrößern/verkleinern
        newDuration = resizeBlock.duration + (deltaSlots * timeSettings.timeStep);
    } else if (resizeDirection === 'top') {
        // Oben vergrößern/verkleinern
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
    if (newTimeIndex < 0 || newTimeIndex >= timeSlots.length) {
        return;
    }

    // Visuelle Vorschau aktualisieren
    const durationSlots = newDuration / timeSettings.timeStep;
    const newHeight = durationSlots * slotHeight - 4;
    element.style.height = `${newHeight}px`;

    // Position aktualisieren wenn oben resized wird
    if (resizeDirection === 'top') {
        const cell = document.querySelector(`[data-day="${resizeBlock.day}"][data-time-index="${newTimeIndex}"]`);
        if (cell) {
            // Element verschieben
            const oldParent = element.parentElement;
            if (oldParent !== cell) {
                cell.appendChild(element);
            }
        }
    }
}

// Resize beenden
function handleResizeEnd(e) {
    if (!isResizing || !resizeBlock) return;

    const element = document.querySelector(`[data-block-id="${resizeBlock.id}"]`);
    if (element) {
        element.classList.remove('resizing');
        element.draggable = true;
    }

    // Finale Werte berechnen
    const slotHeight = calculateSlotHeight();
    const currentHeight = parseInt(element.style.height);
    const newDurationSlots = Math.round((currentHeight + 4) / slotHeight);
    const newDuration = newDurationSlots * timeSettings.timeStep;

    let newTimeIndex = resizeBlock.timeIndex;
    if (resizeDirection === 'top') {
        const cell = element.parentElement;
        newTimeIndex = parseInt(cell.dataset.timeIndex);
    }

    // Daten aktualisieren
    updateBlockAfterResize(resizeBlock, newTimeIndex, newDuration);

    // Cleanup
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);

    isResizing = false;
    resizeDirection = null;
    resizeBlock = null;
}

// Block-Daten nach Resize aktualisieren
function updateBlockAfterResize(block, newTimeIndex, newDuration) {
    // Alte Slots freigeben
    const oldDurationSlots = block.duration / timeSettings.timeStep;
    for (let i = 0; i < oldDurationSlots; i++) {
        const key = `${block.day}-${block.timeIndex + i}`;
        delete scheduledBlocks[key];
    }

    // Neue Slots belegen
    const newDurationSlots = newDuration / timeSettings.timeStep;
    for (let i = 0; i < newDurationSlots; i++) {
        const key = `${block.day}-${newTimeIndex + i}`;
        scheduledBlocks[key] = block.id;
    }

    // Block-Objekt aktualisieren
    block.timeIndex = newTimeIndex;
    block.duration = newDuration;

    console.log(`Block ${block.activity.name} resized: ${newDuration}min ab ${timeSlots[newTimeIndex]}`);
}

// Maximale Dauer berechnen (bis zum nächsten Block oder Ende des Tages)
function getMaxDuration(day, startTimeIndex, currentBlockId) {
    let maxSlots = timeSlots.length - startTimeIndex;

    // Prüfen bis zum nächsten Block
    for (let i = 1; i < maxSlots; i++) {
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

// Block verschieben
function moveScheduledBlock(block, newDay, newTimeIndex) {
    const durationSlots = block.duration / timeSettings.timeStep;

    // Zuerst das alte DOM-Element entfernen
    const oldElement = document.querySelector(`[data-block-id="${block.id}"]`);
    if (oldElement) {
        oldElement.remove();
    }

    // Alte Position aus scheduledBlocks freigeben
    const oldBlockedSlots = Object.keys(scheduledBlocks).filter(key => scheduledBlocks[key] === block.id);
    oldBlockedSlots.forEach(key => delete scheduledBlocks[key]);

    // Prüfen ob neue Position vollständig frei ist
    for (let i = 0; i < durationSlots; i++) {
        const checkTimeIndex = newTimeIndex + i;
        // Prüfen ob der Zeitindex im gültigen Bereich liegt
        if (checkTimeIndex >= timeSlots.length) {
            alert('Block passt nicht in den verfügbaren Zeitraum!');

            // Bei Fehler: Block an alter Position wiederherstellen
            for (let j = 0; j < durationSlots; j++) {
                const restoreKey = `${block.day}-${block.timeIndex + j}`;
                scheduledBlocks[restoreKey] = block.id;
            }
            renderScheduledBlock(block);
            return;
        }

        const checkKey = `${newDay}-${checkTimeIndex}`;
        if (scheduledBlocks[checkKey]) {
            alert('Dieser Zeitraum ist bereits belegt!');

            // Bei Fehler: Block an alter Position wiederherstellen
            for (let j = 0; j < durationSlots; j++) {
                const restoreKey = `${block.day}-${block.timeIndex + j}`;
                scheduledBlocks[restoreKey] = block.id;
            }
            renderScheduledBlock(block);
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

    // Block an neuer Position rendern
    renderScheduledBlock(block);
}

// Geplanten Block entfernen
function removeScheduledBlock(blockId, render = true) {
    // Blockierte Zeitslots finden und freigeben
    const blockedSlots = Object.keys(scheduledBlocks).filter(key => scheduledBlocks[key] === blockId);
    blockedSlots.forEach(key => delete scheduledBlocks[key]);

    // Element immer aus DOM entfernen
    const element = document.querySelector(`[data-block-id="${blockId}"]`);
    if (element) {
        element.remove();
    }
}

// Neuer Wochenplan
function newWeekPlan() {
    if (confirm('Neuen Wochenplan erstellen? Aktuelle Änderungen gehen verloren!')) {
        scheduledBlocks = {};
        document.querySelectorAll('.scheduled-block').forEach(el => el.remove());
        currentPlanName = 'Neuer Wochenplan';
        updatePlanTitle();
    }
}

// Plan-Titel aktualisieren
function updatePlanTitle() {
    document.getElementById('planTitle').textContent = currentPlanName;
}

// Wochenplan speichern
function saveWeekPlan() {
    const defaultName = currentPlanName;
    const planName = prompt('Name für den Wochenplan:', defaultName);
    if (!planName) return;

    const schedule = {};
    document.querySelectorAll('.scheduled-block').forEach(el => {
        const cell = el.parentElement;
        const blockId = el.dataset.blockId;
        const day = cell.dataset.day;
        const timeIndex = parseInt(cell.dataset.timeIndex);

        // Aktivität aus aktueller Liste finden
        const activityName = el.textContent.replace('×', '').trim();
        const activity = activities.find(a => a.name === activityName);
        const height = parseInt(el.style.height);
        const duration = Math.round((height + 4) / 30) * 10;

        schedule[blockId] = {
            id: blockId,
            day: day,
            timeIndex: timeIndex,
            activity: activity,
            duration: duration
        };
    });

    // Neue erweiterte Datenstruktur
    const weekPlan = {
        name: planName,
        created: new Date().toISOString(),
        activities: [...activities], // Aktuelle Aktivitäten mitspeichern
        schedule: schedule
    };

    // Plan speichern und als JSON-Datei herunterladen
    const dataStr = JSON.stringify(weekPlan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${planName}.json`;
    link.click();
    URL.revokeObjectURL(url);

    // Aktuellen Plan-Namen aktualisieren
    currentPlanName = planName;
    updatePlanTitle();

    alert(`Wochenplan "${planName}" als JSON-Datei gespeichert!`);
}

// Wochenplan laden
function loadWeekPlan() {
    // File input für JSON-Dateien erstellen
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const weekPlan = JSON.parse(event.target.result);

                // Validierung der Datenstruktur
                if (!weekPlan.name || !weekPlan.activities || !weekPlan.schedule) {
                    alert('Ungültiges Wochenplan-Format!');
                    return;
                }

                // Aktivitäten laden und speichern
                activities = weekPlan.activities;
                saveActivities();
                createActivityBlocks();

                // Plan-Daten laden
                loadWeekData(weekPlan.schedule);

                // Plan-Namen aktualisieren
                currentPlanName = weekPlan.name;
                updatePlanTitle();

                alert(`Wochenplan "${weekPlan.name}" geladen!`);
            } catch (error) {
                alert('Fehler beim Laden der Datei: ' + error.message);
            }
        };
        reader.readAsText(file);
    };

    input.click();
}

// Wochenplan-Daten laden (Hilfsfunktion)
function loadWeekData(data) {
    // Erst alles leeren
    scheduledBlocks = {};
    document.querySelectorAll('.scheduled-block').forEach(el => el.remove());

    // Dann geladene Blöcke hinzufügen
    Object.values(data).forEach(block => {
        // Defensive Programmierung: Prüfen ob block.activity existiert
        if (!block.activity || !block.activity.name) {
            console.warn('Block ohne gültige Aktivität übersprungen:', block);
            return;
        }

        // Migration: "Oma" -> "Oma besuchen"
        let activityName = block.activity.name;
        if (activityName === "Oma") {
            activityName = "Oma besuchen";
        }

        // Prüfen ob Aktivität noch in der aktuellen Liste existiert
        const activity = activities.find(a => a.name === activityName);
        if (activity) {
            // Aktivität mit aktueller Farbe verwenden
            block.activity = activity;

            const durationSlots = block.duration / timeSettings.timeStep;

            // Zeitslots blockieren
            for (let i = 0; i < durationSlots; i++) {
                const key = `${block.day}-${block.timeIndex + i}`;
                scheduledBlocks[key] = block.id;
            }

            renderScheduledBlock(block);
        } else {
            console.warn(`Aktivität "${activityName}" nicht gefunden, Block übersprungen`);
        }
    });
}


// Legacy-Funktion für Rückwärtskompatibilität
function loadWeek() {
    const saved = localStorage.getItem('wochenplan');
    if (saved) {
        try {
            const data = JSON.parse(saved);

            // Prüfen ob Daten im alten Format sind (ohne activity Property)
            const firstBlock = Object.values(data)[0];
            if (firstBlock && !firstBlock.activity) {
                console.log('Alte Wochenplan-Daten gefunden - werden gelöscht für neues Format');
                localStorage.removeItem('wochenplan');
                return;
            }

            // Neue Datenstruktur laden
            if (data && typeof data === 'object') {
                loadWeekData(data);
            }
        } catch (error) {
            console.warn('Fehler beim Laden alter Wochenplan-Daten:', error);
            // Alte Daten löschen bei Fehlern
            localStorage.removeItem('wochenplan');
        }
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

// Form-Handler
document.getElementById('activityForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('activityName').value.trim();
    const color = document.getElementById('activityColor').value;
    const description = document.getElementById('activityDescription').value.trim();

    if (!name) {
        alert('Bitte geben Sie einen Namen ein!');
        return;
    }

    // Prüfen ob Name bereits existiert (außer bei Bearbeitung)
    const existingIndex = activities.findIndex(a => a.name.toLowerCase() === name.toLowerCase());
    if (existingIndex !== -1 && existingIndex !== currentEditingActivity) {
        alert('Eine Aktivität mit diesem Namen existiert bereits!');
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

// Auto-Fill Modal Funktionen
function openAutoFillModal() {
    document.getElementById('autoFillModal').style.display = 'block';
}

function closeAutoFillModal() {
    document.getElementById('autoFillModal').style.display = 'none';
}

function executeAutoFill() {
    const selectedAge = document.getElementById('childAge').value;

    if (confirm(`Wochenplan für Alter ${selectedAge} erstellen? Bestehende Termine werden überschrieben!`)) {
        autoFillWeekPlan(selectedAge);
        closeAutoFillModal();
    }
}

// Globale Variable für platzierte Aktivitäten (für bessere Konfliktlösung)
let placedActivitiesByDay = {};

// Hauptfunktion für automatisches Füllen
function autoFillWeekPlan(ageGroup) {
    console.log(`Erstelle Wochenplan für Altersgruppe: ${ageGroup}`);
    console.log('Alle verfügbaren Aktivitäten:', activities);

    // Aktuellen Plan leeren
    scheduledBlocks = {};
    placedActivitiesByDay = {
        monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
    };
    document.querySelectorAll('.scheduled-block').forEach(el => el.remove());

    // Debug: Prüfen welche Aktivitäten ageDefaults haben
    activities.forEach(activity => {
        console.log(`Aktivität "${activity.name}":`, {
            hasAgeDefaults: !!activity.ageDefaults,
            ageDefaults: activity.ageDefaults
        });
    });

    // Relevante Aktivitäten für Altersgruppe filtern und sortieren
    let relevantActivities = activities
        .filter(activity => {
            const hasDefaults = activity.ageDefaults && activity.ageDefaults[ageGroup];
            console.log(`Filter "${activity.name}" für ${ageGroup}:`, hasDefaults);
            return hasDefaults;
        })
        .map(activity => ({
            ...activity,
            defaults: activity.ageDefaults[ageGroup]
        }))
        .filter(activity => {
            const hasMinutes = activity.defaults.weeklyMinutes > 0;
            console.log(`Minuten-Check "${activity.name}":`, activity.defaults.weeklyMinutes, hasMinutes);
            return hasMinutes;
        });

    // Intelligente Instrumentauswahl: Nur ein Instrument pro Kind
    relevantActivities = selectSingleInstrument(relevantActivities);

    // Nach Priorität sortieren
    relevantActivities.sort((a, b) => a.defaults.priority - b.defaults.priority);

    console.log('Relevante Aktivitäten nach Filterung:', relevantActivities);

    if (relevantActivities.length === 0) {
        console.error('Keine relevanten Aktivitäten gefunden für Altersgruppe:', ageGroup);
        alert(`Keine Aktivitäten für Altersgruppe ${ageGroup} definiert!`);
        return;
    }

    // Aktivitäten nacheinander platzieren
    console.log('=== AUTO-FILL STARTET ===');
    console.log(`Altersgruppe: ${ageGroup}`);
    console.log('Zu platzierende Aktivitäten:', relevantActivities.map(a => `${a.name} (Priorität: ${a.defaults.priority})`));

    relevantActivities.forEach((activity, index) => {
        console.log(`\n--- Platziere Aktivität ${index + 1}/${relevantActivities.length}: ${activity.name} ---`);
        console.log('Aktivitäts-Details:', {
            name: activity.name,
            dailyMinutes: activity.defaults.dailyMinutes,
            weeklyMinutes: activity.defaults.weeklyMinutes,
            preferredDays: activity.defaults.preferredDays,
            preferredTimes: activity.defaults.preferredTimes,
            priority: activity.defaults.priority
        });

        placeActivityInSchedule(activity, ageGroup);

        // Status nach Platzierung anzeigen
        console.log('Platzierte Aktivitäten pro Tag:');
        Object.entries(placedActivitiesByDay).forEach(([day, activities]) => {
            if (activities.length > 0) {
                console.log(`  ${day}: ${activities.map(a => a.name).join(', ')}`);
            }
        });
    });

    console.log('\n=== AUTO-FILL ABGESCHLOSSEN ===');
    console.log('Finaler Status - Platzierte Aktivitäten pro Tag:');
    Object.entries(placedActivitiesByDay).forEach(([day, activities]) => {
        console.log(`${day}: ${activities.map(a => a.name).join(', ') || 'Keine Aktivitäten'}`);
    });

    alert(`Wochenplan für Altersgruppe ${ageGroup} erstellt!`);
}

// Einzelne Aktivität im Wochenplan platzieren
function placeActivityInSchedule(activity, ageGroup) {
    const defaults = activity.defaults;

    // Spezielle Behandlung für verschiedene Aktivitätstypen
    if (activity.name === "Schule") {
        placeSchoolBlocks(activity, defaults);
    } else if (activity.name === "Hausaufgaben") {
        placeHomeworkBlocks(activity, defaults);
    } else if (activity.name === "Hausaufgabenbetreuung") {
        placeHomeworkSupervisionBlocks(activity, defaults);
    } else if (activity.name === "AG") {
        placeAGBlocks(activity, defaults);
    } else if (activity.name.includes("unterricht")) {
        placeLessonBlocks(activity, defaults);
    } else if (defaults.dailyMinutes > 0) {
        // Tägliche Aktivität (z.B. Üben, Instrument üben)
        placeDailyActivity(activity, defaults);
    } else {
        // Wöchentliche Aktivität (z.B. Sport, Freunde)
        placeWeeklyActivity(activity, defaults);
    }
}

// Schulblöcke platzieren (längere zusammenhängende Blöcke)
function placeSchoolBlocks(activity, defaults) {
    console.log(`Platziere Schulblöcke für ${defaults.preferredDays.length} Tage`);
    defaults.preferredDays.forEach(day => {
        const timeSlot = findBestTimeSlot(day, defaults.dailyMinutes, ["08:00"]);
        if (timeSlot !== null) {
            createScheduledBlock(activity, day, timeSlot, defaults.dailyMinutes);
            console.log(`✓ Schule platziert am ${day} um 08:00 für ${defaults.dailyMinutes}min`);
        } else {
            console.warn(`✗ Schule konnte nicht platziert werden am ${day}`);
        }
    });
}

// Hausaufgabenblöcke platzieren (nach der Schule)
function placeHomeworkBlocks(activity, defaults) {
    defaults.preferredDays.forEach(day => {
        // Prüfen ob bereits Hausaufgabenbetreuung an diesem Tag platziert ist
        if (hasHomeworkSupervisionOnDay(day)) {
            console.log(`Hausaufgaben übersprungen am ${day} wegen Hausaufgabenbetreuung`);
            return;
        }

        // Prüfen ob bereits Hausaufgaben an diesem Tag platziert sind
        if (hasHomeworkOnDay(day)) {
            console.log(`Hausaufgaben übersprungen am ${day} - bereits vorhanden`);
            return;
        }

        // Suche nach Schulende oder verwende bevorzugte Zeiten
        const schoolEndTime = findSchoolEndTime(day);
        const startTimes = schoolEndTime ? [schoolEndTime] : defaults.preferredTimes;

        const timeSlot = findBestTimeSlot(day, defaults.dailyMinutes, startTimes);
        if (timeSlot !== null) {
            createScheduledBlock(activity, day, timeSlot, defaults.dailyMinutes);
            console.log(`✓ Hausaufgaben platziert am ${day} um ${timeSlots[timeSlot]} für ${defaults.dailyMinutes}min`);
        } else {
            console.warn(`✗ Hausaufgaben konnte nicht platziert werden am ${day}`);
        }
    });
}

// Hausaufgabenbetreuung platzieren (direkt nach der Schule, alternative zu AG)
function placeHomeworkSupervisionBlocks(activity, defaults) {
    defaults.preferredDays.forEach(day => {
        // Prüfen ob bereits eine AG an diesem Tag platziert ist
        if (hasAGOnDay(day)) {
            console.log(`Hausaufgabenbetreuung übersprungen am ${day} wegen AG`);
            return;
        }

        // Direkt nach Schulende platzieren
        const schoolEndTime = findSchoolEndTime(day);
        const startTimes = schoolEndTime ? [schoolEndTime] : defaults.preferredTimes;

        console.log(`Platziere Hausaufgabenbetreuung am ${day}, Schulende: ${schoolEndTime}, verfügbare Zeiten:`, startTimes);

        const timeSlot = findBestTimeSlot(day, defaults.dailyMinutes, startTimes);
        if (timeSlot !== null) {
            createScheduledBlock(activity, day, timeSlot, defaults.dailyMinutes);
            console.log(`Hausaufgabenbetreuung erfolgreich platziert am ${day} um ${timeSlots[timeSlot]}`);
        } else {
            console.warn(`Konnte Hausaufgabenbetreuung nicht platzieren am ${day}`);
        }
    });
}

// AG-Blöcke platzieren (direkt nach der Schule, alternative zu Hausaufgabenbetreuung)
function placeAGBlocks(activity, defaults) {
    const totalMinutes = defaults.weeklyMinutes;
    const sessionDuration = Math.min(120, Math.max(60, totalMinutes / defaults.preferredDays.length));

    let placedSessions = 0;
    const sessionsNeeded = Math.ceil(totalMinutes / sessionDuration);

    console.log(`AG-Platzierung: ${sessionsNeeded} Sessions à ${sessionDuration}min benötigt`);

    for (const day of defaults.preferredDays) {
        if (placedSessions >= sessionsNeeded) break;

        // Prüfen ob bereits Hausaufgabenbetreuung an diesem Tag platziert ist
        if (hasHomeworkSupervisionOnDay(day)) {
            console.log(`✗ AG übersprungen am ${day} wegen Hausaufgabenbetreuung`);
            continue;
        }

        // Direkt nach Schulende (mit kurzer Pause)
        const schoolEndTime = findSchoolEndTime(day);
        if (schoolEndTime) {
            const timeSlot = findBestTimeSlot(day, sessionDuration, [schoolEndTime]);
            if (timeSlot !== null) {
                createScheduledBlock(activity, day, timeSlot, sessionDuration);
                console.log(`✓ AG platziert am ${day} um ${timeSlots[timeSlot]} für ${sessionDuration}min`);
                placedSessions++;
            } else {
                console.warn(`✗ AG konnte nicht platziert werden am ${day} (kein Platz nach Schule)`);
            }
        } else {
            console.warn(`✗ AG konnte nicht platziert werden am ${day} (Schulende nicht gefunden)`);
        }
    }

    console.log(`AG-Platzierung abgeschlossen: ${placedSessions}/${sessionsNeeded} Sessions platziert`);
}

// Unterrichtsstunden platzieren (fixe Termine)
function placeLessonBlocks(activity, defaults) {
    const totalMinutes = defaults.weeklyMinutes;
    const sessionsNeeded = Math.ceil(totalMinutes / 60); // Typisch 45-90 Min pro Stunde
    const sessionDuration = Math.min(90, Math.max(45, Math.ceil(totalMinutes / sessionsNeeded)));

    let placedSessions = 0;
    for (const day of defaults.preferredDays) {
        if (placedSessions >= sessionsNeeded) break;

        const timeSlot = findBestTimeSlot(day, sessionDuration, defaults.preferredTimes);
        if (timeSlot !== null) {
            createScheduledBlock(activity, day, timeSlot, sessionDuration);
            placedSessions++;
        }
    }
}

// Tägliche Aktivitäten platzieren
function placeDailyActivity(activity, defaults) {
    defaults.preferredDays.forEach(day => {
        // Für Instrumentübung: Nach Hausaufgaben aber vor dem Abend
        let adjustedTimes = defaults.preferredTimes;
        if (activity.name.includes("trompete") || activity.name.includes("axophon") || activity.name.includes("lavier")) {
            const latestHomework = findLatestHomeworkEnd(day);
            if (latestHomework) {
                adjustedTimes = [latestHomework, ...defaults.preferredTimes];
            }
        }

        const timeSlot = findBestTimeSlot(day, defaults.dailyMinutes, adjustedTimes);
        if (timeSlot !== null) {
            createScheduledBlock(activity, day, timeSlot, defaults.dailyMinutes);
        }
    });
}

// Wöchentliche Aktivitäten platzieren
function placeWeeklyActivity(activity, defaults) {
    const totalMinutes = defaults.weeklyMinutes;

    // Verschiedene Strategien je nach Aktivität
    let sessionDuration, sessionsNeeded;

    if (activity.name === "Sport") {
        // Sport: 60-90 Min Einheiten
        sessionDuration = Math.min(90, Math.max(60, totalMinutes));
        sessionsNeeded = Math.ceil(totalMinutes / sessionDuration);
    } else if (activity.name === "Freizeit") {
        // Freizeit: Längere Blöcke am Wochenende
        sessionDuration = Math.min(180, Math.max(60, totalMinutes / 2));
        sessionsNeeded = Math.ceil(totalMinutes / sessionDuration);
    } else {
        // Standard: 60-120 Min pro Session
        sessionDuration = Math.min(120, Math.max(60, totalMinutes / 2));
        sessionsNeeded = Math.ceil(totalMinutes / sessionDuration);
    }

    let placedSessions = 0;
    for (const day of defaults.preferredDays) {
        if (placedSessions >= sessionsNeeded) break;

        const timeSlot = findBestTimeSlot(day, sessionDuration, defaults.preferredTimes);
        if (timeSlot !== null) {
            createScheduledBlock(activity, day, timeSlot, sessionDuration);
            placedSessions++;
        }
    }
}

// Intelligente Instrumentauswahl: Nur ein Instrument pro Kind
function selectSingleInstrument(activities) {
    // Identifiziere alle verfügbaren Instrumente
    const instrumentActivities = activities.filter(activity =>
        activity.name.includes('unterricht') ||
        ['Trompete', 'Saxophon', 'Klavier'].includes(activity.name)
    );

    if (instrumentActivities.length === 0) {
        return activities; // Keine Instrumente gefunden
    }

    // Gruppiere Instrumente nach Typ
    const instrumentGroups = {
        trompete: instrumentActivities.filter(a => a.name.toLowerCase().includes('trompete')),
        saxophon: instrumentActivities.filter(a => a.name.toLowerCase().includes('saxophon')),
        klavier: instrumentActivities.filter(a => a.name.toLowerCase().includes('klavier'))
    };

    // Wähle zufällig ein Instrument (oder basierend auf Priorität)
    const availableInstruments = Object.keys(instrumentGroups).filter(
        key => instrumentGroups[key].length > 0
    );

    if (availableInstruments.length === 0) {
        return activities.filter(activity => !instrumentActivities.includes(activity));
    }

    // Wähle das erste verfügbare Instrument (kann später randomisiert werden)
    const selectedInstrument = availableInstruments[0];
    const selectedInstrumentActivities = instrumentGroups[selectedInstrument];

    console.log(`Gewähltes Instrument: ${selectedInstrument}`, selectedInstrumentActivities.map(a => a.name));

    // Entferne alle anderen Instrumente und behalte nur das gewählte
    return activities.filter(activity =>
        !instrumentActivities.includes(activity) ||
        selectedInstrumentActivities.includes(activity)
    );
}

// Hilfsfunktionen für realistischere Platzierung
function findSchoolEndTime(day) {
    // Suche nach Schulblöcken anhand der Aktivität, nicht nur der Position
    const schoolActivity = placedActivitiesByDay[day]?.find(activity => activity.name === 'Schule');

    if (!schoolActivity) {
        console.log(`Keine Schule gefunden am ${day}, verwende Standard-Endzeit`);
        // Fallback: Standard-Schulendzeit je nach Altersgruppe
        return '13:30'; // Typische Grundschul-Endzeit
    }

    // Finde alle Schulzeit-Slots am gegebenen Tag
    const schoolBlocks = Object.entries(scheduledBlocks).filter(([key, blockId]) => {
        const [blockDay] = key.split('-');
        if (blockDay !== day) return false;

        // Prüfe ob es sich um einen Schulblock handelt (vereinfacht über Index-Bereich)
        const [, timeIndexStr] = key.split('-');
        const timeIndex = parseInt(timeIndexStr);
        const schoolStartIndex = timeSlots.indexOf('08:00');
        const schoolEndIndex = timeSlots.indexOf('15:00');

        return timeIndex >= schoolStartIndex && timeIndex <= schoolEndIndex;
    });

    if (schoolBlocks.length === 0) {
        console.log(`Keine Schulblöcke gefunden am ${day}`);
        return '13:30'; // Fallback
    }

    // Finde den letzten Schulzeitslot
    const lastSlot = Math.max(...schoolBlocks.map(([key]) => {
        const [, timeIndex] = key.split('-');
        return parseInt(timeIndex);
    }));

    // Berechne die Zeit nach der Schule (mit kurzer Pause)
    const pauseSlots = Math.ceil(30 / timeSettings.timeStep); // 30 Min Pause
    const afterSchoolIndex = lastSlot + 1 + pauseSlots;

    const endTime = afterSchoolIndex < timeSlots.length ? timeSlots[afterSchoolIndex] : null;
    console.log(`Schulende am ${day}: Letzter Slot ${lastSlot} (${timeSlots[lastSlot]}) → Nach Pause: ${endTime}`);

    return endTime;
}

// Generische Funktion: Prüfen ob eine Aktivität an einem Tag platziert ist
function hasActivityOnDay(day, activityName) {
    return placedActivitiesByDay[day] && placedActivitiesByDay[day].some(activity => activity.name === activityName);
}

// Spezifische Helper-Funktionen (verwenden die generische Funktion)
function hasAGOnDay(day) {
    return hasActivityOnDay(day, 'AG');
}

function hasHomeworkSupervisionOnDay(day) {
    return hasActivityOnDay(day, 'Hausaufgabenbetreuung');
}

function hasHomeworkOnDay(day) {
    return hasActivityOnDay(day, 'Hausaufgaben');
}

// Besten verfügbaren Zeitslot finden
function findBestTimeSlot(day, durationMinutes, preferredTimes) {
    const durationSlots = Math.ceil(durationMinutes / timeSettings.timeStep);

    // Durch bevorzugte Zeiten iterieren
    for (const preferredTime of preferredTimes) {
        const startTimeIndex = timeSlots.indexOf(preferredTime);
        if (startTimeIndex === -1) continue;

        // Prüfen ob genügend aufeinanderfolgende Slots frei sind
        let canPlace = true;
        for (let i = 0; i < durationSlots; i++) {
            const checkTimeIndex = startTimeIndex + i;
            if (checkTimeIndex >= timeSlots.length) {
                canPlace = false;
                break;
            }

            const checkKey = `${day}-${checkTimeIndex}`;
            if (scheduledBlocks[checkKey]) {
                canPlace = false;
                break;
            }
        }

        if (canPlace) {
            return startTimeIndex;
        }
    }

    // Fallback: Suche nach dem ersten verfügbaren Slot am Tag
    for (let startTimeIndex = 0; startTimeIndex < timeSlots.length - durationSlots; startTimeIndex++) {
        let canPlace = true;
        for (let i = 0; i < durationSlots; i++) {
            const checkKey = `${day}-${startTimeIndex + i}`;
            if (scheduledBlocks[checkKey]) {
                canPlace = false;
                break;
            }
        }

        if (canPlace) {
            return startTimeIndex;
        }
    }

    return null; // Kein Platz gefunden
}

// Geplanten Block erstellen (Hilfsfunktion für Auto-Fill)
function createScheduledBlock(activity, day, timeIndex, durationMinutes) {
    const blockId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const durationSlots = Math.ceil(durationMinutes / timeSettings.timeStep);

    const block = {
        id: blockId,
        day: day,
        timeIndex: timeIndex,
        activity: activity,
        duration: durationMinutes
    };

    // Zeitslots blockieren
    for (let i = 0; i < durationSlots; i++) {
        const key = `${day}-${timeIndex + i}`;
        scheduledBlocks[key] = blockId;
    }

    // Aktivität im Tracking-System registrieren
    if (!placedActivitiesByDay[day]) {
        placedActivitiesByDay[day] = [];
    }
    placedActivitiesByDay[day].push(activity);

    // Block rendern
    renderScheduledBlock(block);

    console.log(`Platziert: ${activity.name} am ${day} um ${timeSlots[timeIndex]} für ${durationMinutes}min`);
}

// Slot-Höhe basierend auf Zeitraster berechnen
function calculateSlotHeight() {
    // Grundhöhe: 30px für 10 Minuten
    const baseHeight = 30;
    const baseStep = 10;
    return (baseHeight * timeSettings.timeStep) / baseStep;
}

// CSS für variable Slot-Höhen dynamisch anpassen
function updateCalendarCSS() {
    const slotHeight = calculateSlotHeight();

    // Bestehende dynamische Styles entfernen
    const existingStyle = document.getElementById('dynamic-calendar-style');
    if (existingStyle) {
        existingStyle.remove();
    }

    // Neue Styles hinzufügen
    const style = document.createElement('style');
    style.id = 'dynamic-calendar-style';
    style.textContent = `
        .calendar-cell {
            min-height: ${slotHeight}px;
        }
        .time-slot {
            min-height: ${slotHeight}px;
        }
    `;
    document.head.appendChild(style);
}

// Settings Modal Funktionen
function openSettingsModal() {
    // Aktuelle Werte ins Modal laden
    document.getElementById('startTime').value = timeSettings.startTime;
    document.getElementById('endTime').value = timeSettings.endTime;
    document.getElementById('timeStep').value = timeSettings.timeStep;
    document.getElementById('settingsModal').style.display = 'block';
}

function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
}

function applySettings() {
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const timeStep = parseInt(document.getElementById('timeStep').value);

    // Validierung
    if (!startTime || !endTime) {
        alert('Bitte geben Sie gültige Start- und Endzeiten ein!');
        return;
    }

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    if (startTotalMinutes >= endTotalMinutes) {
        alert('Die Startzeit muss vor der Endzeit liegen!');
        return;
    }

    if (confirm('Zeitplan-Änderungen anwenden? Bestehende Termine könnten außerhalb des neuen Zeitbereichs fallen!')) {
        // Neue Einstellungen speichern
        timeSettings.startTime = startTime;
        timeSettings.endTime = endTime;
        timeSettings.timeStep = timeStep;

        saveTimeSettings();

        // Kalender neu aufbauen
        generateTimeSlots();

        // Bestehende Blöcke prüfen und ggf. entfernen
        validateExistingBlocks();

        // UI neu aufbauen
        createCalendarGrid();

        closeSettingsModal();
        alert('Zeitplan-Einstellungen wurden angewendet!');
    }
}

// Bestehende Blöcke gegen neue Zeiteinstellungen validieren
function validateExistingBlocks() {
    const blocksToRemove = [];

    Object.entries(scheduledBlocks).forEach(([key, blockId]) => {
        const [day, timeIndexStr] = key.split('-');
        const timeIndex = parseInt(timeIndexStr);

        // Prüfen ob timeIndex noch gültig ist
        if (timeIndex >= timeSlots.length) {
            blocksToRemove.push(blockId);
        }
    });

    // Ungültige Blöcke entfernen
    blocksToRemove.forEach(blockId => {
        removeScheduledBlock(blockId, false);
    });

    if (blocksToRemove.length > 0) {
        console.log(`${blocksToRemove.length} Blöcke außerhalb des neuen Zeitbereichs entfernt`);
    }
}

// Modal schließen bei Klick außerhalb
window.onclick = function (event) {
    const activityModal = document.getElementById('activityModal');
    const autoFillModal = document.getElementById('autoFillModal');
    const settingsModal = document.getElementById('settingsModal');

    if (event.target === activityModal) {
        closeActivityModal();
    } else if (event.target === autoFillModal) {
        closeAutoFillModal();
    } else if (event.target === settingsModal) {
        closeSettingsModal();
    }
};

// App starten
document.addEventListener('DOMContentLoaded', init);
