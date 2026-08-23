import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { t as Card } from "./card-CtX3ithx.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { $ as MapPin, $t as Building2, Ft as CircleQuestionMark, Gt as Check, H as Phone, Nt as CircleX, O as Send, St as ExternalLink, V as Plus, W as Pencil, X as MessageSquare, Xt as CalendarDays, Yt as Calendar, at as ListFilter, bt as Eye, ct as Layers, ht as FileText, jt as Clock3, k as Search, l as User, o as Video, r as X, v as Trash2, wt as EllipsisVertical, zt as CircleCheck } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B85j8UA0.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-Cmlz_mk1.mjs";
import { l as format } from "../_libs/date-fns.mjs";
import { t as Calendar$1 } from "./calendar-BkciPy-j.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./auth-DmJHUQUY.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { d as DropdownMenuTrigger, i as DropdownMenuItem, n as DropdownMenuContent, s as DropdownMenuSeparator, t as DropdownMenu } from "./dropdown-menu-BfBJVxb8.mjs";
import { a as sendMeetingReminderSms, c as updateMeetingStatus, i as prospectsOptionsQuery, n as deleteMeeting, o as updateMeeting, r as meetingsQueryOptions, s as updateMeetingNotes } from "./meetings-DwgaH8ij.mjs";
import { t as agentsQuery } from "./follow-ups-hGujMQYp.mjs";
import { n as RadioGroupItem, t as RadioGroup } from "./radio-group-BJ3sdkEm.mjs";
import { t as ScheduleMeetingDialog } from "./schedule-meeting-dialog-CvYtY_sd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/meetings-CNHQWCS9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function getTypeIcon$1(type) {
	switch (type) {
		case "Office": return Building2;
		case "Online": return Video;
		case "Client Location": return MapPin;
		default: return CircleQuestionMark;
	}
}
function getStatusBadge$1(status) {
	switch (status) {
		case "Completed": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			variant: "outline",
			className: "bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 text-green-600 dark:text-green-400" }), " Completed"]
		});
		case "Cancelled": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			variant: "destructive",
			className: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3.5 text-red-600 dark:text-red-400" }), " Cancelled"]
		});
		default: return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			variant: "outline",
			className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-3.5 text-amber-600 dark:text-amber-400" }), " Scheduled"]
		});
	}
}
function MeetingDetailModal({ open, onOpenChange, meeting, onStatusChange, onOpenSmsModal, onOpenNotesModal, onEditMeeting, onDeleteMeeting }) {
	if (!meeting) return null;
	const TypeIcon = getTypeIcon$1(meeting.meeting_type);
	const isUrlLocation = meeting.location && (meeting.location.startsWith("http://") || meeting.location.startsWith("https://") || meeting.location.includes("zoom.us") || meeting.location.includes("meet.google.com"));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-2xl bg-white dark:bg-card max-h-[90vh] overflow-y-auto p-6 rounded-2xl shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2 pr-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: "gap-1 text-xs font-semibold border-slate-300 dark:border-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypeIcon, { className: "size-3.5 text-[#67B239]" }),
										" ",
										meeting.meeting_type
									]
								}), getStatusBadge$1(meeting.status)]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground font-mono",
								children: ["ID: ", meeting.id.substring(0, 10)]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "text-xl font-bold text-foreground leading-tight pt-1",
							children: meeting.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
							className: "text-sm text-muted-foreground flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Prospect:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground font-semibold",
								children: meeting.business_name ? `${meeting.business_name} (${meeting.prospect_name || "Direct"})` : meeting.prospect_name || "Direct Client"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3.5 text-slate-400" }), " Date & Schedule"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-semibold text-slate-900 dark:text-slate-100",
									children: [
										meeting.meeting_date,
										" at ",
										meeting.meeting_time
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-3.5 text-slate-400" }), " Contact Phone"]
								}), meeting.phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: `tel:${meeting.phone}`,
									className: "font-semibold font-mono text-[#0B3364] dark:text-teal-400 hover:underline block",
									children: meeting.phone
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-muted-foreground",
									children: "Not specified"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1 sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 text-slate-400" }), " Location / Meeting Link"]
								}), isUrlLocation ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: meeting.location,
									target: "_blank",
									rel: "noopener noreferrer",
									className: "font-medium text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1 break-all",
									children: [meeting.location, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3 shrink-0" })]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium text-slate-800 dark:text-slate-200",
									children: meeting.location || "Brandium HQ / To be determined"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3.5 text-slate-400" }), " Assigned Agent"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold text-slate-900 dark:text-slate-100",
									children: meeting.assigned_user_name || "Assigned Team Member"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-3.5 text-slate-400" }), " Reminder Status"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: meeting.sms_sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: "bg-[#67B239]/15 text-[#468026] dark:text-[#7AC142] border-[#67B239]/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-[#67B239] stroke-[2.5]" }), "Sent"]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-full",
									children: "Pending"
								}) })]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-0.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5 text-slate-400" }), " Meeting Notes & Agenda"]
							}), onOpenNotesModal && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									onOpenChange(false);
									onOpenNotesModal(meeting);
								},
								className: "inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3" }), " Edit Notes"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "sawtooth-cut bg-amber-100 dark:bg-amber-950/80 p-3.5 text-xs text-amber-950 dark:text-amber-100 font-medium leading-relaxed rounded min-h-16",
							children: meeting.notes?.trim() || "No notes or agenda recorded for this meeting yet."
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 w-full sm:w-auto",
						children: [onStatusChange && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								className: "gap-1.5 text-xs bg-white",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Status: ", meeting.status] })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
							align: "start",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: () => onStatusChange(meeting.id, "Scheduled"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-3.5 text-amber-500 mr-2" }), " Mark Scheduled"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: () => onStatusChange(meeting.id, "Completed"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 text-[#67B239] mr-2" }), " Mark Completed"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: () => onStatusChange(meeting.id, "Cancelled"),
									className: "text-destructive",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3.5 text-destructive mr-2" }), " Mark Cancelled"]
								})
							]
						})] }), onDeleteMeeting && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							className: "gap-1.5 text-xs bg-white dark:bg-card border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40",
							onClick: () => {
								onOpenChange(false);
								onDeleteMeeting(meeting);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), " Delete"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 w-full sm:w-auto justify-end",
						children: [
							onOpenSmsModal && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "gap-1.5 text-xs bg-white text-[#67B239] border-[#67B239]/40 hover:bg-[#67B239]/10",
								onClick: () => {
									onOpenChange(false);
									onOpenSmsModal(meeting);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-3.5" }), " Send Reminder SMS"]
							}),
							onEditMeeting && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "gap-1.5 text-xs bg-white dark:bg-card border-blue-200 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40",
								onClick: () => {
									onOpenChange(false);
									onEditMeeting(meeting);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5" }), " Edit Meeting"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => onOpenChange(false),
								className: "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs px-4 cursor-pointer",
								children: "Close"
							})
						]
					})]
				})
			]
		})
	});
}
function EditMeetingDialog({ open, onOpenChange, meeting, onSuccess, onDeleteMeeting }) {
	const { user, profile } = useAuth();
	const queryClient = useQueryClient();
	const prospects = useQuery({
		...prospectsOptionsQuery(),
		enabled: open
	});
	const agents = useQuery({
		...agentsQuery(),
		enabled: open
	});
	const prospectList = prospects.data ?? [];
	const prospectCount = prospectList.length;
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
	const [title, setTitle] = (0, import_react.useState)("");
	const [prospectId, setProspectId] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [meetingDate, setMeetingDate] = (0, import_react.useState)("");
	const [meetingTime, setMeetingTime] = (0, import_react.useState)("10:00");
	const [meetingType, setMeetingType] = (0, import_react.useState)("Office");
	const [location, setLocation] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("Scheduled");
	const [assignedUserId, setAssignedUserId] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!meeting || !open) return;
		setTitle(meeting.title || "");
		setProspectId(meeting.prospect_id || "none");
		setPhone(meeting.phone || "");
		setMeetingDate(meeting.meeting_date || "");
		setMeetingTime(meeting.meeting_time || "10:00");
		setMeetingType(meeting.meeting_type || "Office");
		setLocation(meeting.location || "");
		setStatus(meeting.status || "Scheduled");
		setAssignedUserId(meeting.assigned_user_id || "unassigned");
		setNotes(meeting.notes || "");
	}, [meeting, open]);
	const handleProspectSelect = (pId) => {
		setProspectId(pId);
		if (pId && pId !== "none" && prospects.data) {
			const found = prospects.data.find((p) => p.id === pId);
			if (found?.phone && !phone) setPhone(found.phone);
		}
	};
	const updateMutation = useMutation({
		mutationFn: (updates) => {
			if (!meeting) throw new Error("No meeting selected");
			return updateMeeting(meeting.id, updates);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["meetings"] });
			if (meeting) queryClient.invalidateQueries({ queryKey: ["meeting", meeting.id] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
			toast.success("Meeting updated successfully!");
			onOpenChange(false);
			if (onSuccess) onSuccess();
		},
		onError: (err) => {
			toast.error(err.message || "Failed to update meeting.");
		}
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!meeting) return;
		if (!title.trim()) {
			toast.error("Please enter a meeting title.");
			return;
		}
		if (!meetingDate) {
			toast.error("Please select a meeting date.");
			return;
		}
		updateMutation.mutate({
			title: title.trim(),
			prospect_id: prospectId && prospectId !== "none" ? prospectId : null,
			phone: phone.trim() || null,
			meeting_type: meetingType,
			location: location.trim() || null,
			meeting_date: meetingDate,
			meeting_time: meetingTime || "10:00",
			status,
			assigned_user_id: assignedUserId && assignedUserId !== "unassigned" ? assignedUserId : null,
			notes: notes.trim() || null
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-lg p-6 max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
				className: "pb-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "text-xl font-bold tracking-tight text-foreground flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Edit Meeting" }), meeting && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs font-mono font-normal text-muted-foreground",
						children: ["ID: ", meeting.id]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-xs text-muted-foreground",
					children: "Update schedule, attendee details, location, and meeting agenda."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "space-y-4 pt-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "edit-meeting-title",
							className: "text-xs font-semibold text-foreground",
							children: ["Meeting Title ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-destructive",
								children: "*"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "edit-meeting-title",
							placeholder: "Enter Meeting Title",
							value: title,
							onChange: (e) => setTitle(e.target.value),
							className: "h-10 text-sm rounded-xl focus-visible:ring-[#67B239]",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								htmlFor: "edit-meeting-prospect",
								className: "text-xs font-semibold text-foreground",
								children: ["Prospect ", prospectCount > 0 && `(${prospectCount})`]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: prospectId,
								onValueChange: handleProspectSelect,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "edit-meeting-prospect",
									className: "h-10 text-sm rounded-xl",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select a Prospect" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
									className: "max-h-60",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "none",
										children: "-- No specific prospect --"
									}), prospectList.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: p.id,
										children: p.business_name ? `${p.business_name} (${p.contact_name})` : p.contact_name
									}, p.id))]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "edit-meeting-phone",
								className: "text-xs font-semibold text-foreground",
								children: "Contact Phone"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "edit-meeting-phone",
								placeholder: "+880 1...",
								value: phone,
								onChange: (e) => setPhone(e.target.value),
								className: "h-10 text-sm rounded-xl focus-visible:ring-[#67B239]"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								htmlFor: "edit-meeting-date",
								className: "text-xs font-semibold text-foreground",
								children: ["Date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-destructive",
									children: "*"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "edit-meeting-date",
								type: "date",
								value: meetingDate,
								onChange: (e) => setMeetingDate(e.target.value),
								className: "h-10 text-sm rounded-xl focus-visible:ring-[#67B239]",
								required: true
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "edit-meeting-time",
								className: "text-xs font-semibold text-foreground",
								children: "Time"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "edit-meeting-time",
								type: "time",
								value: meetingTime,
								onChange: (e) => setMeetingTime(e.target.value),
								className: "h-10 text-sm rounded-xl focus-visible:ring-[#67B239]"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "edit-meeting-status",
								className: "text-xs font-semibold text-foreground",
								children: "Meeting Status"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: status,
								onValueChange: (v) => setStatus(v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "edit-meeting-status",
									className: "h-10 text-sm rounded-xl",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Status" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Scheduled",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-3.5 text-amber-500" }), " Scheduled"]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Completed",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 text-[#67B239]" }), " Completed"]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Cancelled",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3.5 text-destructive" }), " Cancelled"]
										})
									})
								] })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "edit-meeting-agent",
								className: "text-xs font-semibold text-foreground",
								children: "Assign Agent"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: assignedUserId,
								onValueChange: setAssignedUserId,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "edit-meeting-agent",
									className: "h-10 text-sm rounded-xl",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Agent" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
									className: "max-h-56",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "unassigned",
										children: "-- Unassigned --"
									}), agentList.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: a.id,
										children: a.name
									}, a.id))]
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 pt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs font-semibold text-foreground",
							children: "Meeting Type"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioGroup, {
							value: meetingType,
							onValueChange: (v) => setMeetingType(v),
							className: "flex items-center gap-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center space-x-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
										value: "Office",
										id: "edit-type-office",
										className: "text-[#67B239] border-slate-400 data-[state=checked]:border-[#67B239] data-[state=checked]:text-[#67B239]"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "edit-type-office",
										className: "text-sm font-medium cursor-pointer",
										children: "Office"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center space-x-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
										value: "Online",
										id: "edit-type-online",
										className: "text-[#67B239] border-slate-400 data-[state=checked]:border-[#67B239] data-[state=checked]:text-[#67B239]"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "edit-type-online",
										className: "text-sm font-medium cursor-pointer",
										children: "Online"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center space-x-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
										value: "Client Location",
										id: "edit-type-location",
										className: "text-[#67B239] border-slate-400 data-[state=checked]:border-[#67B239] data-[state=checked]:text-[#67B239]"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "edit-type-location",
										className: "text-sm font-medium cursor-pointer",
										children: "Location"
									})]
								})
							]
						})]
					}),
					(meetingType === "Client Location" || meetingType === "Online") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5 animate-in fade-in-50 duration-200",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "edit-meeting-location",
							className: "text-xs font-semibold text-foreground",
							children: meetingType === "Online" ? "Meeting Link (Google Meet / Zoom)" : "Location Name & Address"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "edit-meeting-location",
							placeholder: meetingType === "Online" ? "https://meet.google.com/..." : "Enter Location name",
							value: location,
							onChange: (e) => setLocation(e.target.value),
							className: "h-10 text-sm rounded-xl focus-visible:ring-[#67B239]"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "edit-meeting-desc",
							className: "text-xs font-semibold text-foreground",
							children: "Notes & Agenda Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "edit-meeting-desc",
							rows: 3,
							placeholder: "Write meeting description or agenda here",
							value: notes,
							onChange: (e) => setNotes(e.target.value),
							className: "resize-none text-sm rounded-xl focus-visible:ring-[#67B239]"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
						className: "flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 pt-3",
						children: [onDeleteMeeting && meeting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => {
								onOpenChange(false);
								onDeleteMeeting(meeting);
							},
							className: "h-10 px-4 rounded-xl border-red-200 dark:border-red-950 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium text-sm gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), " Delete Meeting"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-end gap-2 sm:gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => onOpenChange(false),
								className: "h-10 px-5 rounded-xl border-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-muted dark:border-border text-slate-700 dark:text-foreground font-medium text-sm",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: updateMutation.isPending,
								className: "h-10 px-6 rounded-xl bg-[#67B239] hover:bg-[#5AA030] text-white font-semibold text-sm shadow-sm transition-all",
								children: updateMutation.isPending ? "Saving Changes..." : "Save Changes"
							})]
						})]
					})
				]
			})]
		})
	});
}
function DeleteMeetingDialog({ meeting, open, onOpenChange, onConfirm, isDeleting = false }) {
	if (!meeting) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md bg-white dark:bg-card border border-border shadow-2xl rounded-2xl p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "flex items-center gap-2.5 text-lg font-bold text-red-600 dark:text-red-400",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-9 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4.5 text-red-600 dark:text-red-400" })
						}), "Delete Meeting"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "text-sm text-muted-foreground leading-relaxed pt-1",
						children: "Are you sure you want to permanently delete this meeting? This action cannot be undone."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "my-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 p-4 space-y-2.5 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-slate-900 dark:text-slate-100 text-sm truncate",
							children: meeting.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "text-[11px] font-semibold border-slate-300 dark:border-border shrink-0",
							children: meeting.meeting_type
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5 text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3.5 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "truncate",
									children: [
										"Prospect:",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-foreground",
											children: meeting.business_name ? `${meeting.business_name} (${meeting.prospect_name || "Direct"})` : meeting.prospect_name || "Direct Client"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3.5 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Schedule:",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
										className: "text-foreground",
										children: [
											meeting.meeting_date,
											" at ",
											meeting.meeting_time
										]
									})
								] })]
							}),
							meeting.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: meeting.location
								})]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "gap-2 sm:gap-0 pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						onClick: () => onOpenChange(false),
						disabled: isDeleting,
						className: "rounded-xl border-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-muted dark:border-border text-slate-700 dark:text-foreground font-medium text-sm",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						onClick: onConfirm,
						disabled: isDeleting,
						className: "rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm gap-1.5 shadow-xs transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), isDeleting ? "Deleting Meeting..." : "Delete Meeting"]
					})]
				})
			]
		})
	});
}
function getTypeIcon(type) {
	switch (type) {
		case "Office": return Building2;
		case "Online": return Video;
		case "Client Location": return MapPin;
		default: return CircleQuestionMark;
	}
}
function getStatusBadge(status) {
	switch (status) {
		case "Completed": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			variant: "outline",
			className: "bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 text-green-600 dark:text-green-400" }), " Completed"]
		});
		case "Cancelled": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			variant: "destructive",
			className: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3.5 text-red-600 dark:text-red-400" }), " Cancelled"]
		});
		default: return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			variant: "outline",
			className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-3.5 text-amber-600 dark:text-amber-400" }), " Scheduled"]
		});
	}
}
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
function MeetingsPage() {
	useNavigate();
	const queryClient = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const [meetingTypeFilter, setMeetingTypeFilter] = (0, import_react.useState)("all");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [dateRange, setDateRange] = (0, import_react.useState)(void 0);
	const [calOpen, setCalOpen] = (0, import_react.useState)(false);
	const filters = {
		search,
		meeting_type: meetingTypeFilter,
		status: statusFilter,
		start_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : void 0,
		end_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : void 0
	};
	const meetings = useQuery(meetingsQueryOptions(filters)).data ?? [];
	const totalCount = meetings.length;
	const scheduledCount = meetings.filter((m) => m.status === "Scheduled").length;
	const completedCount = meetings.filter((m) => m.status === "Completed").length;
	const cancelledCount = meetings.filter((m) => m.status === "Cancelled").length;
	const smsSentCount = meetings.filter((m) => m.sms_sent).length;
	const [activeSmsMeeting, setActiveSmsMeeting] = (0, import_react.useState)(null);
	const [smsMessageText, setSmsMessageText] = (0, import_react.useState)("");
	const [smsResultText, setSmsResultText] = (0, import_react.useState)("");
	const [activeNotesMeeting, setActiveNotesMeeting] = (0, import_react.useState)(null);
	const [editingNotesText, setEditingNotesText] = (0, import_react.useState)("");
	const [viewDetailMeeting, setViewDetailMeeting] = (0, import_react.useState)(null);
	const [isScheduleDialogOpen, setIsScheduleDialogOpen] = (0, import_react.useState)(false);
	const [editingMeeting, setEditingMeeting] = (0, import_react.useState)(null);
	const [deleteTarget, setDeleteTarget] = (0, import_react.useState)(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = (0, import_react.useState)(false);
	const statusMutation = useMutation({
		mutationFn: ({ id, status }) => updateMeetingStatus(id, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["meetings"] });
		}
	});
	const notesMutation = useMutation({
		mutationFn: ({ id, notes }) => updateMeetingNotes(id, notes),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["meetings"] });
			setActiveNotesMeeting(null);
		}
	});
	const deleteMutation = useMutation({
		mutationFn: (id) => deleteMeeting(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["meetings"] });
			toast.success("Meeting deleted successfully");
			setIsDeleteDialogOpen(false);
			setDeleteTarget(null);
		},
		onError: () => {
			toast.error("Failed to delete meeting");
		}
	});
	const smsMutation = useMutation({
		mutationFn: ({ id, msg }) => sendMeetingReminderSms(id, msg),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["meetings"] });
			setSmsResultText(res.message);
			setTimeout(() => {
				setActiveSmsMeeting(null);
				setSmsResultText("");
			}, 1500);
		}
	});
	const handleOpenDeleteModal = (m) => {
		setDeleteTarget(m);
		setIsDeleteDialogOpen(true);
	};
	const handleOpenSmsModal = (m) => {
		setActiveSmsMeeting(m);
		setSmsMessageText(`Reminder: You have a ${m.meeting_type} meeting "${m.title}" scheduled for ${m.meeting_date} at ${m.meeting_time}. Location/Link: ${m.location || "N/A"}. Brandium CRM.`);
	};
	const handleOpenNotesModal = (m) => {
		setActiveNotesMeeting(m);
		setEditingNotesText(m.notes || "");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-2xl font-bold tracking-tight text-foreground flex items-center gap-2",
					children: [
						"Meetings",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							className: "bg-[#67B239] text-white border-0 text-xs",
							children: totalCount
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Schedule, track, and manage client meetings, demos, and follow-up discussions."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setIsScheduleDialogOpen(true),
						className: "bg-[#67B239] hover:bg-[#589c2f] text-white font-semibold shadow-xs gap-1.5 px-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Schedule Meeting"]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Meetings",
						value: totalCount,
						icon: CalendarDays,
						colorScheme: "pastelPurple"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Scheduled",
						value: scheduledCount,
						icon: Clock3,
						colorScheme: "pastelYellow"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Completed",
						value: completedCount,
						icon: CircleCheck,
						colorScheme: "pastelEmerald"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Cancelled",
						value: cancelledCount,
						icon: CircleX,
						colorScheme: "pastelPeach"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "SMS Reminders",
						value: smsSentCount,
						icon: Send,
						colorScheme: "pastelTeal"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative max-w-sm flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "text",
							autoComplete: "off",
							autoCorrect: "off",
							autoCapitalize: "off",
							spellCheck: false,
							placeholder: "Search name, business, phone...",
							value: search,
							onChange: (e) => setSearch(e.target.value),
							className: "pl-9 pr-8 bg-white [&::-webkit-search-cancel-button]:hidden"
						}),
						search && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setSearch(""),
							className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: meetingTypeFilter,
							onValueChange: (val) => setMeetingTypeFilter(val),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
								className: "w-42.5 bg-white",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-3.5 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Types" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All Types"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Office",
									children: "Office"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Online",
									children: "Online"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Client Location",
									children: "Client Location"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Other",
									children: "Other"
								})
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: statusFilter,
							onValueChange: (val) => setStatusFilter(val),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
								className: "w-42.5 bg-white",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListFilter, { className: "size-3.5 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Statuses" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All Statuses"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Scheduled",
									children: "Scheduled"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Completed",
									children: "Completed"
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
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "bg-white dark:bg-card border-slate-200/80 shadow-xs overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left border-collapse text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b bg-slate-50/80 dark:bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4",
									children: "Title"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4",
									children: "Prospect"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4",
									children: "Date & Time"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4",
									children: "Location / Link"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4",
									children: "Notes"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4",
									children: "SMS Badge"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 text-right",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border/60",
							children: meetings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								colSpan: 8,
								className: "py-12 text-center text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-8 mx-auto text-slate-300 mb-2" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold text-foreground",
										children: "No meetings found"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-0.5",
										children: "Try resetting search filters or schedule a new meeting."
									})
								]
							}) }) : meetings.map((m) => {
								const TypeIcon = getTypeIcon(m.meeting_type);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 max-w-56",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1.5 flex-wrap",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => setViewDetailMeeting(m),
													className: "font-semibold text-foreground hover:text-[#67B239] transition-colors truncate block text-left cursor-pointer",
													children: m.title
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
													variant: "outline",
													className: "gap-1 text-[10px] px-1.5 py-0 border-slate-300 dark:border-border font-normal text-muted-foreground",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypeIcon, { className: "size-2.5 text-[#67B239]" }),
														" ",
														m.meeting_type
													]
												})]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-3.5 px-4 max-w-56 text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-medium text-foreground truncate",
												children: m.business_name || m.prospect_name || "Direct Client"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-muted-foreground truncate",
												children: [m.business_name && m.prospect_name ? `${m.prospect_name}` : "", m.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono",
													children: [m.business_name && m.prospect_name ? " · " : "", m.phone]
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-3.5 px-4 whitespace-nowrap text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-medium text-foreground",
												children: m.meeting_date
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-muted-foreground",
												children: m.meeting_time
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 max-w-50 text-xs",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-muted-foreground",
												title: m.location || void 0,
												children: m.location || "N/A"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 whitespace-nowrap",
											children: getStatusBadge(m.status)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 max-w-52 text-xs",
											children: m.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => handleOpenNotesModal(m),
												className: "group text-left flex items-start gap-1.5 text-slate-700 dark:text-slate-300 hover:text-[#67B239] dark:hover:text-[#67B239] transition-colors cursor-pointer",
												title: "Click to view/edit notes",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5 text-slate-400 group-hover:text-[#67B239] shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "line-clamp-2 text-xs leading-snug",
													children: m.notes
												})]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => handleOpenNotesModal(m),
												className: "inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-[#67B239] transition-colors cursor-pointer",
												title: "Add notes",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3 text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Add Note" })]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 whitespace-nowrap",
											children: m.sms_sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
												variant: "outline",
												className: "bg-[#67B239]/15 text-[#468026] dark:text-[#7AC142] border-[#67B239]/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-[#67B239] stroke-[2.5]" }), "Sent"]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-full",
												children: "Pending"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 text-right whitespace-nowrap",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex items-center justify-end",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
													asChild: true,
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														variant: "ghost",
														size: "icon",
														className: "size-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-accent transition-colors cursor-pointer",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "sr-only",
															children: "Open actions menu"
														})]
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
													align: "end",
													className: "w-52",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
															onClick: () => setViewDetailMeeting(m),
															className: "cursor-pointer font-medium text-xs py-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5 text-slate-500 mr-2" }), " View Details"]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
															onClick: () => setEditingMeeting(m),
															className: "cursor-pointer font-medium text-xs py-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5 text-blue-600 mr-2" }), " Edit Meeting Details"]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
															onClick: () => handleOpenSmsModal(m),
															className: "cursor-pointer font-medium text-xs py-2 text-[#468026] dark:text-[#7AC142]",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-3.5 text-[#67B239] mr-2" }), " Send SMS Reminder"]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
															onClick: () => handleOpenNotesModal(m),
															className: "cursor-pointer font-medium text-xs py-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5 text-slate-500 mr-2" }), " Meeting Notes & Agenda"]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
															onClick: () => statusMutation.mutate({
																id: m.id,
																status: "Scheduled"
															}),
															className: "cursor-pointer font-medium text-xs py-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-3.5 text-amber-500 mr-2" }), " Mark Scheduled"]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
															onClick: () => statusMutation.mutate({
																id: m.id,
																status: "Completed"
															}),
															className: "cursor-pointer font-medium text-xs py-2 text-green-600 dark:text-green-400",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 text-[#67B239] mr-2" }), " Mark Completed"]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
															onClick: () => statusMutation.mutate({
																id: m.id,
																status: "Cancelled"
															}),
															className: "cursor-pointer font-medium text-xs py-2 text-rose-600 dark:text-rose-400",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3.5 text-rose-500 mr-2" }), " Mark Cancelled"]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
															onClick: () => handleOpenDeleteModal(m),
															className: "cursor-pointer font-semibold text-xs py-2 text-destructive focus:text-destructive focus:bg-rose-50 dark:focus:bg-rose-950/40",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5 text-destructive mr-2" }), " Delete Meeting"]
														})
													]
												})] })
											})
										})
									]
								}, m.id);
							})
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: Boolean(activeSmsMeeting),
				onOpenChange: (open) => !open && setActiveSmsMeeting(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md bg-white dark:bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2 text-base",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4 text-[#67B239]" }), " Send Meeting SMS Reminder"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
							className: "text-xs",
							children: [
								"Send SMS reminder for \"",
								activeSmsMeeting?.title,
								"\" to",
								" ",
								activeSmsMeeting?.phone || "client",
								"."
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-2",
							children: [smsResultText && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg bg-[#67B239]/10 border border-[#67B239]/30 text-[#0B3364] dark:text-foreground text-xs font-medium flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-[#67B239]" }),
									" ",
									smsResultText
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-medium",
									children: "SMS Message"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									rows: 4,
									value: smsMessageText,
									onChange: (e) => setSmsMessageText(e.target.value),
									className: "bg-white dark:bg-background text-xs"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setActiveSmsMeeting(null),
							className: "bg-white",
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							disabled: smsMutation.isPending || !smsMessageText.trim(),
							onClick: () => activeSmsMeeting && smsMutation.mutate({
								id: activeSmsMeeting.id,
								msg: smsMessageText
							}),
							className: "bg-[#67B239] text-white gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-3.5" }), smsMutation.isPending ? "Sending..." : "Send Reminder"]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: Boolean(activeNotesMeeting),
				onOpenChange: (open) => !open && setActiveNotesMeeting(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md bg-white dark:bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2 text-base",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4 text-[#67B239]" }), " Meeting Notes & Agenda"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
							className: "text-xs",
							children: [
								"Update discussion points or notes for \"",
								activeNotesMeeting?.title,
								"\"."
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3 py-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 5,
								value: editingNotesText,
								onChange: (e) => setEditingNotesText(e.target.value),
								placeholder: "Enter meeting notes...",
								className: "bg-white dark:bg-background text-sm"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setActiveNotesMeeting(null),
							className: "bg-white",
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							disabled: notesMutation.isPending,
							onClick: () => activeNotesMeeting && notesMutation.mutate({
								id: activeNotesMeeting.id,
								notes: editingNotesText
							}),
							className: "bg-[#67B239] text-white gap-1.5",
							children: notesMutation.isPending ? "Saving..." : "Save Notes"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingDetailModal, {
				open: Boolean(viewDetailMeeting),
				onOpenChange: (open) => !open && setViewDetailMeeting(null),
				meeting: viewDetailMeeting,
				onStatusChange: (id, status) => statusMutation.mutate({
					id,
					status
				}),
				onOpenSmsModal: (m) => handleOpenSmsModal(m),
				onOpenNotesModal: (m) => handleOpenNotesModal(m),
				onEditMeeting: (m) => {
					setViewDetailMeeting(null);
					setEditingMeeting(m);
				},
				onDeleteMeeting: (m) => {
					setViewDetailMeeting(null);
					handleOpenDeleteModal(m);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScheduleMeetingDialog, {
				open: isScheduleDialogOpen,
				onOpenChange: setIsScheduleDialogOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditMeetingDialog, {
				open: Boolean(editingMeeting),
				onOpenChange: (open) => !open && setEditingMeeting(null),
				meeting: editingMeeting,
				onDeleteMeeting: (m) => {
					setEditingMeeting(null);
					handleOpenDeleteModal(m);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteMeetingDialog, {
				meeting: deleteTarget,
				open: isDeleteDialogOpen,
				onOpenChange: setIsDeleteDialogOpen,
				onConfirm: () => deleteTarget && deleteMutation.mutate(deleteTarget.id),
				isDeleting: deleteMutation.isPending
			})
		]
	});
}
//#endregion
export { MeetingsPage as component };
