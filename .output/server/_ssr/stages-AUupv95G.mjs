import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { A as Slot, N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { t as Card } from "./card-CtX3ithx.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { A as SearchX, B as PowerOff, Ht as ChevronRight, Mt as Circle, V as Plus, Vt as ChevronUp, W as Pencil, Wt as ChevronDown, ct as Layers, k as Search, r as X, rt as Lock, t as lucide_react_exports, v as Trash2, wt as EllipsisVertical, z as Power } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B85j8UA0.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { d as DropdownMenuTrigger, i as DropdownMenuItem, n as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu-BfBJVxb8.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-Cmlz_mk1.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as stringType, i as objectType, n as coerce, t as booleanType } from "../_libs/zod.mjs";
import { t as PageHeader } from "./placeholder-page-BhrIUunO.mjs";
import { t as ScrollArea } from "./scroll-area-CsnbPvZP.mjs";
import { a as resolveStageColor, d as useCreateStage, f as useDeleteStage, i as isSystemStage, l as stagesWithCountsQuery, o as resolveStageIcon, p as useUpdateStage } from "./stages-U_8NJ4LG.mjs";
import { t as Checkbox } from "./checkbox-kt6FvQcE.mjs";
import { a as useFormContext, i as useForm, n as Controller, r as FormProvider, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stages-AUupv95G.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Form = FormProvider;
var FormFieldContext = import_react.createContext(null);
var FormField = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormFieldContext.Provider, {
		value: { name: props.name },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Controller, { ...props })
	});
};
var useFormField = () => {
	const fieldContext = import_react.useContext(FormFieldContext);
	const itemContext = import_react.useContext(FormItemContext);
	const { getFieldState, formState } = useFormContext();
	if (!fieldContext) throw new Error("useFormField should be used within <FormField>");
	if (!itemContext) throw new Error("useFormField should be used within <FormItem>");
	const fieldState = getFieldState(fieldContext.name, formState);
	const { id } = itemContext;
	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		...fieldState
	};
};
var FormItemContext = import_react.createContext(null);
var FormItem = import_react.forwardRef(({ className, ...props }, ref) => {
	const id = import_react.useId();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormItemContext.Provider, {
		value: { id },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref,
			className: cn("space-y-2", className),
			...props
		})
	});
});
FormItem.displayName = "FormItem";
var FormLabel = import_react.forwardRef(({ className, ...props }, ref) => {
	const { error, formItemId } = useFormField();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
		ref,
		className: cn(error && "text-destructive", className),
		htmlFor: formItemId,
		...props
	});
});
FormLabel.displayName = "FormLabel";
var FormControl = import_react.forwardRef(({ ...props }, ref) => {
	const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slot, {
		ref,
		id: formItemId,
		"aria-describedby": !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`,
		"aria-invalid": !!error,
		...props
	});
});
FormControl.displayName = "FormControl";
var FormDescription = import_react.forwardRef(({ className, ...props }, ref) => {
	const { formDescriptionId } = useFormField();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		ref,
		id: formDescriptionId,
		className: cn("text-[0.8rem] text-muted-foreground", className),
		...props
	});
});
FormDescription.displayName = "FormDescription";
var FormMessage = import_react.forwardRef(({ className, children, ...props }, ref) => {
	const { error, formMessageId } = useFormField();
	const body = error ? String(error?.message ?? "") : children;
	if (!body) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		ref,
		id: formMessageId,
		className: cn("text-[0.8rem] font-medium text-destructive", className),
		...props,
		children: body
	});
});
FormMessage.displayName = "FormMessage";
var CRM_STAGE_ICONS = [
	{
		name: "Circle",
		label: "Default Circle",
		defaultColor: "#3B82F6",
		tags: [
			"circle",
			"dot",
			"default"
		]
	},
	{
		name: "CheckCircle2",
		label: "Success Circle",
		defaultColor: "#10B981",
		tags: [
			"check",
			"done",
			"success",
			"won"
		]
	},
	{
		name: "CheckCircle",
		label: "Check Circle",
		defaultColor: "#10B981",
		tags: [
			"check",
			"complete",
			"won"
		]
	},
	{
		name: "Check",
		label: "Checkmark",
		defaultColor: "#059669",
		tags: [
			"check",
			"ok",
			"yes"
		]
	},
	{
		name: "Trophy",
		label: "Trophy (Won)",
		defaultColor: "#10B981",
		tags: [
			"trophy",
			"winner",
			"deal",
			"sales"
		]
	},
	{
		name: "Award",
		label: "Award Medal",
		defaultColor: "#F59E0B",
		tags: [
			"award",
			"reward",
			"star"
		]
	},
	{
		name: "BadgeCheck",
		label: "Verified Badge",
		defaultColor: "#0EA5E9",
		tags: [
			"verified",
			"check",
			"badge"
		]
	},
	{
		name: "Star",
		label: "Star",
		defaultColor: "#F59E0B",
		tags: [
			"star",
			"favorite",
			"vip"
		]
	},
	{
		name: "Sparkles",
		label: "Sparkles",
		defaultColor: "#EC4899",
		tags: [
			"magic",
			"ai",
			"new",
			"fresh"
		]
	},
	{
		name: "Flame",
		label: "Hot / Flame",
		defaultColor: "#F97316",
		tags: [
			"hot",
			"fire",
			"urgent",
			"lead"
		]
	},
	{
		name: "Zap",
		label: "Lightning",
		defaultColor: "#EAB308",
		tags: [
			"fast",
			"quick",
			"energy",
			"instant"
		]
	},
	{
		name: "Target",
		label: "Target / Goal",
		defaultColor: "#8B5CF6",
		tags: [
			"target",
			"aim",
			"goal",
			"kpi"
		]
	},
	{
		name: "TrendingUp",
		label: "Trending Up",
		defaultColor: "#10B981",
		tags: [
			"growth",
			"sales",
			"increase",
			"up"
		]
	},
	{
		name: "Phone",
		label: "Phone",
		defaultColor: "#3B82F6",
		tags: [
			"call",
			"contact",
			"telesales"
		]
	},
	{
		name: "PhoneCall",
		label: "Calling",
		defaultColor: "#2563EB",
		tags: [
			"active",
			"call",
			"inbound"
		]
	},
	{
		name: "PhoneForwarded",
		label: "Forward Call",
		defaultColor: "#6366F1",
		tags: ["transfer", "forward"]
	},
	{
		name: "PhoneOff",
		label: "Phone Off",
		defaultColor: "#64748B",
		tags: [
			"switched off",
			"unreachable",
			"off"
		]
	},
	{
		name: "PhoneMissed",
		label: "Missed Call",
		defaultColor: "#F43F5E",
		tags: [
			"dnp",
			"missed",
			"did not pick"
		]
	},
	{
		name: "Clock",
		label: "Clock",
		defaultColor: "#64748B",
		tags: [
			"time",
			"wait",
			"pending",
			"history"
		]
	},
	{
		name: "Calendar",
		label: "Calendar",
		defaultColor: "#3B82F6",
		tags: [
			"date",
			"event",
			"schedule"
		]
	},
	{
		name: "CalendarClock",
		label: "Scheduled Time",
		defaultColor: "#8B5CF6",
		tags: [
			"schedule",
			"follow up",
			"due"
		]
	},
	{
		name: "CalendarCheck",
		label: "Meeting Done",
		defaultColor: "#10B981",
		tags: ["meeting", "completed"]
	},
	{
		name: "CalendarDays",
		label: "Calendar Days",
		defaultColor: "#0284C7",
		tags: [
			"agenda",
			"week",
			"planner"
		]
	},
	{
		name: "Timer",
		label: "Timer",
		defaultColor: "#F59E0B",
		tags: ["countdown", "reminder"]
	},
	{
		name: "UserPlus",
		label: "New Lead",
		defaultColor: "#3B82F6",
		tags: [
			"new",
			"lead",
			"add user",
			"prospect"
		]
	},
	{
		name: "Users",
		label: "Clients / Team",
		defaultColor: "#6366F1",
		tags: [
			"people",
			"group",
			"prospects"
		]
	},
	{
		name: "UserCheck",
		label: "Qualified Lead",
		defaultColor: "#10B981",
		tags: ["approved", "user check"]
	},
	{
		name: "UserX",
		label: "Unqualified Lead",
		defaultColor: "#EF4444",
		tags: [
			"lost",
			"rejected",
			"remove"
		]
	},
	{
		name: "DollarSign",
		label: "Dollar / Revenue",
		defaultColor: "#059669",
		tags: [
			"money",
			"sales",
			"price"
		]
	},
	{
		name: "CreditCard",
		label: "Payment / Card",
		defaultColor: "#8B5CF6",
		tags: [
			"payment",
			"billing",
			"invoice"
		]
	},
	{
		name: "Receipt",
		label: "Receipt",
		defaultColor: "#10B981",
		tags: [
			"bill",
			"invoice",
			"payment"
		]
	},
	{
		name: "Wallet",
		label: "Wallet",
		defaultColor: "#0D9488",
		tags: ["finance", "balance"]
	},
	{
		name: "FileText",
		label: "Quotation / Note",
		defaultColor: "#6366F1",
		tags: [
			"quotation",
			"proposal",
			"doc"
		]
	},
	{
		name: "FileCheck",
		label: "Proposal Accepted",
		defaultColor: "#10B981",
		tags: [
			"proposal",
			"contract",
			"approved"
		]
	},
	{
		name: "Briefcase",
		label: "Deal / Business",
		defaultColor: "#8B5CF6",
		tags: [
			"opportunity",
			"business",
			"work"
		]
	},
	{
		name: "Building",
		label: "Enterprise / Company",
		defaultColor: "#475569",
		tags: [
			"company",
			"b2b",
			"corp"
		]
	},
	{
		name: "Send",
		label: "Sent Outreach",
		defaultColor: "#0284C7",
		tags: [
			"send",
			"sent",
			"quotation sent"
		]
	},
	{
		name: "Mail",
		label: "Email",
		defaultColor: "#3B82F6",
		tags: [
			"email",
			"letter",
			"inbox"
		]
	},
	{
		name: "MailCheck",
		label: "Email Read",
		defaultColor: "#10B981",
		tags: ["email check", "opened"]
	},
	{
		name: "MessageSquare",
		label: "Message / SMS",
		defaultColor: "#06B6D4",
		tags: [
			"chat",
			"sms",
			"whatsapp"
		]
	},
	{
		name: "MessageCircle",
		label: "Comment / Chat",
		defaultColor: "#0EA5E9",
		tags: ["chat", "discussion"]
	},
	{
		name: "XCircle",
		label: "Lost / Rejected",
		defaultColor: "#EF4444",
		tags: [
			"lost",
			"cancel",
			"fail",
			"no"
		]
	},
	{
		name: "Ban",
		label: "Denied / Blocked",
		defaultColor: "#DC2626",
		tags: [
			"denied",
			"not interested",
			"block"
		]
	},
	{
		name: "Slash",
		label: "Invalid Number",
		defaultColor: "#94A3B8",
		tags: [
			"invalid",
			"wrong number",
			"bad"
		]
	},
	{
		name: "AlertCircle",
		label: "Attention Needed",
		defaultColor: "#F59E0B",
		tags: [
			"alert",
			"warning",
			"attention"
		]
	},
	{
		name: "AlertTriangle",
		label: "High Risk",
		defaultColor: "#F97316",
		tags: [
			"danger",
			"risk",
			"warning"
		]
	},
	{
		name: "HelpCircle",
		label: "Needs Info",
		defaultColor: "#64748B",
		tags: [
			"question",
			"clarify",
			"info"
		]
	},
	{
		name: "Layers",
		label: "Pipeline Stage",
		defaultColor: "#6366F1",
		tags: [
			"stages",
			"workflow",
			"stack"
		]
	},
	{
		name: "ListChecks",
		label: "Task List",
		defaultColor: "#10B981",
		tags: [
			"tasks",
			"checklist",
			"todo"
		]
	},
	{
		name: "Tag",
		label: "Category / Tag",
		defaultColor: "#EC4899",
		tags: [
			"tag",
			"label",
			"segment"
		]
	},
	{
		name: "Bookmark",
		label: "Bookmarked",
		defaultColor: "#8B5CF6",
		tags: [
			"saved",
			"flag",
			"star"
		]
	},
	{
		name: "Shield",
		label: "Secure",
		defaultColor: "#3B82F6",
		tags: ["protection", "verified"]
	},
	{
		name: "ShieldCheck",
		label: "Guaranteed",
		defaultColor: "#10B981",
		tags: [
			"guarantee",
			"secure",
			"trust"
		]
	},
	{
		name: "Heart",
		label: "Loyal Client",
		defaultColor: "#F43F5E",
		tags: [
			"vip",
			"favorite",
			"love"
		]
	},
	{
		name: "RefreshCw",
		label: "Retargeting",
		defaultColor: "#06B6D4",
		tags: [
			"retry",
			"refresh",
			"recycle"
		]
	},
	{
		name: "Lightbulb",
		label: "Idea / Discovery",
		defaultColor: "#F59E0B",
		tags: [
			"idea",
			"insight",
			"solution"
		]
	},
	{
		name: "Flag",
		label: "Milestone Flag",
		defaultColor: "#EF4444",
		tags: [
			"flag",
			"milestone",
			"priority"
		]
	},
	{
		name: "Bell",
		label: "Notification",
		defaultColor: "#F59E0B",
		tags: [
			"alert",
			"reminder",
			"bell"
		]
	}
];
function getIconDefaultColor(iconName) {
	if (!iconName) return "#3B82F6";
	return CRM_STAGE_ICONS.find((i) => i.name.toLowerCase() === iconName.toLowerCase())?.defaultColor || "#3B82F6";
}
function IconPicker({ value, onChange, onSelectColor, color, className }) {
	const [open, setOpen] = import_react.useState(false);
	const [search, setSearch] = import_react.useState("");
	const currentIconName = value || "Circle";
	const currentDefaultColor = getIconDefaultColor(currentIconName);
	const activeColor = color || currentDefaultColor;
	const SelectedIconComponent = lucide_react_exports[currentIconName] || Circle;
	const filteredIcons = import_react.useMemo(() => {
		const q = search.toLowerCase().trim();
		if (!q) return CRM_STAGE_ICONS;
		return CRM_STAGE_ICONS.filter((item) => item.name.toLowerCase().includes(q) || item.label.toLowerCase().includes(q) || item.tags.some((t) => t.toLowerCase().includes(q)));
	}, [search]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "outline",
				className: cn("w-full h-10 px-3 justify-between rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted/50 cursor-pointer", className),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "size-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs transition-transform hover:scale-105",
						style: { backgroundColor: activeColor },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectedIconComponent, { className: "size-4 text-white" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground font-medium",
						children: "Select Icon"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 text-slate-400 shrink-0 ml-1 opacity-70" })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
			align: "start",
			className: "w-76 sm:w-84 p-3.5 rounded-2xl shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 size-3.5 text-slate-400" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Search icons...",
							value: search,
							onChange: (e) => setSearch(e.target.value),
							className: "h-8.5 pl-8 text-xs rounded-xl bg-slate-50 dark:bg-muted/40 border-slate-200 dark:border-slate-800",
							autoFocus: true
						}),
						search && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setSearch(""),
							className: "absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "h-56 pr-1",
					children: filteredIcons.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-8 text-center text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchX, { className: "size-6 mx-auto mb-1.5 opacity-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium",
							children: "No matching icons"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-5 sm:grid-cols-6 gap-2 p-1",
						children: filteredIcons.map((item) => {
							const IconComp = lucide_react_exports[item.name] || Circle;
							const isSelected = currentIconName === item.name;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									onChange(item.name, item.defaultColor);
									if (onSelectColor) onSelectColor(item.defaultColor);
									setOpen(false);
								},
								title: item.label,
								className: cn("size-9.5 rounded-xl flex items-center justify-center transition-all cursor-pointer relative shadow-2xs", isSelected ? "ring-2 ring-offset-2 ring-primary scale-105 shadow-md" : "hover:scale-110 hover:shadow-xs"),
								style: {
									backgroundColor: isSelected ? color || item.defaultColor : `${item.defaultColor}16`,
									border: isSelected ? "none" : `1px solid ${item.defaultColor}35`
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconComp, {
									className: "size-4.5 transition-transform",
									style: { color: isSelected ? "#FFFFFF" : item.defaultColor }
								})
							}, item.name);
						})
					})
				})]
			})
		})]
	});
}
var stageFormSchema = objectType({
	name: stringType().min(1, "Name is required"),
	stage_group: stringType().min(1, "Group is required"),
	sort_order: coerce.number().int().min(0),
	is_follow_up: booleanType(),
	color: stringType().nullable().optional(),
	icon: stringType().nullable().optional()
});
function StageManagementPage() {
	const navigate = useNavigate();
	const stages = useQuery(stagesWithCountsQuery());
	const createMutation = useCreateStage();
	const updateMutation = useUpdateStage();
	const deleteMutation = useDeleteStage();
	const [isDialogOpen, setIsDialogOpen] = (0, import_react.useState)(false);
	const [editingStage, setEditingStage] = (0, import_react.useState)(null);
	const [search, setSearch] = (0, import_react.useState)("");
	const rawStagesList = stages.data ?? [];
	const filteredStages = rawStagesList.filter((s) => {
		if (!search || !search.trim()) return true;
		const q = search.toLowerCase().trim();
		return s.name.toLowerCase().includes(q) || String(s.sort_order).includes(q);
	});
	const form = useForm({
		resolver: u(stageFormSchema),
		defaultValues: {
			name: "",
			stage_group: "prospect",
			sort_order: (rawStagesList.length ?? 0) + 1,
			is_follow_up: false,
			color: "#2563EB",
			icon: "Circle"
		}
	});
	const onSubmit = (values) => {
		const payload = {
			name: values.name,
			stage_group: values.stage_group,
			sort_order: values.sort_order,
			is_follow_up: values.is_follow_up,
			color: values.color ?? null,
			icon: values.icon ?? null,
			is_active: true
		};
		if (editingStage) updateMutation.mutate({
			id: editingStage.id,
			...payload
		}, { onSuccess: () => {
			setIsDialogOpen(false);
			setEditingStage(null);
			form.reset();
		} });
		else createMutation.mutate(payload, { onSuccess: () => {
			setIsDialogOpen(false);
			form.reset();
		} });
	};
	const handleEdit = (stage) => {
		if (isSystemStage(stage)) {
			toast.error("System stage is protected and cannot be edited.");
			return;
		}
		setEditingStage(stage);
		form.reset({
			name: stage.name,
			stage_group: stage.stage_group,
			sort_order: stage.sort_order,
			is_follow_up: stage.is_follow_up,
			color: resolveStageColor(stage.name, stage.color),
			icon: resolveStageIcon(stage.name, stage.icon)
		});
		setIsDialogOpen(true);
	};
	const toggleActive = (stage) => {
		if (isSystemStage(stage) && stage.is_active) {
			toast.error("System stages are required for core CRM workflows and cannot be deactivated.");
			return;
		}
		updateMutation.mutate({
			id: stage.id,
			is_active: !stage.is_active
		});
	};
	const handleDelete = (id) => {
		const stage = rawStagesList.find((s) => s.id === id);
		if (stage && isSystemStage(stage)) {
			toast.error("System stages cannot be deleted as they are required for CRM workflows.");
			return;
		}
		if (window.confirm("Are you sure you want to delete this stage? This cannot be undone.")) deleteMutation.mutate(id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Stage Management",
				description: "Configure your sales pipeline stages, colors, and tracking rules.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => {
						setEditingStage(null);
						form.reset();
						setIsDialogOpen(true);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 size-4" }), "Create Stage"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative max-w-sm flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-2.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Search stages by name or order...",
						value: search,
						onChange: (e) => setSearch(e.target.value),
						className: "pl-9 pr-8 bg-white dark:bg-card rounded-xl"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "bg-white dark:bg-card border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden rounded-2xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left border-collapse text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b bg-slate-50/80 dark:bg-muted/50 font-semibold text-muted-foreground uppercase tracking-wider",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3.5 px-4 w-16 text-center",
									children: "Order"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3.5 px-4",
									children: "Stage Name & Color"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3.5 px-4",
									children: "Prospects"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3.5 px-4",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3.5 px-4 text-right",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border/60",
							children: stages.isPending ? Array.from({ length: 6 }).map((_, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 5,
								className: "py-4 px-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full rounded-xl" })
							}) }, idx)) : filteredStages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								colSpan: 5,
								className: "py-12 text-center text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-8 mx-auto text-slate-300 mb-2" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold text-foreground",
										children: "No stages found"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-0.5",
										children: "Try resetting your search filter or create a new stage."
									})
								]
							}) }) : filteredStages.map((stage) => {
								const brandColor = resolveStageColor(stage.name, stage.color);
								const iconName = resolveStageIcon(stage.name, stage.icon);
								const IconComponent = lucide_react_exports[iconName] || lucide_react_exports[stage.icon || "Circle"] || Circle;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: `hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors ${!stage.is_active ? "opacity-60 bg-slate-50/40 dark:bg-muted/10" : ""}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 text-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "inline-flex items-center gap-1 font-mono font-bold text-slate-700 dark:text-slate-300",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "w-5 text-center",
													children: stage.sort_order
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-col",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-0.5",
														onClick: () => updateMutation.mutate({
															id: stage.id,
															sort_order: Math.max(0, stage.sort_order - 1)
														}),
														title: "Move Up",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-3" })
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-0.5",
														onClick: () => updateMutation.mutate({
															id: stage.id,
															sort_order: stage.sort_order + 1
														}),
														title: "Move Down",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3" })
													})]
												})]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "size-9 rounded-xl flex items-center justify-center shrink-0 text-white shadow-2xs transition-transform hover:scale-105",
													style: { backgroundColor: brandColor },
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconComponent, { className: "size-4.5 text-white" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm",
														children: stage.name
													}), isSystemStage(stage) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
														className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[9px] px-1.5 py-0 gap-1 font-bold border border-slate-200 dark:border-slate-700",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-2.5 text-slate-500" }), "System"]
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "flex items-center gap-2 mt-1",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border",
														style: {
															backgroundColor: `${brandColor}15`,
															color: brandColor,
															borderColor: `${brandColor}35`
														},
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "size-2 rounded-full inline-block shadow-2xs",
															style: { backgroundColor: brandColor }
														}), brandColor.toUpperCase()]
													})
												})] })]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 whitespace-nowrap",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "ghost",
												size: "sm",
												className: "h-7 px-2 text-xs font-bold gap-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800",
												onClick: () => navigate({
													to: "/prospects",
													search: { search: stage.name }
												}),
												title: "View prospects in this stage",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-foreground",
														children: stage.prospect_count
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-muted-foreground font-normal",
														children: [
															"(",
															stage.prospect_percentage,
															"%)"
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3 text-slate-400" })
												]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 whitespace-nowrap",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => toggleActive(stage),
												className: `cursor-pointer ${isSystemStage(stage) ? "cursor-default" : ""}`,
												title: isSystemStage(stage) ? "System stages remain active" : "Click to toggle status",
												children: stage.is_active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
													className: "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 text-[10px] px-2 py-0.5 font-semibold gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-emerald-500 inline-block" }), "Active"]
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
													variant: "outline",
													className: "text-slate-400 border-slate-200 text-[10px] px-2 py-0.5 font-semibold gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-slate-400 inline-block" }), "Inactive"]
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 text-right whitespace-nowrap",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex items-center justify-end gap-1",
												children: isSystemStage(stage) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													variant: "outline",
													size: "sm",
													disabled: true,
													className: "h-7 px-2 text-xs font-semibold rounded-lg gap-1 opacity-50 cursor-not-allowed bg-slate-50 dark:bg-muted/20 border-slate-200 dark:border-slate-800 text-slate-500",
													title: "System stage is protected and cannot be edited or deleted",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3 text-slate-400" }), "System Locked"]
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													variant: "outline",
													size: "sm",
													className: "h-7 px-2 text-xs font-semibold rounded-lg gap-1 cursor-pointer",
													onClick: () => handleEdit(stage),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3 text-blue-600" }), "Edit"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
													asChild: true,
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														variant: "ghost",
														size: "icon",
														className: "size-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "size-3.5" })
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
													align: "end",
													className: "rounded-xl shadow-xl border-slate-200 dark:border-slate-800",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
															onClick: () => handleEdit(stage),
															className: "text-xs font-semibold cursor-pointer rounded-lg",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-2 size-3.5 text-blue-500" }), "Edit Properties"]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
															onClick: () => toggleActive(stage),
															className: "text-xs font-semibold cursor-pointer rounded-lg",
															children: stage.is_active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PowerOff, { className: "mr-2 size-3.5 text-rose-500" }),
																" ",
																"Deactivate"
															] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Power, { className: "mr-2 size-3.5 text-emerald-500" }),
																" ",
																"Activate"
															] })
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
															className: "text-destructive text-xs font-semibold cursor-pointer rounded-lg",
															onClick: () => handleDelete(stage.id),
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 size-3.5" }), "Delete Stage"]
														})
													]
												})] })] })
											})
										})
									]
								}, stage.id);
							})
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: isDialogOpen,
				onOpenChange: setIsDialogOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editingStage ? "Edit Stage" : "Create New Stage" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Configure the pipeline stage details. Normalized names must be unique." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Form, {
						...form,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: form.handleSubmit(onSubmit),
							className: "space-y-4 py-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
									control: form.control,
									name: "name",
									render: ({ field }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FormItem, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormLabel, { children: "Stage Name" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControl, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "e.g. Sales Won",
											...field
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormMessage, {})
									] })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
										control: form.control,
										name: "stage_group",
										render: ({ field }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FormItem, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormLabel, { children: "Group" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												onValueChange: field.onChange,
												defaultValue: field.value,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControl, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select group" }) }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "new",
														children: "New"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "progress",
														children: "In Progress"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "won",
														children: "Won"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "lost",
														children: "Lost"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "denied",
														children: "Denied"
													})
												] })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormMessage, {})
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
										control: form.control,
										name: "sort_order",
										render: ({ field }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FormItem, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormLabel, { children: "Order" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControl, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												...field
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormMessage, {})
										] })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
										control: form.control,
										name: "color",
										render: ({ field }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FormItem, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormLabel, { children: "Color" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControl, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "color",
													className: "p-1 w-12 h-10",
													...field,
													value: field.value ?? ""
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													...field,
													value: field.value ?? ""
												})]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormMessage, {})
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
										control: form.control,
										name: "icon",
										render: ({ field }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FormItem, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormLabel, { children: "Stage Icon" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControl, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconPicker, {
												value: field.value,
												onChange: (iconName, defaultColor) => {
													field.onChange(iconName);
													if (defaultColor) form.setValue("color", defaultColor);
												},
												color: form.watch("color") || void 0
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormMessage, {})
										] })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
									control: form.control,
									name: "is_follow_up",
									render: ({ field }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FormItem, {
										className: "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControl, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
											checked: field.value,
											onCheckedChange: field.onChange
										}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1 leading-none",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormLabel, { children: "Mark as Follow-up" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Prospects in this stage will appear in follow-up reports."
											})]
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									disabled: createMutation.isPending || updateMutation.isPending,
									children: editingStage ? "Save Changes" : "Create Stage"
								}) })
							]
						})
					})]
				})
			})
		]
	});
}
//#endregion
export { StageManagementPage as component };
