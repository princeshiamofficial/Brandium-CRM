import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as prospectFiltersSchema } from "./prospects-yfdOvavi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prospects-pn4bqfnN.js
var $$splitComponentImporter = () => import("./prospects-talcUyaI.mjs");
var Route = createFileRoute("/_authenticated/prospects")({
	validateSearch: prospectFiltersSchema,
	head: () => ({ meta: [
		{ title: "Prospects | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Manage and qualify your sales leads."
		},
		{
			property: "og:title",
			content: "Prospects | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Manage and qualify your sales leads."
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
