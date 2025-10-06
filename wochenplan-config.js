// ========================================
// GLOBALE KONFIGURATION & VARIABLEN
// ========================================

// Aktivitäten-Verwaltung
let activities = [];
let currentEditingActivity = null;

// Tracking für ungespeicherte Änderungen
let hasUnsavedChanges = false;
let pendingNavigationToWelcome = false;

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
                dailyMinutes: 45,
                weeklyMinutes: 225,
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
                dailyMinutes: 10,
                weeklyMinutes: 50,
                preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
                preferredTimes: ["16:30", "17:30"],
                priority: 7
            },
            "11-14": {
                dailyMinutes: 15,
                weeklyMinutes: 75,
                preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
                preferredTimes: ["17:00", "18:00"],
                priority: 7
            },
            "15-18": {
                dailyMinutes: 20,
                weeklyMinutes: 100,
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
                preferredTimes: ["17:00", "18:00"],
                priority: 9
            },
            "11-14": {
                dailyMinutes: 30,
                weeklyMinutes: 210,
                preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
                preferredTimes: ["18:00", "19:00"],
                priority: 9
            },
            "15-18": {
                dailyMinutes: 30,
                weeklyMinutes: 210,
                preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
                preferredTimes: ["19:00", "20:00"],
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
                weeklyMinutes: 180,
                preferredDays: ["tuesday", "thursday"],
                preferredTimes: ["16:00", "17:00"],
                priority: 6
            },
            "11-14": {
                dailyMinutes: 0,
                weeklyMinutes: 180,
                preferredDays: ["tuesday", "thursday"],
                preferredTimes: ["16:00", "17:00"],
                priority: 6
            },
            "15-18": {
                dailyMinutes: 0,
                weeklyMinutes: 270,
                preferredDays: ["monday", "wednesday", "friday"],
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

// Wochentage
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// Kalender-State
let scheduledBlocks = {}; // Mapping: "day-timeIndex" -> blockId (für Kollisionsprüfung)
let blockRegistry = {};   // Mapping: blockId -> Block-Objekt (für Datenpersistenz)
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

// Auto-Fill Tracking
let placedActivitiesByDay = {};
