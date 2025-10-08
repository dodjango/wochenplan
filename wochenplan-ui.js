// ========================================
// UI & NAVIGATION
// ========================================

// Navigation initialisieren
function initNavigation() {
    const hash = window.location.hash;

    // Hash hat höchste Priorität
    if (hash === '#app') {
        loadWeek();
        navigateToApp();
        return;
    }

    if (hash === '#welcome') {
        navigateToWelcome();
        return;
    }

    // Kein Hash: SessionStorage prüfen (überlebt F5 während Browser-Session)
    const hasActiveSession = sessionStorage.getItem('planActive') === 'true';
    if (hasActiveSession) {
        loadWeek();
        navigateToApp();
        return;
    }

    // Als letztes: LocalStorage prüfen (überlebt Browser-Neustart)
    if (checkActivePlan()) {
        loadWeek();
        navigateToApp();
        return;
    }

    // Kein Plan gefunden → Welcome Screen
    navigateToWelcome();
}

// Hash-Change Handler für Browser Back/Forward
function handleHashChange() {
    const hash = window.location.hash;

    if (hash === '#app') {
        hideWelcomeScreen();
    } else if (hash === '#welcome') {
        showWelcomeScreen();
    }
}

// Zur App navigieren
function navigateToApp() {
    hideWelcomeScreen();
    window.location.hash = 'app';
    sessionStorage.setItem('planActive', 'true');
}

// Zum Welcome Screen navigieren
function navigateToWelcome() {
    // Prüfen ob ungespeicherte Änderungen vorliegen
    if (hasUnsavedChanges) {
        const confirmed = confirm(
            'Sie haben ungespeicherte Änderungen.\n\n' +
            'Möchten Sie die Änderungen speichern, bevor Sie zum Startbildschirm zurückkehren?\n\n' +
            'Klicken Sie "OK" zum Speichern oder "Abbrechen" zum Verwerfen.'
        );

        if (confirmed) {
            // Plan speichern - Navigation wird nach dem Speichern fortgesetzt
            pendingNavigationToWelcome = true;
            openSavePlanModal();
            return;
        }
    }

    // Navigation durchführen
    showWelcomeScreen();
    window.location.hash = 'welcome';
    sessionStorage.removeItem('planActive');
    hasUnsavedChanges = false; // Änderungen verwerfen
}

// Prüfen ob ein aktiver Plan vorhanden ist
function checkActivePlan() {
    const savedPlan = localStorage.getItem('wochenplan');
    if (!savedPlan || savedPlan === '{}' || savedPlan === '[]') {
        return false;
    }

    // Prüfen ob der Plan tatsächlich Daten enthält
    try {
        const data = JSON.parse(savedPlan);
        return data && Object.keys(data).length > 0;
    } catch (error) {
        console.warn('Fehler beim Prüfen des Plans:', error);
        return false;
    }
}

// Willkommensbildschirm anzeigen
function showWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainApp = document.getElementById('main-app');

    if (welcomeScreen && mainApp) {
        welcomeScreen.classList.add('active');
        mainApp.classList.remove('active');
    }
}

// Willkommensbildschirm verstecken
function hideWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainApp = document.getElementById('main-app');

    if (welcomeScreen && mainApp) {
        welcomeScreen.classList.remove('active');
        mainApp.classList.add('active');
    }
}

// Neuen Plan von Willkommensseite erstellen
function createNewPlanFromWelcome() {
    navigateToApp();
    // Kleine Verzögerung damit die UI Zeit hat zu rendern
    setTimeout(() => {
        openAutoFillModal();
    }, 100);
}

// Plan von Willkommensseite laden
function loadPlanFromWelcome() {
    navigateToApp();
    setTimeout(() => {
        loadWeekPlan();
    }, 100);
}

// ========================================
// PLAN-VERWALTUNG UI
// ========================================

// Neuer Wochenplan
function newWeekPlan() {
    if (confirm('Neuen Wochenplan erstellen? Aktuelle Änderungen gehen verloren!')) {
        scheduledBlocks = {};
        blockRegistry = {};
        document.querySelectorAll('.scheduled-block').forEach(el => el.remove());
        currentPlanName = 'Neuer Wochenplan';
        updatePlanTitle();
        saveWeek(); // Leeren Plan speichern
        hasUnsavedChanges = false; // Neuer Plan hat keine ungespeicherten Änderungen
        navigateToApp(); // Zur App navigieren und Session speichern
    }
}

// Plan-Titel aktualisieren
function updatePlanTitle() {
    document.getElementById('planTitle').textContent = currentPlanName;
}

// ========================================
// MODAL-FUNKTIONEN
// ========================================

// Modal-Funktionen: Speichern
function openSavePlanModal() {
    const modal = document.getElementById('savePlanModal');
    const input = document.getElementById('savePlanName');
    const warning = document.getElementById('overwriteWarning');

    input.value = currentPlanName;
    warning.style.display = 'none';

    modal.style.display = 'block';
    input.focus();
    input.select();

    // Enter-Taste zum Speichern
    input.onkeypress = function(e) {
        if (e.key === 'Enter') {
            executeSavePlan();
        }
    };

    // Warnung anzeigen wenn Plan existiert
    input.oninput = function() {
        const savedPlans = getSavedPlans();
        if (savedPlans[input.value.trim()]) {
            warning.style.display = 'block';
        } else {
            warning.style.display = 'none';
        }
    };
}

function closeSavePlanModal() {
    document.getElementById('savePlanModal').style.display = 'none';
    // Navigation abbrechen wenn Modal geschlossen wird ohne zu speichern
    pendingNavigationToWelcome = false;
}

function executeSavePlan() {
    const planName = document.getElementById('savePlanName').value.trim();

    if (!planName) {
        showToast('Bitte geben Sie einen Plan-Namen ein!', 'error', 3000);
        return;
    }

    savePlanToStorage(planName);
    closeSavePlanModal();

    showToast(`Plan "${planName}" wurde gespeichert!`, 'success', 3000);

    // Wenn Navigation zum Welcome Screen ausstehend ist, jetzt durchführen
    if (pendingNavigationToWelcome) {
        pendingNavigationToWelcome = false;
        showWelcomeScreen();
        window.location.hash = 'welcome';
        sessionStorage.removeItem('planActive');
    }
}

// Modal-Funktionen: Laden
function openLoadPlanModal() {
    const modal = document.getElementById('loadPlanModal');
    modal.style.display = 'block';
    renderSavedPlansList();
}

function closeLoadPlanModal() {
    document.getElementById('loadPlanModal').style.display = 'none';
}

function renderSavedPlansList() {
    const container = document.getElementById('savedPlansList');
    const savedPlans = getSavedPlans();
    const planNames = Object.keys(savedPlans).sort();

    if (planNames.length === 0) {
        container.innerHTML = `
            <div class="empty-plans-message">
                <p>Noch keine Pläne gespeichert.</p>
                <p>Erstellen Sie einen Plan und speichern Sie ihn!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = planNames.map(name => {
        const plan = savedPlans[name];
        const date = new Date(plan.lastModified || plan.created);
        const dateStr = date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="plan-item" onclick="loadSavedPlan('${name}')">
                <div class="plan-item-info">
                    <div class="plan-item-name">${name}</div>
                    <div class="plan-item-date">Zuletzt geändert: ${dateStr}</div>
                </div>
                <div class="plan-item-actions">
                    <button class="btn btn-secondary" onclick="deleteSavedPlan('${name}', event)">
                        Löschen
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Alte Funktionen umbenannt für Export/Import
function saveWeekPlan() {
    openSavePlanModal();
}

function loadWeekPlan() {
    openLoadPlanModal();
}

// ========================================
// AUTO-FILL MODAL
// ========================================

// Auto-Fill Modal Funktionen
function openAutoFillModal() {
    document.getElementById('autoFillModal').style.display = 'block';
}

function closeAutoFillModal() {
    document.getElementById('autoFillModal').style.display = 'none';
}

function executeAutoFill() {
    const selectedAge = document.getElementById('childAge').value;

    // Prüfen ob bereits Blöcke vorhanden sind
    const hasExistingBlocks = Object.keys(scheduledBlocks).length > 0;

    // Bestätigung nur bei vorhandenen Blöcken
    if (hasExistingBlocks) {
        if (!confirm(`Wochenplan für Alter ${selectedAge} erstellen? Bestehende Termine werden überschrieben!`)) {
            return; // Abbruch
        }
    }

    autoFillWeekPlan(selectedAge);
    closeAutoFillModal();
    hasUnsavedChanges = true; // Auto-Fill hat Änderungen vorgenommen
    navigateToApp(); // Plan wurde erstellt, zur App navigieren und Session speichern
}

// ========================================
// GLOBAL EVENT-HANDLER
// ========================================

// Modal schließen bei Klick außerhalb
window.onclick = function (event) {
    const activityModal = document.getElementById('activityModal');
    const autoFillModal = document.getElementById('autoFillModal');
    const settingsModal = document.getElementById('settingsModal');
    const savePlanModal = document.getElementById('savePlanModal');
    const loadPlanModal = document.getElementById('loadPlanModal');

    if (event.target === activityModal) {
        closeActivityModal();
    } else if (event.target === autoFillModal) {
        closeAutoFillModal();
    } else if (event.target === settingsModal) {
        closeSettingsModal();
    } else if (event.target === savePlanModal) {
        closeSavePlanModal();
    } else if (event.target === loadPlanModal) {
        closeLoadPlanModal();
    }
};

// Hash-Change Listener für Browser-Navigation (Back/Forward)
window.addEventListener('hashchange', handleHashChange);
