const openContacts = () => {
    const arrow = document.querySelector(".header-contacts__arrow");

    arrow.addEventListener("click", () => {
        const contacts = arrow.closest(".header-contacts");
        const phoneAccordion = contacts.querySelector("#header-secondary-phone");
        const isExpanded = arrow.getAttribute("aria-expanded") !== "true";

        arrow.setAttribute("aria-expanded", String(isExpanded));
        arrow.classList.toggle("header-accord-arrow-active", isExpanded);
        phoneAccordion.classList.toggle("header-accord-active", isExpanded);
        phoneAccordion.setAttribute("aria-hidden", String(!isExpanded));
    });
};

export default openContacts;
