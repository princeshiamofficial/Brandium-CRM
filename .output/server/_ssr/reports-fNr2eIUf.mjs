import { o as __toESM } from "../_runtime.mjs";
import { t as runMySQLQuery } from "./mysql-api-C2GgWVVv.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-CtX3ithx.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as StatCard } from "./stat-card-C9FEmuAx.mjs";
import { Bt as CircleAlert, Et as DollarSign, Jt as ChartColumn, L as Receipt, Yt as Calendar, Zt as CalendarClock, a as Wallet, c as UsersRound, h as Trophy, p as UserCheck, qt as ChartPie, s as Users, zt as CircleCheck } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { n as queryOptions, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as agentOptionsQueryOptions } from "./won-sales-DRPxo5pe.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-Cmlz_mk1.mjs";
import { l as format } from "../_libs/date-fns.mjs";
import { t as Calendar$1 } from "./calendar-BkciPy-j.mjs";
import { t as PageHeader } from "./placeholder-page-BhrIUunO.mjs";
import { a as CartesianGrid, c as Cell, d as Legend, i as XAxis, l as ResponsiveContainer, n as BarChart, o as Bar, r as YAxis, s as Pie, t as PieChart, u as Tooltip } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-fNr2eIUf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CHART_COLORS = [
	"#67B239",
	"#3B82F6",
	"#8B5CF6",
	"#F59E0B",
	"#06B6D4",
	"#EF4444",
	"#EC4899",
	"#10B981"
];
async function fetchReportsData(filters = {}) {
	try {
		const prospectsRes = await runMySQLQuery(`SELECT 
        p.id,
        p.assigned_to,
        p.created_at,
        COALESCE(s.name, 'Prospect') AS stage_name
      FROM \`prospects\` p
      LEFT JOIN \`stages\` s ON p.stage_id = s.id
      WHERE p.is_active = 1;`);
		const invoicesRes = await runMySQLQuery(`SELECT 
        i.id,
        i.total_amount,
        i.paid_amount,
        i.due_amount,
        i.created_by,
        i.created_at
      FROM \`invoices\` i
      WHERE i.status != 'Cancelled';`);
		let prospectsList = Array.isArray(prospectsRes.data) ? prospectsRes.data : [];
		let invoicesList = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];
		if (filters.from_date) {
			prospectsList = prospectsList.filter((p) => String(p["created_at"]) >= filters.from_date);
			invoicesList = invoicesList.filter((i) => String(i["created_at"]) >= filters.from_date);
		}
		if (filters.to_date) {
			prospectsList = prospectsList.filter((p) => String(p["created_at"]) <= `${filters.to_date} 23:59:59`);
			invoicesList = invoicesList.filter((i) => String(i["created_at"]) <= `${filters.to_date} 23:59:59`);
		}
		if (filters.agent_id && filters.agent_id !== "all") {
			prospectsList = prospectsList.filter((p) => p["assigned_to"] === filters.agent_id);
			invoicesList = invoicesList.filter((i) => i["created_by"] === filters.agent_id);
		}
		const totalProspects = prospectsList.length;
		let salesWon = 0;
		let followup = 0;
		const stageMap = /* @__PURE__ */ new Map();
		for (const p of prospectsList) {
			const sName = String(p["stage_name"] || "Prospect").trim();
			const lower = sName.toLowerCase();
			if (lower.includes("won")) salesWon++;
			if (lower.includes("follow")) followup++;
			stageMap.set(sName, (stageMap.get(sName) || 0) + 1);
		}
		let totalBilled = 0;
		let totalPaid = 0;
		let totalOutstanding = 0;
		for (const inv of invoicesList) {
			const tot = Number(inv["total_amount"] || 0);
			const pd = Number(inv["paid_amount"] || 0);
			const due = Number(inv["due_amount"] ?? Math.max(0, tot - pd));
			totalBilled += tot;
			totalPaid += pd;
			totalOutstanding += Math.max(0, due);
		}
		const activeClients = Math.max(0, totalProspects - salesWon);
		const stageDistribution = Array.from(stageMap.entries()).map(([stage, count], idx) => ({
			stage,
			count,
			percentage: totalProspects > 0 ? Number((count / totalProspects * 100).toFixed(1)) : 0,
			color: CHART_COLORS[idx % CHART_COLORS.length] || "#67B239"
		}));
		stageDistribution.sort((a, b) => b.count - a.count);
		return {
			kpis: {
				total_prospects: totalProspects,
				sales_won: salesWon,
				followup,
				total_sales: totalBilled,
				paid_sales: totalPaid,
				total_billed: totalBilled,
				total_outstanding: totalOutstanding,
				total_paid: totalPaid,
				active_clients: activeClients
			},
			stage_distribution: stageDistribution,
			stage_counts: stageDistribution
		};
	} catch (err) {
		console.warn("fetchReportsData error:", err);
		return {
			kpis: {
				total_prospects: 0,
				sales_won: 0,
				followup: 0,
				total_sales: 0,
				paid_sales: 0,
				total_billed: 0,
				total_outstanding: 0,
				total_paid: 0,
				active_clients: 0
			},
			stage_distribution: [],
			stage_counts: []
		};
	}
}
var reportsQueryOptions = (filters = {}) => queryOptions({
	queryKey: ["reports", filters],
	queryFn: () => fetchReportsData(filters)
});
function formatCurrency(amount) {
	return `৳${Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
function ReportsPage() {
	const [dateRange, setDateRange] = (0, import_react.useState)(void 0);
	const [calOpen, setCalOpen] = (0, import_react.useState)(false);
	const [agentFilter, setAgentFilter] = (0, import_react.useState)("all");
	const filters = {
		from_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : void 0,
		to_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : void 0,
		agent_id: agentFilter
	};
	const { data: reportsData, isLoading } = useQuery(reportsQueryOptions(filters));
	const { data: agents = [] } = useQuery(agentOptionsQueryOptions());
	const kpis = reportsData?.kpis;
	const stageDist = reportsData?.stage_distribution || [];
	const stageCounts = reportsData?.stage_counts || [];
	const resetFilters = () => {
		setDateRange(void 0);
		setAgentFilter("all");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, { title: "Reports" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: agentFilter,
						onValueChange: (val) => setAgentFilter(val),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
							className: "w-44 bg-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Agents" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: "All Agents"
						}), agents.map((agent) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: agent.id,
							children: agent.name
						}, agent.id))] })]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
						open: calOpen,
						onOpenChange: setCalOpen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: `bg-white gap-2 text-xs font-normal ${dateRange?.from ? "text-foreground" : "text-muted-foreground"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3.5" }), dateRange?.from ? dateRange.to ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									format(dateRange.from, "MMM d"),
									" –",
									" ",
									format(dateRange.to, "MMM d, yyyy")
								] }) : format(dateRange.from, "MMM d, yyyy") : "Date Range"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
							className: "w-auto p-0",
							align: "end",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
								mode: "range",
								selected: dateRange,
								onSelect: (range) => {
									setDateRange(range);
									if (range?.to) setCalOpen(false);
								},
								numberOfMonths: 2,
								initialFocus: true
							}), dateRange?.from && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border-t p-2 flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									className: "text-xs",
									onClick: () => {
										setDateRange(void 0);
										setCalOpen(false);
									},
									children: "Clear dates"
								})
							})]
						})]
					}), (dateRange || agentFilter !== "all") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						className: "text-xs",
						onClick: resetFilters,
						children: "Reset"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Prospects",
						value: isLoading ? "..." : String(kpis?.total_prospects || 0),
						icon: UsersRound,
						colorScheme: "indigo",
						loading: isLoading
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Sales Won",
						value: isLoading ? "..." : String(kpis?.sales_won || 0),
						icon: Trophy,
						colorScheme: "emerald",
						loading: isLoading
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Follow-up Deals",
						value: isLoading ? "..." : String(kpis?.followup || 0),
						icon: CalendarClock,
						colorScheme: "amber",
						loading: isLoading
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Sales Value",
						value: isLoading ? "..." : formatCurrency(kpis?.total_sales || 0),
						icon: DollarSign,
						colorScheme: "blue",
						loading: isLoading
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Paid Sales Amount",
						value: isLoading ? "..." : formatCurrency(kpis?.paid_sales || 0),
						icon: CircleCheck,
						colorScheme: "emerald",
						loading: isLoading
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Billed Revenue",
						value: isLoading ? "..." : formatCurrency(kpis?.total_billed || 0),
						icon: Receipt,
						colorScheme: "teal",
						loading: isLoading
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Outstanding Due",
						value: isLoading ? "..." : formatCurrency(kpis?.total_outstanding || 0),
						icon: CircleAlert,
						colorScheme: "amber",
						loading: isLoading
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Paid Collected",
						value: isLoading ? "..." : formatCurrency(kpis?.total_paid || 0),
						icon: Wallet,
						colorScheme: "emerald",
						loading: isLoading
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Active Clients",
						value: isLoading ? "..." : String(kpis?.active_clients || 0),
						icon: UserCheck,
						colorScheme: "indigo",
						loading: isLoading,
						className: "col-span-1 sm:col-span-2 lg:col-span-1"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "bg-white dark:bg-card border-slate-200/80 shadow-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
							className: "text-base flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartPie, { className: "size-4 text-[#67B239]" }), "Prospect Stage Distribution (Donut Chart)"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
							className: "text-xs",
							children: "Percentage break-down of prospects across pipeline stages."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-4",
						children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-72 w-full rounded" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-72 w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
										data: stageDist,
										cx: "50%",
										cy: "50%",
										innerRadius: 60,
										outerRadius: 95,
										paddingAngle: 4,
										dataKey: "count",
										nameKey: "stage",
										label: ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`,
										children: stageDist.map((entry, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: entry.color || "#67B239" }, `cell-${index}`))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (val, name) => [`${val} Prospects`, `Stage: ${name}`] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
										verticalAlign: "bottom",
										height: 36,
										wrapperStyle: { fontSize: "11px" }
									})
								] })
							})
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "bg-white dark:bg-card border-slate-200/80 shadow-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
							className: "text-base flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-4 text-blue-600" }), "Stage Prospect Counts (Bar Chart)"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
							className: "text-xs",
							children: "Absolute volume count of prospects grouped by sales stage."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-4",
						children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-72 w-full rounded" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-72 w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
									data: stageCounts,
									margin: {
										top: 10,
										right: 10,
										left: -20,
										bottom: 20
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
											strokeDasharray: "3 3",
											vertical: false,
											opacity: .3
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
											dataKey: "stage",
											tick: { fontSize: 10 },
											interval: 0,
											angle: -15,
											textAnchor: "end"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: { fontSize: 11 } }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (val) => [`${val} Prospects`, "Volume"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
											dataKey: "count",
											radius: [
												4,
												4,
												0,
												0
											],
											children: stageCounts.map((entry, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: entry.color || "#3B82F6" }, `bar-${index}`))
										})
									]
								})
							})
						})
					})]
				})]
			})
		]
	});
}
//#endregion
export { ReportsPage as component };
