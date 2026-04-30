
class AuthController {
    constructor(view) {
        this.view = view;
    }

    isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }


    tryLogin(email, password) {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user || user.email !== email || user.password !== password) {
            return false;
        }
        localStorage.setItem('isLoggedIn', 'true');
        this.view.updateNavbar(true);
        return true;
    }


    register(name, email, password) {
        const existing = JSON.parse(localStorage.getItem('user') || 'null');
        if (existing && existing.email === email) {
            return false;
        }
        const user = { name, email, password, regDate: new Date().toLocaleDateString('uk-UA') };
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        this.view.updateNavbar(true);
        return true;
    }

    logout() {
        localStorage.setItem('isLoggedIn', 'false');
        this.view.updateNavbar(false);
    }
}

class SessionController {
    constructor(model, view, auth) {
        this.model    = model;
        this.view     = view;
        this.auth     = auth;

        // Стан таймера
        this.timer     = null;
        this.elapsed   = 0;
        this.isPaused  = false;
        this.startTime = null;
        this.endTime   = null;

        this._init();
    }

    _init() {
        this.view.updateNavbar(this.auth.isLoggedIn());
        this.view.renderSessions(this.model.getSessions());

        this.view.btnStart.addEventListener('click', () => this.start());
        this.view.btnPause.addEventListener('click', () => this.pauseResume());
        this.view.btnStop.addEventListener('click',  () => this.stop());
        this.view.btnSave.addEventListener('click',  () => this.saveSession());

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', e => {
                e.preventDefault();
                this.auth.logout();
            });
        }
    }

    start() {
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
        if (!this.startTime) return;

        if (!this.isPaused) {
            clearInterval(this.timer);
            this.timer    = null;
            this.isPaused = true;
        } else {
            this.timer = setInterval(() => {
                this.elapsed++;
                this.view.updateTimer(this._formatTime(this.elapsed));
            }, 1000);
            this.isPaused = false;
        }
    }

    stop() {
        if (!this.startTime) return;

        clearInterval(this.timer);
        this.timer    = null;
        this.isPaused = false;
        this.endTime  = new Date();

        this.view.updateTimer(this._formatTime(this.elapsed));
    }

    saveSession() {
        if (!this.startTime || !this.endTime) {
            this.view.showMessage('Спочатку запустіть та зупиніть таймер!', 'warning');
            return;
        }

        const name     = this.view.nameInput.value.trim()
                         || `Сеанс ${this.model.getSessions().length + 1}`;
        const s        = this._formatClock(this.startTime);
        const e        = this._formatClock(this.endTime);
        const duration = this._formatTime(
            Math.round((this.endTime - this.startTime) / 1000)
        );

        this.model.addSession(name, s, e, duration);
        this.view.renderSessions(this.model.getSessions());
        this.view.showMessage(`Сеанс "${name}" збережено!`);

        this.view.clearNameInput();
        this.view.updateTimer('00:00:00');
        this.elapsed   = 0;
        this.startTime = null;
        this.endTime   = null;
    }

    _formatTime(sec) {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return [
            String(h).padStart(2, '0'),
            String(m).padStart(2, '0'),
            String(s).padStart(2, '0'),
        ].join(':');
    }

    _formatClock(date) {
        return [
            String(date.getHours()).padStart(2, '0'),
            String(date.getMinutes()).padStart(2, '0'),
        ].join(':');
    }
}
