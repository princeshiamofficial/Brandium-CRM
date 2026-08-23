import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { Et as DollarSign, Gt as Check, H as Phone, L as Receipt, Yt as Calendar, h as Trophy, ht as FileText, k as Search, l as User, r as X, s as Users, y as Target, zt as CircleCheck } from "../_libs/lucide-react.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as wonSalesQueryOptions, t as agentOptionsQueryOptions } from "./won-sales-M30PUlkq.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-Cmlz_mk1.mjs";
import { l as format } from "../_libs/date-fns.mjs";
import { t as Calendar$1 } from "./calendar-BkciPy-j.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/won-sales-Cp3FeiNS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StatCard({ label, value, icon: Icon, colorScheme }) {
	const styles = {
		pastelPurple: {
			cardBg: "bg-[#F1E8FF] dark:bg-purple-950/40",
			iconText: "text-[#8B5CF6] dark:text-purple-400"
		},
		pastelTeal: {
			cardBg: "bg-[#E1F1F0] dark:bg-teal-950/40",
			iconText: "text-[#0D9488] dark:text-teal-400"
		},
		pastelEmerald: {
			cardBg: "bg-[#E3F2E1] dark:bg-emerald-950/40",
			iconText: "text-[#059669] dark:text-emerald-400"
		},
		pastelPeach: {
			cardBg: "bg-[#FCE8E2] dark:bg-rose-950/40",
			iconText: "text-[#EA580C] dark:text-orange-400"
		},
		pastelYellow: {
			cardBg: "bg-[#FBF3D5] dark:bg-amber-950/40",
			iconText: "text-[#D97706] dark:text-amber-400"
		}
	}[colorScheme];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `group relative overflow-hidden rounded-2xl p-4 sm:p-4.5 shadow-md hover:shadow-lg transition-all duration-200 select-none ${styles.cardBg}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 flex items-center gap-3.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "size-10 sm:size-11 rounded-full bg-white dark:bg-card shadow-2xs flex items-center justify-center shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-5 sm:size-5.5 ${styles.iconText}` })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xl sm:text-2xl font-black text-slate-950 dark:text-white leading-tight mt-0.5 tracking-tight truncate",
					children: value
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute -right-3 -bottom-3 opacity-[0.07] pointer-events-none transform rotate-12 scale-125 transition-transform group-hover:scale-135",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-16 ${styles.iconText}` })
		})]
	});
}
function formatCurrency(amount) {
	return `৳${Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
function WonSalesPage() {
	const [search, setSearch] = (0, import_react.useState)("");
	const [agentFilter, setAgentFilter] = (0, import_react.useState)("all");
	const [dateRange, setDateRange] = (0, import_react.useState)(void 0);
	const [calOpen, setCalOpen] = (0, import_react.useState)(false);
	const filters = {
		search,
		agent_id: agentFilter,
		from_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : void 0,
		to_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : void 0
	};
	const { data: rawWonSales = [], isLoading } = useQuery(wonSalesQueryOptions(filters));
	const { data: rawAgents = [] } = useQuery(agentOptionsQueryOptions());
	const wonSales = Array.isArray(rawWonSales) ? rawWonSales : [];
	const agents = Array.isArray(rawAgents) ? rawAgents : [];
	const totalWonCount = wonSales.length;
	const totalRevenueWon = wonSales.reduce((acc, curr) => acc + curr.sale_amount, 0);
	const resetFilters = () => {
		setSearch("");
		setDateRange(void 0);
		setAgentFilter("all");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-7 text-[#67B239]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "text-2xl font-bold tracking-tight text-foreground",
						children: [
							"Total ",
							totalWonCount,
							" sales won"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Comprehensive relational view of all successfully closed-won client deals, billing invoices, and agent performance."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					className: "bg-[#67B239] hover:bg-[#5aa030] text-white px-3 py-1.5 text-xs font-semibold self-start sm:self-auto gap-1.5 shadow-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }),
						formatCurrency(totalRevenueWon),
						" Revenue Realized"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Sales Won",
						value: String(totalWonCount),
						icon: Trophy,
						colorScheme: "pastelEmerald"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Revenue Generated",
						value: formatCurrency(totalRevenueWon),
						icon: DollarSign,
						colorScheme: "pastelTeal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Active Invoices Linked",
						value: String(totalWonCount),
						icon: Receipt,
						colorScheme: "pastelPurple"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Average Deal Size",
						value: formatCurrency(totalWonCount > 0 ? totalRevenueWon / totalWonCount : 0),
						icon: Target,
						colorScheme: "pastelYellow"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: agentFilter,
							onValueChange: (val) => setAgentFilter(val),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "w-42.5 bg-white",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 truncate",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Agents" })]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All Agents"
							}), agents.map((ag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: ag.id,
								children: ag.name
							}, ag.id))] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1 min-w-50 max-w-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "text",
									placeholder: "Search client, business, phone, invoice...",
									className: "pl-8.5 bg-white",
									value: search,
									onChange: (e) => setSearch(e.target.value)
								}),
								search && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setSearch(""),
									className: "absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
								})
							]
						}),
						(search || agentFilter !== "all" || dateRange) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: resetFilters,
							className: "h-9 px-2 text-xs text-muted-foreground hover:text-foreground",
							children: "Reset"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2 self-start md:self-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
						open: calOpen,
						onOpenChange: setCalOpen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: `h-9 justify-start text-left font-normal bg-white gap-2 text-xs ${!dateRange ? "text-muted-foreground" : "text-foreground font-semibold"}`,
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
					})
				})]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
				children: Array.from({ length: 4 }).map((_, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-4 shadow-2xs space-y-3.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-3/4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-1/3" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-7 rounded-full" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 w-full" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-xl" })
					]
				}, idx))
			}) : wonSales.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-12 text-center text-muted-foreground shadow-2xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-10 mx-auto text-slate-300 mb-2.5" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-bold text-foreground text-base",
						children: "No won sales match your filters"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-1 max-w-sm mx-auto",
						children: "Try adjusting your search terms, changing agent selection, or resetting date filters."
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
				children: wonSales.map((sale) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between select-none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 pb-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug truncate group-hover:text-[#67B239] transition-colors",
										children: sale.business_name || sale.client_name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm font-bold text-[#67B239] mt-0.5 font-mono",
										children: ["৳", Number(sale.sale_amount).toLocaleString()]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-6 sm:size-7 rounded-full bg-[#67B239] flex items-center justify-center shrink-0 text-white shadow-2xs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 stroke-3" })
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-slate-800 dark:text-slate-200 truncate",
										children: sale.client_designation || sale.client_name || "Owner"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: `tel:${sale.phone}`,
										className: "font-mono text-slate-800 dark:text-slate-200 hover:text-[#67B239] transition-colors",
										children: sale.phone
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-[#DCEEEF] dark:bg-teal-950/40 px-4 py-3 text-xs space-y-2 border-y border-[#cbe5e7] dark:border-teal-900/50",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4 text-slate-600 dark:text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Assigned:" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-slate-900 dark:text-slate-100 truncate max-w-36",
										children: sale.assigned_agent_name
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-4 text-slate-600 dark:text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Created by:" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-slate-900 dark:text-slate-100 truncate max-w-36",
										children: sale.created_by_name || sale.assigned_agent_name
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-4 text-slate-600 dark:text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Updated:" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-slate-900 dark:text-slate-100",
										children: format(new Date(sale.updated_at || sale.won_at), "MMM d, yyyy")
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 pt-3 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5 text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Notes" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-[#ECEEF0] dark:bg-slate-800/70 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300 min-h-16 flex items-start",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "line-clamp-3 leading-relaxed",
									children: sale.notes || "Professional Platinum package"
								})
							})]
						})
					] })
				}, sale.id))
			})
		]
	});
}
//#endregion
export { WonSalesPage as component };
