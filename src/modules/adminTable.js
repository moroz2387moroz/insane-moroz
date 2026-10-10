export const initAdminTable = async (apiUrl) => {
    const tableBody = document.querySelector("#tbody");
    const typeFilter = document.querySelector("#typeItem");
    const status = document.querySelector("#admin-data-status");

    try {
        const response = await fetch(`${apiUrl}/items`, {
            credentials: "include",
            headers: { Accept: "application/json" },
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const items = await response.json();
        if (!Array.isArray(items)) {
            throw new Error("Ответ API должен содержать массив услуг");
        }

        const updateTypeOptions = () => {
            const selectedType = typeFilter.value;
            const types = [...new Set(items.map((item) => item.type).filter(Boolean))];
            typeFilter.replaceChildren(new Option("Все услуги", ""));
            types.forEach((type) => typeFilter.add(new Option(type, type)));
            typeFilter.value = types.includes(selectedType) ? selectedType : "";
        };
        updateTypeOptions();

        const modal = document.querySelector("#modal");
        const itemForm = modal.querySelector("form");
        const itemFormStatus = modal.querySelector("#admin-item-status");
        const modalHeading = modal.querySelector(".modal__header");
        const addHeading = "Добавление новой услуги";
        let editingItemId = null;
        const openModal = () => {
            editingItemId = null;
            itemForm.reset();
            modalHeading.textContent = addHeading;
            itemFormStatus.textContent = "";
            itemFormStatus.classList.remove("is-visible");
            modal.style.display = "flex";
            modal.querySelector("#type").focus();
        };
        const closeModal = () => {
            modal.style.display = "none";
            editingItemId = null;
            modalHeading.textContent = addHeading;
        };

        document.querySelector(".btn-addItem").addEventListener("click", openModal);
        modal.querySelector(".button__close").addEventListener("click", closeModal);
        modal.querySelector(".cancel-button").addEventListener("click", closeModal);
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });

        const createCell = (className, value) => {
            const cell = document.createElement("td");
            cell.className = `${className} table__cell`;
            cell.textContent = value ?? "";
            return cell;
        };

        const createActionButton = (className, sprite, label) => {
            const button = document.createElement("button");
            button.className = `button ${className}`;
            button.type = "button";
            const iconWrapper = document.createElement("span");
            iconWrapper.className = "svg_ui";
            const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            icon.classList.add(className === "action-change" ? "action-icon_change" : "action-icon_remove");
            const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
            use.setAttribute("href", `./img/sprite.svg#${sprite}`);
            icon.append(use);
            iconWrapper.append(icon);
            const text = document.createElement("span");
            text.textContent = label;
            button.append(iconWrapper, text);
            return button;
        };

        const renderRows = () => {
            const visibleItems = typeFilter.value
                ? items.filter((item) => item.type === typeFilter.value)
                : items;

            tableBody.replaceChildren(...visibleItems.map((item) => {
                const row = document.createElement("tr");
                row.className = "table__row";
                const actions = document.createElement("div");
                actions.className = "table__actions table__cell";
                actions.append(
                    createActionButton("action-change", "change", "Изменить"),
                    createActionButton("action-remove", "remove", "Удалить")
                );
                const actionCell = document.createElement("td");
                actionCell.append(actions);
                row.append(
                    createCell("table__id", item.id),
                    createCell("table-type", item.type),
                    createCell("table-name", item.name),
                    createCell("table-units", item.units),
                    createCell("table-cost", item.cost === "" || item.cost == null ? "" : `${item.cost} руб`),
                    actionCell
                );
                return row;
            }));
        };

        typeFilter.addEventListener("change", renderRows);
        renderRows();

        tableBody.addEventListener("click", async (event) => {
            const button = event.target.closest(".action-change");
            if (!button || !tableBody.contains(button)) {
                return;
            }

            const row = button.closest(".table__row");
            const itemId = row.querySelector(".table__id").textContent.trim();
            itemFormStatus.textContent = "";
            itemFormStatus.classList.remove("is-visible");
            button.disabled = true;

            try {
                const itemResponse = await fetch(`${apiUrl}/items/${encodeURIComponent(itemId)}`, {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                });
                if (!itemResponse.ok) {
                    throw new Error(`HTTP ${itemResponse.status}`);
                }

                const item = await itemResponse.json();
                editingItemId = String(item.id);
                itemForm.querySelector("#type").value = item.type;
                itemForm.querySelector("#name").value = item.name;
                itemForm.querySelector("#units").value = item.units;
                itemForm.querySelector("#cost").value = item.cost;
                modalHeading.textContent = "Редактировать услугу";
                modal.style.display = "flex";
                modal.querySelector("#type").focus();
            } catch (error) {
                itemFormStatus.textContent = "Не удалось загрузить услугу. Попробуйте ещё раз.";
                itemFormStatus.classList.add("is-visible");
                modal.style.display = "flex";
                console.error("Не удалось загрузить услугу для редактирования:", error);
            } finally {
                button.disabled = false;
            }
        });

        tableBody.addEventListener("click", async (event) => {
            const button = event.target.closest(".action-remove");
            if (!button || !tableBody.contains(button)) {
                return;
            }

            const row = button.closest(".table__row");
            const itemId = row.querySelector(".table__id").textContent.trim();
            button.disabled = true;
            status.textContent = "";
            status.classList.remove("is-visible");

            try {
                const deleteResponse = await fetch(`${apiUrl}/items/${encodeURIComponent(itemId)}`, {
                    method: "DELETE",
                    credentials: "include",
                    headers: { Accept: "application/json" },
                });
                if (!deleteResponse.ok) {
                    throw new Error(`HTTP ${deleteResponse.status}`);
                }

                const itemIndex = items.findIndex((item) => String(item.id) === itemId);
                if (itemIndex !== -1) {
                    items.splice(itemIndex, 1);
                }
                updateTypeOptions();
                renderRows();
            } catch (error) {
                button.disabled = false;
                status.textContent = "Не удалось удалить услугу. Проверьте соединение и попробуйте ещё раз.";
                status.classList.add("is-visible");
                console.error("Не удалось удалить услугу:", error);
            }
        });

        itemForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            itemFormStatus.textContent = "";
            itemFormStatus.classList.remove("is-visible");

            const cost = Number(itemForm.querySelector("#cost").value);
            if (!Number.isFinite(cost)) {
                itemFormStatus.textContent = "Укажите корректную цену.";
                itemFormStatus.classList.add("is-visible");
                return;
            }

            const newItem = {
                type: itemForm.querySelector("#type").value.trim(),
                name: itemForm.querySelector("#name").value.trim(),
                units: itemForm.querySelector("#units").value.trim(),
                cost,
            };
            const submitButton = itemForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;

            try {
                const isEditing = editingItemId !== null;
                const saveResponse = await fetch(
                    `${apiUrl}/items${isEditing ? `/${encodeURIComponent(editingItemId)}` : ""}`,
                    {
                        method: isEditing ? "PATCH" : "POST",
                        credentials: "include",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(newItem),
                    }
                );
                if (!saveResponse.ok) {
                    throw new Error(`HTTP ${saveResponse.status}`);
                }

                const savedItem = await saveResponse.json();
                if (isEditing) {
                    const itemIndex = items.findIndex((item) => String(item.id) === editingItemId);
                    items[itemIndex] = savedItem;
                } else {
                    items.push(savedItem);
                }
                updateTypeOptions();
                typeFilter.value = savedItem.type;
                renderRows();
                itemForm.reset();
                closeModal();
            } catch (error) {
                itemFormStatus.textContent = "Не удалось сохранить услугу. Проверьте соединение и попробуйте ещё раз.";
                itemFormStatus.classList.add("is-visible");
                console.error("Не удалось сохранить услугу:", error);
            } finally {
                submitButton.disabled = false;
            }
        });
    } catch (error) {
        status.textContent = "Не удалось загрузить услуги из API. Проверьте, что JSON-server запущен, и обновите страницу.";
        status.classList.add("is-visible");
        console.error("Не удалось загрузить услуги админки:", error);
    }
};
