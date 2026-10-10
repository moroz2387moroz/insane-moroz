export const initAdminLogin = (apiUrl) => {
    const form = document.querySelector("#admin-login-form");
    const username = form.querySelector("#name");
    const password = form.querySelector("#password");
    const submitButton = form.querySelector('button[type="submit"]');
    const status = form.querySelector(".auth-status");
    const clearErrors = () => {
        form.querySelectorAll(".label").forEach((label) => label.classList.remove("has-error"));
        username.removeAttribute("aria-invalid");
        password.removeAttribute("aria-invalid");
        status.textContent = "";
        status.classList.remove("is-visible");
    };

    form.addEventListener("input", clearErrors);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearErrors();
        submitButton.disabled = true;

        try {
            const params = new URLSearchParams({
                login: username.value,
                password: password.value,
            });
            const response = await fetch(`${apiUrl}/auth/login?${params}`, {
                credentials: "include",
                headers: { Accept: "application/json" },
            });

            if (response.status === 401) {
                form.querySelectorAll(".label").forEach((label) => label.classList.add("has-error"));
                username.setAttribute("aria-invalid", "true");
                password.setAttribute("aria-invalid", "true");
                username.value = "";
                password.value = "";
                username.focus();
                return;
            }

            if (!response.ok) {
                throw new Error("Сервис авторизации недоступен. Проверьте его настройки и повторите попытку.");
            }

            window.location.assign("./table.html");
        } catch (error) {
            status.textContent = error instanceof Error
                ? error.message
                : "Не удалось проверить логин и пароль. Попробуйте ещё раз.";
            status.classList.add("is-visible");
        } finally {
            submitButton.disabled = false;
        }
    });
};

export const guardAdminTable = async (apiUrl, onAuthenticated) => {
    try {
        const response = await fetch(`${apiUrl}/auth/session`, {
            credentials: "include",
            headers: { Accept: "application/json" },
        });

        if (!response.ok) {
            window.location.replace("./index.html");
            return;
        }
        await onAuthenticated();
    } catch {
        window.location.replace("./index.html");
    }
};
