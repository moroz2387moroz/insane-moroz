import createSlider from "./slider.js";

const portfolio = () => {
    const section = document.querySelector("#portfolio");
    const desktopSlider = section.querySelector(".portfolio-slider");
    const mobileSlider = section.querySelector(".portfolio-slider-mobile");
    const counter = section.querySelector("#portfolio-counter");
    const currentCounter = counter.querySelector(".slider-counter-content__current");
    const totalCounter = counter.querySelector(".slider-counter-content__total");
    const desktopPrevious = section.querySelector("#portfolio-arrow_left");
    const desktopNext = section.querySelector("#portfolio-arrow_right");
    const mobilePrevious = section.querySelector("#portfolio-arrow-mobile_left");
    const mobileNext = section.querySelector("#portfolio-arrow-mobile_right");
    const popup = document.querySelector(".popup-portfolio");
    const popupSlider = popup.querySelector(".popup-portfolio-slider");
    const popupSlides = [...popupSlider.children];
    const popupTexts = [...popup.querySelectorAll(".popup-portfolio-text")];
    const popupCounter = popup.querySelector("#popup-portfolio-counter");
    const popupCurrentCounter = popupCounter.querySelector(".slider-counter-content__current");
    const popupTotalCounter = popupCounter.querySelector(".slider-counter-content__total");
    const popupPrevious = popup.querySelector("#popup_portfolio_left");
    const popupNext = popup.querySelector("#popup_portfolio_right");
    const mobileQuery = window.matchMedia("(max-width: 575px)");
    const endScrollTolerance = 32;
    let activePopupSlide = 0;
    let lastFocusedFrame = null;

    const getActiveSlider = () => {
        const isMobile = mobileQuery.matches;
        const slider = isMobile ? mobileSlider : desktopSlider;
        const slides = [...slider.children];
        const previousButton = isMobile ? mobilePrevious : desktopPrevious;
        const nextButton = isMobile ? mobileNext : desktopNext;
        return { slider, slides, previousButton, nextButton };
    };

    const updateControls = () => {
        const { slider, slides, previousButton, nextButton } = getActiveSlider();
        const isMobile = mobileQuery.matches;
        const inactiveButtons = isMobile
            ? [desktopPrevious, desktopNext]
            : [mobilePrevious, mobileNext];
        const maxScroll = Math.max(0, slider.scrollWidth - slider.clientWidth);
        const scrollLeft = slider.scrollLeft;
        const isAtStart = scrollLeft <= 1;
        const isAtEnd = maxScroll - scrollLeft <= endScrollTolerance;
        const currentIndex = slides.reduce((index, slide, slideIndex) => (
            slide.offsetLeft <= scrollLeft + 2 ? slideIndex : index
        ), 0);

        previousButton.classList.toggle("portfolio-arrow-hidden", isAtStart);
        nextButton.classList.toggle("portfolio-arrow-hidden", isAtEnd);
        previousButton.setAttribute("aria-hidden", String(isAtStart));
        nextButton.setAttribute("aria-hidden", String(isAtEnd));
        previousButton.setAttribute("aria-disabled", String(isAtStart));
        nextButton.setAttribute("aria-disabled", String(isAtEnd));
        inactiveButtons.forEach((button) => button.classList.remove("portfolio-arrow-hidden"));

        currentCounter.textContent = String(currentIndex + 1);
        totalCounter.textContent = String(slides.length);
    };

    const move = (direction) => {
        const { slider, slides } = getActiveSlider();
        const maxScroll = Math.max(0, slider.scrollWidth - slider.clientWidth);
        const scrollLeft = slider.scrollLeft;
        const positions = [...new Set([
            ...slides.map((slide) => slide.offsetLeft),
            maxScroll
        ])]
            .filter((position) => position >= 0 && position <= maxScroll)
            .sort((first, second) => first - second);
        const lastPosition = positions.at(-1);
        const previousPosition = positions.at(-2);

        if (
            lastPosition === maxScroll &&
            previousPosition !== undefined &&
            maxScroll - previousPosition <= endScrollTolerance
        ) {
            positions.pop();
        }

        const target = direction > 0
            ? positions.find((position) => position > scrollLeft + 2)
            : positions.filter((position) => position < scrollLeft - 2).pop();

        if (target === undefined) {
            return;
        }

        const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
        slider.scrollTo({ left: target, behavior });
        if (behavior === "instant") {
            updateControls();
        }
    };

    [desktopSlider, mobileSlider].forEach((slider, index) => {
        createSlider({
            container: slider,
            eventRoot: section,
            slides: [...slider.children],
            previousButton: index === 0 ? desktopPrevious : mobilePrevious,
            nextButton: index === 0 ? desktopNext : mobileNext,
            isEnabled: () => getActiveSlider().slider === slider,
            isSwipeEnabled: () => false,
            labels: {
                previous: "Предыдущий слайд портфолио",
                next: "Следующий слайд портфолио",
            },
            onMove: move,
        });
    });

    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-modal", "true");
    popup.setAttribute("aria-hidden", "true");

    const popupController = createSlider({
        container: popupSlider,
        eventRoot: popup,
        slides: popupSlides,
        previousButton: popupPrevious,
        nextButton: popupNext,
        labels: {
            previous: "Предыдущая работа",
            next: "Следующая работа",
        },
        onChange: (index) => {
            activePopupSlide = index;
            popupSlides.forEach((slide, slideIndex) => {
                const isActive = slideIndex === activePopupSlide;
                slide.classList.toggle("popup-portfolio-slider__slide-active", isActive);
                slide.setAttribute("aria-hidden", String(!isActive));
            });

            popupTexts.forEach((text, textIndex) => {
                const isActive = textIndex === activePopupSlide;
                text.classList.toggle("popup-portfolio-text-active", isActive);
                text.setAttribute("aria-hidden", String(!isActive));
            });

            popupPrevious.classList.toggle("portfolio-arrow-hidden", activePopupSlide === 0);
            popupNext.classList.toggle("portfolio-arrow-hidden", activePopupSlide === popupSlides.length - 1);
            popupPrevious.setAttribute("aria-hidden", String(activePopupSlide === 0));
            popupNext.setAttribute("aria-hidden", String(activePopupSlide === popupSlides.length - 1));
            popupPrevious.setAttribute("aria-disabled", String(activePopupSlide === 0));
            popupNext.setAttribute("aria-disabled", String(activePopupSlide === popupSlides.length - 1));

            popupCurrentCounter.textContent = String(activePopupSlide + 1);
            popupTotalCounter.textContent = String(popupSlides.length);
        },
    });

    const setPopupOpen = (isOpen) => {
        popup.classList.toggle("popup-portfolio-active", isOpen);
        popup.setAttribute("aria-hidden", String(!isOpen));
        const anotherPopupIsOpen = Boolean(document.querySelector(
            ".popup-repair-types.popup-repair-types-active, .popup-privacy.popup-privacy-active"
        ));
        document.documentElement.classList.toggle("modal-open", isOpen || anotherPopupIsOpen);

        if (isOpen) {
            const closeButton = [...popup.querySelectorAll(".close")]
                .find((button) => button.getClientRects().length > 0);
            (closeButton || popupPrevious).focus();
        } else {
            lastFocusedFrame?.focus();
            lastFocusedFrame = null;
        }
    };

    const movePopup = (direction) => {
        popupController.goTo(activePopupSlide + direction);
    };

    popup.querySelectorAll(".close").forEach((closeButton) => {
        closeButton.setAttribute("role", "button");
        closeButton.setAttribute("tabindex", "0");
        closeButton.setAttribute("aria-label", "Закрыть портфолио");
        closeButton.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                closeButton.click();
            }
        });
    });

    section.addEventListener("click", (event) => {
        if (!(event.target instanceof Element)) {
            return;
        }

        const frame = event.target.closest(".portfolio-slider__slide-frame");
        if (!frame) {
            return;
        }

        const { slider } = getActiveSlider();
        const frames = [...slider.querySelectorAll(".portfolio-slider__slide-frame")];
        const selectedIndex = frames.indexOf(frame);

        if (selectedIndex < 0 || selectedIndex >= popupSlides.length) {
            return;
        }

        lastFocusedFrame = frame;
        popupController.goTo(selectedIndex);
        setPopupOpen(true);
    });

    section.querySelectorAll(".portfolio-slider__slide-frame").forEach((frame, index) => {
        frame.setAttribute("role", "button");
        frame.setAttribute("tabindex", "0");
        frame.setAttribute("aria-label", `Открыть работу портфолио ${index % popupSlides.length + 1}`);
    });

    section.addEventListener("keydown", (event) => {
        if (!(event.target instanceof Element) || (event.key !== "Enter" && event.key !== " ")) {
            return;
        }

        const frame = event.target.closest(".portfolio-slider__slide-frame");
        if (frame) {
            event.preventDefault();
            frame.click();
        }
    });

    popup.addEventListener("click", (event) => {
        if (event.target === popup || (event.target instanceof Element && event.target.closest(".close"))) {
            setPopupOpen(false);
        }
    });

    popup.addEventListener("keydown", (event) => {
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

    [desktopSlider, mobileSlider].forEach((slider) => {
        slider.addEventListener("scroll", updateControls);
    });

    const resetSliders = () => {
        desktopSlider.scrollTo({ left: 0, behavior: "instant" });
        mobileSlider.scrollTo({ left: 0, behavior: "instant" });
        updateControls();
    };

    const handleResize = () => {
        window.setTimeout(resetSliders, 0);
    };

    mobileQuery.addEventListener("change", resetSliders);
    window.addEventListener("resize", handleResize);
    updateControls();
};

export default portfolio;
