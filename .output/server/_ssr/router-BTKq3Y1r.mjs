import { o as __toESM } from "../_runtime.mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { i as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { n as bootstrapDatabaseOnStartup } from "./auth.functions-D-ttI9sF.mjs";
import { t as AuthProvider } from "./auth-CgRTR6JY.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { a as stringType, i as objectType, n as coerce, t as booleanType } from "../_libs/zod.mjs";
import { n as Route$22 } from "./backup-D_7uSB5E.mjs";
import { t as Route$23 } from "./follow-ups-dBF7Pjdd.mjs";
import { r as Route$24 } from "./opportunities-BNPMqjF6.mjs";
import { t as Route$25 } from "./prospects-pn4bqfnN.mjs";
import { t as Route$26 } from "./stage-history-Chm8Hno2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BTKq3Y1r.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
var styles_default = "/assets/styles-nLld9WeJ.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$21 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Brandium Telesales CRM" },
			{
				name: "description",
				content: "Telesales CRM for prospects, opportunities, follow-ups and billing."
			},
			{
				name: "author",
				content: "Brandium"
			},
			{
				property: "og:title",
				content: "Brandium Telesales CRM"
			},
			{
				property: "og:description",
				content: "Telesales CRM for prospects, opportunities, follow-ups and billing."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@Brandium"
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}, {
			rel: "icon",
			href: "/favicon.ico",
			type: "image/x-icon"
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			suppressHydrationWarning: true,
			children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})]
		})]
	});
}
function RootComponent() {
	const { queryClient } = Route$21.useRouteContext();
	(0, import_react.useEffect)(() => {
		bootstrapDatabaseOnStartup();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {})] })
	});
}
var $$splitComponentImporter$20 = () => import("./routes-DthtgIcL.mjs");
var Route$20 = createFileRoute("/")({
	ssr: false,
	head: () => ({ meta: [
		{ title: "Brandium Telesales CRM" },
		{
			name: "description",
			content: "Telesales CRM for prospects, opportunities, follow-ups and billing."
		},
		{
			property: "og:title",
			content: "Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Telesales CRM for prospects, opportunities, follow-ups and billing."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./route-CViodT7b.mjs");
var Route$19 = createFileRoute("/_authenticated")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var $$splitComponentImporter$18 = () => import("./login-owr4m1mi.mjs");
var Route$18 = createFileRoute("/login")({
	ssr: false,
	head: () => ({ meta: [
		{ title: "Sign in | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Sign in to the Brandium Telesales CRM workspace."
		},
		{
			property: "og:title",
			content: "Sign in | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Sign in to the Brandium Telesales CRM workspace."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./route-9jqM8Lsu.mjs");
var Route$17 = createFileRoute("/_authenticated/admin")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
var $$splitComponentImporter$16 = () => import("./agent-activity-BKmp1VNH.mjs");
var Route$16 = createFileRoute("/_authenticated/agent-activity")({
	head: () => ({ meta: [
		{ title: "Agent Activity Logs | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Immutable real-time audit logs across prospects, deals, payments, and users."
		},
		{
			property: "og:title",
			content: "Agent Activity Logs | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Immutable real-time audit logs across prospects, deals, payments, and users."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./billing-4wWCdfCb.mjs");
var Route$15 = createFileRoute("/_authenticated/billing")({
	head: () => ({ meta: [
		{ title: "Billing | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Manage client invoices, payments, and financial due calculations."
		},
		{
			property: "og:title",
			content: "Billing | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Manage client invoices, payments, and financial due calculations."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./billing-history-F4FvMBwN.mjs");
var Route$14 = createFileRoute("/_authenticated/billing-history")({
	head: () => ({ meta: [
		{ title: "Billing History | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Comprehensive audit history for all client invoices and payments."
		},
		{
			property: "og:title",
			content: "Billing History | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Comprehensive audit history for all client invoices and payments."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./client-balances-BoeAAQ95.mjs");
var Route$13 = createFileRoute("/_authenticated/client-balances")({
	head: () => ({ meta: [
		{ title: "Client Balances | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Real-time client ledger and balance aggregation."
		},
		{
			property: "og:title",
			content: "Client Balances | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Real-time client ledger and balance aggregation."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./dashboard-DFvYbK7W.mjs");
var Route$12 = createFileRoute("/_authenticated/dashboard")({
	head: () => ({ meta: [
		{ title: "Dashboard | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Performance overview for your telesales team."
		},
		{
			property: "og:title",
			content: "Dashboard | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Performance overview for your telesales team."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./denied-payments-jLLCpYvi.mjs");
var Route$11 = createFileRoute("/_authenticated/denied-payments")({
	head: () => ({ meta: [
		{ title: "Denied Payments | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Track clients who denied payment after sales completion."
		},
		{
			property: "og:title",
			content: "Denied Payments | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Track clients who denied payment after sales completion."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./meetings-DjUsqmyh.mjs");
var Route$10 = createFileRoute("/_authenticated/meetings")({
	head: () => ({ meta: [
		{ title: "Meetings | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Schedule, track and manage client meetings."
		},
		{
			property: "og:title",
			content: "Meetings | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Schedule, track and manage client meetings."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./reports-7CcJxgWf.mjs");
var Route$9 = createFileRoute("/_authenticated/reports")({
	head: () => ({ meta: [
		{ title: "Reports & Analytics | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Filtered SQL aggregated reports, KPIs, stage distribution, and stage count analytics."
		},
		{
			property: "og:title",
			content: "Reports & Analytics | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Filtered SQL aggregated reports, KPIs, stage distribution, and stage count analytics."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./send-sms-CKYHNNtf.mjs");
var Route$8 = createFileRoute("/_authenticated/send-sms")({
	head: () => ({ meta: [
		{ title: "Send SMS | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Compose and send SMS messages to prospects and clients."
		},
		{
			property: "og:title",
			content: "Send SMS | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Compose and send SMS messages to prospects and clients."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./won-sales-8_BzMUuU.mjs");
var Route$7 = createFileRoute("/_authenticated/won-sales")({
	head: () => ({ meta: [
		{ title: "Won Sales | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Closed-won deals and their detailed relational records."
		},
		{
			property: "og:title",
			content: "Won Sales | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Closed-won deals and their detailed relational records."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./agent-reports-3qlOUzKN.mjs");
var Route$6 = createFileRoute("/_authenticated/admin/agent-reports")({
	head: () => ({ meta: [
		{ title: "Agent Activity Reports | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Comprehensive agent activity analysis, conversion rates, and stage metrics."
		},
		{
			property: "og:title",
			content: "Agent Activity Reports | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Comprehensive agent activity analysis, conversion rates, and stage metrics."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./data-backup-BTccaOET.mjs");
var Route$5 = createFileRoute("/_authenticated/admin/data-backup")({
	head: () => ({ meta: [
		{ title: "Data Backup | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Export and back up your CRM data."
		},
		{
			property: "og:title",
			content: "Data Backup | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Export and back up your CRM data."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./services-BPDMqvOM.mjs");
var Route$4 = createFileRoute("/_authenticated/admin/services")({
	head: () => ({ meta: [
		{ title: "Service Management | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Configure sales service offerings and soft-delete protections."
		},
		{
			property: "og:title",
			content: "Service Management | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Configure sales service offerings and soft-delete protections."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./stages-AUupv95G.mjs");
objectType({
	name: stringType().min(1, "Name is required"),
	stage_group: stringType().min(1, "Group is required"),
	sort_order: coerce.number().int().min(0),
	is_follow_up: booleanType(),
	color: stringType().nullable().optional(),
	icon: stringType().nullable().optional()
});
var Route$3 = createFileRoute("/_authenticated/admin/stages")({
	head: () => ({ meta: [
		{ title: "Stage Management | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Manage available lead stages and pipeline flow."
		},
		{
			property: "og:title",
			content: "Stage Management | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Manage available lead stages and pipeline flow."
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./users-Eua6ZCux.mjs");
var Route$2 = createFileRoute("/_authenticated/admin/users")({
	head: () => ({ meta: [
		{ title: "User Management | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Admin-only CRM user accounts, roles, and access control management."
		},
		{
			property: "og:title",
			content: "User Management | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Admin-only CRM user accounts, roles, and access control management."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./sms.logs-4MzYdo-b.mjs");
var Route$1 = createFileRoute("/_authenticated/sms/logs")({
	head: () => ({ meta: [
		{ title: "SMS Logs | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Comprehensive audit trail for every SMS attempt in Brandium CRM."
		},
		{
			property: "og:title",
			content: "SMS Logs | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Comprehensive audit trail for every SMS attempt in Brandium CRM."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./sms.send-Cp3q3iPf.mjs");
var Route = createFileRoute("/_authenticated/sms/send")({
	head: () => ({ meta: [
		{ title: "Send SMS | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Send single or bulk SMS broadcasts to prospects and clients."
		},
		{
			property: "og:title",
			content: "Send SMS | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Send single or bulk SMS broadcasts to prospects and clients."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$20.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$21
});
var AuthenticatedRouteRoute = Route$19.update({
	id: "/_authenticated",
	getParentRoute: () => Route$21
});
var LoginRoute = Route$18.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$21
});
var AuthenticatedAdminRouteRoute = Route$17.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAgentActivityRoute = Route$16.update({
	id: "/agent-activity",
	path: "/agent-activity",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedBillingRoute = Route$15.update({
	id: "/billing",
	path: "/billing",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedBillingHistoryRoute = Route$14.update({
	id: "/billing-history",
	path: "/billing-history",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedClientBalancesRoute = Route$13.update({
	id: "/client-balances",
	path: "/client-balances",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDashboardRoute = Route$12.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDeniedPaymentsRoute = Route$11.update({
	id: "/denied-payments",
	path: "/denied-payments",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedFollowUpsRoute = Route$23.update({
	id: "/follow-ups",
	path: "/follow-ups",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedMeetingsRoute = Route$10.update({
	id: "/meetings",
	path: "/meetings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedOpportunitiesRoute = Route$24.update({
	id: "/opportunities",
	path: "/opportunities",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedProspectsRoute = Route$25.update({
	id: "/prospects",
	path: "/prospects",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedReportsRoute = Route$9.update({
	id: "/reports",
	path: "/reports",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSendSmsRoute = Route$8.update({
	id: "/send-sms",
	path: "/send-sms",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedWonSalesRoute = Route$7.update({
	id: "/won-sales",
	path: "/won-sales",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminAgentReportsRoute = Route$6.update({
	id: "/agent-reports",
	path: "/agent-reports",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminBackupRoute = Route$22.update({
	id: "/backup",
	path: "/backup",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminDataBackupRoute = Route$5.update({
	id: "/data-backup",
	path: "/data-backup",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminServicesRoute = Route$4.update({
	id: "/services",
	path: "/services",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminStageHistoryRoute = Route$26.update({
	id: "/stage-history",
	path: "/stage-history",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminStagesRoute = Route$3.update({
	id: "/stages",
	path: "/stages",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminUsersRoute = Route$2.update({
	id: "/users",
	path: "/users",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedSmsLogsRoute = Route$1.update({
	id: "/sms/logs",
	path: "/sms/logs",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSmsSendRoute = Route.update({
	id: "/sms/send",
	path: "/sms/send",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminRouteRouteChildren = {
	AuthenticatedAdminAgentReportsRoute,
	AuthenticatedAdminBackupRoute,
	AuthenticatedAdminDataBackupRoute,
	AuthenticatedAdminServicesRoute,
	AuthenticatedAdminStageHistoryRoute,
	AuthenticatedAdminStagesRoute,
	AuthenticatedAdminUsersRoute
};
var AuthenticatedRouteRouteChildren = {
	AuthenticatedAdminRouteRoute: AuthenticatedAdminRouteRoute._addFileChildren(AuthenticatedAdminRouteRouteChildren),
	AuthenticatedAgentActivityRoute,
	AuthenticatedBillingRoute,
	AuthenticatedBillingHistoryRoute,
	AuthenticatedClientBalancesRoute,
	AuthenticatedDashboardRoute,
	AuthenticatedDeniedPaymentsRoute,
	AuthenticatedFollowUpsRoute,
	AuthenticatedMeetingsRoute,
	AuthenticatedOpportunitiesRoute,
	AuthenticatedProspectsRoute,
	AuthenticatedReportsRoute,
	AuthenticatedSendSmsRoute,
	AuthenticatedWonSalesRoute,
	AuthenticatedSmsLogsRoute,
	AuthenticatedSmsSendRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	LoginRoute
};
var routeTree = Route$21._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
