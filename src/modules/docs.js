import createSlider from "./slider.js";

const docs = () => {
    const section = document.querySelector("#transparency");
    const slider = section.querySelector(".transparency-slider");
    const previousButton = section.querySelector("#transparency-arrow_left");
    const nextButton = section.querySelector("#transparency-arrow_right");
    const slides = [...slider.querySelectorAll(".transparency-item")];
    const mobileQuery = window.matchMedia("(max-width: 1090px)");
    const popup = document.querySelector(".popup-transparency");
    const popupSlider = popup.querySelector(".popup-transparency-slider");
    const popupSlides = [...popupSlider.children];
    const popupCounter = popup.querySelector("#transparency-popup-counter");
    const popupCurrent = popupCounter.querySelector(".slider-counter-content__current");
    const popupTotal = popupCounter.querySelector(".slider-counter-content__total");
    const popupPrevious = popup.querySelector("#transparency_left");
    const popupNext = popup.querySelector("#transparency_right");
    let activeIndex = 0;
    let activePopupIndex = 0;
    let lastFocusedDocument = null;

    const updateSlider = (index = activeIndex) => {
        activeIndex = index;
        const isSliderActive = mobileQuery.matches;
        slider.style.transform = isSliderActive ? `translateX(-${activeIndex * 100}%)` : "";

        slides.forEach((slide, index) => {
            slide.setAttribute("aria-hidden", String(isSliderActive && index !== activeIndex));
        });

        [previousButton, nextButton].forEach((button, index) => {
            const isAtEdge = index === 0 ? activeIndex === 0 : activeIndex === slides.length - 1;
            const isHidden = !isSliderActive;
            button.classList.toggle("docs-arrow-hidden", isHidden);
            button.setAttribute("aria-hidden", String(isHidden));
            button.setAttribute("aria-disabled", String(isAtEdge));
            button.tabIndex = isHidden ? -1 : 0;
        });
    };

    const mainSliderController = createSlider({
        container: slider,
        eventRoot: section,
        slides,
        previousButton,
        nextButton,
        isEnabled: () => mobileQuery.matches,
        labels: {
            previous: "Предыдущий документ",
            next: "Следующий документ",
        },
        onChange: updateSlider,
    });

    mobileQuery.addEventListener("change", () => {
        mainSliderController.goTo(0);
        updateSlider(0);
    });

    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-modal", "true");
    popup.setAttribute("aria-hidden", "true");

    popupSlides.forEach((slide, index) => {
        const desktopImage = slide.querySelector("img.mobile-hide");
        const mobileImage = slide.querySelector("img.tablet-hide.desktop-hide");
        const documentTitle = slides[index].querySelector(".transparency-item__title").textContent.trim();

        mobileImage.src = desktopImage.src;
        mobileImage.alt = documentTitle;

        slide.querySelectorAll("img").forEach((image) => {
            image.draggable = false;
        });
    });

    const popupSliderController = createSlider({
        container: popupSlider,
        eventRoot: popup,
        slides: popupSlides,
        previousButton: popupPrevious,
        nextButton: popupNext,
        labels: {
            previous: "Предыдущий документ",
            next: "Следующий документ",
        },
        onChange: (index) => {
            activePopupIndex = index;
            popupSlides.forEach((slide, slideIndex) => {
                const isActive = slideIndex === activePopupIndex;
                slide.classList.toggle("popup-transparency-slider__slide-active", isActive);
                slide.setAttribute("aria-hidden", String(!isActive));
            });

            popupPrevious.setAttribute("aria-disabled", String(activePopupIndex === 0));
            popupNext.setAttribute("aria-disabled", String(activePopupIndex === popupSlides.length - 1));

            popupCurrent.textContent = String(activePopupIndex + 1);
            popupTotal.textContent = String(popupSlides.length);
        },
    });

    const setPopupOpen = (isOpen) => {
        popup.classList.toggle("popup-transparency-active", isOpen);
        popup.setAttribute("aria-hidden", String(!isOpen));

        const anotherPopupIsOpen = Boolean(document.querySelector(
            ".popup-repair-types.popup-repair-types-active, " +
            ".popup-privacy.popup-privacy-active, " +
            ".popup-portfolio.popup-portfolio-active"
        ));
        document.documentElement.classList.toggle("modal-open", isOpen || anotherPopupIsOpen);

        if (isOpen) {
            const closeButton = [...popup.querySelectorAll(".close")]
                .find((button) => button.getClientRects().length > 0);
            (closeButton || popupPrevious).focus();
        } else {
            lastFocusedDocument?.focus();
            lastFocusedDocument = null;
        }
    };

    const movePopup = (direction) => {
        popupSliderController.goTo(activePopupIndex + direction);
    };

    popup.querySelectorAll(".close").forEach((closeButton) => {
        closeButton.setAttribute("role", "button");
        closeButton.setAttribute("tabindex", "0");
        closeButton.setAttribute("aria-label", "Закрыть документы");
        closeButton.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                closeButton.click();
            }
        });
    });

    slides.forEach((slide, index) => {
        const image = slide.querySelector(".transparency-item__img");
        image.setAttribute("role", "button");
        image.setAttribute("tabindex", "0");
        image.setAttribute("aria-label", `Открыть документ: ${slide.querySelector(".transparency-item__title").textContent.trim() || index + 1}`);
    });

    section.addEventListener("click", (event) => {
        if (!(event.target instanceof Element)) {
            return;
        }

        const image = event.target.closest(".transparency-item__img");
        if (!image) {
            return;
        }

        const documentItem = image.closest(".transparency-item");
        const index = slides.indexOf(documentItem);
        if (index < 0 || index >= popupSlides.length) {
            return;
        }

        lastFocusedDocument = image;
        popupSliderController.goTo(index);
        setPopupOpen(true);
    });

    section.addEventListener("keydown", (event) => {
        if (!(event.target instanceof Element) || (event.key !== "Enter" && event.key !== " ")) {
            return;
        }

        if (event.target.closest(".transparency-item__img")) {
            event.preventDefault();
            event.target.click();
        }
    });

    popup.addEventListener("click", (event) => {
        if (event.target === popup || (event.target instanceof Element && event.target.closest(".close"))) {
            setPopupOpen(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (!popup.classList.contains("popup-transparency-active")) {
            return;
        }

        if (event.defaultPrevented) {
            return;
        }

        if (event.key === "Escape") {
            setPopupOpen(false);
        } else if (event.key === "ArrowLeft") {
            movePopup(-1);
        } else if (event.key === "ArrowRight") {
            movePopup(1);
        }
    });

};

export default docs;
