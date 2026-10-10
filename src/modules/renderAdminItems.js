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

export const renderAdminItems = (items, tableBody, selectedType) => {
    const visibleItems = selectedType
        ? items.filter((item) => item.type === selectedType)
        : items;

    tableBody.replaceChildren(...visibleItems.map((item) => {
        const row = document.createElement("tr");
        row.className = "table__row";
        row.dataset.key = item.id;
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

export const renderAdminItemTypes = (items, typeFilter) => {
    const selectedType = typeFilter.value;
    const types = [...new Set(items.map((item) => item.type).filter(Boolean))];
    typeFilter.replaceChildren(new Option("Все услуги", ""));
    types.forEach((type) => typeFilter.add(new Option(type, type)));
    typeFilter.value = types.includes(selectedType) ? selectedType : "";
};
