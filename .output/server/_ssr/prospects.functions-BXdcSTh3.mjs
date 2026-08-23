import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createSsrRpc } from "./createSsrRpc-DthKYKwL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prospects.functions-BXdcSTh3.js
/**
* Server Function: Saves or inserts a prospect directly into local MySQL database `brandium_crm.prospects`.
*/
var saveMySQLProspect = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("634bb8fcfc2d3747cbf5b5bd2c42247db01d232a6968b19d1c461e5f46d73e7f"));
/**
* Server Function: Fetches all prospects from local MySQL database `brandium_crm.prospects`.
*/
var fetchMySQLProspects = createServerFn({ method: "GET" }).handler(createSsrRpc("989c390de9f9607f6445baeb29b776b2e8bb972a3df6baff55423f8858aec19d"));
createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("fb9036294f37134c9830ee41c58d2c863463a220c74f65630b75aba35acbbae7"));
/**
* Server Function: Soft-deletes (marks is_active=0) a prospect in MySQL `brandium_crm.prospects`.
*/
var deleteMySQLProspect = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("192174d2f49f4de7b0ddb1fb2bbd65926d6c11d7b4101b2414c64bc0a9f2455c"));
createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("de5f7fbc5103c068b3c443600a30f286a455a708c437a5e475edf3361b9ec6b8"));
//#endregion
export { fetchMySQLProspects as n, saveMySQLProspect as r, deleteMySQLProspect as t };
