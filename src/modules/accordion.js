const accordion = () => {
    const accordion = document.querySelector("#faq .accordion");
    const questions = [...accordion.querySelectorAll(".title_block")];

    const panels = questions.map((question, index) => {
        const panel = question.nextElementSibling;

        const questionId = `faq-question-${index + 1}`;
        const panelId = `faq-answer-${index + 1}`;
        question.id = questionId;
        panel.id = panelId;
        question.setAttribute("role", "button");
        question.setAttribute("tabindex", "0");
        question.setAttribute("aria-controls", panelId);
        panel.setAttribute("role", "region");
        panel.setAttribute("aria-labelledby", questionId);

        return panel;
    });

    const setExpanded = (question, panel, expanded) => {
        question.classList.toggle("msg-active", expanded);
        question.setAttribute("aria-expanded", String(expanded));
        panel.setAttribute("aria-hidden", String(!expanded));
        panel.inert = !expanded;
    };

    questions.forEach((question, index) => {
        setExpanded(question, panels[index], question.classList.contains("msg-active"));
    });

    accordion.addEventListener("click", (event) => {
        const question = event.target.closest(".title_block");
        if (!question || !accordion.contains(question)) {
            return;
        }

        const index = questions.indexOf(question);
        const panel = panels[index];
        const shouldExpand = question.getAttribute("aria-expanded") !== "true";
        questions.forEach((item, itemIndex) => {
            setExpanded(item, panels[itemIndex], item === question && shouldExpand);
        });
    });

    accordion.addEventListener("keydown", (event) => {
        const question = event.target.closest(".title_block");
        if (!question || !accordion.contains(question)) {
            return;
        }

        const index = questions.indexOf(question);
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            question.click();
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
            event.preventDefault();
            const direction = event.key === "ArrowUp" ? -1 : 1;
            const nextIndex = event.key === "Home"
                ? 0
                : event.key === "End"
                    ? questions.length - 1
                    : (index + direction + questions.length) % questions.length;
            questions[nextIndex].focus();
        }
    });
};

export default accordion;
