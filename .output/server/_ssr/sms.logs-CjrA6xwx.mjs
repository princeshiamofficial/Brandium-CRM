import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { a as CardTitle, i as CardHeader, r as CardDescription, t as Card } from "./card-CtX3ithx.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { $t as Building2, At as Clock, Bt as CircleAlert, Ht as ChevronRight, St as ExternalLink, U as PhoneCall, Ut as ChevronLeft, Yt as Calendar, Z as MessagesSquare, k as Search, l as User, r as X, s as Users, zt as CircleCheck } from "../_libs/lucide-react.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as agentOptionsQueryOptions } from "./won-sales-CZnnHU4y.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-Cmlz_mk1.mjs";
import { l as format } from "../_libs/date-fns.mjs";
import { t as Calendar$1 } from "./calendar-BkciPy-j.mjs";
import { a as smsLogsQueryOptions } from "./sms-xtUGh48A.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sms.logs-CjrA6xwx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SmsLogsPage() {
	const [search, setSearch] = (0, import_react.useState)("");
	const [agentFilter, setAgentFilter] = (0, import_react.useState)("all");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [dateRange, setDateRange] = (0, import_react.useState)(void 0);
	const [calOpen, setCalOpen] = (0, import_react.useState)(false);
	const [pageSize, setPageSize] = (0, import_react.useState)(10);
	const [currentPage, setCurrentPage] = (0, import_react.useState)(1);
	const { data: rawSmsLogs = [], isLoading } = useQuery(smsLogsQueryOptions());
	const { data: rawAgents = [] } = useQuery(agentOptionsQueryOptions());
	const smsLogs = Array.isArray(rawSmsLogs) ? rawSmsLogs : [];
	const agents = Array.isArray(rawAgents) ? rawAgents : [];
	const filteredLogs = smsLogs.filter((log) => {
		if (statusFilter !== "all" && log.status !== statusFilter) return false;
		if (agentFilter !== "all") {
			const matchAgent = agents.find((a) => a.id === agentFilter);
			if (matchAgent && log.sent_by_name !== matchAgent.name) return false;
		}
		if (dateRange?.from) {
			const fromStr = format(dateRange.from, "yyyy-MM-dd");
			if (log.created_at.substring(0, 10) < fromStr) return false;
		}
		if (dateRange?.to) {
			const toStr = format(dateRange.to, "yyyy-MM-dd");
			if (log.created_at.substring(0, 10) > toStr) return false;
		}
		if (search && search.trim() !== "") {
			const q = search.toLowerCase().trim();
			const matchRecipient = log.recipient_name && log.recipient_name.toLowerCase().includes(q) || log.prospect_name && log.prospect_name.toLowerCase().includes(q);
			const matchPhone = log.recipient_phone.includes(q);
			const matchMsg = log.message.toLowerCase().includes(q);
			const matchSender = log.sent_by_name.toLowerCase().includes(q);
			const matchRole = log.sender_role ? log.sender_role.toLowerCase().includes(q) : false;
			const matchApiId = log.api_response_id.toLowerCase().includes(q);
			const matchPayload = log.provider_response ? log.provider_response.toLowerCase().includes(q) : false;
			return matchRecipient || matchPhone || matchMsg || matchSender || matchRole || matchApiId || matchPayload;
		}
		return true;
	});
	const totalFilteredCount = filteredLogs.length;
	const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
	const validCurrentPage = Math.min(currentPage, totalPages);
	const startIndex = (validCurrentPage - 1) * pageSize;
	const paginatedLogs = filteredLogs.slice(startIndex, startIndex + pageSize);
	const getStatusBadge = (status) => {
		switch (status) {
			case "Sent": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				className: "bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-2 py-0.5 gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3" }), "Sent"]
			});
			case "Pending": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				className: "bg-amber-500 hover:bg-amber-600 text-white text-[10px] px-2 py-0.5 gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3" }), "Pending"]
			});
			case "Failed": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				className: "bg-red-600 hover:bg-red-700 text-white text-[10px] px-2 py-0.5 gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-3" }), "Failed"]
			});
			default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "outline",
				children: status
			});
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "text-2xl font-bold tracking-tight text-foreground flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessagesSquare, { className: "size-6 text-[#67B239]" }), "SMS Delivery Logs Audit"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-0.5",
				children: "Full compliance record of every Single and Bulk SMS attempt dispatched from Brandium CRM."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: agentFilter,
						onValueChange: (val) => {
							setAgentFilter(val);
							setCurrentPage(1);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
							className: "w-42.5 bg-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Agents" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: "All Agents"
						}), agents.map((ag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: ag.id,
							children: ag.name
						}, ag.id))] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative max-w-sm flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Search name, business, phone...",
								value: search,
								onChange: (e) => {
									setSearch(e.target.value);
									setCurrentPage(1);
								},
								className: "pl-8 text-xs bg-white"
							}),
							search && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setSearch("");
									setCurrentPage(1);
								},
								className: "absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: statusFilter,
						onValueChange: (val) => {
							setStatusFilter(val);
							setCurrentPage(1);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-36 bg-white",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Statuses" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
								value: "all",
								children: [
									"All Statuses (",
									totalFilteredCount,
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "Sent",
								children: "Sent"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "Pending",
								children: "Pending"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "Failed",
								children: "Failed"
							})
						] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
						open: calOpen,
						onOpenChange: setCalOpen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: "bg-white text-xs h-9 justify-start text-left font-normal gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3.5 text-muted-foreground" }), dateRange?.from ? dateRange.to ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									format(dateRange.from, "LLL dd"),
									" – ",
									format(dateRange.to, "LLL dd")
								] }) : format(dateRange.from, "LLL dd, yyyy") : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Date Range" })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
							className: "w-auto p-0",
							align: "end",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
								initialFocus: true,
								mode: "range",
								selected: dateRange,
								onSelect: (range) => {
									setDateRange(range);
									setCurrentPage(1);
									if (range?.to) setCalOpen(false);
								},
								numberOfMonths: 2
							}), dateRange && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
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
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "bg-white dark:bg-card border-slate-200/80 shadow-xs overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "py-3.5 px-4 border-b bg-slate-50/60 dark:bg-muted/40",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-sm font-bold text-foreground",
								children: "SMS Attempts Audit Table"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
								className: "text-xs",
								children: [
									"Showing ",
									totalFilteredCount > 0 ? startIndex + 1 : 0,
									"–",
									Math.min(startIndex + pageSize, totalFilteredCount),
									" of ",
									totalFilteredCount,
									" records"
								]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left border-collapse text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b bg-slate-50/80 dark:bg-muted/50 font-semibold text-muted-foreground uppercase tracking-wider",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "Recipient"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "Phone Number"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "SMS Message Content"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "Sender Agent"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "Status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "Date & Time"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-border/60",
								children: isLoading ? Array.from({ length: 5 }).map((_, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									colSpan: 6,
									className: "py-4 px-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full rounded" })
								}) }, idx)) : paginatedLogs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									colSpan: 6,
									className: "py-12 text-center text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessagesSquare, { className: "size-8 mx-auto text-slate-300 mb-2" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-foreground",
											children: "No SMS logs match your filters"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground mt-0.5",
											children: "Try clearing search or changing status filter."
										})
									]
								}) }) : paginatedLogs.map((log) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-3.5 px-4 max-w-48",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-semibold text-foreground truncate",
												children: log.recipient_name || log.prospect_name || "Prospect Recipient"
											}), log.prospect_id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "link",
												size: "sm",
												className: "h-auto p-0 text-[11px] text-[#67B239] hover:underline gap-0.5 mt-0.5",
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
													to: "/prospects",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-3" }),
														"View Prospect Profile",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-2.5" })
													]
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 whitespace-nowrap",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
												href: `tel:${log.recipient_phone}`,
												className: "font-mono text-slate-700 dark:text-slate-300 hover:text-[#67B239] flex items-center gap-1 font-semibold",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneCall, { className: "size-3 text-emerald-600" }), log.recipient_phone]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 max-w-64",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "line-clamp-2 text-foreground/90 leading-relaxed",
												title: log.message,
												children: [
													"\"",
													log.message,
													"\""
												]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 whitespace-nowrap",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "font-medium text-foreground flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3.5 text-blue-600" }), log.sent_by_name]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 whitespace-nowrap",
											children: getStatusBadge(log.status)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 whitespace-nowrap text-muted-foreground font-mono text-[11px]",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3 text-slate-400" }),
													new Date(log.created_at).toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
														year: "numeric"
													}),
													" ",
													new Date(log.created_at).toLocaleTimeString("en-US", {
														hour: "2-digit",
														minute: "2-digit"
													})
												]
											})
										})
									]
								}, log.id))
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-t gap-3 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Rows per page:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: String(pageSize),
								onValueChange: (val) => {
									setPageSize(Number(val));
									setCurrentPage(1);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "w-16 h-7 text-xs",
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
									className: "h-7 w-7 p-0",
									disabled: validCurrentPage <= 1,
									onClick: () => setCurrentPage((prev) => Math.max(1, prev - 1)),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-3.5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									className: "h-7 w-7 p-0",
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
export { SmsLogsPage as component };
