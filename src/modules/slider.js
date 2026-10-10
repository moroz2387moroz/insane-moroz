const createSlider = ({
    container,
    eventRoot = container,
    slides,
    previousButton,
    nextButton,
    dots = [],
    initialIndex = 0,
    loop = false,
    axis = "x",
    threshold = 40,
    isEnabled = () => true,
    activeDotClass = "dot_active",
    labels = {},
    onMove,
    isSwipeEnabled = isEnabled,
    onChange = () => {},
}) => {
    let activeIndex = Math.max(0, Math.min(initialIndex, slides.length - 1));
    let pointerStart = null;

    const getIndex = (index) => loop
        ? (index + slides.length) % slides.length
        : Math.max(0, Math.min(index, slides.length - 1));

    const goTo = (index) => {
        const nextIndex = getIndex(index);
        if (nextIndex === activeIndex) {
            return;
        }

        const previousIndex = activeIndex;
        activeIndex = nextIndex;
        onChange(activeIndex, previousIndex);
        updateDots();
    };

    const move = (direction) => {
        if (!isEnabled()) {
            return;
        }

        if (onMove) {
            onMove(direction);
        } else {
            goTo(activeIndex + direction);
        }
    };

    const updateDots = () => {
        dots.forEach((dot, index) => {
            const isActive = index === activeIndex;
            dot.classList.toggle(activeDotClass, isActive);
            dot.setAttribute("aria-current", String(isActive));
        });
    };

    const controls = new Map();
    if (previousButton instanceof HTMLButtonElement) {
        previousButton.type = "button";
    } else {
        previousButton.removeAttribute("disabled");
    }
    previousButton.setAttribute("role", "button");
    previousButton.setAttribute("tabindex", "0");
    previousButton.setAttribute("aria-label", labels.previous || "Предыдущий слайд");
    controls.set(previousButton, -1);

    if (nextButton instanceof HTMLButtonElement) {
        nextButton.type = "button";
    } else {
        nextButton.removeAttribute("disabled");
    }
    nextButton.setAttribute("role", "button");
    nextButton.setAttribute("tabindex", "0");
    nextButton.setAttribute("aria-label", labels.next || "Следующий слайд");
    controls.set(nextButton, 1);
    dots.forEach((dot, index) => {
        if (dot instanceof HTMLButtonElement) dot.type = "button";
        dot.setAttribute("role", "button");
        dot.setAttribute("tabindex", "0");
        dot.setAttribute("aria-label", labels.dot?.(index) || `Показать слайд ${index + 1}`);
    });

    eventRoot.addEventListener("click", (event) => {
        if (!(event.target instanceof Element)) {
            return;
        }

        const control = event.target.closest('[role="button"]');
        if (!control || !eventRoot.contains(control)) {
            return;
        }

        if (controls.has(control)) {
            move(controls.get(control));
            return;
        }

        const dotIndex = dots.indexOf(control);
        if (dotIndex !== -1 && isEnabled()) {
            goTo(dotIndex);
        }
    });

    eventRoot.addEventListener("keydown", (event) => {
        if (!(event.target instanceof Element)) {
            return;
        }

        const control = event.target.closest('[role="button"]');
        const isSliderControl = controls.has(control) || dots.includes(control);
        if (
            control &&
            isSliderControl &&
            eventRoot.contains(control) &&
            (event.key === "Enter" || event.key === " ")
        ) {
            if (control instanceof HTMLButtonElement) {
                return;
            }

            event.preventDefault();
            control.click();
            return;
        }

        if (!container.contains(event.target) || !isEnabled()) {
            return;
        }

        const previousKey = axis === "y" ? "ArrowUp" : "ArrowLeft";
        const nextKey = axis === "y" ? "ArrowDown" : "ArrowRight";
        if (event.key === previousKey) {
            event.preventDefault();
            move(-1);
        } else if (event.key === nextKey) {
            event.preventDefault();
            move(1);
        }
    });

    container.addEventListener("pointerdown", (event) => {
        if (isSwipeEnabled()) {
            pointerStart = axis === "y" ? event.clientY : event.clientX;
        }
    });

    container.addEventListener("pointerup", (event) => {
        if (pointerStart === null) {
            return;
        }

        const pointerEnd = axis === "y" ? event.clientY : event.clientX;
        const distance = pointerEnd - pointerStart;
        pointerStart = null;

        if (Math.abs(distance) >= threshold) {
            move(distance < 0 ? 1 : -1);
        }
    });

    container.addEventListener("pointercancel", () => {
        pointerStart = null;
    });

    updateDots();
    onChange(activeIndex, activeIndex);

    return {
        goTo,
        getIndex: () => activeIndex,
    };
};

export default createSlider;
