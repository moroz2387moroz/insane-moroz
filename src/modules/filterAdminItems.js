import { renderAdminItems, renderAdminItemTypes } from "./renderAdminItems.js";

export const initAdminItemFilter = (items, typeFilter, tableBody) => {
    const render = (selectedType = typeFilter.value) => {
        renderAdminItemTypes(items, typeFilter);
        typeFilter.value = [...typeFilter.options].some((option) => option.value === selectedType)
            ? selectedType
            : "";
        renderAdminItems(items, tableBody, typeFilter.value);
    };

    typeFilter.addEventListener("change", () => render());
    render();

    return render;
};
