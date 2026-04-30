/**
 * VIEW — відповідає за відображення даних у DOM.
 * Не містить бізнес-логіки. Отримує дані від контролера.
 */
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

    /** Оновлює відображення таймера */
    updateTimer(timeText) {
        this.timerDisplay.textContent = timeText;
    }

    /** Перерендерує список збережених сесій */
    renderSessions(sessions) {
        this.historyList.innerHTML = '';
        sessions.forEach((s, i) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <span><strong>${i + 1}. ${s.name}</strong> — ${s.start}–${s.end}</span>
                <span class="badge bg-danger rounded-pill">${s.duration}</span>
            `;
            this.historyList.append(li);
        });
    }

    /** Очищує поле введення назви сесії */
    clearNameInput() {
        this.nameInput.value = '';
    }

    /** Показує повідомлення у вигляді тосту */
    showMessage(text, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} position-fixed bottom-0 end-0 m-3`;
        toast.style.zIndex = 9999;
        toast.textContent = text;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    /** Оновлює навігаційну панель залежно від стану авторизації */
    updateNavbar(isLoggedIn) {
        const guestItems = document.querySelectorAll('[data-guest]');
        const authItems  = document.querySelectorAll('[data-auth]');
        if (isLoggedIn) {
            guestItems.forEach(el => el.style.display = 'none');
            authItems.forEach(el => el.style.display = 'block');
        } else {
            guestItems.forEach(el => el.style.display = 'block');
            authItems.forEach(el => el.style.display = 'none');
        }
    }
}
