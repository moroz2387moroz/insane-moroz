export const initAdminItemForm = () => {
    const modal = document.querySelector("#modal");
    const form = modal.querySelector("#admin-item-form");
    const status = modal.querySelector("#admin-item-status");
    const heading = modal.querySelector(".modal__header");
    const addHeading = "Добавление новой услуги";

    const show = () => {
        status.textContent = "";
        status.classList.remove("is-visible");
        modal.style.display = "flex";
        modal.querySelector("#type").focus();
    };

    const close = () => {
        modal.style.display = "none";
        form.reset();
        delete form.dataset.method;
        delete form.dataset.itemId;
        heading.textContent = addHeading;
        status.textContent = "";
        status.classList.remove("is-visible");
    };

    const setError = (message) => {
        status.textContent = message;
        status.classList.add("is-visible");
    };

    document.querySelector(".btn-addItem").addEventListener("click", () => {
        form.reset();
        delete form.dataset.itemId;
        form.dataset.method = "POST";
        heading.textContent = addHeading;
        show();
    });
    modal.querySelector(".button__close").addEventListener("click", close);
    modal.querySelector(".cancel-button").addEventListener("click", close);
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            close();
        }
    });

    return {
        modal,
        form,
        status,
        heading,
        show,
        close,
        setError,
        getItem() {
            const cost = Number(form.querySelector("#cost").value);
            if (!Number.isFinite(cost)) {
                throw new Error("Укажите корректную цену.");
            }

            return {
                type: form.querySelector("#type").value.trim(),
                name: form.querySelector("#name").value.trim(),
                units: form.querySelector("#units").value.trim(),
                cost,
            };
        },
        fill(item) {
            form.querySelector("#type").value = item.type;
            form.querySelector("#name").value = item.name;
            form.querySelector("#units").value = item.units;
            form.querySelector("#cost").value = item.cost;
            form.dataset.method = "PATCH";
            form.dataset.itemId = item.id;
            heading.textContent = "Редактировать услугу";
            show();
        },
    };
};
