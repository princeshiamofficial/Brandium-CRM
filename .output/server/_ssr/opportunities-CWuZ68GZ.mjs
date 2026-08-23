import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { n as CardContent, t as Card } from "./card-CtX3ithx.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { At as Clock, Ct as Ellipsis, Et as DollarSign, H as Phone, Ht as ChevronRight, Nt as CircleX, Pt as CircleSlash, Ut as ChevronLeft, W as Pencil, Yt as Calendar, _ as TrendingUp, bt as Eye, ct as Layers, ht as FileText, k as Search, l as User, on as BadgeCheck, r as X, s as Users, v as Trash2, y as Target } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B85j8UA0.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { n as queryOptions, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as supabase } from "./client-zNIm7ljR.mjs";
import { n as useAuth } from "./auth-CKa-otva.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { a as DropdownMenuLabel, c as DropdownMenuSub, d as DropdownMenuTrigger, i as DropdownMenuItem, l as DropdownMenuSubContent, n as DropdownMenuContent, o as DropdownMenuPortal, s as DropdownMenuSeparator, t as DropdownMenu, u as DropdownMenuSubTrigger } from "./dropdown-menu-BfBJVxb8.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-Cmlz_mk1.mjs";
import { l as format } from "../_libs/date-fns.mjs";
import { t as Calendar$1 } from "./calendar-BkciPy-j.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as agentsQuery } from "./follow-ups-Dro_lrtZ.mjs";
import { t as l } from "../_libs/use-debounce.mjs";
import { a as opportunitySummaryQuery, c as useUpdateOpportunityStatus, i as opportunitiesQuery, n as REJECTED_STAGES, o as useCreateOpportunity, r as Route, s as useSoftDeleteOpportunity, t as PIPELINE_STAGES } from "./opportunities-CAbhA4OR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/opportunities-CWuZ68GZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var prospectOptionsQuery = () => queryOptions({
	queryKey: ["prospect-options"],
	queryFn: async () => {
		const { data, error } = await supabase.from("prospects").select("id, contact_name, business_name").order("created_at", { ascending: false }).limit(200);
		if (error) return [];
		return data ?? [];
	}
});
function OpportunityDialog({ open, onOpenChange, defaultProspectId }) {
	const { user, profile, isAdmin } = useAuth();
	const createMutation = useCreateOpportunity();
	const prospects = useQuery({
		...prospectOptionsQuery(),
		enabled: open
	});
	const agents = useQuery({
		...agentsQuery(),
		enabled: open
	});
	const agentList = (0, import_react.useMemo)(() => {
		const rawAgents = agents.data ?? [];
		return [...user ? [{
			id: user.id,
			name: `${profile?.full_name || user.email || "Current User"} (Me)`
		}] : [], ...rawAgents].filter((v, i, self) => i === self.findIndex((t) => t.id === v.id));
	}, [
		user,
		profile?.full_name,
		agents.data
	]);
	const [prospectId, setProspectId] = (0, import_react.useState)(defaultProspectId ?? "");
	const [estimatedValue, setEstimatedValue] = (0, import_react.useState)("50000");
	const [assignedTo, setAssignedTo] = (0, import_react.useState)(user?.id ?? "");
	const [status, setStatus] = (0, import_react.useState)("Opportunity Created");
	const [notes, setNotes] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setProspectId(defaultProspectId ?? "");
		setEstimatedValue("50000");
		setStatus("Opportunity Created");
		setNotes("");
		if (user?.id) setAssignedTo(user.id);
		else if (agentList.length > 0 && agentList[0]) setAssignedTo(agentList[0].id);
	}, [
		open,
		defaultProspectId,
		user?.id,
		agentList
	]);
	const submit = () => {
		if (!prospectId) {
			toast.error("Please select a prospect.");
			return;
		}
		const val = parseFloat(estimatedValue);
		if (isNaN(val) || val < 0) {
			toast.error("Enter a valid estimated monetary value.");
			return;
		}
		if (!user?.id) {
			toast.error("User session missing.");
			return;
		}
		createMutation.mutate({
			prospect_id: prospectId,
			estimated_value: val,
			assigned_to: assignedTo || user.id,
			created_by: user.id,
			status,
			notes: notes.trim() || void 0
		}, {
			onSuccess: () => {
				toast.success("Opportunity created successfully!");
				onOpenChange(false);
			},
			onError: (error) => toast.error(error.message)
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create Opportunity" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Identify and track a new sales deal in your pipeline." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 pt-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "opp-prospect",
								children: "Prospect"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: prospectId,
								onValueChange: setProspectId,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "opp-prospect",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select prospect" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (prospects.data ?? []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: String(p["id"]),
									children: p["business_name"] ? `${String(p["contact_name"])} — ${String(p["business_name"])}` : String(p["contact_name"] ?? "")
								}, String(p["id"]))) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "opp-value",
								children: "Estimated Value (৳)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "opp-value",
								type: "number",
								min: "0",
								step: "500",
								value: estimatedValue,
								onChange: (e) => setEstimatedValue(e.target.value),
								placeholder: "e.g. 50000"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Assigned Agent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: assignedTo || (agentList[0]?.id ?? ""),
								onValueChange: setAssignedTo,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select agent" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: agentList.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: a.id,
									children: a.name
								}, a.id)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Initial Pipeline Stage" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: status,
								onValueChange: (val) => setStatus(val),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select stage" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PIPELINE_STAGES.slice(0, 4).map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: st,
									children: st
								}, st)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "opp-notes",
								children: "Notes / Deal Context"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "opp-notes",
								value: notes,
								onChange: (e) => setNotes(e.target.value),
								placeholder: "What service or package is this prospect interested in?",
								rows: 3
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: submit,
					disabled: createMutation.isPending,
					children: createMutation.isPending ? "Creating..." : "Create Opportunity"
				})] })
			]
		})
	});
}
var getStageBadgeStyle = (status) => {
	const s = (status || "").toLowerCase();
	if (s.includes("won") || s.includes("closed")) return "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/70";
	if (s.includes("lost") || s.includes("denied")) return "bg-rose-100/90 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/70";
	if (s.includes("dnp") || s.includes("pursue")) return "bg-slate-200/90 text-slate-800 dark:bg-slate-800/90 dark:text-slate-200 border border-slate-300/70";
	if (s.includes("negotiat")) return "bg-orange-100/90 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-200/70";
	if (s.includes("proposal") || s.includes("quote")) return "bg-amber-100/90 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/70";
	if (s.includes("follow") || s.includes("contact") || s.includes("meet")) return "bg-cyan-100/90 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border border-cyan-200/70";
	if (s.includes("created") || s.includes("opportunity")) return "bg-indigo-100/90 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/70";
	return "bg-purple-100/90 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/70";
};
function StatCard({ label, value, icon: Icon, loading, active, onClick, variant = "purple" }) {
	const variantStyles = {
		purple: {
			bg: "bg-[#F3E8FF] dark:bg-purple-950/40",
			iconText: "text-purple-600 dark:text-purple-300",
			watermark: "text-purple-600/12 dark:text-purple-400/12"
		},
		teal: {
			bg: "bg-[#E6F7F5] dark:bg-teal-950/40",
			iconText: "text-teal-600 dark:text-teal-300",
			watermark: "text-teal-600/12 dark:text-teal-400/12"
		},
		green: {
			bg: "bg-[#EBF7E7] dark:bg-emerald-950/40",
			iconText: "text-emerald-600 dark:text-emerald-300",
			watermark: "text-emerald-600/12 dark:text-emerald-400/12"
		},
		coral: {
			bg: "bg-[#FFF0E6] dark:bg-orange-950/40",
			iconText: "text-orange-600 dark:text-orange-300",
			watermark: "text-orange-600/12 dark:text-orange-400/12"
		},
		yellow: {
			bg: "bg-[#FFF9E5] dark:bg-amber-950/40",
			iconText: "text-amber-600 dark:text-amber-300",
			watermark: "text-amber-600/12 dark:text-amber-400/12"
		},
		default: {
			bg: "bg-[#F3E8FF] dark:bg-purple-950/40",
			iconText: "text-purple-600 dark:text-purple-300",
			watermark: "text-purple-600/12 dark:text-purple-400/12"
		},
		active: {
			bg: "bg-[#E6F7F5] dark:bg-teal-950/40",
			iconText: "text-teal-600 dark:text-teal-300",
			watermark: "text-teal-600/12 dark:text-teal-400/12"
		},
		won: {
			bg: "bg-[#EBF7E7] dark:bg-emerald-950/40",
			iconText: "text-emerald-600 dark:text-emerald-300",
			watermark: "text-emerald-600/12 dark:text-emerald-400/12"
		},
		rejected: {
			bg: "bg-[#FFF0E6] dark:bg-orange-950/40",
			iconText: "text-orange-600 dark:text-orange-300",
			watermark: "text-orange-600/12 dark:text-orange-400/12"
		}
	};
	const current = variantStyles[variant] || variantStyles.purple;
	const activeStyles = active ? "shadow-md scale-[1.01]" : "shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-200";
	const cursorStyle = onClick ? "cursor-pointer" : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		onClick,
		className: `relative overflow-hidden rounded-2xl p-4.5 flex items-center gap-3.5 select-none shadow-md ${current.bg} ${activeStyles} ${cursorStyle}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "size-11 rounded-full bg-white dark:bg-slate-900 shadow-xs flex items-center justify-center shrink-0 z-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-5 ${current.iconText}` })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "z-10 min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight truncate",
					children: label
				}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-1.5 h-7 w-16 rounded-md" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight",
					children: value
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `absolute -right-3 -bottom-3 size-24 ${current.watermark} pointer-events-none select-none z-0 transform rotate-6` })
		]
	});
}
function OpportunitiesPage() {
	const searchParams = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const { user, isAdmin } = useAuth();
	const userId = user?.id ?? "";
	const [searchInput, setSearchInput] = (0, import_react.useState)(searchParams.search ?? "");
	const [debouncedSearch] = l(searchInput, 300);
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [dateRange, setDateRange] = (0, import_react.useState)(searchParams.from ? {
		from: new Date(searchParams.from),
		to: searchParams.to ? new Date(searchParams.to) : void 0
	} : void 0);
	const [calOpen, setCalOpen] = (0, import_react.useState)(false);
	const [editingNotesRow, setEditingNotesRow] = (0, import_react.useState)(null);
	const [noteContent, setNoteContent] = (0, import_react.useState)("");
	const statusMutation = useUpdateOpportunityStatus();
	const softDeleteMutation = useSoftDeleteOpportunity();
	(0, import_react.useEffect)(() => {
		const next = debouncedSearch.trim() || void 0;
		if (next === (searchParams.search ?? void 0)) return;
		navigate({
			search: (prev) => ({
				...prev,
				search: next,
				page: 1
			}),
			replace: true
		});
	}, [
		debouncedSearch,
		navigate,
		searchParams.search
	]);
	const updateFilter = (key, value) => {
		navigate({ search: (prev) => ({
			...prev,
			[key]: value,
			page: 1
		}) });
	};
	const list = useQuery({
		...opportunitiesQuery(searchParams, userId, isAdmin),
		enabled: !!userId
	});
	const summary = useQuery({
		...opportunitySummaryQuery(userId, isAdmin),
		enabled: !!userId
	});
	const agents = useQuery({ ...agentsQuery() });
	const handleUpdateStatus = (row, status, e) => {
		e?.stopPropagation();
		statusMutation.mutate({
			id: row.id,
			status,
			prospectId: row.prospect_id,
			prospectName: row.prospect_name,
			estimatedValue: row.estimated_value,
			notes: row.notes || void 0
		}, {
			onSuccess: () => {
				if (status === "Sales Won") toast.success(`🎉 Opportunity for ${row.prospect_name || "Prospect"} converted to Sales Won! Stage & activities updated.`);
				else toast.success(`Opportunity status updated to ${status}`);
			},
			onError: (error) => toast.error(error.message)
		});
	};
	const handleSoftDelete = (row, e) => {
		e?.stopPropagation();
		if (!confirm(`Are you sure you want to remove opportunity for ${row.prospect_name}?`)) return;
		softDeleteMutation.mutate(row.id, {
			onSuccess: () => toast.success("Opportunity soft deleted"),
			onError: (error) => toast.error(error.message)
		});
	};
	const rows = list.data?.data ?? [];
	const page = searchParams.page ?? 1;
	const pageCount = list.data?.pageCount ?? 1;
	const hasActiveFilters = Boolean(searchParams.search) || Boolean(searchParams.status) || Boolean(searchParams.agent) || Boolean(searchParams.from);
	const clearFilters = () => {
		setSearchInput("");
		setDateRange(void 0);
		navigate({
			search: () => ({ page: 1 }),
			replace: true
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3.5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Deals",
						value: summary.data?.total ?? 0,
						icon: Target,
						loading: summary.isLoading,
						variant: "purple",
						active: searchParams.status === void 0,
						onClick: () => updateFilter("status", void 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Pipeline Value",
						value: `৳${(summary.data?.totalValue ?? 0).toLocaleString()}`,
						icon: DollarSign,
						loading: summary.isLoading,
						variant: "teal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Active Deals",
						value: summary.data?.active ?? 0,
						icon: TrendingUp,
						loading: summary.isLoading,
						variant: "green",
						active: searchParams.status === "Negotiation",
						onClick: () => updateFilter("status", "Negotiation")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Sales Won",
						value: summary.data?.won ?? 0,
						icon: BadgeCheck,
						loading: summary.isLoading,
						variant: "coral",
						active: searchParams.status === "Sales Won",
						onClick: () => updateFilter("status", "Sales Won")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Rejected / Lost",
						value: summary.data?.rejected ?? 0,
						icon: CircleX,
						loading: summary.isLoading,
						variant: "yellow",
						active: searchParams.status === "Sales Lost",
						onClick: () => updateFilter("status", "Sales Lost")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 flex-1",
					children: [
						isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: searchParams.agent ?? "all",
							onValueChange: (v) => updateFilter("agent", v === "all" ? void 0 : v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
								className: "w-42.5 bg-white",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Agents" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All Agents"
							}), (agents.data ?? []).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: a.id,
								children: a.name
							}, a.id))] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1 max-w-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: searchInput,
									onChange: (e) => setSearchInput(e.target.value),
									placeholder: "Search by prospect name, business, phone...",
									className: "pl-9 bg-white"
								}),
								searchInput && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setSearchInput(""),
									className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
								})
							]
						}),
						hasActiveFilters && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: clearFilters,
							className: "text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-1 size-3.5" }), "Clear filters"]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: searchParams.status ?? "all",
						onValueChange: (v) => updateFilter("status", v === "all" ? void 0 : v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-40 bg-white",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Stages" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All Stages"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "Negotiation",
								children: "Negotiation"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "Proposal Sent",
								children: "Proposal Sent"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "Contacted",
								children: "Contacted"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "Sales Won",
								children: "Sales Won"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "Sales Lost",
								children: "Sales Lost"
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
								className: `bg-white justify-start text-left font-normal ${dateRange?.from ? "text-foreground" : "text-muted-foreground"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "mr-2 size-4" }), dateRange?.from ? dateRange.to ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									format(dateRange.from, "LLL dd"),
									" - ",
									format(dateRange.to, "LLL dd")
								] }) : format(dateRange.from, "LLL dd, yyyy") : "Date Range"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
							className: "w-auto p-0",
							align: "end",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
								mode: "range",
								selected: dateRange,
								onSelect: (range) => {
									setDateRange(range);
									if (range?.from) updateFilter("from", format(range.from, "yyyy-MM-dd"));
									if (range?.to) {
										updateFilter("to", format(range.to, "yyyy-MM-dd"));
										setCalOpen(false);
									}
									if (!range?.from) {
										updateFilter("from", void 0);
										updateFilter("to", void 0);
									}
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
										updateFilter("from", void 0);
										updateFilter("to", void 0);
										setCalOpen(false);
									},
									children: "Clear dates"
								})
							})]
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center justify-between px-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-muted-foreground",
							children: list.isLoading ? "Loading opportunities..." : `Showing ${rows.length} opportunity deal(s)`
						})
					}),
					list.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3.5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
						children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-4 shadow-2xs space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full rounded-xl" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-3/4" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 w-full rounded-xl" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-full rounded-xl" })
							]
						}, i))
					}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex flex-col items-center gap-3 py-14 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid size-12 place-items-center rounded-full bg-muted text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "size-6" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold text-base",
								children: "No opportunities found"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground mt-1 max-w-sm",
								children: hasActiveFilters ? "No opportunities match your filter criteria." : "Create your first sales opportunity to start tracking pipeline value."
							})] }),
							hasActiveFilters && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: clearFilters,
								children: "Reset Filters"
							})
						]
					}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3.5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
						children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "group relative rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-4 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start gap-2.5 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "size-9 rounded-full bg-purple-100/80 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center shrink-0 border border-purple-200/60 shadow-2xs mt-0.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "size-4.5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => {
													setEditingNotesRow(row);
													setNoteContent(row.notes || "");
												},
												className: "text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-tight truncate block text-left group-hover:text-[#0A2E5C] dark:group-hover:text-purple-300 transition-colors cursor-pointer",
												children: row.prospect_business || row.prospect_name || "Untitled Deal"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-slate-500 dark:text-slate-400 font-semibold truncate mt-0.5",
												children: row.prospect_name || "Direct Client"
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "ghost",
											size: "icon",
											className: "size-7.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-accent shrink-0 -mr-1 transition-colors cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "sr-only",
												children: "Open menu"
											})]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
										align: "end",
										className: "w-48 rounded-xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
												onClick: () => {
													setEditingNotesRow(row);
													setNoteContent(row.notes || "");
												},
												className: "flex items-center gap-2 text-xs font-semibold rounded-md px-2 py-1.5 cursor-pointer",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5 text-slate-600 dark:text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Edit Notes" })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSub, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSubTrigger, {
												className: "flex items-center gap-2 text-xs font-semibold rounded-md px-2 py-1.5 cursor-pointer",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-3.5 text-blue-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Update Stage" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSubContent, {
												className: "w-48 rounded-xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, {
														className: "text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 py-0.5",
														children: "Active Stages"
													}),
													PIPELINE_STAGES.map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
														onClick: (e) => handleUpdateStatus(row, st, e),
														className: "text-xs font-semibold rounded-md px-2 py-1.5 cursor-pointer",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "mr-2 size-3.5 text-emerald-600" }), st]
													}, st)),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, {
														className: "text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 py-0.5",
														children: "Lost / Rejected"
													}),
													REJECTED_STAGES.map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
														onClick: (e) => handleUpdateStatus(row, st, e),
														className: "text-xs font-semibold text-rose-600 rounded-md px-2 py-1.5 cursor-pointer",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleSlash, { className: "mr-2 size-3.5 text-rose-500" }), st]
													}, st))
												]
											}) })] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
												onClick: () => {
													setEditingNotesRow(row);
													setNoteContent(row.notes || "");
												},
												className: "flex items-center gap-2 text-xs font-semibold rounded-md px-2 py-1.5 cursor-pointer",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "View Details" })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
												onClick: () => handleSoftDelete(row),
												className: "flex items-center gap-2 text-xs font-semibold rounded-md px-2 py-1.5 text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40 cursor-pointer",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5 text-rose-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Delete" })]
											})
										]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 rounded-lg px-2.5 py-1 flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] font-medium text-emerald-700 dark:text-emerald-300",
											children: "Value:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-mono font-bold text-emerald-700 dark:text-emerald-300 text-xs",
											children: ["৳", (row.estimated_value || 0).toLocaleString()]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: cn("inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs shrink-0", getStageBadgeStyle(row.status)),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-current shrink-0" }), row.status]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 bg-[#F4F6F8] dark:bg-slate-800/50 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300 font-semibold space-y-1.5 border border-slate-100/80 dark:border-slate-800",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-2 text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1.5 truncate",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3.5 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "truncate",
													children: [
														"Agent:",
														" ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
															className: "font-bold text-slate-900 dark:text-slate-100",
															children: row.agent_name || "Unassigned"
														})
													]
												})]
											}), row.prospect_phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1 font-mono text-[11px] text-slate-600 dark:text-slate-300 shrink-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-3 text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.prospect_phone })]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3 text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Created: ", format(new Date(row.created_at), "MMM dd, yyyy")] })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: format(new Date(row.created_at), "hh:mm a") })]
										}),
										row.notes?.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 rounded-md px-2 py-1 text-[11px] text-amber-900 dark:text-amber-200 font-normal line-clamp-2",
												children: row.notes.trim()
											})
										})
									]
								})
							] })
						}, row.id))
					}),
					pageCount > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between pt-4 border-t",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								"Page ",
								page,
								" of ",
								pageCount
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								disabled: page <= 1,
								onClick: () => void navigate({ search: (prev) => ({
									...prev,
									page: page - 1
								}) }),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4 mr-1" }), " Previous"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								disabled: page >= pageCount,
								onClick: () => void navigate({ search: (prev) => ({
									...prev,
									page: page + 1
								}) }),
								children: ["Next ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 ml-1" })]
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!editingNotesRow,
				onOpenChange: (open) => !open && setEditingNotesRow(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md rounded-2xl p-6 bg-white dark:bg-card border border-slate-200 dark:border-slate-800 shadow-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-5 text-[#16a34a]" }), "Edit Opportunity Notes"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
							className: "text-xs text-slate-500",
							children: [
								"Update notes for",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "text-slate-900 dark:text-slate-100 font-bold",
									children: editingNotesRow?.prospect_name || editingNotesRow?.prospect_business
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "py-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: noteContent,
								onChange: (e) => setNoteContent(e.target.value),
								placeholder: "Enter notes...",
								className: "min-h-28 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "gap-2 sm:gap-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setEditingNotesRow(null),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								className: "bg-[#16a34a] hover:bg-[#15803d] text-white font-bold",
								onClick: () => {
									if (!editingNotesRow) return;
									statusMutation.mutate({
										id: editingNotesRow.id,
										status: editingNotesRow.status,
										prospectId: editingNotesRow.prospect_id,
										prospectName: editingNotesRow.prospect_name,
										estimatedValue: editingNotesRow.estimated_value,
										notes: noteContent
									}, {
										onSuccess: () => {
											toast.success("Notes updated successfully");
											setEditingNotesRow(null);
										},
										onError: (err) => toast.error(err.message)
									});
								},
								children: "Save Notes"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpportunityDialog, {
				open: dialogOpen,
				onOpenChange: setDialogOpen
			})
		]
	});
}
//#endregion
export { OpportunitiesPage as component };
