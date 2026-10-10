const sendForm = () => {
    const getStatus = (form) => {
        let status = form.nextElementSibling;

        if (!status?.classList.contains("form-status")) {
            status = document.createElement("div");
            status.className = "form-status";
            status.setAttribute("aria-live", "polite");
            form.insertAdjacentElement("afterend", status);
        }

        return status;
    };

    document.addEventListener("submit", async (event) => {
        const form = event.target;

        if (!(form instanceof HTMLFormElement) || event.defaultPrevented) {
            return;
        }

        event.preventDefault();

        const status = getStatus(form);
        status.textContent = "";
        status.classList.remove("form-status-error", "form-status-success");

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.form = form.id || "website";
        const submitButtons = [...form.querySelectorAll('button[type="submit"], button:not([type])')];
        submitButtons.forEach((button) => {
            button.disabled = true;
        });

        try {
            const response = await fetch(form.dataset.endpoint || "./server.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(data),
            });
            let result;
            try {
                result = await response.json();
            } catch {
                throw new Error("Сервер вернул некорректный ответ. Попробуйте позже.");
            }

            if (!response.ok) {
                throw new Error(result.message || "Не удалось отправить заявку. Попробуйте позже.");
            }
            status.textContent = "Заявка отправлена. Мы скоро свяжемся с вами.";
            status.classList.add("form-status-success");
            document.dispatchEvent(new CustomEvent("form:success", { detail: { form } }));
        } catch (error) {
            status.textContent = error instanceof Error && error.message
                ? error.message
                : "Не удалось отправить заявку. Попробуйте позже или свяжитесь с нами по телефону.";
            status.classList.add("form-status-error");
        } finally {
            submitButtons.forEach((button) => {
                button.disabled = false;
            });
        }
    });
};

export default sendForm;
