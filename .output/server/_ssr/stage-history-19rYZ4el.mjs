import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as stringType, i as objectType, n as coerce } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stage-history-19rYZ4el.js
var $$splitComponentImporter = () => import("./stage-history-mFj_KB8r.mjs");
var stageHistorySearchSchema = objectType({
	page: coerce.number().int().min(1).catch(1),
	search: stringType().optional(),
	agent: stringType().optional(),
	from: stringType().optional(),
	to: stringType().optional()
});
var Route = createFileRoute("/_authenticated/admin/stage-history")({
	validateSearch: (search) => stageHistorySearchSchema.parse(search),
	head: () => ({ meta: [
		{ title: "Stage History | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Audit trail of pipeline stage changes."
		},
		{
			property: "og:title",
			content: "Stage History | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Audit trail of pipeline stage changes."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
