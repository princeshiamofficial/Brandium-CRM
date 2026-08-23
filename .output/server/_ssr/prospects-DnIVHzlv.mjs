import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as prospectFiltersSchema } from "./prospects-BReyl5S3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prospects-DnIVHzlv.js
var $$splitComponentImporter = () => import("./prospects-BwQeYv8H.mjs");
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
