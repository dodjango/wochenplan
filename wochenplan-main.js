// ========================================
// INITIALISIERUNG
// ========================================

// Initialisierung
function init() {
    // Einmalige Bereinigung alter Datenformate
    cleanupLegacyData();

    loadTimeSettings();
    generateTimeSlots();
    loadActivities();
    createActivityBlocks();
    createCalendarGrid();

    // Hash-basierte Navigation initialisieren
    initNavigation();
}

// App starten
document.addEventListener('DOMContentLoaded', init);
