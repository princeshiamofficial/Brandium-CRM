import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { a as CardTitle, i as CardHeader, r as CardDescription, t as Card } from "./card-CtX3ithx.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as StatCard } from "./stat-card-C9FEmuAx.mjs";
import { At as Clock, Ht as ChevronRight, L as Receipt, Nt as CircleX, P as RotateCcw, Tt as Download, Ut as ChevronLeft, Yt as Calendar, ct as Layers, k as Search, r as X, ut as History, zt as CircleCheck } from "../_libs/lucide-react.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-Cmlz_mk1.mjs";
import { l as format } from "../_libs/date-fns.mjs";
import { t as Calendar$1 } from "./calendar-BkciPy-j.mjs";
import { a as invoicesQueryOptions, i as exportBillingHistoryCSV } from "./billing-RxPrIlIi.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/billing-history-CCLzSV3b.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function formatCurrency(amount) {
	return `৳${Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
function BillingHistoryPage() {
	const [search, setSearch] = (0, import_react.useState)("");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [dateRange, setDateRange] = (0, import_react.useState)(void 0);
	const [calOpen, setCalOpen] = (0, import_react.useState)(false);
	const [sortField] = (0, import_react.useState)("date");
	const [sortOrder] = (0, import_react.useState)("desc");
	const [pageSize, setPageSize] = (0, import_react.useState)(10);
	const [currentPage, setCurrentPage] = (0, import_react.useState)(1);
	const filters = {
		search,
		status: statusFilter,
		from_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : void 0,
		to_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : void 0
	};
	const { data: rawInvoices = [], isLoading } = useQuery(invoicesQueryOptions(filters));
	const invoices = Array.isArray(rawInvoices) ? rawInvoices : [];
	const allBillsCount = invoices.length;
	const allBillsTotal = invoices.reduce((acc, curr) => acc + curr.total_amount, 0);
	const paidInvoices = invoices.filter((inv) => inv.status === "Paid");
	const paidCount = paidInvoices.length;
	const paidTotal = paidInvoices.reduce((acc, curr) => acc + curr.total_amount, 0);
	const pendingInvoices = invoices.filter((inv) => inv.status === "Pending" || inv.status === "Partially Paid");
	const pendingCount = pendingInvoices.length;
	const pendingTotal = pendingInvoices.reduce((acc, curr) => acc + curr.due_amount, 0);
	const cancelledInvoices = invoices.filter((inv) => inv.status === "Cancelled");
	const cancelledCount = cancelledInvoices.length;
	const cancelledTotal = cancelledInvoices.reduce((acc, curr) => acc + curr.total_amount, 0);
	const sortedInvoices = [...invoices].sort((a, b) => {
		if (sortField === "date") {
			const timeA = new Date(a.bill_date).getTime();
			const timeB = new Date(b.bill_date).getTime();
			return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
		} else return sortOrder === "desc" ? b.total_amount - a.total_amount : a.total_amount - b.total_amount;
	});
	const totalFilteredCount = sortedInvoices.length;
	const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
	const validCurrentPage = Math.min(currentPage, totalPages);
	const startIndex = (validCurrentPage - 1) * pageSize;
	const paginatedInvoices = sortedInvoices.slice(startIndex, startIndex + pageSize);
	const handleExportCSV = () => {
		if (sortedInvoices.length === 0) {
			toast.error("No billing history records to export.");
			return;
		}
		exportBillingHistoryCSV(sortedInvoices);
		toast.success(`Exported ${sortedInvoices.length} billing history records to CSV!`);
	};
	const resetFilters = () => {
		setSearch("");
		setStatusFilter("all");
		setDateRange(void 0);
	};
	const getStatusBadge = (status) => {
		switch (status) {
			case "Paid": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-900/60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-emerald-500" }), "Paid"]
			});
			case "Partially Paid": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200/80 dark:border-blue-900/60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-blue-500" }), "Partially Paid"]
			});
			case "Pending": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/80 dark:border-amber-900/60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-amber-500" }), "Pending"]
			});
			case "Cancelled": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-slate-400" }), "Cancelled"]
			});
			default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: status });
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-2 rounded-xl bg-[#67B239]/10 text-[#67B239]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-bold tracking-tight text-foreground",
						children: "Billing History & Audit Trail"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs sm:text-sm text-muted-foreground mt-1",
					children: "Complete searchable audit ledger of all client invoices and payments."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					className: "gap-1.5 text-xs font-medium h-9 rounded-xl self-start sm:self-auto bg-white dark:bg-card border-slate-200 dark:border-border",
					onClick: handleExportCSV,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5 text-[#67B239]" }), "Export CSV"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "All Bills",
						value: String(allBillsCount),
						hint: `Total: ${formatCurrency(allBillsTotal)}`,
						icon: Receipt,
						colorScheme: "pastelPurple"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Paid Bills",
						value: String(paidCount),
						hint: `Cleared: ${formatCurrency(paidTotal)}`,
						icon: CircleCheck,
						colorScheme: "pastelEmerald"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Pending / Due",
						value: String(pendingCount),
						hint: `Outstanding: ${formatCurrency(pendingTotal)}`,
						icon: Clock,
						colorScheme: "pastelPeach"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Cancelled Bills",
						value: String(cancelledCount),
						hint: `Cancelled: ${formatCurrency(cancelledTotal)}`,
						icon: CircleX,
						colorScheme: "pastelTeal"
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
							placeholder: "Search client, business, invoice #...",
							value: search,
							onChange: (e) => {
								setSearch(e.target.value);
								setCurrentPage(1);
							},
							className: "pl-9 pr-8 h-9 text-xs sm:text-sm bg-white dark:bg-card rounded-xl border-slate-200 dark:border-border"
						}),
						search && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setSearch("");
								setCurrentPage(1);
							},
							className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: statusFilter,
							onValueChange: (val) => {
								setStatusFilter(val);
								setCurrentPage(1);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
								className: "flex-1 sm:flex-none sm:w-40 h-9 text-xs rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-3.5 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Statuses" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All Statuses"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Pending",
									children: "Pending"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Partially Paid",
									children: "Partially Paid"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Paid",
									children: "Paid"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Cancelled",
									children: "Cancelled"
								})
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
							open: calOpen,
							onOpenChange: setCalOpen,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									className: `flex-1 sm:flex-none h-9 px-3 text-xs font-normal rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border gap-2 ${dateRange?.from ? "text-foreground font-medium" : "text-muted-foreground"}`,
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
										setCurrentPage(1);
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
											setCurrentPage(1);
											setCalOpen(false);
										},
										children: "Clear dates"
									})
								})]
							})]
						}),
						(search || statusFilter !== "all" || dateRange) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "icon",
							onClick: resetFilters,
							title: "Reset Filters",
							className: "h-9 w-9 rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border text-muted-foreground hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "bg-white dark:bg-card border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "py-3 px-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-muted/20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								className: "text-sm font-semibold text-foreground",
								children: [
									"Billing Ledger History (",
									totalFilteredCount,
									")"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
								className: "text-xs",
								children: [
									"Showing ",
									totalFilteredCount > 0 ? startIndex + 1 : 0,
									"–",
									Math.min(startIndex + pageSize, totalFilteredCount),
									" of ",
									totalFilteredCount,
									" bills"
								]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "hidden md:block overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left border-collapse text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-muted/40 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "Client"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "Client ID"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "Total Amount"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "Paid Amount"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "Due Amount"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "Description"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "Bill Date"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "Status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "Created By"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "Created At"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-slate-100 dark:divide-slate-800/80",
								children: isLoading ? Array.from({ length: 5 }).map((_, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									colSpan: 10,
									className: "py-4 px-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full rounded-lg" })
								}) }, idx)) : paginatedInvoices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									colSpan: 10,
									className: "py-12 text-center text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-8 mx-auto text-slate-300 mb-2" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-foreground",
											children: "No billing history records found"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground mt-0.5",
											children: "Adjust your search terms or date range filters."
										})
									]
								}) }) : paginatedInvoices.map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-3 px-4 max-w-44",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-semibold text-foreground truncate",
												children: inv.prospect_name
											}), inv.business_name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] text-muted-foreground truncate",
												children: inv.business_name
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-3 px-4 whitespace-nowrap font-mono text-slate-500 text-[11px]",
											children: ["#", inv.prospect_id]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-4 whitespace-nowrap font-mono font-bold text-foreground",
											children: formatCurrency(inv.total_amount)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-4 whitespace-nowrap font-mono font-semibold text-emerald-600 dark:text-emerald-400",
											children: formatCurrency(inv.paid_amount)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-4 whitespace-nowrap font-mono font-semibold",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: inv.due_amount > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-400",
												children: formatCurrency(inv.due_amount)
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-4 max-w-48",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "line-clamp-1 text-muted-foreground text-xs",
												title: inv.description,
												children: inv.description
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-4 whitespace-nowrap font-mono text-slate-600 dark:text-slate-400 text-xs",
											children: inv.bill_date
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-4 whitespace-nowrap",
											children: getStatusBadge(inv.status)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-4 whitespace-nowrap font-medium text-foreground text-xs",
											children: inv.created_by_name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-4 whitespace-nowrap text-muted-foreground font-mono text-[11px]",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(inv.created_at).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric"
												}) })]
											})
										})
									]
								}, inv.id))
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "block md:hidden divide-y divide-slate-100 dark:divide-slate-800",
						children: paginatedInvoices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "py-8 text-center text-muted-foreground text-xs p-4",
							children: "No billing history records match your filters."
						}) : paginatedInvoices.map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 space-y-2.5 text-xs hover:bg-slate-50 dark:hover:bg-muted/30",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono font-bold text-foreground",
										children: inv.invoice_number
									}), getStatusBadge(inv.status)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-semibold text-foreground text-sm",
									children: [
										inv.prospect_name,
										" ",
										inv.business_name ? `(${inv.business_name})` : ""
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground text-xs line-clamp-2",
									children: inv.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-3 gap-2 bg-slate-50/80 dark:bg-muted/30 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 font-mono text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] uppercase font-semibold text-muted-foreground block",
											children: "Total"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold text-foreground",
											children: formatCurrency(inv.total_amount)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] uppercase font-semibold text-muted-foreground block",
											children: "Paid"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold text-emerald-600",
											children: formatCurrency(inv.paid_amount)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] uppercase font-semibold text-muted-foreground block",
											children: "Due"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold text-rose-600",
											children: formatCurrency(inv.due_amount)
										})] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-[11px] text-muted-foreground pt-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Bill Date: ", inv.bill_date] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["By: ", inv.created_by_name] })]
								})
							]
						}, inv.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800/80 gap-3 text-xs bg-slate-50/30 dark:bg-muted/10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Rows per page:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: String(pageSize),
								onValueChange: (val) => {
									setPageSize(Number(val));
									setCurrentPage(1);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "w-16 h-7 text-xs rounded-lg bg-white dark:bg-card border-slate-200 dark:border-border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "10" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "10",
										children: "10"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "20",
										children: "20"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "50",
										children: "50"
									})
								] })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between sm:justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									"Page ",
									validCurrentPage,
									" of ",
									totalPages
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									className: "h-7 w-7 p-0 rounded-lg bg-white dark:bg-card border-slate-200 dark:border-border",
									disabled: validCurrentPage <= 1,
									onClick: () => setCurrentPage((prev) => Math.max(1, prev - 1)),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-3.5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									className: "h-7 w-7 p-0 rounded-lg bg-white dark:bg-card border-slate-200 dark:border-border",
									disabled: validCurrentPage >= totalPages,
									onClick: () => setCurrentPage((prev) => Math.min(totalPages, prev + 1)),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5" })
								})]
							})]
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { BillingHistoryPage as component };
