import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as executeMySQLQueryFn } from "./crm.functions-BCdpz-Ev.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as StatCard } from "./stat-card-C9FEmuAx.mjs";
import { F as Repeat, Rt as CircleDollarSign, Wt as ChevronDown, Yt as Calendar, Zt as CalendarClock, a as Wallet, c as UsersRound, h as Trophy, ot as ListChecks, rn as Banknote } from "../_libs/lucide-react.mjs";
import { n as queryOptions, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as useAuth } from "./auth-vDqZlo-r.mjs";
import { d as DropdownMenuTrigger, i as DropdownMenuItem, n as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu-BfBJVxb8.mjs";
import { t as agentsQuery } from "./follow-ups-33mvp5RO.mjs";
import { n as fetchMySQLProspects } from "./prospects.functions-DuZO1_D5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-ClDHbCrw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DashboardGreetingBanner({ selectedAgent, onAgentChange, selectedDateRange = "This Month", onDateRangeChange }) {
	const { profile, user, isAdmin } = useAuth();
	(profile?.full_name?.trim() || user?.user_metadata?.["full_name"] || user?.email || "Mehan").split(" ")[0];
	const agents = useQuery({
		...agentsQuery(),
		enabled: isAdmin
	});
	const [dateRange, setDateRange] = (0, import_react.useState)(selectedDateRange);
	const [selectedAgentLabel, setSelectedAgentLabel] = (0, import_react.useState)("All Agents");
	const handleDateSelect = (range) => {
		setDateRange(range);
		onDateRangeChange?.(range);
	};
	const handleAgentSelect = (agentId, label) => {
		setSelectedAgentLabel(label);
		onAgentChange?.(agentId);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-white dark:bg-card rounded-xl border border-[#E1E6ED] dark:border-border shadow-2xs px-4 py-2.5 flex items-center gap-3 w-fit",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersRound, { className: "size-4 text-[#7AC142] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-bold text-[#7AC142] dark:text-[#9ED968] tracking-wide",
						children: "Select Agent"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuTrigger, {
					className: "bg-[#F5F7FA] hover:bg-slate-200/80 dark:bg-muted dark:hover:bg-muted/80 text-[#0A2E5C] dark:text-foreground text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border-0 outline-none cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: selectedAgentLabel }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3 text-[#5A6B85] dark:text-muted-foreground" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
					align: "start",
					className: "w-44",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							onClick: () => handleAgentSelect(void 0, "All Agents"),
							children: "All Agents"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							onClick: () => handleAgentSelect(user?.id, "Assigned to Me"),
							children: "Assigned to Me"
						}),
						isAdmin && (agents.data ?? []).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							onClick: () => handleAgentSelect(a.id, a.name),
							children: a.name
						}, a.id))
					]
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-white dark:bg-card rounded-xl border border-[#E1E6ED] dark:border-border shadow-2xs px-4 py-2.5 flex items-center gap-3 w-fit",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-4 text-[#7AC142] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-bold text-[#7AC142] dark:text-[#9ED968] tracking-wide",
						children: "Filter"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuTrigger, {
					className: "bg-[#F5F7FA] hover:bg-slate-200/80 dark:bg-muted dark:hover:bg-muted/80 text-[#0A2E5C] dark:text-foreground text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border-0 outline-none cursor-pointer",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3 text-[#5A6B85] dark:text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: dateRange }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3 text-[#5A6B85] dark:text-muted-foreground" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
					align: "end",
					className: "w-40",
					children: [
						"Today",
						"This Week",
						"This Month",
						"This Quarter",
						"This Year"
					].map((range) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
						onClick: () => handleDateSelect(range),
						children: range
					}, range))
				})] })]
			})]
		})
	});
}
var EMPTY_METRICS = {
	total_prospects: 0,
	active_prospects: 0,
	won_sales: 0,
	pending_tasks: 0,
	follow_up_stage: 0,
	total_sales: 0,
	paid_sales: 0,
	outstanding_amount: 0
};
function getProspectBucket(p) {
	const sName = String(p.stage_name || "").toLowerCase().trim();
	const sGroup = String(p.stage_group || "").toLowerCase().trim();
	if (sName.includes("won") || sGroup === "won") return "won_sales";
	if (sName.includes("follow")) return "follow_up_stage";
	if (sName.includes("opportunity") || sName.includes("meeting") || sName.includes("quotation") || sGroup === "in_progress" && sName !== "prospect") return "pending_tasks";
	if (sGroup === "lost" || sGroup === "unreachable" || sName.includes("dnp") || sName.includes("switched") || sName.includes("invalid") || sName.includes("lost")) return "lost";
	return "new_prospects";
}
var dashboardMetricsQuery = (_userId) => queryOptions({
	queryKey: ["dashboard", "metrics"],
	queryFn: async () => {
		let all = [];
		try {
			const res = await fetchMySQLProspects();
			if (res?.success && Array.isArray(res.prospects) && res.prospects.length > 0) all = res.prospects;
		} catch (err) {
			console.warn("dashboardMetricsQuery error:", err);
		}
		if (all.length === 0) return EMPTY_METRICS;
		const totalProspects = all.length;
		let newProspects = 0;
		let wonSales = 0;
		let followUp = 0;
		let pendingTasks = 0;
		for (const p of all) {
			const bucket = getProspectBucket({
				stage_name: p["stage_name"],
				stage_group: p["stage_group"]
			});
			if (bucket === "won_sales") wonSales++;
			else if (bucket === "follow_up_stage") followUp++;
			else if (bucket === "pending_tasks") pendingTasks++;
			else if (bucket === "new_prospects") newProspects++;
		}
		let totalSales = 0;
		let paidSales = 0;
		try {
			const invRes = await executeMySQLQueryFn({ data: { sql: "SELECT COALESCE(SUM(total_amount), 0) AS total_sales, COALESCE(SUM(paid_amount), 0) AS paid_sales FROM invoices;" } });
			totalSales = Number(invRes?.data?.[0]?.["total_sales"] || 0);
			paidSales = Number(invRes?.data?.[0]?.["paid_sales"] || 0);
		} catch {}
		return {
			total_prospects: totalProspects,
			active_prospects: newProspects,
			won_sales: wonSales,
			pending_tasks: pendingTasks,
			follow_up_stage: followUp,
			total_sales: totalSales,
			paid_sales: paidSales,
			outstanding_amount: Math.max(0, totalSales - paidSales)
		};
	}
});
var recentProspectsQuery = (_userId) => queryOptions({
	queryKey: ["dashboard", "recent-prospects"],
	queryFn: async () => {
		let all = [];
		try {
			const res = await fetchMySQLProspects();
			if (res?.success && Array.isArray(res.prospects) && res.prospects.length > 0) all = res.prospects;
		} catch (err) {
			console.warn("recentProspectsQuery error:", err);
		}
		return all.slice(0, 50).map((p) => {
			const sName = String(p["stage_name"] || "Prospect").toLowerCase();
			let group = "in_progress";
			if (sName.includes("won") || sName.includes("sales won")) group = "won";
			else if (sName.includes("prospect")) group = "new";
			else if (sName.includes("lost")) group = "lost";
			return {
				id: String(p["id"]),
				contact_name: String(p["contact_name"] || "N/A"),
				business_name: p["business_name"] || null,
				service_name: p["service_name"] || null,
				stage_name: p["stage_name"] || "Prospect",
				stage_group: p["stage_group"] || group,
				created_at: String(p["created_at"] || (/* @__PURE__ */ new Date()).toISOString())
			};
		});
	}
});
function formatCurrency(value) {
	return `৳${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
var stageBadgeVariant = (group) => group === "won" ? "default" : group === "lost" ? "destructive" : group === "new" ? "outline" : "secondary";
function Dashboard() {
	const { user } = useAuth();
	const userId = user?.id ?? "";
	const metrics = useQuery({
		...dashboardMetricsQuery(userId),
		enabled: Boolean(userId)
	});
	const prospects = useQuery({
		...recentProspectsQuery(userId),
		enabled: Boolean(userId)
	});
	const m = metrics.data;
	const loading = metrics.isPending || !userId;
	const categoryLists = [
		{
			key: "total_prospects",
			label: "Total Prospects",
			cardBg: "bg-[#F1E8FF] border-[#E3D5FF] dark:bg-purple-950/40 dark:border-purple-800/60 shadow-xs",
			headerBorder: "border-purple-200/80 dark:border-purple-800/60",
			labelColor: "text-slate-900 dark:text-purple-200 font-bold",
			badgeBg: "bg-purple-600 text-white font-bold shadow-xs",
			items: prospects.data ?? []
		},
		{
			key: "active_prospects",
			label: "Active Prospects",
			cardBg: "bg-[#E1F1F0] border-[#C8E7E4] dark:bg-teal-950/40 dark:border-teal-800/60 shadow-xs",
			headerBorder: "border-teal-200/80 dark:border-teal-800/60",
			labelColor: "text-slate-900 dark:text-teal-200 font-bold",
			badgeBg: "bg-[#67B239] text-white font-bold shadow-xs",
			items: (prospects.data ?? []).filter((p) => getProspectBucket(p) === "new_prospects")
		},
		{
			key: "won_sales",
			label: "Won Sales",
			cardBg: "bg-[#E3F2E1] border-[#CDE9C9] dark:bg-emerald-950/40 dark:border-emerald-800/60 shadow-xs",
			headerBorder: "border-emerald-200/80 dark:border-emerald-800/60",
			labelColor: "text-slate-900 dark:text-emerald-200 font-bold",
			badgeBg: "bg-emerald-600 text-white font-bold shadow-xs",
			items: (prospects.data ?? []).filter((p) => getProspectBucket(p) === "won_sales")
		},
		{
			key: "pending_tasks",
			label: "Pending Task",
			cardBg: "bg-[#FCE8E2] border-[#F8D4C8] dark:bg-rose-950/40 dark:border-rose-800/60 shadow-xs",
			headerBorder: "border-orange-200/80 dark:border-orange-800/60",
			labelColor: "text-slate-900 dark:text-rose-200 font-bold",
			badgeBg: "bg-orange-500 text-white font-bold shadow-xs",
			items: (prospects.data ?? []).filter((p) => getProspectBucket(p) === "pending_tasks")
		},
		{
			key: "follow_up_stage",
			label: "Follow-up Stage",
			cardBg: "bg-[#FBF3D5] border-[#F5E6B5] dark:bg-amber-950/40 dark:border-amber-800/60 shadow-xs",
			headerBorder: "border-amber-200/80 dark:border-amber-800/60",
			labelColor: "text-slate-900 dark:text-amber-200 font-bold",
			badgeBg: "bg-amber-500 text-white font-bold shadow-xs",
			items: (prospects.data ?? []).filter((p) => getProspectBucket(p) === "follow_up_stage")
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardGreetingBanner, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Prospects",
						value: String(m?.total_prospects ?? 0),
						icon: UsersRound,
						loading,
						colorScheme: "pastelPurple"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Active Prospects",
						value: String(m?.active_prospects ?? 0),
						icon: ListChecks,
						loading,
						colorScheme: "pastelTeal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Won Sales",
						value: String(m?.won_sales ?? 0),
						icon: Trophy,
						loading,
						colorScheme: "pastelEmerald"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Pending Tasks",
						value: String(m?.pending_tasks ?? 0),
						icon: CalendarClock,
						loading,
						colorScheme: "pastelPeach"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Follow-up Stage",
						value: String(m?.follow_up_stage ?? 0),
						icon: Repeat,
						loading,
						colorScheme: "pastelYellow"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mt-4",
				children: prospects.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
					children: [
						0,
						1,
						2,
						3,
						4
					].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border bg-card text-card-foreground p-5 shadow-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-24" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" })]
						})]
					}, i))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
					children: categoryLists.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("rounded-2xl border p-4 shadow-2xs flex flex-col justify-between transition-all hover:shadow-md", cat.cardBg),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("flex items-center justify-between border-b pb-3 mb-1", cat.headerBorder),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100", cat.labelColor),
								children: cat.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: cn("text-[11px] size-6 rounded-full p-0 flex items-center justify-center font-bold border-0", cat.badgeBg),
								children: cat.items.length
							})]
						}), cat.items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "py-8 text-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-slate-500 font-medium",
								children: "No prospects in this list"
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-1 divide-y divide-slate-200/50 dark:divide-slate-800/50",
							children: cat.items.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between gap-2 py-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-xs font-bold text-slate-900 dark:text-slate-100",
										children: p.business_name || p.contact_name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "truncate text-[11px] font-medium text-slate-700 dark:text-slate-300",
										children: [p.business_name ? `${p.contact_name} · ` : "", p.service_name ?? "No service"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: stageBadgeVariant(p.stage_group),
									className: "shrink-0 text-[10px] font-semibold rounded-full px-2 py-0.5",
									children: p.stage_name ?? "Unassigned"
								})]
							}, p.id))
						})] })
					}, cat.key))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex items-center justify-center my-4 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-full border-t border-slate-400/60 dark:border-slate-700" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute bg-[#EEEFF2] dark:bg-background px-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/prospects",
						className: "h-10 px-8 rounded-xl bg-[#3F3F3F] hover:bg-[#262626] text-white text-xs font-bold tracking-wide flex items-center justify-center shadow-md shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "View All Prospects" })
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Sales",
						value: formatCurrency(m?.total_sales ?? 0),
						icon: CircleDollarSign,
						loading,
						colorScheme: "emerald"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Paid Sales",
						value: formatCurrency(m?.paid_sales ?? 0),
						icon: Wallet,
						loading,
						colorScheme: "teal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Outstanding Amount",
						value: formatCurrency(m?.outstanding_amount ?? 0),
						icon: Banknote,
						loading,
						colorScheme: "indigo"
					})
				]
			})
		]
	});
}
//#endregion
export { Dashboard as component };
