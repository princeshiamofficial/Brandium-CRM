import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { D as ShieldAlert, H as Phone, It as CirclePlus, Yt as Calendar, bt as Eye, cn as ArrowRightLeft, ct as Layers, ht as FileText, k as Search, l as User, r as X, s as Users, sn as ArrowRight, ut as History, wt as EllipsisVertical, zt as CircleCheck } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B85j8UA0.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as agentOptionsQueryOptions } from "./won-sales-C_keZqny.mjs";
import { n as useAuth } from "./auth-vDqZlo-r.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { d as DropdownMenuTrigger, i as DropdownMenuItem, n as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu-BfBJVxb8.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-Cmlz_mk1.mjs";
import { l as format } from "../_libs/date-fns.mjs";
import { t as Calendar$1 } from "./calendar-BkciPy-j.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as FollowUpDialog } from "./follow-up-dialog-DbICGoVN.mjs";
import { i as stageHistoryForProspectQueryOptions, r as deniedPaymentsQueryOptions, t as changeDeniedPaymentStage } from "./denied-payments-EkXHEvWB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/denied-payments-DKTaUwjF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STAGE_OPTIONS = [
	{
		value: "Negotiation",
		label: "Negotiation (Re-evaluating Pricing & Terms)"
	},
	{
		value: "Follow Up",
		label: "Follow Up (Scheduled Call / Re-engagement)"
	},
	{
		value: "Closed Won",
		label: "Closed Won (Payment Recovered & Resolved)"
	},
	{
		value: "Closed Lost",
		label: "Closed Lost (Written Off / Deal Cancelled)"
	},
	{
		value: "Denied Payment",
		label: "Denied Payment (Keep Pending Attention)"
	}
];
function DeniedPaymentChangeStageModal({ open, onOpenChange, record }) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [newStage, setNewStage] = (0, import_react.useState)("Negotiation");
	const [note, setNote] = (0, import_react.useState)("");
	const changeMutation = useMutation({
		mutationFn: async () => {
			if (!record) return;
			return changeDeniedPaymentStage({
				deniedPaymentId: record.id,
				prospectId: record.prospect_id,
				newStage,
				note: note || `Stage updated from ${record.current_stage} to ${newStage}`,
				changedByUserId: user?.id || null,
				changedByUserName: user?.email || "Current Agent"
			});
		},
		onSuccess: () => {
			toast.success(`Stage updated to "${newStage}". Stage history recorded automatically!`);
			queryClient.invalidateQueries({ queryKey: ["denied-payments"] });
			queryClient.invalidateQueries({ queryKey: ["stage-history-prospect"] });
			onOpenChange(false);
			setNote("");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update stage history.");
		}
	});
	if (!record) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2 text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "size-5 text-[#67B239]" }), "Change Stage & Log History"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					"Updating stage for ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
						className: "text-foreground",
						children: record.prospect_name
					}),
					" (",
					record.business_name || record.service,
					"). Changing out of Denied Payment will automatically record a permanent stage history entry."
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-3 text-xs flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-amber-800 dark:text-amber-300 font-medium",
								children: "Current Stage:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-amber-900 dark:text-amber-200",
								children: record.current_stage
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "new_stage",
								className: "text-xs font-semibold",
								children: "Select New Stage"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: newStage,
								onValueChange: setNewStage,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "new_stage",
									className: "w-full text-xs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select target stage..." })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: STAGE_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: opt.value,
									className: "text-xs",
									children: opt.label
								}, opt.value)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "transition_note",
								className: "text-xs font-semibold",
								children: "Stage History Note (Mandatory Reason)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "transition_note",
								placeholder: "Detail the agreement, resolution terms, or discount offered to move out of Denied Payment...",
								rows: 3,
								value: note,
								onChange: (e) => setNote(e.target.value),
								className: "text-xs"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => onOpenChange(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5",
					disabled: changeMutation.isPending,
					onClick: () => changeMutation.mutate(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), changeMutation.isPending ? "Recording Stage..." : "Save Stage & History"]
				})] })
			]
		})
	});
}
function DeniedPaymentStageHistoryModal({ open, onOpenChange, record }) {
	const prospectIdKey = record?.prospect_id || (record?.id ? `prospect-${record.id}` : "");
	const { data: historyList, isLoading } = useQuery({
		...stageHistoryForProspectQueryOptions(prospectIdKey),
		enabled: open && Boolean(prospectIdKey)
	});
	if (!record) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
				className: "flex items-center gap-2 text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-5 text-[#67B239]" }), "Stage Transition History"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
				"Audit log of all stage changes for",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
					className: "text-foreground",
					children: record.prospect_name
				}),
				" (",
				record.business_name || record.phone,
				")"
			] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "py-2 space-y-4 max-h-[60vh] overflow-y-auto pr-1",
				children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-lg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-lg" })]
				}) : !historyList || historyList.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-8 text-center text-muted-foreground text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-8 mx-auto text-slate-300 mb-2" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold text-foreground",
							children: "No stage history recorded yet"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground mt-0.5",
							children: "Stage transitions will be logged automatically when stage changes occur."
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6",
					children: historyList.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative pl-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -left-2 top-1 size-4 rounded-full bg-[#67B239] border-2 border-white dark:border-slate-900 shadow-xs" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-card p-3 space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5 text-xs font-semibold",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "bg-white dark:bg-background text-slate-700 dark:text-slate-300",
												children: item.from_stage_name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3 text-muted-foreground" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												className: "bg-[#67B239] hover:bg-[#5aa030] text-white",
												children: item.to_stage_name
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1 text-[11px] text-muted-foreground font-mono",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3" }),
											new Date(item.changed_at).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric"
											}),
											" ",
											new Date(item.changed_at).toLocaleTimeString("en-US", {
												hour: "2-digit",
												minute: "2-digit"
											})
										]
									})]
								}),
								item.note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-foreground/90 bg-white dark:bg-background p-2 rounded border border-slate-100 dark:border-slate-800/80",
									children: [
										"\"",
										item.note,
										"\""
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 text-[11px] text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3 text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Updated by: ", item.changed_by_name || "Agent"] })]
								})
							]
						})]
					}, item.id))
				})
			})]
		})
	});
}
function DeniedPaymentsPage() {
	const [search, setSearch] = (0, import_react.useState)("");
	const [agentFilter, setAgentFilter] = (0, import_react.useState)("all");
	const [stageFilter, setStageFilter] = (0, import_react.useState)("all");
	const [dateRange, setDateRange] = (0, import_react.useState)(void 0);
	const [calOpen, setCalOpen] = (0, import_react.useState)(false);
	const [followUpRecord, setFollowUpRecord] = (0, import_react.useState)(null);
	const [followUpOpen, setFollowUpOpen] = (0, import_react.useState)(false);
	const [changeStageRecord, setChangeStageRecord] = (0, import_react.useState)(null);
	const [changeStageOpen, setChangeStageOpen] = (0, import_react.useState)(false);
	const [historyRecord, setHistoryRecord] = (0, import_react.useState)(null);
	const [historyOpen, setHistoryOpen] = (0, import_react.useState)(false);
	const filters = {
		search,
		agent_id: agentFilter,
		current_stage: stageFilter,
		from_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : void 0,
		to_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : void 0
	};
	const { data: rawDeniedPayments = [], isLoading } = useQuery(deniedPaymentsQueryOptions(filters));
	const { data: rawAgents = [] } = useQuery(agentOptionsQueryOptions());
	const deniedPayments = Array.isArray(rawDeniedPayments) ? rawDeniedPayments : [];
	const agents = Array.isArray(rawAgents) ? rawAgents : [];
	const attentionCount = deniedPayments.filter((item) => item.current_stage === "Denied Payment").length;
	deniedPayments.reduce((acc, curr) => acc + curr.amount, 0);
	const handleOpenFollowUp = (record) => {
		setFollowUpRecord(record);
		setFollowUpOpen(true);
	};
	const handleOpenChangeStage = (record) => {
		setChangeStageRecord(record);
		setChangeStageOpen(true);
	};
	const handleOpenHistory = (record) => {
		setHistoryRecord(record);
		setHistoryOpen(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "text-2xl font-bold tracking-tight text-foreground flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-6 text-red-600 dark:text-red-500" }), "Denied Payments"]
					}), attentionCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full",
						children: [attentionCount, " Action Required"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Track, follow up, and transition clients who declined or denied payments."
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative min-w-50 max-w-sm flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Search name, business, phone...",
								value: search,
								onChange: (e) => setSearch(e.target.value),
								className: "pl-8.5 bg-white"
							}),
							search && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setSearch(""),
								className: "absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: stageFilter,
						onValueChange: (val) => setStageFilter(val),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-42.5 bg-white",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 truncate",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Stages" })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All Stages"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "Denied Payment",
								children: "Denied Payment"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "Negotiation",
								children: "Negotiation"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "Follow Up",
								children: "Follow Up"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "Closed Won",
								children: "Closed Won"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "Closed Lost",
								children: "Closed Lost"
							})
						] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
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
					})]
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
			}) : deniedPayments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-12 text-center text-muted-foreground shadow-2xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-10 mx-auto text-slate-300 mb-2.5" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-bold text-foreground text-base",
						children: "No denied payments found"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-1 max-w-sm mx-auto",
						children: "All clients are in good standing or adjust your search terms and filters."
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
				children: deniedPayments.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between select-none",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 pb-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug truncate group-hover:text-red-600 transition-colors",
										children: item.business_name || item.prospect_name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm font-bold text-red-600 dark:text-red-400 mt-0.5 font-mono",
										children: ["৳", Number(item.amount).toLocaleString()]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-6 sm:size-7 rounded-full bg-red-600 flex items-center justify-center shrink-0 text-white shadow-2xs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-4 stroke-[2.5]" })
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-medium text-slate-800 dark:text-slate-200 truncate",
										children: [
											item.prospect_name,
											" ",
											item.service ? `• ${item.service}` : ""
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: `tel:${item.phone}`,
										className: "font-mono text-slate-800 dark:text-slate-200 hover:text-red-600 transition-colors",
										children: item.phone
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-[#FCE8E2] dark:bg-rose-950/40 px-4 py-3 text-xs space-y-2 border-y border-[#F8D4C8] dark:border-rose-900/50",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4 text-slate-600 dark:text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Assigned:" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-slate-900 dark:text-slate-100 truncate max-w-36",
										children: item.agent_name
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-4 text-slate-600 dark:text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Denied by:" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-red-700 dark:text-red-300 truncate max-w-36",
										children: item.denied_by
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-4 text-slate-600 dark:text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Denied on:" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-slate-900 dark:text-slate-100",
										children: format(new Date(item.denied_at), "MMM d, yyyy")
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 pt-3 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5 text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Denial Reason" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: item.current_stage === "Denied Payment" ? "destructive" : "outline",
									className: "text-[10px] px-1.5 py-0 font-semibold",
									children: item.current_stage
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-[#ECEEF0] dark:bg-slate-800/70 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300 min-h-16 flex items-start",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "line-clamp-3 leading-relaxed",
									children: item.denial_reason ? `"${item.denial_reason}"` : "No specific denial reason provided."
								})
							})]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4 pt-0 pb-3.5 flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								className: "flex-1 h-8 bg-[#67B239] hover:bg-[#589c2f] text-white text-xs font-semibold rounded-xl gap-1.5 shadow-xs",
								onClick: () => handleOpenFollowUp(item),
								title: "Schedule Follow-up task",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "size-3.5" }), "Follow Up"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								className: "h-8 px-2.5 bg-amber-50/80 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/60 hover:bg-amber-100 gap-1 text-xs font-semibold rounded-xl",
								onClick: () => handleOpenChangeStage(item),
								title: "Change Stage",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "size-3.5" }), "Stage"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									className: "size-8 p-0 text-slate-500 dark:text-slate-400 hover:text-foreground rounded-xl border border-slate-200/80 dark:border-slate-800 shrink-0",
									title: "More actions",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "size-3.5" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								align: "end",
								className: "w-44",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: () => handleOpenHistory(item),
									className: "cursor-pointer gap-2 text-xs font-medium",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-3.5 text-slate-500" }), "Stage History"]
								}), item.prospect_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
									asChild: true,
									className: "cursor-pointer gap-2 text-xs font-medium",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/prospects",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5 text-slate-500" }), "View Prospect"]
									})
								}) : null]
							})] })
						]
					})]
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FollowUpDialog, {
				open: followUpOpen,
				onOpenChange: setFollowUpOpen,
				prospectId: followUpRecord?.prospect_id || "",
				prospectLabel: followUpRecord ? `${followUpRecord.prospect_name} (${followUpRecord.business_name || followUpRecord.service})` : ""
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeniedPaymentChangeStageModal, {
				open: changeStageOpen,
				onOpenChange: setChangeStageOpen,
				record: changeStageRecord
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeniedPaymentStageHistoryModal, {
				open: historyOpen,
				onOpenChange: setHistoryOpen,
				record: historyRecord
			})
		]
	});
}
//#endregion
export { DeniedPaymentsPage as component };
