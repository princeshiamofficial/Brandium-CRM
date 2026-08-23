import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B85j8UA0.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./auth-DmJHUQUY.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { i as prospectsOptionsQuery, t as createMeeting } from "./meetings-DwgaH8ij.mjs";
import { t as agentsQuery } from "./follow-ups-hGujMQYp.mjs";
import { n as RadioGroupItem, t as RadioGroup } from "./radio-group-BJ3sdkEm.mjs";
import { t as Checkbox } from "./checkbox-kt6FvQcE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/schedule-meeting-dialog-CvYtY_sd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ScheduleMeetingDialog({ open, onOpenChange, defaultProspectId, onSuccess }) {
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
	const [prospectId, setProspectId] = (0, import_react.useState)(defaultProspectId ?? "");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [meetingDate, setMeetingDate] = (0, import_react.useState)("");
	const [meetingTime, setMeetingTime] = (0, import_react.useState)("10:00");
	const [meetingType, setMeetingType] = (0, import_react.useState)("Office");
	const [location, setLocation] = (0, import_react.useState)("");
	const [assignedUserId, setAssignedUserId] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [sendSms, setSendSms] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setTitle("");
		setProspectId(defaultProspectId ?? "");
		setMeetingType("Office");
		setLocation("");
		const tomorrow = new Date(Date.now() + 864e5).toISOString().split("T")[0];
		setMeetingDate(tomorrow || "");
		setMeetingTime("10:00");
		setDescription("");
		setSendSms(true);
		if (defaultProspectId && prospects.data) {
			const found = prospects.data.find((p) => p.id === defaultProspectId);
			if (found?.phone) setPhone(found.phone);
		} else setPhone("");
		if (user?.id) setAssignedUserId(user.id);
		else if (agentList.length > 0 && agentList[0]) setAssignedUserId(agentList[0].id);
	}, [
		open,
		defaultProspectId,
		user?.id,
		agentList,
		prospects.data
	]);
	const handleProspectSelect = (pId) => {
		setProspectId(pId);
		if (pId && pId !== "none" && prospects.data) {
			const found = prospects.data.find((p) => p.id === pId);
			if (found?.phone) setPhone(found.phone);
			if (!title && found?.business_name) setTitle(`Meeting with ${found.business_name}`);
		}
	};
	const createMutation = useMutation({
		mutationFn: createMeeting,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["meetings"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
			queryClient.invalidateQueries({ queryKey: ["prospects"] });
			queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
			toast.success("Meeting scheduled successfully!");
			onOpenChange(false);
			if (onSuccess) onSuccess();
		},
		onError: (err) => {
			toast.error(err.message || "Failed to schedule meeting.");
		}
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!title.trim()) {
			toast.error("Please enter a meeting title.");
			return;
		}
		if (!meetingDate) {
			toast.error("Please select a meeting date.");
			return;
		}
		createMutation.mutate({
			title: title.trim(),
			prospect_id: prospectId && prospectId !== "none" ? prospectId : null,
			phone: phone.trim() || null,
			meeting_type: meetingType,
			location: location.trim() || null,
			meeting_date: meetingDate,
			meeting_time: meetingTime || "10:00",
			assigned_user_id: assignedUserId && assignedUserId !== "unassigned" ? assignedUserId : null,
			notes: description.trim() || null,
			send_sms_now: sendSms
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-lg p-6 max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
				className: "pb-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "text-xl font-bold tracking-tight text-foreground",
					children: "Schedule New Meeting"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-xs text-muted-foreground",
					children: "Plan an appointment, demo, or consultation with client."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "space-y-4 pt-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "meeting-title",
							className: "text-xs font-semibold text-foreground",
							children: ["Meeting Title ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-destructive",
								children: "*"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "meeting-title",
							placeholder: "Enter Meeting Title",
							value: title,
							onChange: (e) => setTitle(e.target.value),
							className: "h-10 text-sm rounded-xl focus-visible:ring-[#67B239]",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "meeting-prospect",
							className: "text-xs font-semibold text-foreground",
							children: ["Prospects ", prospectCount > 0 && `(${prospectCount} available)`]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: prospectId,
							onValueChange: handleProspectSelect,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "meeting-prospect",
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
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								htmlFor: "meeting-date",
								className: "text-xs font-semibold text-foreground",
								children: ["Date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-destructive",
									children: "*"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "meeting-date",
									type: "date",
									value: meetingDate,
									onChange: (e) => setMeetingDate(e.target.value),
									className: "h-10 text-sm rounded-xl focus-visible:ring-[#67B239]",
									required: true
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "meeting-time",
								className: "text-xs font-semibold text-foreground",
								children: "Time"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "meeting-time",
									type: "time",
									value: meetingTime,
									onChange: (e) => setMeetingTime(e.target.value),
									className: "h-10 text-sm rounded-xl focus-visible:ring-[#67B239]"
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2 pt-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioGroup, {
							value: meetingType,
							onValueChange: (v) => setMeetingType(v),
							className: "flex items-center gap-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center space-x-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
										value: "Office",
										id: "type-office",
										className: "text-[#67B239] border-slate-400 data-[state=checked]:border-[#67B239] data-[state=checked]:text-[#67B239]"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "type-office",
										className: "text-sm font-medium cursor-pointer",
										children: "Office"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center space-x-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
										value: "Online",
										id: "type-online",
										className: "text-[#67B239] border-slate-400 data-[state=checked]:border-[#67B239] data-[state=checked]:text-[#67B239]"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "type-online",
										className: "text-sm font-medium cursor-pointer",
										children: "Online"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center space-x-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
										value: "Client Location",
										id: "type-location",
										className: "text-[#67B239] border-slate-400 data-[state=checked]:border-[#67B239] data-[state=checked]:text-[#67B239]"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "type-location",
										className: "text-sm font-medium cursor-pointer",
										children: "Location"
									})]
								})
							]
						})
					}),
					(meetingType === "Client Location" || meetingType === "Online") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5 animate-in fade-in-50 duration-200",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "meeting-location",
							className: "text-xs font-semibold text-foreground",
							children: meetingType === "Online" ? "Meeting Link (Google Meet / Zoom)" : "Location Name & Address"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "meeting-location",
							placeholder: meetingType === "Online" ? "https://meet.google.com/..." : "Enter Location name",
							value: location,
							onChange: (e) => setLocation(e.target.value),
							className: "h-10 text-sm rounded-xl focus-visible:ring-[#67B239]"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "meeting-agent",
							className: "text-xs font-semibold text-foreground",
							children: "Assign Agent"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: assignedUserId,
							onValueChange: setAssignedUserId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "meeting-agent",
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
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "meeting-desc",
							className: "text-xs font-semibold text-foreground",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "meeting-desc",
							rows: 3,
							placeholder: "Write meeting description here",
							value: description,
							onChange: (e) => setDescription(e.target.value),
							className: "resize-none text-sm rounded-xl focus-visible:ring-[#67B239]"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center space-x-2 pt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							id: "meeting-sms",
							checked: sendSms,
							onCheckedChange: (c) => setSendSms(Boolean(c)),
							className: "data-[state=checked]:bg-[#67B239] data-[state=checked]:border-[#67B239]"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "meeting-sms",
							className: "text-xs text-muted-foreground font-medium cursor-pointer",
							children: "Send SMS reminder notification to prospect"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
						className: "gap-2 sm:gap-3 pt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => onOpenChange(false),
							className: "h-10 px-5 rounded-xl border-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-muted dark:border-border text-slate-700 dark:text-foreground font-medium text-sm",
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: createMutation.isPending,
							className: "h-10 px-6 rounded-xl bg-[#67B239] hover:bg-[#5AA030] text-white font-semibold text-sm shadow-sm transition-all",
							children: createMutation.isPending ? "Scheduling..." : "Schedule Meeting"
						})]
					})
				]
			})]
		})
	});
}
//#endregion
export { ScheduleMeetingDialog as t };
