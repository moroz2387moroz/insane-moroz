const validateForms = () => {
    const phoneSelector = 'input[name="phone"]';
    const consultationForm = document.querySelector(".popup-consultation .feedback__form");
    consultationForm.noValidate = true;

    const isPhoneComplete = (input) => {
        let digits = input.value.replace(/\D/g, "");
        if (/^[78]\d{10}$/.test(digits)) {
            digits = digits.slice(1);
        }
        return digits.length === 10;
    };
    const phonePattern = String.raw`\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}`;
    const phoneErrorMessage = "Введите номер телефона полностью: +7 (XXX) XXX-XX-XX.";

    document.querySelectorAll(phoneSelector).forEach((input) => {
        input.required = true;
        input.pattern = phonePattern;
        input.title = phoneErrorMessage;
    });

    const setPhoneError = (input, showError) => {
        const inputWrap = input.closest(".feedback__input");

        let error = inputWrap.querySelector(".phone-error");
        if (showError && !error) {
            error = document.createElement("span");
            error.className = "phone-error";
            error.id = `${input.id}-error`;
            error.setAttribute("role", "alert");
            error.textContent = "Введите корректный номер телефона.";
            inputWrap.append(error);
        } else if (!showError && error) {
            error.remove();
        }

        input.setAttribute("aria-invalid", String(showError));
        if (showError) {
            input.setAttribute("aria-describedby", `${input.id}-error`);
        } else {
            input.removeAttribute("aria-describedby");
        }
    };

    const setConsentError = (consent, showError) => {
        const checkboxContainer = consent.closest(".checkbox");

        let error = checkboxContainer.querySelector(".consent-error");
        if (showError && !error) {
            error = document.createElement("span");
            error.className = "consent-error";
            error.id = `${consent.id}-error`;
            error.setAttribute("role", "alert");
            error.textContent = "Необходимо поставить галочку и согласиться на обработку персональных данных.";
            checkboxContainer.append(error);
        } else if (!showError && error) {
            error.remove();
        }

        consent.setAttribute("aria-invalid", String(showError));
        if (showError) {
            consent.setAttribute("aria-describedby", `${consent.id}-error`);
        } else {
            consent.removeAttribute("aria-describedby");
        }
    };

    const formatPhone = (digits) => {
        let formatted = "+7";

        if (digits.length > 0) {
            formatted += ` (${digits.slice(0, 3)}`;
        }
        if (digits.length >= 3) {
            formatted += ")";
        }
        if (digits.length > 3) {
            formatted += ` ${digits.slice(3, 6)}`;
        }
        if (digits.length > 6) {
            formatted += `-${digits.slice(6, 8)}`;
        }
        if (digits.length > 8) {
            formatted += `-${digits.slice(8, 10)}`;
        }

        return formatted;
    };

    document.addEventListener("focusin", (event) => {
        const input = event.target;

        if (input instanceof HTMLInputElement && input.matches(phoneSelector) && !input.value) {
            input.value = "+7 (";
            input.setSelectionRange(input.value.length, input.value.length);
        }
    });

    document.addEventListener("beforeinput", (event) => {
        const input = event.target;

        if (
            input instanceof HTMLInputElement &&
            input.matches(phoneSelector) &&
            event.data &&
            !/^\d+$/.test(event.data)
        ) {
            event.preventDefault();
        }
    });

    document.addEventListener("input", (event) => {
        const input = event.target;

        if (!(input instanceof HTMLInputElement) || !input.matches(phoneSelector)) {
            return;
        }

        const rawValue = input.value;
        const caret = input.selectionStart ?? rawValue.length;
        const hasCountryPrefix = /^\+7/.test(rawValue);
        const digitsBeforeCaret = rawValue.slice(0, caret).replace(/\D/g, "").length;
        let subscriberDigits = rawValue.replace(/\D/g, "");

        if (
            (hasCountryPrefix && subscriberDigits.startsWith("7")) ||
            /^[78]\d{10}$/.test(subscriberDigits)
        ) {
            subscriberDigits = subscriberDigits.slice(1);
        }

        subscriberDigits = subscriberDigits.slice(0, 10);
        const formatted = subscriberDigits.length ? formatPhone(subscriberDigits) : (rawValue ? "+7 (" : "");
        const subscriberDigitsBeforeCaret = Math.max(0, digitsBeforeCaret - Number(hasCountryPrefix));
        let newCaret = subscriberDigitsBeforeCaret === 0
            ? (subscriberDigits.length ? 4 : formatted.length)
            : formatted.length;
        let digitCount = 0;

        for (let index = 2; index < formatted.length; index += 1) {
            if (/\d/.test(formatted[index])) {
                digitCount += 1;
                if (digitCount === subscriberDigitsBeforeCaret) {
                    newCaret = index + 1;
                    break;
                }
            }
        }

        input.value = formatted;
        input.setSelectionRange(newCaret, newCaret);

        if (input !== consultationForm.querySelector(phoneSelector)) {
            input.setCustomValidity(
                input.value && !isPhoneComplete(input) ? phoneErrorMessage : ""
            );
        }
    });

    document.addEventListener("focusout", (event) => {
        const input = event.target;

        if (
            input instanceof HTMLInputElement &&
            input.matches(phoneSelector) &&
            /^\+7\s*\($/.test(input.value)
        ) {
            input.value = "";
        }
    });

    document.addEventListener("submit", (event) => {
        const form = event.target;

        if (!(form instanceof HTMLFormElement)) {
            return;
        }

        if (form === consultationForm) {
            const phone = form.querySelector(phoneSelector);
            const consent = form.querySelector('input[type="checkbox"]');
            const isPhoneInvalid = !isPhoneComplete(phone);
            const isConsentMissing = !consent.checked;
            setPhoneError(phone, isPhoneInvalid);
            setConsentError(consent, isConsentMissing);

            if (isPhoneInvalid || isConsentMissing) {
                event.preventDefault();
                (isPhoneInvalid ? phone : consent).focus();
                return;
            }

            return;
        }

        const consent = form.querySelector('input[type="checkbox"]');

        if (!consent.checked) {
            event.preventDefault();
            consent.setAttribute("aria-invalid", "true");

            const checkboxContainer = consent.closest(".checkbox");
            let error = checkboxContainer.querySelector(".consent-error");

            if (!error) {
                error = document.createElement("span");
                error.className = "consent-error";
                error.id = `${consent.id}-error`;
                error.setAttribute("role", "alert");
                error.textContent = "Необходимо согласие на обработку персональных данных.";
                checkboxContainer.append(error);
            }

            consent.setAttribute("aria-describedby", error.id);
        }
    });

    document.addEventListener("change", (event) => {
        const consent = event.target;

        if (
            !(consent instanceof HTMLInputElement) ||
            consent.type !== "checkbox" ||
            !consent.checked
        ) {
            return;
        }

        if (consent.form === consultationForm) {
            setConsentError(consent, false);
            return;
        }

        consent.removeAttribute("aria-invalid");
        consent.removeAttribute("aria-describedby");
        consent.closest(".checkbox").querySelector(".consent-error")?.remove();
    });

    document.addEventListener("input", (event) => {
        const phone = event.target;
        if (!(phone instanceof HTMLInputElement) || !phone.matches(phoneSelector)) {
            return;
        }

        const isComplete = isPhoneComplete(phone);
        if (phone.form === consultationForm) {
            if (phone.getAttribute("aria-invalid") === "true" && isComplete) {
                setPhoneError(phone, false);
            }
            return;
        }

        phone.setCustomValidity(phone.value && !isComplete ? phoneErrorMessage : "");
    });
};

export default validateForms;
