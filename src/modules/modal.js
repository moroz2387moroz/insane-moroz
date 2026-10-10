const modal = () => {
    const repairTypesPopup = document.querySelector("#popup-repair-types");
    const privacyPopup = document.querySelector("#popup-privacy");
    const consultationPopup = document.querySelector(".popup-consultation");
    const thankPopup = document.querySelector(".popup-thank");
    const thankClose = thankPopup.querySelector(".close-thank");
    let lastFocusedBeforeThank = null;

    const updateScrollLock = () => {
        const hasOpenPopup = document.querySelector(
            ".popup-menu.popup-menu-active, " +
            ".popup-repair-types.popup-repair-types-active, " +
            ".popup-privacy.popup-privacy-active, " +
            ".popup-consultation.popup-consultation-active, " +
            ".popup-portfolio.popup-portfolio-active, " +
            ".popup-transparency.popup-transparency-active, " +
            ".popup-thank.popup-thank-active"
        );
        document.documentElement.classList.toggle("modal-open", Boolean(hasOpenPopup));
    };

    const setThankOpen = (isOpen) => {
        thankPopup.classList.toggle("popup-thank-active", isOpen);
        thankPopup.setAttribute("aria-hidden", String(!isOpen));
        updateScrollLock();

        if (isOpen) {
            lastFocusedBeforeThank = document.activeElement;
            thankClose.focus();
        } else {
            lastFocusedBeforeThank?.focus?.();
            lastFocusedBeforeThank = null;
        }
    };

    const setRepairTypesOpen = (isOpen) => {
        repairTypesPopup.classList.toggle("popup-repair-types-active", isOpen);
        repairTypesPopup.setAttribute("aria-hidden", String(!isOpen));
        updateScrollLock();
    };

    const setPrivacyOpen = (isOpen) => {
        privacyPopup.classList.toggle("popup-privacy-active", isOpen);
        privacyPopup.setAttribute("aria-hidden", String(!isOpen));
        updateScrollLock();
    };

    const setConsultationOpen = (isOpen) => {
        consultationPopup.classList.toggle("popup-consultation-active", isOpen);
        consultationPopup.setAttribute("aria-hidden", String(!isOpen));
        updateScrollLock();

        if (isOpen) {
            consultationClose.focus();
        }
    };

    consultationPopup.setAttribute("role", "dialog");
    consultationPopup.setAttribute("aria-modal", "true");
    consultationPopup.setAttribute("aria-hidden", "true");
    const consultationClose = consultationPopup.querySelector(".close-consultation");
    consultationClose.setAttribute("role", "button");
    consultationClose.setAttribute("tabindex", "0");
    consultationClose.setAttribute("aria-label", "Закрыть окно консультации");
    consultationClose.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            consultationClose.click();
        }
    });

    thankPopup.setAttribute("role", "dialog");
    thankPopup.setAttribute("aria-modal", "true");
    thankPopup.setAttribute("aria-hidden", "true");
    thankClose.setAttribute("role", "button");
    thankClose.setAttribute("tabindex", "0");
    thankClose.setAttribute("aria-label", "Закрыть окно благодарности");
    thankClose.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            thankClose.click();
        }
    });

    document.addEventListener("form:success", () => setThankOpen(true));

    document.addEventListener("click", (event) => {
        const target = event.target;

        if (!(target instanceof Element)) {
            return;
        }

        const consultationTrigger = target.closest("button");
        if (consultationTrigger?.textContent.trim().replace(/\s+/g, " ") === "Проконсультироваться") {
            event.preventDefault();
            setConsultationOpen(true);
            return;
        }

        const trigger = target.closest(".js-open-repair-types");

        if (trigger) {
            event.preventDefault();
            setRepairTypesOpen(true);
            return;
        }

        const privacyTrigger = target.closest(".link-privacy");

        if (privacyTrigger && !privacyPopup.contains(privacyTrigger)) {
            event.preventDefault();
            setPrivacyOpen(true);
            return;
        }

        if (
            repairTypesPopup.contains(target) &&
            (target === repairTypesPopup || target.closest(".close"))
        ) {
            setRepairTypesOpen(false);
        }

        if (
            privacyPopup.contains(target) &&
            (target === privacyPopup || target.closest(".close"))
        ) {
            setPrivacyOpen(false);
        }

        if (
            consultationPopup.contains(target) &&
            (target === consultationPopup || target.closest(".close-consultation"))
        ) {
            setConsultationOpen(false);
        }

        if (
            thankPopup.contains(target) &&
            (target === thankPopup || target.closest(".close-thank"))
        ) {
            setThankOpen(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && repairTypesPopup.classList.contains("popup-repair-types-active")) {
            setRepairTypesOpen(false);
        }
        if (event.key === "Escape" && privacyPopup.classList.contains("popup-privacy-active")) {
            setPrivacyOpen(false);
        }
        if (event.key === "Escape" && consultationPopup.classList.contains("popup-consultation-active")) {
            setConsultationOpen(false);
        }
        if (event.key === "Escape" && thankPopup.classList.contains("popup-thank-active")) {
            setThankOpen(false);
        }
    });
};

export default modal;
