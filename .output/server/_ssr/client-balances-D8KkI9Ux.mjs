import { o as __toESM } from "../_runtime.mjs";
import { t as runMySQLQuery } from "./mysql-api-C2GgWVVv.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { t as Card } from "./card-CtX3ithx.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as StatCard } from "./stat-card-C9FEmuAx.mjs";
import { Bt as CircleAlert, Et as DollarSign, P as RotateCcw, U as PhoneCall, Yt as Calendar, a as Wallet, et as Mail, k as Search, p as UserCheck, r as X, zt as CircleCheck } from "../_libs/lucide-react.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { n as queryOptions, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-Cmlz_mk1.mjs";
import { l as format } from "../_libs/date-fns.mjs";
import { t as Calendar$1 } from "./calendar-BkciPy-j.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-balances-D8KkI9Ux.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function calculateClientBalance(totalBilled, totalPaid) {
	return Math.max(0, totalBilled - totalPaid);
}
async function fetchClientBalances(filters = {}) {
	try {
		const res = await runMySQLQuery(`SELECT 
        p.id AS client_id,
        p.contact_name AS name,
        p.business_name,
        p.phone,
        p.email,
        p.updated_at AS last_updated,
        COALESCE(SUM(CASE WHEN i.status != 'Cancelled' THEN i.total_amount ELSE 0 END), 0) AS total_billed,
        COALESCE(SUM(CASE WHEN i.status != 'Cancelled' THEN i.paid_amount ELSE 0 END), 0) AS total_paid
      FROM \`prospects\` p
      LEFT JOIN \`invoices\` i ON p.id = i.prospect_id
      WHERE p.is_active = 1
      GROUP BY p.id, p.contact_name, p.business_name, p.phone, p.email, p.updated_at
      ORDER BY total_billed DESC, p.created_at DESC;`);
		if (!res.success || !Array.isArray(res.data)) return [];
		return applyClientBalanceFilters(res.data.map((item) => {
			const billed = Number(item["total_billed"] || 0);
			const paid = Number(item["total_paid"] || 0);
			const bal = calculateClientBalance(billed, paid);
			return {
				client_id: String(item["client_id"] || ""),
				name: String(item["name"] || "Client"),
				business_name: item["business_name"] || void 0,
				phone: item["phone"] || void 0,
				email: item["email"] || void 0,
				total_billed: billed,
				total_paid: paid,
				current_balance: bal,
				last_updated: String(item["last_updated"] || (/* @__PURE__ */ new Date()).toISOString())
			};
		}), filters);
	} catch (err) {
		console.warn("fetchClientBalances error:", err);
		return [];
	}
}
function applyClientBalanceFilters(list, filters) {
	let result = list;
	if (filters.from_date) {
		const fromStr = filters.from_date;
		result = result.filter((c) => c.last_updated.split("T")[0] >= fromStr);
	}
	if (filters.to_date) {
		const toStr = filters.to_date;
		result = result.filter((c) => c.last_updated.split("T")[0] <= toStr);
	}
	if (filters.search && filters.search.trim() !== "") {
		const q = filters.search.toLowerCase().trim();
		result = result.filter((c) => c.name.toLowerCase().includes(q) || c.business_name && c.business_name.toLowerCase().includes(q) || c.client_id.toLowerCase().includes(q) || c.phone && c.phone.includes(q) || c.email && c.email.toLowerCase().includes(q));
	}
	return result;
}
var clientBalancesQueryOptions = (filters = {}) => queryOptions({
	queryKey: ["client-balances", filters],
	queryFn: () => fetchClientBalances(filters)
});
function formatCurrency(amount) {
	return `৳${Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
function getInitials(name) {
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2 && parts[0] && parts[1]) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
	return name.slice(0, 2).toUpperCase();
}
function ClientBalancesPage() {
	const [search, setSearch] = (0, import_react.useState)("");
	const [dateRange, setDateRange] = (0, import_react.useState)(void 0);
	const [calOpen, setCalOpen] = (0, import_react.useState)(false);
	const filters = {
		search,
		from_date: dateRange?.from?.toISOString(),
		to_date: dateRange?.to?.toISOString()
	};
	const { data: balances = [], isLoading } = useQuery(clientBalancesQueryOptions(filters));
	const totalOutstanding = balances.reduce((acc, c) => acc + c.current_balance, 0);
	const totalBilled = balances.reduce((acc, c) => acc + c.total_billed, 0);
	const totalPaid = balances.reduce((acc, c) => acc + c.total_paid, 0);
	const activeClientsCount = balances.filter((c) => c.total_billed > 0 || c.current_balance > 0).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-2 rounded-xl bg-[#67B239]/10 text-[#67B239]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-bold tracking-tight text-foreground",
						children: "Client Balances"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs sm:text-sm text-muted-foreground mt-1",
					children: "Real-time client financial ledger and outstanding balance tracking."
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Outstanding",
						value: formatCurrency(totalOutstanding),
						icon: CircleAlert,
						colorScheme: "pastelPeach"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Billed",
						value: formatCurrency(totalBilled),
						icon: DollarSign,
						colorScheme: "pastelTeal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Paid",
						value: formatCurrency(totalPaid),
						icon: CircleCheck,
						colorScheme: "pastelEmerald"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Active Clients",
						value: String(activeClientsCount),
						icon: UserCheck,
						colorScheme: "pastelPurple"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative max-w-sm flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Search name, business, phone...",
							value: search,
							onChange: (e) => setSearch(e.target.value),
							className: "pl-9 pr-8 h-9 text-xs sm:text-sm bg-white dark:bg-card rounded-xl border-slate-200 dark:border-border"
						}),
						search && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setSearch(""),
							className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
						open: calOpen,
						onOpenChange: setCalOpen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: `h-9 px-3 text-xs font-normal rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border gap-2 ${dateRange?.from ? "text-foreground font-medium" : "text-muted-foreground"}`,
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
					}), (search || dateRange) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "icon",
						onClick: () => {
							setSearch("");
							setDateRange(void 0);
						},
						title: "Reset Filters",
						className: "h-9 w-9 rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border text-muted-foreground hover:text-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: isLoading ? Array.from({ length: 4 }).map((_, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "p-4 sm:p-5 bg-white dark:bg-card border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-11 rounded-xl shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-44 rounded" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3.5 w-32 rounded" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-56 rounded" })
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 sm:grid-cols-4 gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-24 rounded-xl" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-24 rounded-xl" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-24 rounded-xl" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-24 rounded-xl" })
							]
						})]
					})
				}, idx)) : balances.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "py-12 text-center bg-white dark:bg-card border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-8 mx-auto text-slate-300 mb-2" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold text-foreground",
							children: "No client balances match your filters"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-0.5",
							children: "Try resetting date range or search queries."
						})
					]
				}) : balances.map((client) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "bg-white dark:bg-card border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start sm:items-center gap-3.5 min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-11 rounded-xl bg-[#67B239]/10 text-[#67B239] font-bold flex items-center justify-center text-sm shrink-0 border border-[#67B239]/20",
								children: getInitials(client.name)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1 min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "font-semibold text-foreground text-sm sm:text-base truncate",
												children: client.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono text-[11px] text-muted-foreground",
												children: ["#", client.client_id]
											}),
											client.current_balance === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-900/60",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-emerald-500" }), "Cleared"]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200/80 dark:border-rose-900/60",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-rose-500" }), "Due"]
											})
										]
									}),
									client.business_name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground truncate",
										children: client.business_name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-3 pt-0.5 text-xs text-muted-foreground",
										children: [client.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: `tel:${client.phone}`,
											className: "font-mono text-slate-600 dark:text-slate-400 hover:text-[#67B239] flex items-center gap-1 transition-colors",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneCall, { className: "size-3 text-[#67B239] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: client.phone })]
										}), client.email && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: `mailto:${client.email}`,
											className: "text-slate-500 hover:text-foreground flex items-center gap-1 transition-colors truncate max-w-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3 text-blue-500 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "truncate",
												children: client.email
											})]
										})]
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 bg-slate-50/80 dark:bg-muted/30 p-3 sm:p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shrink-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block",
										children: "Current Due"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `font-mono font-bold text-sm block ${client.current_balance > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`,
										children: formatCurrency(client.current_balance)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block",
										children: "Total Billed"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono font-bold text-sm text-foreground block",
										children: formatCurrency(client.total_billed)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block",
										children: "Total Paid"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 block",
										children: formatCurrency(client.total_paid)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block",
										children: "Last Updated"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1 text-[11px] font-mono text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(client.last_updated).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric"
										}) })]
									})]
								})
							]
						})]
					})
				}, client.client_id))
			})
		]
	});
}
//#endregion
export { ClientBalancesPage as component };
