/**
 * APP — точка входу застосунку.
 * Створює екземпляри MVC-шарів та запускає додаток.
 *
 * Порядок підключення у HTML:
 *   <script src="js/model.js"></script>
 *   <script src="js/view.js"></script>
 *   <script src="js/controller.js"></script>
 *   <script src="js/app.js"></script>
 */
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
