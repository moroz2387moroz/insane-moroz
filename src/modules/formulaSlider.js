const formulaSlider = () => {
    const sliderWrap = document.querySelector(".formula-slider-wrap");
    const slider = sliderWrap.querySelector(".formula-slider");
    const slides = [...slider.querySelectorAll(".formula-slider__slide")];
    const previousButton = sliderWrap.querySelector("#formula-arrow_left");
    const nextButton = sliderWrap.querySelector("#formula-arrow_right");
    const mobileQuery = window.matchMedia("(max-width: 1024px)");
    let activeIndex = 1;
    let pointerStartY = null;
    let isVertical = null;
    const slideAnimations = new WeakMap();

    const updateSlides = (animate = false) => {
        if (!isVertical) {
            return;
        }

        const previousPositions = animate
            ? new Map(slides.map((slide) => [slide, slide.getBoundingClientRect()]))
            : null;

        const orderedSlides = slides.map((slide, index) => {
            const offset = (index - activeIndex + slides.length) % slides.length;
            const isActive = offset === 0;
            const visualPosition = offset === slides.length - 1 ? 0 : offset + 1;

            return { slide, isActive, visualPosition };
        });

        orderedSlides
            .sort((first, second) => first.visualPosition - second.visualPosition)
            .forEach(({ slide, isActive }) => {
                slider.appendChild(slide);
                slide.classList.toggle("formula-slider__slide-active", isActive);
                slide.setAttribute("aria-hidden", "false");
                slide.querySelector(".formula-item__icon").tabIndex = isActive ? 0 : -1;
            });

        if (!animate || !previousPositions) {
            return;
        }

        const rowHeight = Math.max(...slides.map((slide) => slide.getBoundingClientRect().height));
        slides.forEach((slide) => {
            const previousPosition = previousPositions.get(slide);
            const nextPosition = slide.getBoundingClientRect();
            const offsetY = previousPosition.top - nextPosition.top;
            const previousAnimation = slideAnimations.get(slide);

            if (previousAnimation) {
                previousAnimation.cancel();
            }

            if (Math.abs(offsetY) < 1) {
                return;
            }

            if (Math.abs(offsetY) > rowHeight * 1.5) {
                const opacity = getComputedStyle(slide).opacity;
                slideAnimations.set(slide, slide.animate(
                    [{ opacity: 0 }, { opacity }],
                    { duration: 180, delay: 420, easing: "ease-out", fill: "backwards" }
                ));
                return;
            }

            slideAnimations.set(slide, slide.animate(
                [
                    { transform: `translateY(${offsetY}px)` },
                    { transform: "translateY(0)" }
                ],
                { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
            ));
        });
    };

    const changeSlide = (direction) => {
        if (!isVertical) {
            return;
        }

        activeIndex = (activeIndex + direction + slides.length) % slides.length;
        updateSlides(true);
    };

    const setVerticalMode = () => {
        isVertical = mobileQuery.matches;
        sliderWrap.classList.toggle("formula-slider-vertical", isVertical);

        [previousButton, nextButton].forEach((button, index) => {
            if (isVertical) {
                button.setAttribute("role", "button");
                button.setAttribute("tabindex", "0");
                button.setAttribute("aria-label", index === 0 ? "Предыдущий слайд" : "Следующий слайд");
                return;
            }

            button.removeAttribute("role");
            button.removeAttribute("tabindex");
            button.removeAttribute("aria-label");
        });

        if (isVertical) {
            updateSlides();
            return;
        }

        slides.forEach((slide) => {
            slide.classList.remove("formula-slider__slide-active");
            slide.removeAttribute("aria-hidden");
            slide.querySelector(".formula-item__icon").removeAttribute("tabindex");
            const animation = slideAnimations.get(slide);
            if (animation) {
                animation.cancel();
                slideAnimations.delete(slide);
            }
            slider.appendChild(slide);
        });
    };

    const handleArrowKey = (event, direction) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            changeSlide(direction);
        }
    };

    previousButton.addEventListener("click", () => changeSlide(-1));
    nextButton.addEventListener("click", () => changeSlide(1));
    previousButton.addEventListener("keydown", (event) => handleArrowKey(event, -1));
    nextButton.addEventListener("keydown", (event) => handleArrowKey(event, 1));

    slider.addEventListener("keydown", (event) => {
        if (!isVertical) {
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            changeSlide(-1);
        } else if (event.key === "ArrowDown") {
            event.preventDefault();
            changeSlide(1);
        }
    });

    slider.addEventListener("pointerdown", (event) => {
        if (!isVertical) {
            return;
        }

        pointerStartY = event.clientY;
        slider.setPointerCapture(event.pointerId);
    });

    slider.addEventListener("pointerup", (event) => {
        if (pointerStartY === null) {
            return;
        }

        const distance = event.clientY - pointerStartY;
        pointerStartY = null;

        if (Math.abs(distance) >= 40) {
            changeSlide(distance > 0 ? -1 : 1);
        }
    });

    slider.addEventListener("pointercancel", () => {
        pointerStartY = null;
    });

    mobileQuery.addEventListener("change", setVerticalMode);
    window.addEventListener("resize", setVerticalMode);
    setVerticalMode();
};

export default formulaSlider;
