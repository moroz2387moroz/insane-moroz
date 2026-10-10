const tooltip = () => {
    const formula = document.querySelector("#formula");
    const iconSelector = ".formula-item__icon";

    const setTooltipState = (icon, isActive) => {
        const item = icon.closest(".formula-item");
        const popup = icon.querySelector(".formula-item-popup");

        item.classList.toggle("active-item", isActive);

        if (!isActive) {
            popup.classList.remove("formula-item-popup-below");
            return;
        }

        const shouldShowBelow = popup.getBoundingClientRect().top < 0;
        popup.classList.toggle("formula-item-popup-below", shouldShowBelow);
    };

    formula.querySelectorAll(iconSelector).forEach((icon, index) => {
        const popup = icon.querySelector(".formula-item-popup");

        popup.id = `formula-tooltip-${index + 1}`;
        icon.setAttribute("tabindex", "0");
        icon.setAttribute("aria-describedby", popup.id);
    });

    formula.addEventListener("pointerover", (event) => {
        const icon = event.target.closest(iconSelector);

        if (icon && !icon.contains(event.relatedTarget)) {
            setTooltipState(icon, true);
        }
    });

    formula.addEventListener("pointerout", (event) => {
        const icon = event.target.closest(iconSelector);

        if (icon && !icon.contains(event.relatedTarget)) {
            setTooltipState(icon, false);
        }
    });

    formula.addEventListener("focusin", (event) => {
        const icon = event.target.closest(iconSelector);

        if (icon) {
            setTooltipState(icon, true);
        }
    });

    formula.addEventListener("focusout", (event) => {
        const icon = event.target.closest(iconSelector);

        if (icon && !icon.contains(event.relatedTarget)) {
            setTooltipState(icon, false);
        }
    });
};

export default tooltip;
