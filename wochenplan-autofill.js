// ========================================
// AUTO-FILL ALGORITHMUS
// ========================================

// Hauptfunktion für automatisches Füllen
function autoFillWeekPlan(ageGroup) {
    console.log(`Erstelle Wochenplan für Altersgruppe: ${ageGroup}`);
    console.log('Alle verfügbaren Aktivitäten:', activities);

    // Aktuellen Plan leeren
    scheduledBlocks = {};
    blockRegistry = {};
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
        Object.entries(placedActivitiesByDay).forEach(([day, blocks]) => {
            if (blocks.length > 0) {
                console.log(`  ${day}: ${blocks.map(b => b.activity.name).join(', ')}`);
            }
        });
    });

    console.log('\n=== AUTO-FILL ABGESCHLOSSEN ===');
    console.log('Finaler Status - Platzierte Aktivitäten pro Tag:');
    Object.entries(placedActivitiesByDay).forEach(([day, blocks]) => {
        console.log(`${day}: ${blocks.map(b => b.activity.name).join(', ') || 'Keine Aktivitäten'}`);
    });

    // Balance-Validierung durchführen
    console.log('\n=== BALANCE-VALIDIERUNG ===');
    validateWeekBalance(ageGroup);

    // Auto-Save nach Auto-Fill
    saveWeek();
}

// Einzelne Aktivität im Wochenplan platzieren
function placeActivityInSchedule(activity, ageGroup) {
    const defaults = activity.defaults;

    // VEREINFACHTER AUTOFILL: Nur folgende Aktivitäten werden platziert
    const allowedActivities = [
        "Schule",
        "Hausaufgaben",
        "Üben",
        "Sport",
        // Musikinstrumente (werden durch selectSingleInstrument gefiltert)
        "Klavierunterricht", "Klavier",
        "Trompetenunterricht", "Trompete",
        "Saxophonunterricht", "Saxophon"
    ];

    if (!allowedActivities.includes(activity.name)) {
        console.log(`⏭️ ${activity.name} wird übersprungen (nur manuell platzierbar)`);
        return;
    }

    // Spezielle Behandlung für verschiedene Aktivitätstypen
    if (activity.name === "Schule") {
        placeSchoolBlocks(activity, defaults);
    } else if (activity.name === "Hausaufgaben") {
        placeHomeworkBlocks(activity, defaults);
    } else if (activity.name.includes("unterricht")) {
        placeLessonBlocks(activity, defaults);
    } else if (defaults.dailyMinutes > 0) {
        // Tägliche Aktivität (z.B. Üben, Instrument üben)
        placeDailyActivity(activity, defaults);
    } else {
        // Wöchentliche Aktivität (z.B. Sport)
        placeWeeklyActivity(activity, defaults);
    }
}

// ========================================
// PLATZIERUNGS-FUNKTIONEN
// ========================================

// Schulblöcke platzieren (längere zusammenhängende Blöcke)
function placeSchoolBlocks(activity, defaults) {
    console.log(`Platziere Schulblöcke für ${defaults.preferredDays.length} Tage`);
    defaults.preferredDays.forEach(day => {
        const timeSlot = findBestTimeSlot(day, defaults.dailyMinutes, ["08:00"], activity.name);
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
        // Prüfen ob bereits Hausaufgaben an diesem Tag platziert sind
        if (hasHomeworkOnDay(day)) {
            console.log(`Hausaufgaben übersprungen am ${day} - bereits vorhanden`);
            return;
        }

        // Suche nach Schulende oder verwende bevorzugte Zeiten
        const schoolEndTime = findSchoolEndTime(day);
        const startTimes = schoolEndTime ? [schoolEndTime] : defaults.preferredTimes;

        const timeSlot = findBestTimeSlot(day, defaults.dailyMinutes, startTimes, activity.name);
        if (timeSlot !== null) {
            createScheduledBlock(activity, day, timeSlot, defaults.dailyMinutes);
            console.log(`✓ Hausaufgaben platziert am ${day} um ${timeSlots[timeSlot]} für ${defaults.dailyMinutes}min`);
        } else {
            console.warn(`✗ Hausaufgaben konnte nicht platziert werden am ${day}`);
        }
    });
}

// Hausaufgabenbetreuung platzieren (direkt nach der Schule, alternative zu AG und Hausaufgaben)
function placeHomeworkSupervisionBlocks(activity, defaults) {
    defaults.preferredDays.forEach(day => {
        // KRITISCH: Prüfen ob bereits Hausaufgaben an diesem Tag platziert sind
        if (hasHomeworkOnDay(day)) {
            console.log(`Hausaufgabenbetreuung übersprungen am ${day} wegen Hausaufgaben`);
            return;
        }

        // Prüfen ob bereits eine AG an diesem Tag platziert ist
        if (hasAGOnDay(day)) {
            console.log(`Hausaufgabenbetreuung übersprungen am ${day} wegen AG`);
            return;
        }

        // Direkt nach Schulende platzieren
        const schoolEndTime = findSchoolEndTime(day);
        const startTimes = schoolEndTime ? [schoolEndTime] : defaults.preferredTimes;

        console.log(`Platziere Hausaufgabenbetreuung am ${day}, Schulende: ${schoolEndTime}, verfügbare Zeiten:`, startTimes);

        const timeSlot = findBestTimeSlot(day, defaults.dailyMinutes, startTimes, activity.name);
        if (timeSlot !== null) {
            const success = createScheduledBlock(activity, day, timeSlot, defaults.dailyMinutes);
            if (success) {
                console.log(`✓ Hausaufgabenbetreuung erfolgreich platziert am ${day} um ${timeSlots[timeSlot]}`);
            }
        } else {
            console.warn(`✗ Konnte Hausaufgabenbetreuung nicht platzieren am ${day}`);
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
            const timeSlot = findBestTimeSlot(day, sessionDuration, [schoolEndTime], activity.name);
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

        const timeSlot = findBestTimeSlot(day, sessionDuration, defaults.preferredTimes, activity.name);
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

        const timeSlot = findBestTimeSlot(day, defaults.dailyMinutes, adjustedTimes, activity.name);
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
        // Sport: Vereinstraining in Deutschland typisch 2-3× pro Woche à 90 Min
        sessionDuration = 90; // Standard-Session (1,5 Stunden)
        sessionsNeeded = Math.ceil(totalMinutes / sessionDuration);

        console.log(`Sport-Planung: ${sessionsNeeded} Sessions à ${sessionDuration} Min (Ziel: ${totalMinutes} Min/Woche)`);
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

        const timeSlot = findBestTimeSlot(day, sessionDuration, defaults.preferredTimes, activity.name);
        if (timeSlot !== null) {
            createScheduledBlock(activity, day, timeSlot, sessionDuration);
            placedSessions++;
        }
    }
}

// ========================================
// VALIDIERUNG & BALANCE
// ========================================

// Balance-Validierung: Prüft ob Wochenziele erreicht wurden
function validateWeekBalance(ageGroup) {
    const activityMinutes = {};

    // Sammle alle platzierten Aktivitäten und summiere Minuten
    days.forEach(day => {
        const dayBlocks = placedActivitiesByDay[day] || [];
        dayBlocks.forEach(block => {
            const activityName = block.activity.name;
            if (!activityMinutes[activityName]) {
                activityMinutes[activityName] = 0;
            }
            activityMinutes[activityName] += block.duration;
        });
    });

    console.log('\n📊 Wochenzusammenfassung:');
    console.log('========================');

    // Prüfe jede Aktivität gegen Soll-Werte
    activities.forEach(activity => {
        if (!activity.ageDefaults || !activity.ageDefaults[ageGroup]) return;

        const defaults = activity.ageDefaults[ageGroup];
        const target = defaults.weeklyMinutes;
        const actual = activityMinutes[activity.name] || 0;

        if (target > 0) {
            const percentage = Math.round((actual / target) * 100);
            const status = percentage >= 90 ? '✅' : percentage >= 70 ? '⚠️' : '❌';
            console.log(`${status} ${activity.name}: ${actual}/${target} Min (${percentage}%)`);

            // Warnungen für wichtige Aktivitäten
            if (percentage < 70) {
                if (activity.name === 'Sport') {
                    console.warn(`⚠️ WARNUNG: Sport-Ziel nicht erreicht! WHO empfiehlt 420 Min/Woche (60 Min täglich)`);
                } else if (activity.name === 'Hausaufgaben') {
                    console.warn(`⚠️ WARNUNG: Hausaufgaben-Zeit zu niedrig für Altersgruppe ${ageGroup}`);
                }
            }
        }
    });

    // Spezielle Prüfungen für Sport
    const sportMinutes = activityMinutes['Sport'] || 0;
    console.log('\n🏃 Sportverein-Training:');
    console.log(`Geplant: ${sportMinutes} Min/Woche`);
    console.log(`Hinweis: WHO empfiehlt 60 Min Bewegung täglich (420 Min/Woche).`);
    console.log(`Vereinstraining allein reicht nicht - zusätzliche Bewegung im Alltag wichtig!`);

    console.log('========================\n');
}

// Freie Zeiten mit Freizeit auffüllen
function fillGapsWithFreizeit(ageGroup) {
    // Finde die Freizeit-Aktivität
    const freizeitActivity = activities.find(a => a.name === 'Freizeit');
    if (!freizeitActivity) {
        console.warn('Freizeit-Aktivität nicht gefunden!');
        return;
    }

    const minGapDuration = 30; // Mindestens 30 Minuten Lücke
    const maxEndTimeWeekday = '20:00'; // Keine Freizeit nach 20:00 an Wochentagen
    const maxEndTimeWeekend = '21:00'; // Länger am Wochenende
    const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    allDays.forEach(day => {
        const isWeekend = day === 'saturday' || day === 'sunday';
        const maxEndTime = isWeekend ? maxEndTimeWeekend : maxEndTimeWeekday;
        console.log(`\nSuche Lücken am ${day}...`);

        // Finde alle Blöcke des Tages, sortiert nach timeIndex
        const dayBlocks = placedActivitiesByDay[day]?.sort((a, b) => a.timeIndex - b.timeIndex) || [];

        if (dayBlocks.length === 0) {
            console.log(`  Keine Aktivitäten am ${day}, überspringe Freizeit-Auffüllung`);
            return;
        }

        // Finde Start (nach Schulende) und Ende (vor maxEndTime)
        const schoolEndIndex = findSchoolEndIndex(day);
        const maxEndIndex = timeSlots.indexOf(maxEndTime);

        console.log(`  Schul-Ende-Index: ${schoolEndIndex}, Max-Ende-Index: ${maxEndIndex}`);
        console.log(`  Aktivitäten: ${dayBlocks.map(b => `${b.activity.name}@${b.timeIndex}`).join(', ')}`);

        // Suche Lücken zwischen Aktivitäten
        for (let i = 0; i < dayBlocks.length - 1; i++) {
            const currentBlock = dayBlocks[i];
            const nextBlock = dayBlocks[i + 1];

            // Berechne Ende des aktuellen Blocks
            const currentEndIndex = currentBlock.timeIndex + Math.ceil(currentBlock.duration / timeSettings.timeStep);

            // Lücke zwischen currentBlock und nextBlock
            const gapStartIndex = currentEndIndex;
            const gapEndIndex = nextBlock.timeIndex;
            const gapDuration = (gapEndIndex - gapStartIndex) * timeSettings.timeStep;

            console.log(`  Lücke zwischen ${currentBlock.activity.name} (Ende: ${gapStartIndex}) und ${nextBlock.activity.name} (Start: ${gapEndIndex}): ${gapDuration} Min`);

            // Prüfe ob Lücke groß genug ist und innerhalb der erlaubten Zeit liegt
            if (gapDuration >= minGapDuration &&
                gapStartIndex >= schoolEndIndex &&
                gapEndIndex <= maxEndIndex) {

                // Erstelle Freizeit-Block für die Lücke
                console.log(`  ✓ Fülle Lücke mit Freizeit: ${timeSlots[gapStartIndex]} - ${timeSlots[gapEndIndex]} (${gapDuration} Min)`);
                createScheduledBlock(freizeitActivity, day, gapStartIndex, gapDuration);
            } else {
                console.log(`  ✗ Lücke nicht geeignet (zu klein oder außerhalb der Zeit)`);
            }
        }

        // Prüfe auch ob nach der letzten Aktivität noch Platz ist (optional)
        const lastBlock = dayBlocks[dayBlocks.length - 1];
        const lastEndIndex = lastBlock.timeIndex + Math.ceil(lastBlock.duration / timeSettings.timeStep);
        const remainingDuration = (maxEndIndex - lastEndIndex) * timeSettings.timeStep;

        console.log(`  Nach letzter Aktivität (${lastBlock.activity.name}): ${remainingDuration} Min bis ${maxEndTime}`);

        if (remainingDuration >= minGapDuration && lastEndIndex >= schoolEndIndex) {
            console.log(`  ✓ Fülle Zeit nach letzter Aktivität mit Freizeit: ${timeSlots[lastEndIndex]} - ${maxEndTime} (${remainingDuration} Min)`);
            createScheduledBlock(freizeitActivity, day, lastEndIndex, remainingDuration);
        }

        // Spezial: Am Wochenende mindestens eine große Freizeit-Session garantieren
        if (isWeekend && dayBlocks.length === 0) {
            const morningStart = timeSlots.indexOf('10:00');
            const afternoonStart = timeSlots.indexOf('14:00');
            const maxEnd = timeSlots.indexOf(maxEndTime);

            if (morningStart !== -1 && maxEnd !== -1) {
                const duration = (maxEnd - morningStart) * timeSettings.timeStep;
                console.log(`  ✓ Wochenende ohne Aktivitäten: Platziere große Freizeit-Session (${duration} Min)`);
                createScheduledBlock(freizeitActivity, day, morningStart, duration);
            }
        }
    });

    console.log('\n=== FREIZEIT-AUFFÜLLUNG ABGESCHLOSSEN ===');
}

// Hilfsfunktion: Finde den Index nach Schulende
function findSchoolEndIndex(day) {
    const schoolBlocks = placedActivitiesByDay[day]?.filter(block =>
        block.activity.name === 'Schule'
    ) || [];

    if (schoolBlocks.length === 0) {
        // Kein Schul-Tag, verwende Standard-Startzeit (z.B. 13:00)
        const defaultStart = '13:00';
        return timeSlots.indexOf(defaultStart);
    }

    // Finde Ende der Schule
    const latestBlock = schoolBlocks.reduce((latest, current) => {
        const currentEnd = current.timeIndex + Math.ceil(current.duration / timeSettings.timeStep);
        const latestEnd = latest.timeIndex + Math.ceil(latest.duration / timeSettings.timeStep);
        return currentEnd > latestEnd ? current : latest;
    });

    const endSlotIndex = latestBlock.timeIndex + Math.ceil(latestBlock.duration / timeSettings.timeStep);

    // Füge Pause hinzu (wie in findSchoolEndTime)
    const pauseSlots = Math.ceil(30 / timeSettings.timeStep);
    return endSlotIndex + pauseSlots;
}

// ========================================
// HELPER-FUNKTIONEN
// ========================================

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

    // Wähle zufällig ein verfügbares Instrument
    const randomIndex = Math.floor(Math.random() * availableInstruments.length);
    const selectedInstrument = availableInstruments[randomIndex];
    const selectedInstrumentActivities = instrumentGroups[selectedInstrument];

    console.log(`Gewähltes Instrument: ${selectedInstrument} (zufällig aus ${availableInstruments.join(', ')})`, selectedInstrumentActivities.map(a => a.name));

    // Entferne alle anderen Instrumente und behalte nur das gewählte
    return activities.filter(activity =>
        !instrumentActivities.includes(activity) ||
        selectedInstrumentActivities.includes(activity)
    );
}

// Hilfsfunktionen für realistischere Platzierung
function findSchoolEndTime(day) {
    // Suche nach Schulblöcken im Tracking-System
    const schoolBlocks = placedActivitiesByDay[day]?.filter(block =>
        block.activity.name === 'Schule'
    ) || [];

    if (schoolBlocks.length === 0) {
        console.log(`Keine Schule gefunden am ${day}, verwende Standard-Endzeit`);
        // Fallback: Standard-Schulendzeit je nach Altersgruppe
        return '13:30'; // Typische Grundschul-Endzeit
    }

    // Finde den Block mit dem spätesten Ende (normalerweise gibt es nur einen Schulblock)
    const latestBlock = schoolBlocks.reduce((latest, current) => {
        const currentEnd = current.timeIndex + Math.ceil(current.duration / timeSettings.timeStep);
        const latestEnd = latest.timeIndex + Math.ceil(latest.duration / timeSettings.timeStep);
        return currentEnd > latestEnd ? current : latest;
    });

    // Berechne die Zeit nach der Schule (mit kurzer Pause)
    const endSlotIndex = latestBlock.timeIndex + Math.ceil(latestBlock.duration / timeSettings.timeStep);
    const pauseSlots = Math.ceil(30 / timeSettings.timeStep); // 30 Min Pause
    const afterSchoolIndex = endSlotIndex + pauseSlots;

    const endTime = afterSchoolIndex < timeSlots.length ? timeSlots[afterSchoolIndex] : null;
    console.log(`Schulende am ${day}: Letzter Slot ${endSlotIndex} (${timeSlots[endSlotIndex - 1]}) → Nach Pause: ${endTime}`);

    return endTime;
}

// Ende der Hausaufgaben finden (für Platzierung von Übe-Aktivitäten)
function findLatestHomeworkEnd(day) {
    // Finde alle Hausaufgaben-Blöcke am gegebenen Tag
    const homeworkBlocks = placedActivitiesByDay[day]?.filter(block =>
        block.activity.name === 'Hausaufgaben'
    ) || [];

    if (homeworkBlocks.length === 0) {
        return null;
    }

    // Finde den Block mit dem spätesten Ende
    const latestBlock = homeworkBlocks.reduce((latest, current) => {
        const currentEnd = current.timeIndex + Math.ceil(current.duration / timeSettings.timeStep);
        const latestEnd = latest.timeIndex + Math.ceil(latest.duration / timeSettings.timeStep);
        return currentEnd > latestEnd ? current : latest;
    });

    // Berechne Endzeit mit kurzer Pause
    const endSlotIndex = latestBlock.timeIndex + Math.ceil(latestBlock.duration / timeSettings.timeStep);
    const pauseSlots = Math.ceil(15 / timeSettings.timeStep); // 15 Min Pause
    const afterHomeworkIndex = endSlotIndex + pauseSlots;

    const endTime = afterHomeworkIndex < timeSlots.length ? timeSlots[afterHomeworkIndex] : null;
    console.log(`Hausaufgaben-Ende am ${day}: Letzter Slot ${endSlotIndex} (${timeSlots[endSlotIndex - 1]}) → Nach Pause: ${endTime}`);

    return endTime;
}

// Generische Funktion: Prüfen ob eine Aktivität an einem Tag platziert ist
function hasActivityOnDay(day, activityName) {
    return placedActivitiesByDay[day] && placedActivitiesByDay[day].some(block => block.activity.name === activityName);
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

// Prüfen ob ein Zeitslot vor der Schule liegt
function isBeforeSchool(day, timeIndex) {
    // Finde Schulblöcke am Tag
    const schoolBlocks = placedActivitiesByDay[day]?.filter(block =>
        block.activity.name === 'Schule'
    ) || [];

    if (schoolBlocks.length > 0) {
        // Schule ist bereits platziert - prüfe ob timeIndex vor Schulstart liegt
        const earliestSchoolBlock = schoolBlocks.reduce((earliest, current) =>
            current.timeIndex < earliest.timeIndex ? current : earliest
        );
        return timeIndex < earliestSchoolBlock.timeIndex;
    } else {
        // Schule noch nicht platziert - prüfe gegen Standard-Schulstart (08:00)
        const schoolStartTime = '08:00';
        const schoolStartIndex = timeSlots.indexOf(schoolStartTime);
        return schoolStartIndex !== -1 && timeIndex < schoolStartIndex;
    }
}

// Besten verfügbaren Zeitslot finden
function findBestTimeSlot(day, durationMinutes, preferredTimes, activityName = null) {
    const durationSlots = Math.ceil(durationMinutes / timeSettings.timeStep);

    // Durch bevorzugte Zeiten iterieren
    for (const preferredTime of preferredTimes) {
        const startTimeIndex = timeSlots.indexOf(preferredTime);
        if (startTimeIndex === -1) continue;

        // Validierung: Keine Aktivitäten vor Schule (außer Schule selbst)
        if (activityName && activityName !== 'Schule' && isBeforeSchool(day, startTimeIndex)) {
            continue; // Überspringe Zeiten vor der Schule
        }

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
        // Validierung: Keine Aktivitäten vor Schule (außer Schule selbst)
        if (activityName && activityName !== 'Schule' && isBeforeSchool(day, startTimeIndex)) {
            continue; // Überspringe Zeiten vor der Schule
        }

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

    // KOLLISIONSPRÜFUNG: Prüfen ob alle benötigten Slots frei sind
    for (let i = 0; i < durationSlots; i++) {
        const checkTimeIndex = timeIndex + i;

        // Prüfen ob der Zeitindex im gültigen Bereich liegt
        if (checkTimeIndex >= timeSlots.length) {
            console.warn(`⚠️ Block ${activity.name} passt nicht in den verfügbaren Zeitraum (${day}, Start: ${timeSlots[timeIndex]}, Dauer: ${durationMinutes}min)`);
            return false;
        }

        const checkKey = `${day}-${checkTimeIndex}`;
        if (scheduledBlocks[checkKey]) {
            console.warn(`⚠️ KOLLISION ERKANNT: Zeitraum ${day} ${timeSlots[checkTimeIndex]} bereits belegt! Block ${activity.name} wird NICHT platziert.`);
            return false;
        }
    }

    const block = {
        id: blockId,
        day: day,
        timeIndex: timeIndex,
        activity: activity,
        duration: durationMinutes
    };

    // Block in Registry speichern
    blockRegistry[blockId] = block;

    // Zeitslots blockieren (nur wenn keine Kollision)
    for (let i = 0; i < durationSlots; i++) {
        const key = `${day}-${timeIndex + i}`;
        scheduledBlocks[key] = blockId;
    }

    // Block-Informationen im Tracking-System registrieren (für Auto-Fill-Logik)
    if (!placedActivitiesByDay[day]) {
        placedActivitiesByDay[day] = [];
    }
    placedActivitiesByDay[day].push({
        activity: activity,
        timeIndex: timeIndex,
        duration: durationMinutes,
        id: blockId
    });

    // Block rendern
    renderScheduledBlock(block);

    console.log(`✓ Platziert: ${activity.name} am ${day} um ${timeSlots[timeIndex]} für ${durationMinutes}min`);
    return true;
}
