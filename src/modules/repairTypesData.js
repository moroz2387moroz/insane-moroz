const repairTypesData = () => {
    const popup = document.querySelector("#popup-repair-types");
    const navigation = popup.querySelector(".nav-list-popup-repair");
    const heading = popup.querySelector("#switch-inner");
    const tableContainer = popup.querySelector(".popup-repair-types-content-table");
    const table = tableContainer.querySelector(".popup-repair-types-content-table__list");
    const tbody = table.querySelector("tbody");
    const previousCategoryButton = popup.querySelector("#nav-arrow-popup-repair_left");
    const nextCategoryButton = popup.querySelector("#nav-arrow-popup-repair_right");
    const categories = new Map();

    const createCell = (className, content) => {
        const cell = document.createElement("td");
        cell.className = className;

        if (content instanceof DocumentFragment) {
            cell.append(content);
        } else {
            cell.textContent = content;
        }

        return cell;
    };

    const createUnitContent = (unit) => {
        const fragment = document.createDocumentFragment();
        if (unit === "м2") {
            fragment.append(document.createTextNode("м"));
            const superscript = document.createElement("sup");
            superscript.textContent = "2";
            fragment.append(superscript);
        } else {
            fragment.append(document.createTextNode(unit));
        }

        return fragment;
    };

    const renderCategory = (category, categoryIndex) => {
        const rows = categories.get(category);
        heading.textContent = category;
        navigation.querySelectorAll(".popup-repair-types-nav__item").forEach((button, index) => {
            const isActive = index === categoryIndex;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
        tbody.replaceChildren(...rows.map((item, index) => {
            const row = document.createElement("tr");
            row.className = `mobile-row${index === 0 ? " showHide" : ""}`;
            row.setAttribute("tabindex", "0");
            row.setAttribute("aria-expanded", String(index === 0));
            row.append(
                createCell("repair-types-name", item.name),
                createCell("mobile-col-title tablet-hide desktop-hide", "Ед.измерения"),
                createCell("mobile-col-title tablet-hide desktop-hide", "Цена за ед."),
                createCell("repair-types-value", createUnitContent(item.units)),
                createCell("repair-types-value", `${item.cost} руб.`)
            );
            return row;
        }));
        tableContainer.scrollTop = 0;
    };

    const showLoadError = (error) => {
        const message = document.createElement("p");
        message.className = "repair-types-data-error";
        message.setAttribute("role", "alert");
        message.textContent = "Не удалось загрузить список услуг и цен. Попробуйте обновить страницу.";
        tableContainer.replaceChildren(message);
        console.error("Не удалось загрузить db/db.json:", error);
    };

    const loadRepairTypes = async () => {
        const response = await fetch("/api/items", {
            headers: { Accept: "application/json" },
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const items = await response.json();
        items.forEach((item) => {
            if (!categories.has(item.type)) {
                categories.set(item.type, []);
            }
            categories.get(item.type).push(item);
        });

        const categoryNames = [...categories.keys()];
        navigation.replaceChildren(...categoryNames.map((category, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = `button_o popup-repair-types-nav__item${index === 0 ? " active" : ""}`;
            button.textContent = category;
            button.setAttribute("aria-pressed", String(index === 0));
            return button;
        }));
        navigation.style.minWidth = "max-content";
        navigation.style.flexWrap = "nowrap";

        navigation.addEventListener("click", (event) => {
            const button = event.target.closest(".popup-repair-types-nav__item");
            if (!button || !navigation.contains(button)) {
                return;
            }

            renderCategory(button.textContent, [...navigation.children].indexOf(button));
            button.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
        });

        const changeCategory = (direction) => {
            const activeIndex = [...navigation.children].findIndex((button) => button.classList.contains("active"));
            const nextIndex = Math.max(0, Math.min(activeIndex + direction, navigation.children.length - 1));
            renderCategory(categoryNames[nextIndex], nextIndex);
            navigation.children[nextIndex].scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
        };

        [previousCategoryButton, nextCategoryButton].forEach((button, index) => {
            button.setAttribute("role", "button");
            button.setAttribute("tabindex", "0");
            button.setAttribute("aria-label", index === 0 ? "Предыдущая категория" : "Следующая категория");
            button.addEventListener("click", () => changeCategory(index === 0 ? -1 : 1));
            button.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    button.click();
                }
            });
        });

        tbody.addEventListener("click", (event) => {
            const row = event.target.closest(".mobile-row");
            if (!row || !tbody.contains(row)) {
                return;
            }

            const isExpanded = !row.classList.contains("showHide");
            tbody.querySelectorAll(".mobile-row").forEach((item) => {
                const itemIsExpanded = item === row && isExpanded;
                item.classList.toggle("showHide", itemIsExpanded);
                item.setAttribute("aria-expanded", String(itemIsExpanded));
            });
        });

        tbody.addEventListener("keydown", (event) => {
            const row = event.target.closest(".mobile-row");
            if (row && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                row.click();
            }
        });

        tableContainer.replaceChildren(table);
        renderCategory(categoryNames[0], 0);
    };

    loadRepairTypes().catch(showLoadError);
};

export default repairTypesData;
