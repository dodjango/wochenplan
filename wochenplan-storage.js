// ========================================
// DATENSPEICHERUNG & PERSISTENZ
// ========================================

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

// ========================================
// PLAN-VERWALTUNG (LocalStorage)
// ========================================

// Alle gespeicherten Pläne abrufen
function getSavedPlans() {
    const saved = localStorage.getItem('savedPlans');
    return saved ? JSON.parse(saved) : {};
}

// Plan im LocalStorage speichern
function savePlanToStorage(planName) {
    const savedPlans = getSavedPlans();

    // Prüfen ob Plan schon existiert und created-Datum übernehmen
    const existingPlan = savedPlans[planName];
    const created = existingPlan ? existingPlan.created : new Date().toISOString();

    const plan = {
        name: planName,
        created: created,
        lastModified: new Date().toISOString(),
        activities: [...activities],
        blockRegistry: {...blockRegistry}
    };

    savedPlans[planName] = plan;
    localStorage.setItem('savedPlans', JSON.stringify(savedPlans));

    // Aktuellen Plan-Namen aktualisieren
    currentPlanName = planName;
    updatePlanTitle();
    saveWeek();

    // Änderungen wurden gespeichert
    hasUnsavedChanges = false;

    console.log(`Plan "${planName}" gespeichert`);
}

// Gespeicherten Plan laden
function loadSavedPlan(planName) {
    const savedPlans = getSavedPlans();
    const plan = savedPlans[planName];

    if (!plan) {
        alert(`Plan "${planName}" nicht gefunden!`);
        return;
    }

    // Aktivitäten laden
    activities = plan.activities;
    saveActivities();
    createActivityBlocks();

    // Block-Daten laden
    loadWeekData(plan.blockRegistry);

    // Plan-Namen aktualisieren
    currentPlanName = planName;
    updatePlanTitle();

    closeLoadPlanModal();
    navigateToApp();

    hasUnsavedChanges = false; // Geladener Plan hat keine ungespeicherten Änderungen

    console.log(`Plan "${planName}" geladen`);
}

// Gespeicherten Plan löschen
function deleteSavedPlan(planName, event) {
    event.stopPropagation(); // Verhindere das Laden des Plans

    if (!confirm(`Möchten Sie den Plan "${planName}" wirklich löschen?`)) {
        return;
    }

    const savedPlans = getSavedPlans();
    delete savedPlans[planName];
    localStorage.setItem('savedPlans', JSON.stringify(savedPlans));

    // Liste neu rendern
    renderSavedPlansList();

    console.log(`Plan "${planName}" gelöscht`);
}

// ========================================
// WOCHENPLAN-DATEN LADEN/SPEICHERN
// ========================================

// Wochenplan-Daten laden (Hilfsfunktion)
function loadWeekData(data) {
    // Erst alles leeren
    scheduledBlocks = {};
    blockRegistry = {};
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

            // Block in Registry speichern
            blockRegistry[block.id] = block;

            // Zeitslots blockieren (mit korrekter 5-Minuten-Kollisionserkennung)
            const startMinutes = timeIndexToMinutes(block.timeIndex);
            occupyTimeSlots(block.day, startMinutes, block.duration, block.id);

            renderScheduledBlock(block);
        } else {
            console.warn(`Aktivität "${activityName}" nicht gefunden, Block übersprungen`);
        }
    });

    // Automatisch speichern nach dem Laden
    saveWeek();
}

// Legacy-Funktion für Rückwärtskompatibilität
function loadWeek() {
    const savedSlots = localStorage.getItem('wochenplan');
    const savedRegistry = localStorage.getItem('blockRegistry');

    // Neues Format: blockRegistry vorhanden
    if (savedRegistry) {
        try {
            scheduledBlocks = savedSlots ? JSON.parse(savedSlots) : {};
            blockRegistry = JSON.parse(savedRegistry);

            // Plan-Namen wiederherstellen
            const savedPlanName = localStorage.getItem('currentPlanName');
            if (savedPlanName) {
                currentPlanName = savedPlanName;
                updatePlanTitle();
            }

            console.log('Lade Wochenplan aus Registry:',
                Object.keys(blockRegistry).length, 'Blöcke gefunden');

            // Alle bestehenden Blöcke aus DOM entfernen
            document.querySelectorAll('.scheduled-block').forEach(el => el.remove());

            // Collision-Map zurücksetzen
            scheduledBlocks = {};

            // Blöcke aus Registry rendern
            Object.values(blockRegistry).forEach(block => {
                // Aktivität mit aktuellen Daten mergen (für Farb-Updates etc.)
                const activity = activities.find(a => a.name === block.activity.name);
                if (activity) {
                    block.activity = activity;

                    // Zeitslots blockieren (mit korrekter 5-Minuten-Kollisionserkennung)
                    const startMinutes = timeIndexToMinutes(block.timeIndex);
                    occupyTimeSlots(block.day, startMinutes, block.duration, block.id);

                    renderScheduledBlock(block);
                } else {
                    console.warn(`Aktivität "${block.activity.name}" nicht gefunden, Block wird übersprungen`);
                }
            });

            console.log('Wochenplan erfolgreich geladen');
            hasUnsavedChanges = false; // Geladener Plan hat keine ungespeicherten Änderungen
            return;
        } catch (error) {
            console.warn('Fehler beim Laden aus Registry:', error);
            localStorage.removeItem('blockRegistry');
        }
    }

    // Altes Format: Nur wochenplan vorhanden (als Block-Objekte)
    if (savedSlots) {
        try {
            const data = JSON.parse(savedSlots);

            // Prüfen ob Daten im alten Format sind (Block-Objekte statt Slot-Mapping)
            const firstValue = Object.values(data)[0];
            if (firstValue && typeof firstValue === 'object' && firstValue.activity) {
                console.log('Alte Wochenplan-Daten gefunden - werden migriert');
                loadWeekData(data); // Migriert automatisch zur Registry
                hasUnsavedChanges = false; // Geladener Plan hat keine ungespeicherten Änderungen
                return;
            }

            // Sehr altes Format (ohne activity Property) - löschen
            if (firstValue && !firstValue.activity && typeof firstValue === 'object') {
                console.log('Sehr alte Wochenplan-Daten gefunden - werden gelöscht');
                localStorage.removeItem('wochenplan');
            }
        } catch (error) {
            console.warn('Fehler beim Laden alter Wochenplan-Daten:', error);
            localStorage.removeItem('wochenplan');
        }
    }

    // Am Ende sicherstellen, dass keine ungespeicherten Änderungen markiert sind
    hasUnsavedChanges = false;
}

// Wochenplan automatisch im localStorage speichern
function saveWeek() {
    localStorage.setItem('wochenplan', JSON.stringify(scheduledBlocks));
    localStorage.setItem('blockRegistry', JSON.stringify(blockRegistry));
    localStorage.setItem('currentPlanName', currentPlanName);
    console.log('Wochenplan automatisch gespeichert:',
        Object.keys(blockRegistry).length, 'Blöcke,',
        Object.keys(scheduledBlocks).length, 'Slots belegt');
}

// ========================================
// EXPORT/IMPORT (Datei-Download/-Upload)
// ========================================

function exportPlan() {
    const planName = prompt('Name für den Export:', currentPlanName);
    if (!planName) return;

    const weekPlan = {
        name: planName,
        created: new Date().toISOString(),
        activities: [...activities],
        schedule: {...blockRegistry}
    };

    const dataStr = JSON.stringify(weekPlan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${planName}.json`;
    link.click();
    URL.revokeObjectURL(url);

    alert(`Plan "${planName}" als JSON-Datei exportiert!`);
}

function importPlan() {
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

                if (!weekPlan.name || !weekPlan.activities || !weekPlan.schedule) {
                    alert('Ungültiges Wochenplan-Format!');
                    return;
                }

                activities = weekPlan.activities;
                saveActivities();
                createActivityBlocks();

                loadWeekData(weekPlan.schedule);

                currentPlanName = weekPlan.name;
                updatePlanTitle();
                saveWeek();

                hasUnsavedChanges = false; // Importierter Plan hat keine ungespeicherten Änderungen

                navigateToApp();

                alert(`Plan "${weekPlan.name}" wurde importiert!`);
            } catch (error) {
                alert('Fehler beim Laden der Datei: ' + error.message);
            }
        };
        reader.readAsText(file);
    };

    input.click();
}
