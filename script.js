// Перевірка стану автентифікації
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

if (!isLoggedIn()) {
    localStorage.removeItem('sessions');
}

// Оновлення навігації
function updateNavbar() {
    const guestItems = document.querySelectorAll('[data-guest]');
    const authItems  = document.querySelectorAll('[data-auth]');
    if (isLoggedIn()) {
        guestItems.forEach(el => el.style.display = 'none');
        authItems.forEach(el => el.style.display = 'block');
    } else {
        guestItems.forEach(el => el.style.display = 'block');
        authItems.forEach(el => el.style.display = 'none');
    }
}

// Демонстраційні функції входу/виходу
function loginDemo() {
    localStorage.setItem('isLoggedIn', 'true');
    updateNavbar();
}
function logoutDemo() {
    localStorage.setItem('isLoggedIn', 'false');
    updateNavbar();
}

// Модель: зберігає сесії
class SessionModel {
    constructor() {
        this.sessions = JSON.parse(localStorage.getItem('sessions')) || [];
    }
    addSession(name, start, end, duration) {
        this.sessions.push({ name, start, end, duration });
        this._save();
    }
    getSessions() {
        return this.sessions;
    }
    _save() {
        localStorage.setItem('sessions', JSON.stringify(this.sessions));
    }
}

// Представлення: оновлює DOM
class SessionView {
    constructor() {
        this.timerDisplay = document.getElementById('timer-display');
        this.historyList  = document.querySelector('.list-group');
        this.nameInput    = document.querySelector('input[placeholder="Назва сеансу"]');
        this.btnStart     = document.querySelector('button.btn-success');
        this.btnPause     = document.querySelector('button.btn-warning');
        this.btnStop      = document.querySelector('button.btn-danger');
        this.btnSave      = document.querySelector('button.btn-primary');
    }
    updateTimer(timeText) {
        this.timerDisplay.textContent = timeText;
    }
    renderSessions(sessions) {
        this.historyList.innerHTML = '';
        sessions.forEach((s, i) => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = `${i+1}. ${s.name} — ${s.start}–${s.end} (тривалість: ${s.duration})`;
            this.historyList.append(li);
        });
    }
}

// Контролер: обробляє події
class SessionController {
    constructor(model, view) {
        this.model     = model;
        this.view      = view;
        this.timer     = null;
        this.elapsed   = 0;
        this.isPaused  = false;
        this.startTime = null;
        this.endTime   = null;
        this._init();
    }

    _init() {
        updateNavbar();
        this.view.renderSessions(this.model.getSessions());
        this.view.btnStart.addEventListener('click', () => this.start());
        this.view.btnPause.addEventListener('click', () => this.pauseResume());
        this.view.btnStop.addEventListener('click',  () => this.stop());
        this.view.btnSave.addEventListener('click',  () => this.saveSession());

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', e => {
                e.preventDefault();
                logoutDemo();
            });
        }
    }

    start() {
        // Не запускати повторно, якщо таймер вже йде
        if (this.timer) return;

        this.startTime = new Date();
        this.endTime   = null;
        this.elapsed   = 0;
        this.isPaused  = false;

        this.view.updateTimer(this._formatTime(0));

        this.timer = setInterval(() => {
            this.elapsed++;
            this.view.updateTimer(this._formatTime(this.elapsed));
        }, 1000);
    }

    pauseResume() {
        // Нічого не робити, якщо таймер не запущений
        if (!this.startTime) return;

        if (!this.isPaused) {
            // Пауза: зупиняємо інтервал
            clearInterval(this.timer);
            this.timer    = null;
            this.isPaused = true;
        } else {
            // Продовження: відновлюємо інтервал
            this.timer = setInterval(() => {
                this.elapsed++;
                this.view.updateTimer(this._formatTime(this.elapsed));
            }, 1000);
            this.isPaused = false;
        }
    }

    stop() {
        // Нічого не робити, якщо таймер не запущений
        if (!this.startTime) return;

        clearInterval(this.timer);
        this.timer    = null;
        this.isPaused = false;
        this.endTime  = new Date();

        // Показуємо фінальний час, а не скидаємо до нуля
        this.view.updateTimer(this._formatTime(this.elapsed));
    }

    saveSession() {
        if (!this.startTime || !this.endTime) return;

        const name     = this.view.nameInput.value.trim() || `Сеанс ${this.model.getSessions().length + 1}`;
        const s        = this._formatClock(this.startTime);
        const e        = this._formatClock(this.endTime);
        const duration = this._formatTime(Math.round((this.endTime - this.startTime) / 1000));

        this.model.addSession(name, s, e, duration);
        this.view.renderSessions(this.model.getSessions());

        // Скидаємо стан після збереження
        this.view.nameInput.value = '';
        this.view.updateTimer('00:00:00');
        this.elapsed   = 0;
        this.startTime = null;
        this.endTime   = null;
    }

    // ВИПРАВЛЕНО: повертає рядок у форматі ГГ:ХХ:СС
    _formatTime(sec) {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return [
            String(h).padStart(2, '0'),
            String(m).padStart(2, '0'),
            String(s).padStart(2, '0')
        ].join(':');
    }

    _formatClock(date) {
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    }
}

// Ініціалізація
window.addEventListener('DOMContentLoaded', () => {
    const model = new SessionModel();
    const view  = new SessionView();
    new SessionController(model, view);
});
