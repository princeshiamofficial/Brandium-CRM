import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useAuth } from "./auth-CKa-otva.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Cij7q8iB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Index() {
	const { session, loading } = useAuth();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (loading) return;
		navigate({
			to: session ? "/dashboard" : "/login",
			replace: true
		});
	}, [
		loading,
		session,
		navigate
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-muted/30",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" })
	});
}
//#endregion
export { Index as component };
