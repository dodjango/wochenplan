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

    // ✅ NEU: Kritische Verbesserungen initialisieren
    setupTouchEvents();           // wochenplan-touch.js
    setupKeyboardNavigation();    // wochenplan-keyboard.js
    setupAriaLabels();            // wochenplan-accessibility.js

    // Hash-basierte Navigation initialisieren
    initNavigation();
}

// App starten
document.addEventListener('DOMContentLoaded', init);
