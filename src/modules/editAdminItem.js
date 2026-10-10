export const initEditAdminItem = (service, tableBody, itemForm, onSaved) => {
    tableBody.addEventListener("click", async (event) => {
        const button = event.target.closest(".action-change");
        if (!button || !tableBody.contains(button)) {
            return;
        }

        const itemId = button.closest(".table__row").dataset.key;
        itemForm.status.textContent = "";
        itemForm.status.classList.remove("is-visible");
        button.disabled = true;

        try {
            const item = await service.getItem(itemId);
            itemForm.fill(item);
        } catch (error) {
            itemForm.setError("Не удалось загрузить услугу. Попробуйте ещё раз.");
            itemForm.show();
            console.error("Не удалось загрузить услугу для редактирования:", error);
        } finally {
            button.disabled = false;
        }
    });

    itemForm.form.addEventListener("submit", async (event) => {
        if (itemForm.form.dataset.method !== "PATCH") {
            return;
        }
        event.preventDefault();
        itemForm.status.textContent = "";
        itemForm.status.classList.remove("is-visible");

        let updatedFields;
        try {
            updatedFields = itemForm.getItem();
        } catch (error) {
            itemForm.setError(error.message);
            return;
        }

        const itemId = itemForm.form.dataset.itemId;
        const submitButton = itemForm.form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        try {
            const updatedItem = await service.editItem(itemId, updatedFields);
            onSaved(updatedItem);
            itemForm.close();
        } catch (error) {
            itemForm.setError("Не удалось сохранить услугу. Проверьте соединение и попробуйте ещё раз.");
            console.error("Не удалось отредактировать услугу:", error);
        } finally {
            submitButton.disabled = false;
        }
    });
};
