import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { n as CardContent, t as Card } from "./card-CtX3ithx.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { At as Clock, H as Phone, Ht as ChevronRight, Pt as CircleSlash, St as ExternalLink, Ut as ChevronLeft, V as Plus, Yt as Calendar, Zt as CalendarClock, at as ListFilter, g as TriangleAlert, ht as FileText, k as Search, l as User, ot as ListChecks, p as UserCheck, r as X, s as Users, ut as History, zt as CircleCheck } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B85j8UA0.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-Cmlz_mk1.mjs";
import { l as format } from "../_libs/date-fns.mjs";
import { t as Calendar$1 } from "./calendar-BkciPy-j.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./auth-DmJHUQUY.mjs";
import { d as DropdownMenuTrigger, i as DropdownMenuItem, n as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu-BfBJVxb8.mjs";
import { a as prospectTimelineQuery, c as useSetFollowUpStatus, i as followUpsQuery, o as statusBadgeVariant, r as followUpSummaryQuery, t as agentsQuery } from "./follow-ups-hGujMQYp.mjs";
import { t as FollowUpDialog } from "./follow-up-dialog-mmRwZw9_.mjs";
import { t as Route } from "./follow-ups-B3x4i_ll.mjs";
import { t as PageHeader } from "./placeholder-page-BhrIUunO.mjs";
import { n as ScrollBar, t as ScrollArea } from "./scroll-area-CsnbPvZP.mjs";
import { t as ChangeStageDialog } from "./change-stage-dialog-BkUoYpSS.mjs";
import { t as l } from "../_libs/use-debounce.mjs";
import { t as Root } from "../_libs/radix-ui__react-separator.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/follow-ups-DzuUoRHt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Separator = import_react.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	decorative,
	orientation,
	className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className),
	...props
}));
Separator.displayName = Root.displayName;
function FollowUpDetailModal({ open, onOpenChange, followUp, onScheduleNext }) {
	const statusMutation = useSetFollowUpStatus();
	const prospectId = followUp?.prospect_id ?? "";
	const timeline = useQuery({
		...prospectTimelineQuery(prospectId),
		enabled: open && !!prospectId
	});
	if (!followUp) return null;
	const setStatus = (status) => {
		statusMutation.mutate({
			id: followUp.id,
			status,
			prospectId: followUp.prospect_id,
			prospectName: followUp.prospect_name,
			note: followUp.note || void 0
		}, {
			onSuccess: () => toast.success(`Follow-up status set to ${status}`),
			onError: (error) => toast.error(error.message)
		});
	};
	const dueAtDate = followUp.due_at ? new Date(followUp.due_at) : null;
	const createdAtDate = followUp.created_at ? new Date(followUp.created_at) : null;
	const updatedAtDate = followUp.updated_at ? new Date(followUp.updated_at) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-2xl max-h-[90vh] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2 pr-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: statusBadgeVariant(followUp.effective_status),
							className: "capitalize text-xs",
							children: followUp.effective_status
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: ["ID: ", followUp.id.substring(0, 8)]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "text-xl font-bold mt-1",
						children: [followUp.prospect_name || "Follow-up Details", followUp.prospect_business ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground font-normal text-base block sm:inline sm:ml-2",
							children: [
								"(",
								followUp.prospect_business,
								")"
							]
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "text-xs",
						children: "Complete details and chronological timeline for this prospect follow-up task."
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							followUp.prospect_phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "default",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: `tel:${followUp.prospect_phone}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "mr-2 size-4" }),
										"Call ",
										followUp.prospect_phone
									]
								})
							}),
							followUp.effective_status !== "completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200",
								onClick: () => setStatus("completed"),
								disabled: statusMutation.isPending,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mr-1.5 size-4 text-emerald-600" }), "Complete Task"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									children: "Update Status"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								align: "start",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: () => setStatus("pending"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "mr-2 size-4 text-amber-500" }), "Pending"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: () => setStatus("completed"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mr-2 size-4 text-emerald-500" }), "Completed"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: () => setStatus("cancelled"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleSlash, { className: "mr-2 size-4 text-muted-foreground" }), "Cancelled"]
									})
								]
							})] })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => {
							onOpenChange(false);
							onScheduleNext?.(followUp.prospect_id, followUp.prospect_name ?? "this prospect");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 size-4" }), "Add next follow-up"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2 text-sm pt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "size-3.5" }), " Scheduled At"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: dueAtDate ? format(dueAtDate, "PPP 'at' p") : "Not set"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "size-3.5" }), " Assigned Agent"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: followUp.agent_name || "Unassigned"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3.5" }), " Created By"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: followUp.creator_name || "System"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5" }), " Created / Updated"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									"Created: ",
									createdAtDate ? format(createdAtDate, "dd MMM yyyy, p") : "—",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Updated: ",
									updatedAtDate ? format(updatedAtDate, "dd MMM yyyy, p") : "—"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sm:col-span-2 space-y-1 rounded-lg border bg-card p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider",
								children: "Notes / Instructions"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-relaxed whitespace-pre-wrap",
								children: followUp.note || "No specific note added."
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-2" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
							className: "font-semibold text-sm flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4 text-primary" }), "Chronological Follow-up Timeline"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							className: "h-7 text-xs",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/prospects",
								children: ["View Prospects ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-1 size-3" })]
							})
						})]
					}), timeline.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 w-full rounded-md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 w-full rounded-md" })]
					}) : (timeline.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground italic py-2",
						children: "No previous timeline records found for this prospect."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "relative space-y-3 border-l pl-4 ml-2",
						children: (timeline.data ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "relative pl-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute -left-5.75 top-1.5 size-2.5 rounded-full border-2 border-background ${item.status === "completed" ? "bg-emerald-500" : item.status === "overdue" ? "bg-rose-500" : "bg-amber-500"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border bg-muted/20 p-3 text-xs space-y-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center justify-between gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 font-semibold",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.date }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-muted-foreground",
												children: ["· ", item.time]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: statusBadgeVariant(item.status),
											className: "capitalize text-[10px] px-1.5 py-0",
											children: item.status
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-foreground/90 font-normal",
										children: item.note
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center justify-between text-[11px] text-muted-foreground pt-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Agent: ", item.agent] })
									})
								]
							})]
						}, item.id))
					})]
				})
			]
		})
	});
}
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
		pending: {
			bg: "bg-[#E6F7F5] dark:bg-teal-950/40",
			iconText: "text-teal-600 dark:text-teal-300",
			watermark: "text-teal-600/12 dark:text-teal-400/12"
		},
		completed: {
			bg: "bg-[#EBF7E7] dark:bg-emerald-950/40",
			iconText: "text-emerald-600 dark:text-emerald-300",
			watermark: "text-emerald-600/12 dark:text-emerald-400/12"
		},
		overdue: {
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
function getStageBadgeColor(stageName) {
	const name = (stageName || "").toLowerCase();
	if (name.includes("won") || name.includes("sales")) return "bg-[#67B239] text-white";
	if (name.includes("prospect") || name.includes("lead")) return "bg-blue-600 text-white";
	if (name.includes("follow")) return "bg-teal-600 text-white";
	if (name.includes("opportunity")) return "bg-orange-500 text-white";
	if (name.includes("dnp")) return "bg-amber-500 text-white";
	if (name.includes("switched")) return "bg-purple-600 text-white";
	if (name.includes("invalid")) return "bg-rose-600 text-white";
	if (name.includes("not_interested") || name.includes("not interested")) return "bg-slate-600 text-white";
	if (name.includes("denied")) return "bg-red-700 text-white";
	return "bg-indigo-600 text-white";
}
function FollowUpTimelineList({ prospectId, currentFollowUp }) {
	const { data: timelineItems = [], isLoading } = useQuery({
		...prospectTimelineQuery(prospectId),
		enabled: !!prospectId
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 py-2 px-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-44 rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-44 rounded-xl" })]
	});
	const items = timelineItems.length > 0 ? timelineItems : [{
		id: currentFollowUp.id,
		date: currentFollowUp.due_at ? format(new Date(currentFollowUp.due_at), "MMM d, yyyy") : "N/A",
		time: currentFollowUp.due_at ? format(new Date(currentFollowUp.due_at), "hh:mm a") : "N/A",
		note: currentFollowUp.note || "No note specified",
		agent: currentFollowUp.agent_name || "Agent",
		status: currentFollowUp.effective_status
	}];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollArea, {
		className: "w-full whitespace-nowrap",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-0 py-1 px-1 min-w-max pb-2",
			children: items.map((item, idx) => {
				const isCurrent = item.id === currentFollowUp.id || idx === 0;
				const isLast = idx === items.length - 1;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-start w-44 space-y-2 whitespace-normal",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `w-full px-2.5 py-0.5 rounded-full text-[10px] font-bold text-center tracking-tight shadow-2xs ${isCurrent ? "bg-emerald-600 text-white font-semibold" : "bg-slate-700 dark:bg-slate-600 text-white font-medium"}`,
							children: [
								item.date,
								", ",
								item.time
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "w-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-xl p-2.5 shadow-2xs min-h-24 space-y-1 overflow-hidden flex flex-col justify-start",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate",
								children: [
									"Agent:",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-slate-600 dark:text-slate-300",
										children: item.agent
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "sawtooth-cut bg-amber-100 dark:bg-amber-950/80 p-2 text-[10px] text-amber-950 dark:text-amber-100 font-medium leading-snug h-11 line-clamp-2 overflow-hidden",
								children: item.note?.trim() || "No notes entered."
							})]
						})]
					}), !isLast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-6 h-0.5 bg-slate-300 dark:bg-slate-700 shrink-0 self-start mt-2.5" })]
				}, item.id || idx);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollBar, { orientation: "horizontal" })]
	});
}
function FollowUpsPage() {
	const searchParams = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const { user, isAdmin } = useAuth();
	const userId = user?.id ?? "";
	const [searchInput, setSearchInput] = (0, import_react.useState)(searchParams.search ?? "");
	const [debouncedSearch] = l(searchInput, 300);
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [dialogTarget, setDialogTarget] = (0, import_react.useState)(null);
	const [changeStageTarget, setChangeStageTarget] = (0, import_react.useState)(null);
	const [detailModalOpen, setDetailModalOpen] = (0, import_react.useState)(false);
	const [selectedFollowUp, setSelectedFollowUp] = (0, import_react.useState)(null);
	const [dateRange, setDateRange] = (0, import_react.useState)(searchParams.from ? {
		from: new Date(searchParams.from),
		to: searchParams.to ? new Date(searchParams.to) : void 0
	} : void 0);
	const [calOpen, setCalOpen] = (0, import_react.useState)(false);
	const statusMutation = useSetFollowUpStatus();
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
		...followUpsQuery(searchParams, userId, isAdmin),
		enabled: !!userId
	});
	const summary = useQuery({
		...followUpSummaryQuery(userId, isAdmin),
		enabled: !!userId
	});
	const agents = useQuery({ ...agentsQuery() });
	const handleCompleteTask = (row, e) => {
		e?.stopPropagation();
		statusMutation.mutate({
			id: row.id,
			status: "completed",
			prospectId: row.prospect_id,
			prospectName: row.prospect_name,
			note: row.note || void 0
		}, {
			onSuccess: () => toast.success(`Completed follow-up for ${row.prospect_name || "prospect"}`),
			onError: (error) => toast.error(error.message)
		});
	};
	const rows = list.data?.data ?? [];
	const page = searchParams.page ?? 1;
	const pageCount = list.data?.pageCount ?? 1;
	const hasActiveFilters = Boolean(searchParams.search) || Boolean(searchParams.status) || Boolean(searchParams.agent) || Boolean(searchParams.from) || Boolean(searchParams.to);
	const clearAllFilters = () => {
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
				className: "flex flex-wrap items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
					title: "Follow Ups",
					description: "Manage scheduled follow-up calls, view chronological timeline, and update task statuses."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => {
						setDialogTarget(null);
						setDialogOpen(true);
					},
					className: "shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 size-4" }), "Schedule Follow-up"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3.5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Tasks",
						value: summary.data?.total ?? 0,
						icon: ListChecks,
						loading: summary.isLoading,
						variant: "purple",
						active: searchParams.status === void 0,
						onClick: () => {
							updateFilter("status", void 0);
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Pending",
						value: summary.data?.pending ?? 0,
						icon: CalendarClock,
						loading: summary.isLoading,
						variant: "teal",
						active: searchParams.status === "pending",
						onClick: () => {
							updateFilter("status", searchParams.status === "pending" ? void 0 : "pending");
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Completed",
						value: summary.data?.completed ?? 0,
						icon: CircleCheck,
						loading: summary.isLoading,
						variant: "green",
						active: searchParams.status === "completed",
						onClick: () => {
							updateFilter("status", searchParams.status === "completed" ? void 0 : "completed");
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Overdue",
						value: summary.data?.overdue ?? 0,
						icon: TriangleAlert,
						loading: summary.isLoading,
						variant: "coral",
						active: searchParams.status === "overdue",
						onClick: () => {
							updateFilter("status", searchParams.status === "overdue" ? void 0 : "overdue");
						}
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 flex-1",
					children: [isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative max-w-sm flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "pl-9 pr-8 bg-white",
								placeholder: "Search name, business, phone...",
								value: searchInput,
								onChange: (e) => setSearchInput(e.target.value)
							}),
							searchInput && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setSearchInput(""),
								className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: searchParams.status ?? "all",
						onValueChange: (v) => updateFilter("status", v === "all" ? void 0 : v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
							className: "w-42.5 bg-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListFilter, { className: "size-3.5 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Statuses" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All Statuses"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "pending",
								children: "Pending"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "completed",
								children: "Completed"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "cancelled",
								children: "Cancelled"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "overdue",
								children: "Overdue"
							})
						] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
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
							children: list.isLoading ? "Loading follow-ups..." : `Showing ${rows.length} follow-up task(s)`
						})
					}),
					list.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full rounded-xl" }, i))
					}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex flex-col items-center gap-3 py-14 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid size-12 place-items-center rounded-full bg-muted text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "size-6" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold text-base",
								children: "No follow-ups found"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground mt-1 max-w-sm",
								children: hasActiveFilters ? "No follow-up calls match your current search and filter criteria. Try resetting filters." : "Schedule your first follow-up to keep track of telesales prospects."
							})] }),
							hasActiveFilters ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: clearAllFilters,
								children: "Reset Filters"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: () => {
									setDialogTarget(null);
									setDialogOpen(true);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 size-4" }), "Schedule Follow-up"]
							})
						]
					}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-4",
						children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col xl:flex-row items-stretch justify-between gap-3.5 overflow-hidden",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "w-full xl:w-[26%] shrink-0 flex flex-col justify-between space-y-2.5 pr-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-start gap-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "size-8.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center shrink-0 mt-0.5",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0 flex-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														className: `${getStageBadgeColor(row.stage_name)} text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 border-0 shadow-2xs`,
														children: row.stage_name || "Follow-up"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
														className: "text-sm font-bold text-slate-900 dark:text-slate-100 truncate leading-tight",
														title: row.prospect_name,
														children: row.prospect_name || "Contact Name"
													}),
													row.prospect_business && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate",
														children: row.prospect_business
													})
												]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex items-center text-[11px] font-bold text-slate-500 dark:text-slate-400 px-0.5",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "flex items-center gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3 text-slate-400" }), " Notes"]
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "sawtooth-cut bg-amber-100 dark:bg-amber-950/80 p-2.5 text-[11px] text-amber-950 dark:text-amber-100 font-medium leading-snug h-12 line-clamp-2 overflow-hidden",
												children: row.note?.trim() || "No notes entered yet."
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1 min-w-0 flex-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium truncate",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "truncate",
														children: [
															"Agent:",
															" ",
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
																className: "text-slate-800 dark:text-slate-200 font-semibold",
																children: row.agent_name || "Assigned Agent"
															})
														]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.due_at ? format(new Date(row.due_at), "MMM d, yyyy") : "N/A" })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.due_at ? format(new Date(row.due_at), "hh:mm a") : "N/A" })]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: row.prospect_phone ? `tel:${row.prospect_phone}` : "#",
											onClick: (e) => {
												if (!row.prospect_phone) {
													e.preventDefault();
													toast.info("No phone number recorded for this prospect.");
												}
											},
											className: "shrink-0 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-3.5 fill-current" }), "Call"]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-full xl:w-[55%] flex-1 bg-[#EEF7F7] dark:bg-slate-950/60 border border-[#DCEEEE] dark:border-slate-800/70 rounded-xl p-3 flex items-center overflow-x-auto min-h-36 custom-scrollbar",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FollowUpTimelineList, {
										prospectId: row.prospect_id,
										currentFollowUp: row
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "w-full xl:w-[19%] shrink-0 flex xl:flex-col items-center justify-center gap-2 pt-2 xl:pt-0 border-t xl:border-t-0 xl:border-l border-slate-100 dark:border-slate-800/80 xl:pl-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											onClick: () => {
												setSelectedFollowUp(row);
												setDetailModalOpen(true);
											},
											className: "flex-1 xl:flex-none w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs h-9 rounded-xl shadow-2xs transition-colors cursor-pointer",
											children: "View"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											onClick: () => {
												setChangeStageTarget({
													id: row.prospect_id,
													label: row.prospect_name || row.prospect_business || "Prospect",
													stageId: null,
													currentStageName: row.stage_name || "Follow-up"
												});
											},
											className: "flex-1 xl:flex-none w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs h-9 rounded-xl shadow-2xs transition-colors cursor-pointer",
											children: "Update Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											onClick: (e) => handleCompleteTask(row, e),
											disabled: statusMutation.isPending || row.effective_status === "completed",
											className: "flex-1 xl:flex-none w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs h-9 rounded-xl shadow-2xs transition-colors cursor-pointer",
											children: "Complete"
										})
									]
								})
							]
						}, row.id))
					}),
					pageCount > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between pt-3 border-t",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								"Showing page ",
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FollowUpDetailModal, {
				open: detailModalOpen,
				onOpenChange: setDetailModalOpen,
				followUp: selectedFollowUp,
				onScheduleNext: (pId, pLabel) => {
					setDialogTarget({
						id: pId,
						label: pLabel
					});
					setDialogOpen(true);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FollowUpDialog, {
				open: dialogOpen,
				onOpenChange: setDialogOpen,
				...dialogTarget ? {
					prospectId: dialogTarget.id,
					prospectLabel: dialogTarget.label
				} : {}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangeStageDialog, {
				target: changeStageTarget,
				onOpenChange: (open) => {
					if (!open) setChangeStageTarget(null);
				},
				onStageChange: (_stageId, stageName) => {
					if (stageName.toLowerCase().trim().includes("follow")) {
						const target = changeStageTarget;
						setChangeStageTarget(null);
						if (target) {
							setDialogTarget({
								id: target.id,
								label: target.label
							});
							setDialogOpen(true);
						}
					}
				}
			})
		]
	});
}
//#endregion
export { FollowUpsPage as component };
