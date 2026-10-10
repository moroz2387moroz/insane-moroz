import { AdminItemService } from "./adminItemService.js";
import { initAdminItemForm } from "./adminItemForm.js";
import { initAdminItemFilter } from "./filterAdminItems.js";
import { initAddAdminItem } from "./addAdminItem.js";
import { initEditAdminItem } from "./editAdminItem.js";
import { initRemoveAdminItem } from "./removeAdminItem.js";

export const initAdminTable = async (apiUrl) => {
    const tableBody = document.querySelector("#tbody");
    const typeFilter = document.querySelector("#typeItem");
    const status = document.querySelector("#admin-data-status");
    const service = new AdminItemService(apiUrl);

    try {
        const items = await service.getItems();
        if (!Array.isArray(items)) {
            throw new Error("Ответ API должен содержать массив услуг");
        }

        const refresh = initAdminItemFilter(items, typeFilter, tableBody);
        const itemForm = initAdminItemForm();
        const updateItems = (updatedItem) => {
            const itemIndex = items.findIndex((item) => String(item.id) === String(updatedItem.id));
            if (itemIndex === -1) {
                items.push(updatedItem);
            } else {
                items[itemIndex] = updatedItem;
            }
            refresh(updatedItem.type);
        };
        const removeItem = (itemId) => {
            const itemIndex = items.findIndex((item) => String(item.id) === String(itemId));
            if (itemIndex !== -1) {
                items.splice(itemIndex, 1);
            }
            refresh();
        };

        initAddAdminItem(service, itemForm, updateItems);
        initEditAdminItem(service, tableBody, itemForm, updateItems);
        initRemoveAdminItem(service, tableBody, status, removeItem);
    } catch (error) {
        status.textContent = "Не удалось загрузить услуги из API. Проверьте, что JSON-server запущен, и обновите страницу.";
        status.classList.add("is-visible");
        console.error("Не удалось загрузить услуги админки:", error);
    }
};
