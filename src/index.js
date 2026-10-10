import openContacts from "./modules/openContacts.js";
import openMenu from "./modules/openMenu.js";
import modal from "./modules/modal.js";
import validateForms from "./modules/validateForms.js";
import sendForm from "./modules/sendForm.js";
import tooltip from "./modules/tooltip.js";
import formulaSlider from "./modules/formulaSlider.js";
import repairType from "./modules/repairType.js";
import portfolio from "./modules/portfolio.js";
import docs from "./modules/docs.js";
import feedback from "./modules/feedback.js";
import accordion from "./modules/accordion.js";
import repairTypesData from "./modules/repairTypesData.js";

openContacts();
openMenu();
modal();
validateForms();
sendForm([
    { formId: "feedback1" },
    { formId: "feedback2" },
    { formId: "feedback3" },
    { formId: "feedback4" },
    { formId: "feedback5" },
    { formId: "feedback6" },
]);
tooltip();
formulaSlider();
repairType();
portfolio();
docs();
feedback();
accordion();
repairTypesData();
