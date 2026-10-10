import createSlider from "./slider.js";

const feedback = () => {
    const section = document.querySelector("#reviews");
    const slider = section.querySelector(".reviews-slider");
    const previousButton = section.querySelector("#reviews-arrow_left");
    const nextButton = section.querySelector("#reviews-arrow_right");
    const dots = [...section.querySelectorAll(".slider-dots-reviews .dot-reviews")];
    const slides = [...slider.querySelectorAll(".reviews-slider__slide")];

    createSlider({
        container: slider,
        eventRoot: section,
        slides,
        previousButton,
        nextButton,
        dots,
        loop: true,
        labels: {
            previous: "Предыдущий отзыв",
            next: "Следующий отзыв",
            dot: (index) => `Показать отзыв ${index + 1}`,
        },
        onChange: (activeIndex) => {
            slides.forEach((slide, index) => {
                const isActive = index === activeIndex;
                slide.style.setProperty("--review-slide-offset", String(index - activeIndex));
                slide.setAttribute("aria-hidden", String(!isActive));
                slide.inert = !isActive;
            });
        },
    });
};

export default feedback;
