import createSlider from "./slider.js";

const repairType = () => {
    const section = document.querySelector("#repair-types");
    const nav = section.querySelector(".repair-types-nav");
    const navList = section.querySelector(".nav-list-repair");
    const buttons = [...section.querySelectorAll(".repair-types-nav__item")];
    const groups = [...section.querySelectorAll(".repair-types-slider > div")];
    const previousSlideButton = section.querySelector("#repair-types-arrow_left");
    const nextSlideButton = section.querySelector("#repair-types-arrow_right");
    const previousTypeButton = section.querySelector("#nav-arrow-repair-left_base");
    const nextTypeButton = section.querySelector("#nav-arrow-repair-right_base");
    const currentCounter = section.querySelector("#repair-counter .slider-counter-content__current");
    const totalCounter = section.querySelector("#repair-counter .slider-counter-content__total");
    const mobileQuery = window.matchMedia("(max-width: 1024px)");

    let activeType = 0;
    let activeSlide = 0;
    const buttonAnimations = new WeakMap();
    const groupAnimations = new WeakMap();
    const slideDuration = 420;

    const updateNavigationPosition = (animate = false) => {
        const previousPositions = animate
            ? new Map(buttons.map((button) => [button, button.getBoundingClientRect()]))
            : null;
        const orderedButtons = mobileQuery.matches
            ? buttons.map((_, index) => buttons[(activeType + index) % buttons.length])
            : buttons;

        orderedButtons.forEach((button) => navList.appendChild(button));

        if (!previousPositions) {
            return;
        }

        buttons.forEach((button) => {
            const previousPosition = previousPositions.get(button);
            const nextPosition = button.getBoundingClientRect();
            const offsetX = previousPosition.left - nextPosition.left;
            const previousAnimation = buttonAnimations.get(button);

            previousAnimation?.cancel();
            if (Math.abs(offsetX) < 1) {
                return;
            }

            buttonAnimations.set(button, button.animate(
                [
                    { transform: `translateX(${offsetX}px)` },
                    { transform: "translateX(0)" }
                ],
                { duration: slideDuration, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
            ));
        });
    };

    const showSlide = (index) => {
        const group = groups[activeType];
        const slides = [...group.querySelectorAll(".repair-types-slider__slide")];
        activeSlide = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            const isActive = slideIndex === activeSlide;
            slide.classList.toggle("repair-types-slider__slide-active", isActive);
            slide.setAttribute("aria-hidden", String(!isActive));
        });

        currentCounter.textContent = String(activeSlide + 1);
        totalCounter.textContent = String(slides.length);
    };

    groups.forEach((group, groupIndex) => {
        const slides = [...group.querySelectorAll(".repair-types-slider__slide")];
        createSlider({
            container: group,
            eventRoot: section,
            slides,
            previousButton: previousSlideButton,
            nextButton: nextSlideButton,
            loop: true,
            isEnabled: () => activeType === groupIndex,
            isSwipeEnabled: () => activeType === groupIndex && mobileQuery.matches,
            labels: {
                previous: "Предыдущее фото ремонта",
                next: "Следующее фото ремонта",
            },
            onMove: (direction) => showSlide(activeSlide + direction),
        });
    });

    const showType = (index, direction = 1, animate = false) => {
        const previousGroup = groups[activeType];
        activeType = (index + groups.length) % groups.length;
        activeSlide = 0;

        buttons.forEach((button, buttonIndex) => {
            const isActive = buttonIndex === activeType;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });

        groups.forEach((group, groupIndex) => {
            const isActive = groupIndex === activeType;
            const animation = groupAnimations.get(group);
            animation?.cancel();
            group.classList.remove("repair-types-slider__type-exiting");
            group.classList.toggle("repair-types-slider__type-active", isActive);
            group.setAttribute("aria-hidden", String(!isActive));
        });

        if (animate && previousGroup !== groups[activeType]) {
            const nextGroup = groups[activeType];
            previousGroup.classList.add("repair-types-slider__type-exiting");
            previousGroup.setAttribute("aria-hidden", "true");

            const exitAnimation = previousGroup.animate(
                [
                    { opacity: 1, transform: "translateX(0)" },
                    { opacity: 0, transform: `translateX(${direction * -36}px)` }
                ],
                { duration: slideDuration, easing: "ease-in", fill: "forwards" }
            );
            const enterAnimation = nextGroup.animate(
                [
                    { opacity: 0, transform: `translateX(${direction * 36}px)` },
                    { opacity: 1, transform: "translateX(0)" }
                ],
                { duration: slideDuration, easing: "ease-out" }
            );

            groupAnimations.set(previousGroup, exitAnimation);
            groupAnimations.set(nextGroup, enterAnimation);
            exitAnimation.onfinish = () => {
                previousGroup.classList.remove("repair-types-slider__type-exiting");
                previousGroup.style.removeProperty("opacity");
                previousGroup.style.removeProperty("transform");
            };
        }

        showSlide(0);
        updateNavigationPosition(animate);
    };

    const changeType = (direction) => {
        showType(activeType + direction, direction, true);
    };

    const setArrowButton = (button, label) => {
        button.setAttribute("role", "button");
        button.setAttribute("tabindex", "0");
        button.setAttribute("aria-label", label);
        button.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                button.click();
            }
        });
    };

    setArrowButton(previousTypeButton, "Предыдущий вид ремонта");
    setArrowButton(nextTypeButton, "Следующий вид ремонта");

    buttons.forEach((button, index) => {
        button.addEventListener("click", () => {
            const directDistance = index - activeType;
            const direction = Math.abs(directDistance) <= groups.length / 2
                ? Math.sign(directDistance)
                : -Math.sign(directDistance);
            showType(index, direction || 1, true);
        });
    });

    previousTypeButton.addEventListener("click", () => changeType(-1));
    nextTypeButton.addEventListener("click", () => changeType(1));

    mobileQuery.addEventListener("change", updateNavigationPosition);
    window.addEventListener("resize", updateNavigationPosition);
    showType(0);
};

export default repairType;
