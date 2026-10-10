const openMenu = () => {
    const menuToggle = document.querySelector(".menu__toggle");
    const menuPopup = document.querySelector("#popup-menu");

    const setMenuOpen = (isOpen) => {
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
        menuPopup.classList.toggle("popup-menu-active", isOpen);
        menuPopup.setAttribute("aria-hidden", String(!isOpen));
    };

    menuToggle.addEventListener("click", () => {
        setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
    });

    menuPopup.addEventListener("click", (event) => {
        if (event.target === menuPopup || event.target.closest(".close-menu, .menu-link")) {
            setMenuOpen(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
            setMenuOpen(false);
            menuToggle.focus();
        }
    });
};

export default openMenu;
