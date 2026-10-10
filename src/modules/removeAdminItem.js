export const initRemoveAdminItem = (service, tableBody, status, onRemoved) => {
    tableBody.addEventListener("click", async (event) => {
        const button = event.target.closest(".action-remove");
        if (!button || !tableBody.contains(button)) {
            return;
        }

        const itemId = button.closest(".table__row").dataset.key;
        button.disabled = true;
        status.textContent = "";
        status.classList.remove("is-visible");

        try {
            await service.removeItem(itemId);
            onRemoved(itemId);
        } catch (error) {
            button.disabled = false;
            status.textContent = "Не удалось удалить услугу. Проверьте соединение и попробуйте ещё раз.";
            status.classList.add("is-visible");
            console.error("Не удалось удалить услугу:", error);
        }
    });
};
