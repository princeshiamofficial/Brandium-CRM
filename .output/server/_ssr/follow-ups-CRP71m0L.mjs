import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as followUpFiltersSchema } from "./follow-ups-fuC15oQ0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/follow-ups-CRP71m0L.js
var $$splitComponentImporter = () => import("./follow-ups-DdrQ2KQs.mjs");
var Route = createFileRoute("/_authenticated/follow-ups")({
	validateSearch: followUpFiltersSchema,
	head: () => ({ meta: [
		{ title: "Follow Ups | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Track pending, completed, cancelled, and overdue follow-up calls across your telesales pipeline."
		},
		{
			property: "og:title",
			content: "Follow Ups | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Track pending, completed, cancelled, and overdue follow-up calls across your telesales pipeline."
		},
		{
			property: "og:type",
			content: "website"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
