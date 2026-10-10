export const initAddAdminItem = (service, itemForm, onSaved) => {
    itemForm.form.addEventListener("submit", async (event) => {
        if (itemForm.form.dataset.method !== "POST") {
            return;
        }
        event.preventDefault();
        itemForm.status.textContent = "";
        itemForm.status.classList.remove("is-visible");

        let newItem;
        try {
            newItem = itemForm.getItem();
        } catch (error) {
            itemForm.setError(error.message);
            return;
        }

        const submitButton = itemForm.form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        try {
            const createdItem = await service.addItem(newItem);
            onSaved(createdItem);
            itemForm.close();
        } catch (error) {
            itemForm.setError("Не удалось сохранить услугу. Проверьте соединение и попробуйте ещё раз.");
            console.error("Не удалось создать услугу:", error);
        } finally {
            submitButton.disabled = false;
        }
    });
};
