import { guardAdminTable, initAdminLogin } from "./modules/adminAuth.js";
import { initAdminTable } from "./modules/adminTable.js";

const apiUrl = "/api";

if (window.location.pathname.endsWith("/table.html")) {
    guardAdminTable(apiUrl, () => initAdminTable(apiUrl));
} else {
    initAdminLogin(apiUrl);
}
