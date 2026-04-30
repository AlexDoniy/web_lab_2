/**
 * MODEL — відповідає за зберігання та управління даними сесій.
 * Не знає нічого про DOM або логіку таймера.
 */
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

    clearSessions() {
        this.sessions = [];
        this._save();
    }

    _save() {
        localStorage.setItem('sessions', JSON.stringify(this.sessions));
    }
}
