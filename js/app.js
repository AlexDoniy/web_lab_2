
window.addEventListener('DOMContentLoaded', () => {
    // Якщо користувач не авторизований — очищаємо сесії
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        localStorage.removeItem('sessions');
    }

    const model = new SessionModel();
    const view  = new SessionView();
    const auth  = new AuthController(view);

    new SessionController(model, view, auth);
});
