document.addEventListener("click", (event) => {
    const arrow = event.target.closest(".header-contacts__arrow");

    if (!arrow) {
        return;
    }

    const contacts = arrow.closest(".header-contacts");
    const phoneAccordion = contacts.querySelector(".header-contacts__phone-number-accord");
    const isExpanded = arrow.getAttribute("aria-expanded") === "true";

    arrow.setAttribute("aria-expanded", String(!isExpanded));
    arrow.classList.toggle("header-accord-arrow-active", !isExpanded);
    phoneAccordion.classList.toggle("header-accord-active", !isExpanded);
    phoneAccordion.setAttribute("aria-hidden", String(isExpanded));
});
