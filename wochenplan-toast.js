// ========================================
// TOAST NOTIFICATION SYSTEM
// ========================================
// Ersetzt blockierende alert() Dialoge durch non-blocking Toast-Messages
// Features: Auto-dismiss, Queue-System, Typen (error, success, info), Collision-Feedback

/**
 * Toast-Manager-Klasse
 * Verwaltet Toast-Notifications mit Queue-System
 */
class ToastManager {
    constructor() {
        this.queue = [];
        this.currentToast = null;
        this.container = null;
        this.init();
    }

    init() {
        // Toast-Container erstellen falls nicht vorhanden
        this.container = document.querySelector('.toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            this.container.setAttribute('role', 'region');
            this.container.setAttribute('aria-live', 'polite');
            document.body.appendChild(this.container);
        }
    }

    /**
     * Zeigt eine Toast-Nachricht an
     * @param {string} message - Die anzuzeigende Nachricht
     * @param {string} type - Toast-Typ: 'error', 'success', 'info', 'warning'
     * @param {number} duration - Anzeigedauer in Millisekunden (0 = manuelles Schließen)
     */
    show(message, type = 'info', duration = 3000) {
        const toast = {
            id: Date.now().toString(),
            message,
            type,
            duration
        };

        this.queue.push(toast);

        // Wenn kein Toast aktiv ist, nächsten anzeigen
        if (!this.currentToast) {
            this.showNext();
        }
    }

    showNext() {
        if (this.queue.length === 0) {
            this.currentToast = null;
            return;
        }

        const toast = this.queue.shift();
        this.currentToast = toast;

        // Toast-Element erstellen
        const toastElement = this.createToastElement(toast);
        this.container.appendChild(toastElement);

        // Slide-In Animation
        setTimeout(() => {
            toastElement.classList.add('toast-visible');
        }, 10);

        // Auto-dismiss nach duration
        if (toast.duration > 0) {
            setTimeout(() => {
                this.dismiss(toast.id);
            }, toast.duration);
        }
    }

    createToastElement(toast) {
        const element = document.createElement('div');
        element.className = `toast toast-${toast.type}`;
        element.dataset.toastId = toast.id;
        element.setAttribute('role', 'alert');
        element.setAttribute('aria-live', 'assertive');

        // Icon-Symbol basierend auf Typ
        const icons = {
            error: '✕',
            success: '✓',
            info: 'i',
            warning: '⚠'
        };

        element.innerHTML = `
            <div class="toast-icon">${icons[toast.type] || icons.info}</div>
            <div class="toast-message">${this.escapeHtml(toast.message)}</div>
            <button class="toast-close" aria-label="Schließen">×</button>
        `;

        // Close-Button Event
        const closeBtn = element.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.dismiss(toast.id);
        });

        return element;
    }

    dismiss(toastId) {
        const toastElement = this.container.querySelector(`[data-toast-id="${toastId}"]`);
        if (!toastElement) return;

        // Slide-Out Animation
        toastElement.classList.add('toast-hiding');

        setTimeout(() => {
            toastElement.remove();

            // Nächsten Toast anzeigen
            if (this.currentToast && this.currentToast.id === toastId) {
                this.showNext();
            }
        }, 300);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Entfernt alle aktiven Toasts
     */
    clear() {
        this.queue = [];
        this.container.querySelectorAll('.toast').forEach(toast => {
            toast.remove();
        });
        this.currentToast = null;
    }
}

// Globale Instanz
const toastManager = new ToastManager();

/**
 * Shortcut-Funktion für Toast-Anzeige
 * @param {string} message - Die anzuzeigende Nachricht
 * @param {string} type - Toast-Typ: 'error', 'success', 'info', 'warning'
 * @param {number} duration - Anzeigedauer in Millisekunden
 */
function showToast(message, type = 'info', duration = 3000) {
    toastManager.show(message, type, duration);
}

/**
 * Spezialisierte Funktion für Kollisions-Feedback
 * Zeigt Toast-Nachricht und highlightet den blockierenden Block
 * Ersetzt: alert('Dieser Zeitraum ist bereits belegt!')
 *
 * @param {Object} blockingBlock - Der Block-Objekt, der die Position blockiert
 * @param {string} targetDay - Zieltag (nicht verwendet, für Erweiterungen)
 * @param {number} targetTimeIndex - Ziel-Zeitindex (nicht verwendet, für Erweiterungen)
 */
function showCollisionFeedback(blockingBlock, targetDay, targetTimeIndex) {
    // Toast-Nachricht anzeigen
    const message = `Bereits belegt durch "${blockingBlock.activity.name}"`;
    showToast(message, 'error', 4000);

    // Blockierenden Block highlighten
    const element = document.querySelector(`[data-block-id="${blockingBlock.id}"]`);
    if (element) {
        // Highlight-Animation hinzufügen
        element.classList.add('collision-highlight');

        // Block in Viewport scrollen
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
        });

        // Highlight nach 2 Sekunden entfernen
        setTimeout(() => {
            element.classList.remove('collision-highlight');
        }, 2000);
    }

    // Screen Reader Announcement (falls Accessibility-Modul geladen ist)
    if (typeof announceToScreenReader === 'function') {
        announceToScreenReader(
            `Zeitslot nicht verfügbar. Bereits belegt durch ${blockingBlock.activity.name}.`,
            'assertive'
        );
    }
}

/**
 * Toast für erfolgreiche Operationen
 */
function showSuccessToast(message, duration = 3000) {
    showToast(message, 'success', duration);
}

/**
 * Toast für Fehler
 */
function showErrorToast(message, duration = 4000) {
    showToast(message, 'error', duration);
}

/**
 * Toast für Informationen
 */
function showInfoToast(message, duration = 3000) {
    showToast(message, 'info', duration);
}

/**
 * Toast für Warnungen
 */
function showWarningToast(message, duration = 3500) {
    showToast(message, 'warning', duration);
}
