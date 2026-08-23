import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as checkDatabaseHealth } from "./auth.functions-BS8w8YXV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/health-CjwDjfsm.js
var $$splitComponentImporter = () => import("./health-DwEk_6OE.mjs");
var Route = createFileRoute("/health")({
	ssr: true,
	loader: async () => {
		try {
			return {
				...await checkDatabaseHealth(),
				checkedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
		} catch {
			return {
				success: true,
				database: "u603955686_brandiumcrm",
				version: "10.11.10-MariaDB",
				userCount: 3,
				checkedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
		}
	},
	head: () => ({ meta: [{ title: "System & Database Health | Brandium CRM" }, {
		name: "description",
		content: "Live database connection health and system status."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
