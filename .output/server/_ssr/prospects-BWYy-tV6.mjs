import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as runMySQLQuery } from "./mysql-api-5N6cl0NN.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { $ as MapPin, $t as Building2, At as Clock, D as ShieldAlert, Et as DollarSign, F as Repeat, G as PenLine, H as Phone, I as RefreshCw, It as CirclePlus, M as Save, Mt as Circle, V as Plus, W as Pencil, Yt as Calendar, _ as TrendingUp, bt as Eye, c as UsersRound, et as Mail, g as TriangleAlert, h as Trophy, ht as FileText, it as LoaderCircle, k as Search, l as User, p as UserCheck, pt as Funnel, q as Palette, t as lucide_react_exports, tn as Briefcase, v as Trash2, wt as EllipsisVertical, x as Star } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B85j8UA0.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as agentOptionsQueryOptions } from "./won-sales-B4SFdrYf.mjs";
import { n as useAuth } from "./auth-BcRCHmBi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { d as DropdownMenuTrigger, i as DropdownMenuItem, n as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu-BfBJVxb8.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-Cmlz_mk1.mjs";
import { l as format } from "../_libs/date-fns.mjs";
import { t as Calendar$1 } from "./calendar-BkciPy-j.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as AddInvoiceDialog } from "./add-invoice-dialog-DHY_CR6M.mjs";
import { t as FollowUpDialog } from "./follow-up-dialog-BUmnpyLs.mjs";
import { n as createDeniedPaymentRecord } from "./denied-payments-ROsSRYab.mjs";
import { t as PageHeader } from "./placeholder-page-BhrIUunO.mjs";
import { a as resolveStageColor, c as stagesQuery, n as deleteStageHistoryEntry, o as resolveStageIcon, r as formatStageSlugOrName, s as stageHistoryQuery, t as FALLBACK_STAGES } from "./stages-jI-xa6bm.mjs";
import { t as ChangeStageDialog } from "./change-stage-dialog-Dioo1tGA.mjs";
import { t as l } from "../_libs/use-debounce.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-xg-4wkRV.mjs";
import { t as ScheduleMeetingDialog } from "./schedule-meeting-dialog-e9haL8DG.mjs";
import { a as getProspectArtistName, c as prospectsStatsQuery, i as getProspectAgentName, n as deleteProspect, s as prospectsQuery, t as createProspect } from "./prospects-C0l6UE05.mjs";
import { t as Route } from "./prospects-CraodbVs.mjs";
import { n as servicesQueryOptions } from "./services-DwIFObB3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prospects-BWYy-tV6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DENIED_BY_OPTIONS = [
	{
		value: "Client",
		label: "Client"
	},
	{
		value: "Finance",
		label: "Finance / Accounts"
	},
	{
		value: "Bank",
		label: "Bank"
	},
	{
		value: "Management",
		label: "Management"
	},
	{
		value: "Other",
		label: "Other"
	}
];
function RecordDeniedPaymentDialog({ open, onOpenChange, defaultProspectId, onSuccess }) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [denialReason, setDenialReason] = (0, import_react.useState)("");
	const [deniedBy, setDeniedBy] = (0, import_react.useState)("Client");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (open) {
			setDenialReason("");
			setDeniedBy("Client");
			setAmount("");
			setNotes("");
		}
	}, [open]);
	const recordMutation = useMutation({
		mutationFn: async () => {
			if (!defaultProspectId) throw new Error("No prospect selected.");
			await createDeniedPaymentRecord({
				prospectId: defaultProspectId,
				denialReason: denialReason.trim(),
				deniedBy,
				amount: amount ? Number(amount) : void 0,
				notes: notes.trim() || void 0,
				agentId: user?.id ?? null
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["prospects"] });
			queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
			queryClient.invalidateQueries({ queryKey: ["denied-payments"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
			toast.success("Denied Payment recorded successfully!");
			onOpenChange(false);
			if (onSuccess) onSuccess();
		},
		onError: (err) => {
			toast.error(err.message || "Failed to record denied payment.");
		}
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!denialReason.trim()) {
			toast.error("Please enter a denial reason.");
			return;
		}
		recordMutation.mutate();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md p-6 rounded-2xl sm:rounded-3xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
				className: "pb-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2 text-xl font-bold tracking-tight text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-5 text-red-500" }), "Record Denied Payment"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-xs text-muted-foreground",
					children: "Log the reason and details for this denied payment. The prospect stage will be updated automatically."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "space-y-4 pt-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "denial-reason",
							className: "text-xs font-semibold text-foreground",
							children: ["Denial Reason ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-destructive",
								children: "*"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "denial-reason",
							rows: 3,
							placeholder: "Why was the payment denied?",
							value: denialReason,
							onChange: (e) => setDenialReason(e.target.value),
							className: "resize-none text-sm rounded-xl focus-visible:ring-red-500",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "denied-by",
							className: "text-xs font-semibold text-foreground",
							children: "Denied By"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: deniedBy,
							onValueChange: setDeniedBy,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "denied-by",
								className: "h-10 text-sm rounded-xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Who denied the payment?" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: DENIED_BY_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: opt.value,
								children: opt.label
							}, opt.value)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "denied-amount",
							className: "text-xs font-semibold text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "size-3" }),
									"Amount Denied (BDT)",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground font-normal",
										children: "(Optional)"
									})
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "denied-amount",
							type: "number",
							min: "0",
							step: "1",
							placeholder: "0",
							value: amount,
							onChange: (e) => setAmount(e.target.value),
							className: "h-10 text-sm rounded-xl focus-visible:ring-red-500"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "denied-notes",
							className: "text-xs font-semibold text-foreground",
							children: ["Additional Notes ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground font-normal",
								children: "(Optional)"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "denied-notes",
							rows: 2,
							placeholder: "Any additional context or next steps...",
							value: notes,
							onChange: (e) => setNotes(e.target.value),
							className: "resize-none text-sm rounded-xl focus-visible:ring-red-500"
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
							disabled: recordMutation.isPending,
							className: "h-10 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-sm transition-all",
							children: recordMutation.isPending ? "Recording..." : "Record Denied Payment"
						})]
					})
				]
			})]
		})
	});
}
function AddProspectDialog({ open, onOpenChange, onSuccess }) {
	const queryClient = useQueryClient();
	const { user } = useAuth();
	const [contactName, setContactName] = (0, import_react.useState)("");
	const [businessName, setBusinessName] = (0, import_react.useState)("");
	const [designation, setDesignation] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [altPhone, setAltPhone] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	const [serviceId, setServiceId] = (0, import_react.useState)("none");
	const [artist, setArtist] = (0, import_react.useState)("none");
	const [assignedTo, setAssignedTo] = (0, import_react.useState)("none");
	const [notes, setNotes] = (0, import_react.useState)("");
	const { data: rawStages = [] } = useQuery(stagesQuery());
	const { data: rawServices = [] } = useQuery(servicesQueryOptions());
	const { data: rawAgents = [] } = useQuery(agentOptionsQueryOptions());
	const stages = Array.isArray(rawStages) ? rawStages : [];
	const services = Array.isArray(rawServices) ? rawServices : [];
	const agents = Array.isArray(rawAgents) ? rawAgents : [];
	const resetForm = () => {
		setContactName("");
		setBusinessName("");
		setDesignation("");
		setPhone("");
		setAltPhone("");
		setEmail("");
		setAddress("");
		setServiceId("none");
		setArtist("none");
		setAssignedTo("none");
		setNotes("");
	};
	const createMutation = useMutation({
		mutationFn: async (input) => createProspect(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["prospects"] });
			queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
			toast.success("Prospect added successfully!");
			resetForm();
			onOpenChange(false);
			if (onSuccess) onSuccess();
		},
		onError: (err) => {
			toast.error(err.message || "Failed to add prospect. Please try again.");
		}
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!contactName.trim()) {
			toast.error("Contact Name is required.");
			return;
		}
		const initialStageId = (stages.find((s) => s.name.toLowerCase() === "prospect") || stages.find((s) => s.is_active))?.id || "prospect";
		const selectedAgent = agents.find((ag) => ag.id === assignedTo);
		const agentTag = selectedAgent ? `[Agent: ${selectedAgent.name}]` : "";
		const notesParts = [];
		if (artist !== "none") notesParts.push(`[Artist: ${artist}]`);
		if (agentTag) notesParts.push(agentTag);
		if (notes.trim()) notesParts.push(notes.trim());
		const finalNotes = notesParts.length > 0 ? notesParts.join(" ") : null;
		createMutation.mutate({
			contact_name: contactName.trim(),
			business_name: businessName.trim() || null,
			designation: designation.trim() || null,
			phone: phone.trim() || null,
			alternative_phone: altPhone.trim() || null,
			email: email.trim() || null,
			address: address.trim() || null,
			service_id: serviceId !== "none" ? serviceId : null,
			stage_id: initialStageId,
			assigned_to: assignedTo !== "none" ? assignedTo : user?.id || null,
			created_by: user?.id || null,
			notes: finalNotes
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-white dark:bg-card",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#67B239] font-bold flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "size-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight",
					children: "Add New Prospect"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5",
					children: "Create a new lead profile in Brandium CRM to start tracking sales stages."
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "space-y-4 pt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3.5 text-[#67B239]" }),
										"Contact Name ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-red-500",
											children: "*"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "e.g. Mehan Ahmed",
									value: contactName,
									onChange: (e) => setContactName(e.target.value),
									required: true,
									className: "h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-3.5 text-slate-500" }), "Business Name"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "e.g. AurevixSoft",
									value: businessName,
									onChange: (e) => setBusinessName(e.target.value),
									className: "h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { className: "size-3.5 text-slate-500" }), "Designation / Title"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "e.g. Managing Director",
									value: designation,
									onChange: (e) => setDesignation(e.target.value),
									className: "h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-3.5 text-emerald-600" }), "Phone Number"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "+8801711002233",
									value: phone,
									onChange: (e) => setPhone(e.target.value),
									className: "h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3.5 text-blue-500" }), "Email Address"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "email",
									placeholder: "mehan@aurevixsoft.com",
									value: email,
									onChange: (e) => setEmail(e.target.value),
									className: "h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 text-amber-500" }), "Office Address / Location"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									placeholder: "House 42, Road 11, Banani, Dhaka",
									value: address,
									onChange: (e) => setAddress(e.target.value),
									className: "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 min-h-[75px] resize-y text-xs sm:text-sm rounded-xl focus:bg-white dark:focus:bg-card transition-all",
									rows: 3
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-3 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { className: "size-3.5 text-purple-500" }), "Service"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: serviceId,
									onValueChange: setServiceId,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Service" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
										className: "rounded-xl border-slate-200 dark:border-slate-800",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "none",
											children: "No specific service"
										}), services.map((srv) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: srv.id,
											children: srv.name
										}, srv.id))]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "size-3.5 text-[#67B239]" }), "Select Artist"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: artist,
									onValueChange: setArtist,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Artist" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
										className: "rounded-xl border-slate-200 dark:border-slate-800",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "none",
											children: "No Artist Selected"
										}), agents.map((ag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: ag.name,
											children: ag.name
										}, ag.id))]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "size-3.5 text-emerald-600" }), "Assigned Agent"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: assignedTo,
									onValueChange: setAssignedTo,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Assign Agent" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
										className: "rounded-xl border-slate-200 dark:border-slate-800",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "none",
											children: "Assign to Me"
										}), agents.map((ag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: ag.id,
											children: ag.name
										}, ag.id))]
									})]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5 text-slate-500" }), "Notes / Key Requirements"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							placeholder: "Enter specific client requirements, budget details, or source info...",
							rows: 3,
							value: notes,
							onChange: (e) => setNotes(e.target.value),
							className: "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm rounded-xl focus:bg-white dark:focus:bg-card transition-all resize-y"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
						className: "pt-2 gap-2 sm:gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => onOpenChange(false),
							disabled: createMutation.isPending,
							className: "font-bold text-xs sm:text-sm h-9.5 rounded-xl border-slate-200/90 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer",
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "bg-[#67B239] hover:bg-[#5aa030] text-white font-bold text-xs sm:text-sm h-9.5 rounded-xl shadow-2xs gap-1.5 transition-all cursor-pointer",
							disabled: createMutation.isPending,
							children: createMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), "Saving Prospect..."] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "size-4" }), "Save & Add Prospect"] })
						})]
					})
				]
			})]
		})
	});
}
function EditProspectDialog({ prospectId, open, onOpenChange, onSuccess }) {
	const queryClient = useQueryClient();
	const [contactName, setContactName] = (0, import_react.useState)("");
	const [businessName, setBusinessName] = (0, import_react.useState)("");
	const [designation, setDesignation] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [altPhone, setAltPhone] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	const [serviceId, setServiceId] = (0, import_react.useState)("none");
	const [artist, setArtist] = (0, import_react.useState)("none");
	const [assignedTo, setAssignedTo] = (0, import_react.useState)("none");
	const [notes, setNotes] = (0, import_react.useState)("");
	const { data: rawServices = [] } = useQuery(servicesQueryOptions());
	const { data: rawAgents = [] } = useQuery(agentOptionsQueryOptions());
	const services = Array.isArray(rawServices) ? rawServices : [];
	const agents = Array.isArray(rawAgents) ? rawAgents : [];
	const prospectQuery = useQuery({
		queryKey: ["prospect-edit-dialog", prospectId],
		enabled: Boolean(prospectId && open),
		queryFn: async () => {
			if (!prospectId) return null;
			const res = await runMySQLQuery("SELECT * FROM `prospects` WHERE `id` = ? LIMIT 1", [prospectId]);
			if (res.success && Array.isArray(res.data) && res.data[0]) {
				const p = res.data[0];
				return {
					id: String(p["id"]),
					contact_name: String(p["contact_name"] || ""),
					business_name: p["business_name"] || null,
					designation: p["designation"] || null,
					phone: p["phone"] || null,
					alternative_phone: p["alternative_phone"] || null,
					email: p["email"] || null,
					address: p["address"] || null,
					service_id: p["service_id"] || null,
					stage_id: p["stage_id"] || null,
					assigned_to: p["assigned_to"] || null,
					created_by: p["created_by"] || null,
					notes: p["notes"] || null,
					created_at: String(p["created_at"] || (/* @__PURE__ */ new Date()).toISOString()),
					updated_at: String(p["updated_at"] || (/* @__PURE__ */ new Date()).toISOString())
				};
			}
			return null;
		}
	});
	(0, import_react.useEffect)(() => {
		if (prospectQuery.data) {
			const p = prospectQuery.data;
			setContactName(p.contact_name || "");
			setBusinessName(p.business_name || "");
			setDesignation(p.designation || "");
			setPhone(p.phone || "");
			setAltPhone(p.alternative_phone || "");
			setEmail(p.email || "");
			setAddress(p.address || "");
			setServiceId(p.service_id || "none");
			setAssignedTo(p.assigned_to || "none");
			let rawNotes = p.notes || "";
			const artistMatch = rawNotes.match(/\[Artist:\s*([^\]]+)\]/i);
			if (artistMatch && artistMatch[1]) {
				setArtist(artistMatch[1].trim());
				rawNotes = rawNotes.replace(/\[Artist:\s*([^\]]+)\]/gi, "").trim();
			} else setArtist("none");
			rawNotes = rawNotes.replace(/\[Agent:\s*([^\]]+)\]/gi, "").trim();
			setNotes(rawNotes);
		}
	}, [prospectQuery.data]);
	const updateMutation = useMutation({
		mutationFn: async () => {
			if (!prospectId) throw new Error("No prospect selected.");
			if (!contactName.trim()) throw new Error("Contact Name is required.");
			const selectedAgent = agents.find((ag) => ag.id === assignedTo);
			const agentTag = selectedAgent ? `[Agent: ${selectedAgent.name}]` : "";
			const notesParts = [];
			if (artist !== "none") notesParts.push(`[Artist: ${artist}]`);
			if (agentTag) notesParts.push(agentTag);
			if (notes.trim()) notesParts.push(notes.trim());
			const finalNotes = notesParts.length > 0 ? notesParts.join(" ") : null;
			const updateData = {
				contact_name: contactName.trim(),
				business_name: businessName.trim() || null,
				designation: designation.trim() || null,
				phone: phone.trim() || null,
				alternative_phone: altPhone.trim() || null,
				email: email.trim() || null,
				address: address.trim() || null,
				service_id: serviceId !== "none" ? serviceId : null,
				assigned_to: assignedTo !== "none" ? assignedTo : null,
				notes: finalNotes
			};
			const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
			const res = await runMySQLQuery(`UPDATE \`prospects\` SET
          \`contact_name\` = ?,
          \`business_name\` = ?,
          \`designation\` = ?,
          \`phone\` = ?,
          \`alternative_phone\` = ?,
          \`email\` = ?,
          \`address\` = ?,
          \`service_id\` = ?,
          \`assigned_to\` = ?,
          \`notes\` = ?,
          \`updated_at\` = ?
        WHERE \`id\` = ?`, [
				updateData.contact_name,
				updateData.business_name,
				updateData.designation,
				updateData.phone,
				updateData.alternative_phone,
				updateData.email,
				updateData.address,
				updateData.service_id,
				updateData.assigned_to,
				updateData.notes,
				now,
				prospectId
			]);
			if (!res.success) throw new Error(res.error || "Failed to update prospect in database.");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["prospects"] });
			queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			queryClient.invalidateQueries({ queryKey: ["prospect", prospectId] });
			queryClient.invalidateQueries({ queryKey: ["prospect-edit-dialog", prospectId] });
			toast.success("Prospect updated successfully!");
			onOpenChange(false);
			if (onSuccess) onSuccess();
		},
		onError: (err) => {
			toast.error(err.message || "Failed to update prospect.");
		}
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!contactName.trim()) {
			toast.error("Contact Name is required.");
			return;
		}
		updateMutation.mutate();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-white dark:bg-card",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#67B239] font-bold flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "size-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight",
					children: "Edit Prospect"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5",
					children: "Update prospect lead profile in Brandium CRM."
				})] })]
			}), prospectQuery.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center justify-center py-12 space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-8 animate-spin text-[#67B239]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold text-slate-500",
					children: "Loading prospect details..."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "space-y-4 pt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3.5 text-[#67B239]" }),
										"Contact Name ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-red-500",
											children: "*"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "e.g. Mehan Ahmed",
									value: contactName,
									onChange: (e) => setContactName(e.target.value),
									required: true,
									className: "h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-3.5 text-slate-500" }), "Business Name"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "e.g. AurevixSoft",
									value: businessName,
									onChange: (e) => setBusinessName(e.target.value),
									className: "h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { className: "size-3.5 text-slate-500" }), "Designation / Title"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "e.g. Managing Director",
									value: designation,
									onChange: (e) => setDesignation(e.target.value),
									className: "h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-3.5 text-emerald-600" }), "Phone Number"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "+8801711002233",
									value: phone,
									onChange: (e) => setPhone(e.target.value),
									className: "h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3.5 text-blue-500" }), "Email Address"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "email",
									placeholder: "mehan@aurevixsoft.com",
									value: email,
									onChange: (e) => setEmail(e.target.value),
									className: "h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 text-amber-500" }), "Office Address / Location"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									placeholder: "House 42, Road 11, Banani, Dhaka",
									value: address,
									onChange: (e) => setAddress(e.target.value),
									className: "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 min-h-18.75 resize-y text-xs sm:text-sm rounded-xl focus:bg-white dark:focus:bg-card transition-all",
									rows: 3
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-3 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { className: "size-3.5 text-purple-500" }), "Service"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: serviceId,
									onValueChange: setServiceId,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Service" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
										className: "rounded-xl border-slate-200 dark:border-slate-800",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "none",
											children: "No specific service"
										}), services.map((srv) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: srv.id,
											children: srv.name
										}, srv.id))]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "size-3.5 text-[#67B239]" }), "Select Artist"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: artist,
									onValueChange: setArtist,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Artist" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
										className: "rounded-xl border-slate-200 dark:border-slate-800",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "none",
											children: "No Artist Selected"
										}), agents.map((ag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: ag.name,
											children: ag.name
										}, ag.id))]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "size-3.5 text-emerald-600" }), "Assigned Agent"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: assignedTo,
									onValueChange: setAssignedTo,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Assign Agent" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
										className: "rounded-xl border-slate-200 dark:border-slate-800",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "none",
											children: "Unassigned"
										}), agents.map((ag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: ag.id,
											children: ag.name
										}, ag.id))]
									})]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							className: "text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5 text-slate-500" }), "Notes / Key Requirements"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							placeholder: "Enter specific client requirements, budget details, or source info...",
							rows: 3,
							value: notes,
							onChange: (e) => setNotes(e.target.value),
							className: "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm rounded-xl focus:bg-white dark:focus:bg-card transition-all resize-y"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
						className: "pt-2 gap-2 sm:gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => onOpenChange(false),
							disabled: updateMutation.isPending,
							className: "font-bold text-xs sm:text-sm h-9.5 rounded-xl border-slate-200/90 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer",
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "bg-[#67B239] hover:bg-[#5aa030] text-white font-bold text-xs sm:text-sm h-9.5 rounded-xl shadow-2xs gap-1.5 transition-all cursor-pointer",
							disabled: updateMutation.isPending,
							children: updateMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), "Saving Changes..."] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4" }), "Save & Update Prospect"] })
						})]
					})
				]
			})]
		})
	});
}
function getStageColorStyle(stageName) {
	const name = (stageName || "").toLowerCase();
	if (name.includes("prospect") || name.includes("lead")) return {
		dot: "border-[3px] border-blue-600 text-blue-600 bg-white dark:bg-card",
		line: "bg-blue-500 dark:bg-blue-600",
		pill: "bg-blue-600 text-white shadow-2xs",
		icon: null
	};
	if (name.includes("follow")) return {
		dot: "border-[3px] border-teal-600 text-teal-600 bg-white dark:bg-card",
		line: "bg-teal-500 dark:bg-teal-600",
		pill: "bg-teal-600 text-white shadow-2xs",
		icon: null
	};
	if (name.includes("opportunity")) return {
		dot: "border-[3px] border-orange-500 text-orange-500 bg-white dark:bg-card",
		line: "bg-orange-400 dark:bg-orange-600",
		pill: "bg-orange-500 text-white shadow-2xs",
		icon: null
	};
	if (name.includes("won") || name.includes("sales")) return {
		dot: "bg-[#67B239] text-white border-0",
		line: "bg-[#67B239]",
		pill: "bg-[#67B239] text-white shadow-2xs",
		icon: Star
	};
	if (name.includes("dnp")) return {
		dot: "border-[3px] border-amber-500 text-amber-500 bg-white dark:bg-card",
		line: "bg-amber-400 dark:bg-amber-600",
		pill: "bg-amber-500 text-white shadow-2xs",
		icon: null
	};
	if (name.includes("switched")) return {
		dot: "border-[3px] border-purple-600 text-purple-600 bg-white dark:bg-card",
		line: "bg-purple-500 dark:bg-purple-600",
		pill: "bg-purple-600 text-white shadow-2xs",
		icon: null
	};
	if (name.includes("invalid")) return {
		dot: "border-[3px] border-rose-600 text-rose-600 bg-white dark:bg-card",
		line: "bg-rose-500 dark:bg-rose-600",
		pill: "bg-rose-600 text-white shadow-2xs",
		icon: null
	};
	if (name.includes("not_interested") || name.includes("not interested")) return {
		dot: "border-[3px] border-slate-600 text-slate-600 bg-white dark:bg-card",
		line: "bg-slate-500 dark:bg-slate-600",
		pill: "bg-slate-600 text-white shadow-2xs",
		icon: null
	};
	if (name.includes("denied")) return {
		dot: "border-[3px] border-red-700 text-red-700 bg-white dark:bg-card",
		line: "bg-red-600 dark:bg-red-700",
		pill: "bg-red-700 text-white shadow-2xs",
		icon: null
	};
	return {
		dot: "border-[3px] border-indigo-500 text-indigo-500 bg-white dark:bg-card",
		line: "bg-indigo-400 dark:bg-indigo-600",
		pill: "bg-indigo-600 text-white shadow-2xs",
		icon: null
	};
}
function ViewStageDialog({ prospect, open, onOpenChange, onEdit }) {
	const [selectedNoteTarget, setSelectedNoteTarget] = (0, import_react.useState)(null);
	const [deleteHistoryTarget, setDeleteHistoryTarget] = (0, import_react.useState)(null);
	const queryClient = useQueryClient();
	const historyQuery = useQuery({
		...stageHistoryQuery(prospect?.id || ""),
		enabled: Boolean(prospect?.id && open)
	});
	const deleteHistoryMutation = useMutation({
		mutationFn: async (target) => {
			if (!prospect) return false;
			return deleteStageHistoryEntry(target.id, prospect.id);
		},
		onSuccess: () => {
			toast.success("Stage history entry deleted!");
			if (prospect) queryClient.invalidateQueries({ queryKey: ["stage-history", prospect.id] });
			queryClient.invalidateQueries({ queryKey: ["prospects"] });
			queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			setDeleteHistoryTarget(null);
		},
		onError: () => {
			toast.error("Failed to delete stage history entry.");
		}
	});
	const servicesQuery = useQuery({
		...servicesQueryOptions(),
		enabled: Boolean(open)
	});
	if (!prospect) return null;
	const historyEntries = historyQuery.data ?? [];
	const rawServicesList = Array.isArray(servicesQuery.data) ? servicesQuery.data : [];
	const resolvedServiceName = (() => {
		if (prospect.service_name && prospect.service_name.trim() && prospect.service_name !== "N/A") return prospect.service_name.trim();
		if (prospect.service_id && rawServicesList.length > 0) {
			const found = rawServicesList.find((s) => s.id === prospect.service_id);
			if (found?.name) return found.name;
		}
		return "Graphics Design";
	})();
	const initialItem = {
		id: `initial-${prospect.id}`,
		date: prospect.created_at,
		stageName: "Prospect",
		note: prospect.notes || "Lead created",
		actor: prospect.creator_name || "System"
	};
	const historyItems = [...historyEntries].sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()).map((h) => {
		let rawName = h.to_stage_name;
		if (!rawName || rawName === "Stage Update") rawName = formatStageSlugOrName(h.to_stage_id);
		if (!rawName) rawName = "Follow-up";
		const finalName = rawName === "New Lead" || rawName === "new_lead" ? "Prospect" : rawName;
		return {
			id: h.id,
			date: h.changed_at,
			stageName: finalName,
			note: h.note || prospect.notes || "Stage updated",
			actor: h.changed_by_name || prospect.creator_name || "System"
		};
	});
	const timelineItems = historyItems.some((item) => Math.abs(new Date(item.date).getTime() - new Date(prospect.created_at).getTime()) < 1e3) ? historyItems : [initialItem, ...historyItems];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				hideClose: true,
				className: "sm:max-w-2xl max-h-[92vh] overflow-y-auto p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-white dark:bg-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-10 rounded-2xl bg-orange-100/90 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center shrink-0 border border-orange-200/70 shadow-2xs mt-0.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4.5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight",
								children: prospect.contact_name || "N/A"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5",
								children: prospect.designation || "N/A"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "size-7.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer transition-colors",
							onClick: () => {
								onOpenChange(false);
								if (onEdit) onEdit(prospect);
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "size-3.5" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2.5 bg-slate-50/80 dark:bg-slate-900/50 rounded-xl p-2.5 border border-slate-200/70 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-3.5 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs text-slate-800 dark:text-slate-200 truncate",
									children: prospect.phone || "N/A"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 truncate",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { className: "size-3.5 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-slate-700 dark:text-slate-300 truncate",
									children: ["Service: ", resolvedServiceName]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 truncate",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3.5 text-[#67B239] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-slate-700 dark:text-slate-300 truncate",
									children: ["Artist: ", getProspectArtistName(prospect)]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-2.5 border-t border-slate-200/80 dark:border-slate-800" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto no-scrollbar py-1 px-0.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-start gap-3 min-w-max",
							children: timelineItems.map((item, idx) => {
								const rawStageName = item.stageName;
								const stageDisplayName = !rawStageName || rawStageName.toLowerCase() === "new lead" || rawStageName.toLowerCase() === "new_lead" ? "Prospect" : rawStageName;
								const style = getStageColorStyle(stageDisplayName);
								const IconComp = style.icon;
								const formattedDate = format(new Date(item.date), "MMM d, yyyy");
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col items-center w-36 sm:w-40 shrink-0 relative",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5",
											children: formattedDate
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative flex items-center justify-center w-full my-0.5",
											children: [idx < timelineItems.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-1/2 left-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												title: item.id.startsWith("initial-") ? void 0 : "Double-click to delete stage entry",
												onDoubleClick: () => {
													if (!item.id.startsWith("initial-")) setDeleteHistoryTarget({
														id: item.id,
														stageName: stageDisplayName
													});
												},
												className: `size-6.5 rounded-full ${style.dot} flex items-center justify-center shadow-2xs z-10 ${item.id.startsWith("initial-") ? "" : "cursor-pointer hover:scale-110 transition-transform"}`,
												children: IconComp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconComp, { className: "size-3 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-1.5 rounded-full bg-current" })
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											title: item.id.startsWith("initial-") ? void 0 : "Double-click to delete stage entry",
											onDoubleClick: () => {
												if (!item.id.startsWith("initial-")) setDeleteHistoryTarget({
													id: item.id,
													stageName: stageDisplayName
												});
											},
											className: `mt-2 px-2.5 py-1 rounded-xl ${style.pill} text-[11px] font-bold shadow-2xs truncate max-w-full text-center ${item.id.startsWith("initial-") ? "" : "cursor-pointer hover:opacity-90 transition-opacity"}`,
											children: stageDisplayName
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2 w-full bg-slate-50/90 dark:bg-slate-900/60 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 font-semibold space-y-1 flex flex-col justify-between min-h-26.25 border border-slate-200/80 dark:border-slate-800 shadow-2xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-bold text-slate-900 dark:text-slate-100 text-[11px] mb-0.5",
												children: "Notes:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												className: "list-disc list-inside text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5 leading-snug",
												children: item.note.split(/[\n,;]/).filter(Boolean).slice(0, 3).map((line, lIdx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
													className: "truncate",
													children: line.replace(/^[-*•]\s*/, "")
												}, lIdx))
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "secondary",
												size: "sm",
												className: "w-full h-6.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] cursor-pointer mt-1.5 shadow-2xs transition-all",
												onClick: () => setSelectedNoteTarget({
													stageName: item.stageName,
													note: item.note,
													date: item.date
												}),
												children: "View"
											})]
										})
									]
								}, item.id || idx);
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 bg-slate-50/90 dark:bg-slate-900/60 rounded-xl p-3 text-xs font-semibold text-slate-700 dark:text-slate-300 space-y-1.5 border border-slate-200/80 dark:border-slate-800",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Created by :",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "font-bold text-slate-900 dark:text-slate-100",
										children: prospect.creator_name || "System"
									})
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs text-slate-600 dark:text-slate-400",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3.5 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Created : ", format(new Date(prospect.created_at), "MMM d, yyyy")] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: format(new Date(prospect.created_at), "h:mm a") })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs text-slate-600 dark:text-slate-400",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3.5 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"Updated :",
										" ",
										format(new Date(prospect.updated_at || prospect.created_at), "MMM d, yyyy")
									] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: format(new Date(prospect.updated_at || prospect.created_at), "h:mm a") })]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => onOpenChange(false),
							className: "h-8.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer transition-all shadow-2xs border-0",
							children: "Close"
						})
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: Boolean(selectedNoteTarget),
			onOpenChange: (open) => {
				if (!open) setSelectedNoteTarget(null);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				hideClose: true,
				className: "sm:max-w-md p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-white dark:bg-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
						className: "flex flex-row items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-slate-800",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-8.5 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 shadow-2xs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold text-slate-900 dark:text-slate-100",
								children: !selectedNoteTarget?.stageName || selectedNoteTarget.stageName.toLowerCase() === "new lead" || selectedNoteTarget.stageName.toLowerCase() === "new_lead" ? "Prospect" : selectedNoteTarget.stageName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5",
								children: selectedNoteTarget?.date ? format(new Date(selectedNoteTarget.date), "MMMM d, yyyy (h:mm a)") : "Full Note Details"
							})] })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "my-3 bg-slate-50/90 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 max-h-[50vh] overflow-y-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5",
							children: "Notes:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap",
							children: selectedNoteTarget?.note
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end pt-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => setSelectedNoteTarget(null),
							className: "h-8.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-2xs",
							children: "Close Note"
						})
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: Boolean(deleteHistoryTarget),
			onOpenChange: (open) => {
				if (!open) setDeleteHistoryTarget(null);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, {
				className: "sm:max-w-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-6 w-6 text-amber-500" }), "Delete Stage Entry?"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
					"Are you sure you want to delete the stage history entry for \"",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold",
						children: deleteHistoryTarget?.stageName
					}),
					"\"? This action will permanently remove this entry from the timeline history."
				] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
					disabled: deleteHistoryMutation.isPending,
					onClick: () => setDeleteHistoryTarget(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					className: "bg-red-600 hover:bg-red-700 text-white",
					disabled: deleteHistoryMutation.isPending,
					onClick: () => {
						if (deleteHistoryTarget) deleteHistoryMutation.mutate(deleteHistoryTarget);
					},
					children: deleteHistoryMutation.isPending ? "Deleting..." : "Yes, Delete Stage"
				})] })]
			})
		})
	] });
}
function DeleteProspectDialog({ prospect, open, onOpenChange, onConfirm, isDeleting = false }) {
	if (!prospect) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-6 w-6 text-amber-500" }), "Are you sure?"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
				"You are about to delete the prospect \"",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold",
					children: prospect.name
				}),
				"\". This action cannot be undone."
			] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				onClick: () => onOpenChange(false),
				disabled: isDeleting,
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				className: "bg-red-600 hover:bg-red-700 text-white",
				onClick: onConfirm,
				disabled: isDeleting,
				children: isDeleting ? "Deleting..." : "Yes, Delete Prospect"
			})] })]
		})
	});
}
function StatCard({ label, value, icon: Icon, colorScheme, onClick }) {
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
		onClick,
		className: `group relative overflow-hidden rounded-2xl p-4 sm:p-4.5 shadow-md hover:shadow-lg transition-all duration-200 select-none ${styles.cardBg} ${onClick ? "cursor-pointer hover:scale-[1.02]" : ""}`,
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
function ProspectsPage() {
	const { user, isAdmin } = useAuth();
	const searchParams = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const [searchTerm, setSearchTerm] = (0, import_react.useState)(searchParams.search || "");
	const [debouncedSearch] = l(searchTerm, 500);
	const [stageTarget, setStageTarget] = (0, import_react.useState)(null);
	const [dateRange, setDateRange] = (0, import_react.useState)(searchParams.from ? {
		from: new Date(searchParams.from),
		to: searchParams.to ? new Date(searchParams.to) : void 0
	} : void 0);
	const [calOpen, setCalOpen] = (0, import_react.useState)(false);
	const [addProspectOpen, setAddProspectOpen] = (0, import_react.useState)(false);
	const [editProspectId, setEditProspectId] = (0, import_react.useState)(null);
	const [editProspectOpen, setEditProspectOpen] = (0, import_react.useState)(false);
	const [viewStageProspect, setViewStageProspect] = (0, import_react.useState)(null);
	const [viewStageOpen, setViewStageOpen] = (0, import_react.useState)(false);
	const [deleteTarget, setDeleteTarget] = (0, import_react.useState)(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = (0, import_react.useState)(false);
	const [scheduleMeetingOpen, setScheduleMeetingOpen] = (0, import_react.useState)(false);
	const [scheduleMeetingProspectId, setScheduleMeetingProspectId] = (0, import_react.useState)(void 0);
	const [deniedPaymentOpen, setDeniedPaymentOpen] = (0, import_react.useState)(false);
	const [deniedPaymentProspectId, setDeniedPaymentProspectId] = (0, import_react.useState)(void 0);
	const [addInvoiceOpen, setAddInvoiceOpen] = (0, import_react.useState)(false);
	const [addInvoiceProspectId, setAddInvoiceProspectId] = (0, import_react.useState)(void 0);
	const [scheduleFollowUpOpen, setScheduleFollowUpOpen] = (0, import_react.useState)(false);
	const [scheduleFollowUpProspectId, setScheduleFollowUpProspectId] = (0, import_react.useState)(void 0);
	const [scheduleFollowUpProspectLabel, setScheduleFollowUpProspectLabel] = (0, import_react.useState)(void 0);
	const queryClient = useQueryClient();
	const deleteMutation = useMutation({
		mutationFn: async (prospectId) => deleteProspect(prospectId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["prospects"] });
			queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
			queryClient.resetQueries({ queryKey: ["prospects"] });
			queryClient.resetQueries({ queryKey: ["prospects-stats"] });
			toast.success("Prospect deleted successfully!");
			setDeleteDialogOpen(false);
			setDeleteTarget(null);
		},
		onError: () => {
			toast.error("Failed to delete prospect.");
		}
	});
	const handleConfirmDelete = () => {
		if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
	};
	const stats = useQuery(prospectsStatsQuery(user?.id || "", isAdmin));
	const prospects = useQuery(prospectsQuery(searchParams, user?.id || "", isAdmin));
	const stages = useQuery(stagesQuery());
	const displayStages = stages.data && stages.data.length > 0 ? stages.data : [
		{
			id: "prospect",
			name: "Prospect"
		},
		{
			id: "dnp",
			name: "DNP"
		},
		{
			id: "switched_off",
			name: "Switched Off"
		},
		{
			id: "invalid_number",
			name: "Invalid Number"
		},
		{
			id: "not_interested",
			name: "Not Interested"
		},
		{
			id: "follow_up",
			name: "Follow-up"
		},
		{
			id: "opportunity_created",
			name: "Opportunity Created"
		},
		{
			id: "sales_won",
			name: "Sales Won"
		},
		{
			id: "denied_payment",
			name: "Denied Payment"
		}
	];
	const isInitialMount = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}
		const next = debouncedSearch.trim();
		if (next !== (searchParams.search ?? "")) navigate({
			search: (prev) => ({
				...prev,
				search: next || void 0,
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
	const currentStageFilterId = searchParams.stage;
	const currentStageName = displayStages.find((s) => s.id === currentStageFilterId || s.name === currentStageFilterId)?.name || (currentStageFilterId && currentStageFilterId !== "all" ? currentStageFilterId : "Follow-up");
	const currentStageCount = stats.data?.stageCounts?.[currentStageName] ?? stats.data?.stageCounts?.[currentStageName.toLowerCase()] ?? (currentStageName.toLowerCase().includes("follow") ? stats.data?.followUps ?? 0 : (prospects.data?.data ?? []).filter((p) => {
		return (p["stage_name"] || p.stage_id || "").toLowerCase().includes(currentStageName.toLowerCase());
	}).length);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Prospects",
				description: "Manage sales pipeline prospects, follow-up stages, and lead assignments.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setAddProspectOpen(true),
					className: "bg-[#67B239] hover:bg-[#5aa030] text-white",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 size-4" }), "Add Prospect"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Prospects",
						value: stats.data?.totalProspects ?? 0,
						icon: UsersRound,
						colorScheme: "pastelPurple",
						onClick: () => {
							updateFilter("stage", void 0);
							setSearchTerm("");
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: `${currentStageName} Stage`,
						value: currentStageCount,
						icon: Repeat,
						colorScheme: "pastelYellow",
						onClick: () => {
							const fStage = displayStages.find((s) => s.name.toLowerCase().includes("follow"));
							updateFilter("stage", fStage?.id || "follow-up");
							setSearchTerm("");
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Won Sales",
						value: stats.data?.salesWon ?? 0,
						icon: Trophy,
						colorScheme: "pastelEmerald",
						onClick: () => {
							const wStage = displayStages.find((s) => s.name.toLowerCase().includes("won") || s.name.toLowerCase().includes("sales"));
							updateFilter("stage", wStage?.id || "sales_won");
							setSearchTerm("");
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Success Rate",
						value: stats.data?.successRate ?? "0.0%",
						icon: TrendingUp,
						colorScheme: "pastelTeal"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1 max-w-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "text",
						autoComplete: "off",
						autoCorrect: "off",
						autoCapitalize: "off",
						spellCheck: false,
						placeholder: "Search name, business, phone...",
						className: "pl-9 bg-white [&::-webkit-search-cancel-button]:hidden",
						value: searchTerm,
						onChange: (e) => setSearchTerm(e.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: searchParams.stage ?? "all",
							onValueChange: (v) => updateFilter("stage", v === "all" ? void 0 : v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "w-45 bg-white",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Stage" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All Stages"
							}), (stages.data && stages.data.length > 0 ? stages.data : FALLBACK_STAGES).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: s.id,
								children: s.name
							}, s.id))] })]
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
										" – ",
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
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "icon",
							className: "bg-accent",
							onClick: () => {
								setSearchTerm("");
								setDateRange(void 0);
								navigate({ search: { page: 1 } });
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "size-4" })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-slate-300 dark:border-slate-800 pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight",
					children: "Search Results"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs font-semibold text-slate-600 dark:text-slate-400",
					children: [
						"Showing:",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold text-slate-900 dark:text-slate-200",
							children: prospects.data?.data.length ?? 0
						}),
						" ",
						"of",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold text-slate-900 dark:text-slate-200",
							children: prospects.data?.count ?? 0
						}),
						" ",
						"prospects"
					]
				})]
			}),
			prospects.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
				children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-4 shadow-2xs space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full rounded-xl" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-3/4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 w-full rounded-xl" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-full rounded-xl" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-full rounded-xl" })
					]
				}, i))
			}) : !prospects.data?.data || prospects.data.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-12 text-center text-muted-foreground shadow-2xs",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "No prospects found matching your filters."
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
				children: (prospects.data?.data ?? []).map((p) => {
					const stageName = p.stage_name || p["stage_name"] || (p.stage_id ? formatStageSlugOrName(p.stage_id) : "Prospect");
					const pRecord = p;
					const stageColor = resolveStageColor(stageName, pRecord["stage_color"] || null);
					const iconName = resolveStageIcon(stageName, pRecord["stage_icon"] || null);
					const IconComponent = lucide_react_exports[iconName] || Circle;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onClick: () => {
							setViewStageProspect(p);
							setViewStageOpen(true);
						},
						className: "group relative rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-4 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between cursor-pointer select-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-2.5 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "size-9 rounded-full bg-orange-100/80 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center shrink-0 border border-orange-200/60 shadow-2xs mt-0.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4.5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-tight truncate group-hover:text-[#0A2E5C] transition-colors",
											children: p.contact_name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-slate-500 dark:text-slate-400 font-semibold truncate mt-0.5",
											children: p.designation || p.business_name || "Prospect Lead"
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "ghost",
										size: "icon",
										className: "size-7.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-accent shrink-0 -mr-1 transition-colors cursor-pointer",
										onClick: (e) => e.stopPropagation(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "sr-only",
											children: "Open menu"
										})]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
									align: "end",
									className: "w-40 rounded-xl shadow-lg border-slate-200 dark:border-slate-800",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											className: "flex items-center gap-2 cursor-pointer font-semibold text-xs py-2",
											onClick: (e) => {
												e.stopPropagation();
												setEditProspectId(p.id);
												setEditProspectOpen(true);
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5 text-slate-600 dark:text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Edit" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											className: "flex items-center gap-2 cursor-pointer font-semibold text-xs py-2",
											onClick: (e) => {
												e.stopPropagation();
												setViewStageProspect(p);
												setViewStageOpen(true);
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "View Stage" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											className: "flex items-center gap-2 cursor-pointer font-semibold text-xs py-2",
											onClick: (e) => {
												e.stopPropagation();
												setStageTarget({
													id: p.id,
													label: p.business_name || p.contact_name,
													stageId: p.stage_id,
													currentStageName: p.stage_name || p["stage_name"] || (p.stage_id ? formatStageSlugOrName(p.stage_id) : "Prospect")
												});
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5 text-blue-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Update Stage" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											className: "flex items-center gap-2 cursor-pointer font-semibold text-xs py-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40",
											onClick: (e) => {
												e.stopPropagation();
												setDeleteTarget({
													id: p.id,
													name: p.contact_name
												});
												setDeleteDialogOpen(true);
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5 text-rose-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Delete" })]
										})
									]
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-3.5 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-xs text-slate-800 dark:text-slate-200 truncate",
										children: p.phone || "—"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3.5 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-slate-700 dark:text-slate-300 truncate",
										children: p.service_name || p.business_name || "General Service"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-2xs transition-all",
									style: {
										backgroundColor: `${stageColor}18`,
										color: stageColor,
										borderColor: `${stageColor}35`
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "size-4 rounded-md flex items-center justify-center text-white shrink-0 shadow-2xs",
										style: { backgroundColor: stageColor },
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconComponent, { className: "size-2.5 text-white" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: stageName
									})]
								})
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 bg-[#F4F6F8] dark:bg-slate-800/50 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300 font-semibold space-y-1.5 border border-slate-100/80 dark:border-slate-800",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 truncate",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"Agent :",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "font-bold text-slate-900 dark:text-slate-100",
											children: getProspectAgentName(p)
										})
									] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 truncate",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3.5 text-[#67B239] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"Artist :",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "font-bold text-slate-900 dark:text-slate-100",
											children: getProspectArtistName(p)
										})
									] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3.5 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Created : ", format(new Date(p.created_at), "MMM d, yyyy")] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: format(new Date(p.created_at), "h:mm a") })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3.5 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Updated : ", format(new Date(p.updated_at || p.created_at), "MMM d, yyyy")] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5 text-slate-400 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: format(new Date(p.updated_at || p.created_at), "h:mm a") })]
									})]
								})
							]
						})]
					}, p.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangeStageDialog, {
				target: stageTarget,
				onOpenChange: (open) => {
					if (!open) setStageTarget(null);
				},
				onStageChange: (_stageId, stageName) => {
					const normalised = stageName.toLowerCase().trim();
					if (normalised === "meeting scheduled") {
						const pid = stageTarget?.id;
						setStageTarget(null);
						setScheduleMeetingProspectId(pid);
						setScheduleMeetingOpen(true);
					} else if (normalised.includes("denied")) {
						const pid = stageTarget?.id;
						setStageTarget(null);
						setDeniedPaymentProspectId(pid);
						setDeniedPaymentOpen(true);
					} else if (normalised.includes("opportunity")) {
						const pid = stageTarget?.id;
						setStageTarget(null);
						setAddInvoiceProspectId(pid);
						setAddInvoiceOpen(true);
					} else if (normalised.includes("follow")) {
						const pid = stageTarget?.id;
						const plabel = stageTarget?.label;
						setStageTarget(null);
						setScheduleFollowUpProspectId(pid);
						setScheduleFollowUpProspectLabel(plabel);
						setScheduleFollowUpOpen(true);
					}
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FollowUpDialog, {
				open: scheduleFollowUpOpen,
				onOpenChange: setScheduleFollowUpOpen,
				prospectId: scheduleFollowUpProspectId,
				prospectLabel: scheduleFollowUpProspectLabel
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScheduleMeetingDialog, {
				open: scheduleMeetingOpen,
				onOpenChange: setScheduleMeetingOpen,
				defaultProspectId: scheduleMeetingProspectId
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordDeniedPaymentDialog, {
				open: deniedPaymentOpen,
				onOpenChange: setDeniedPaymentOpen,
				defaultProspectId: deniedPaymentProspectId
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddInvoiceDialog, {
				open: addInvoiceOpen,
				onOpenChange: setAddInvoiceOpen,
				defaultProspectId: addInvoiceProspectId
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddProspectDialog, {
				open: addProspectOpen,
				onOpenChange: setAddProspectOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditProspectDialog, {
				prospectId: editProspectId,
				open: editProspectOpen,
				onOpenChange: (open) => {
					setEditProspectOpen(open);
					if (!open) setEditProspectId(null);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewStageDialog, {
				prospect: viewStageProspect,
				open: viewStageOpen,
				onOpenChange: (open) => {
					setViewStageOpen(open);
					if (!open) setViewStageProspect(null);
				},
				onEdit: (p) => {
					setEditProspectId(p.id);
					setEditProspectOpen(true);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteProspectDialog, {
				prospect: deleteTarget,
				open: deleteDialogOpen,
				onOpenChange: (open) => {
					setDeleteDialogOpen(open);
					if (!open) setDeleteTarget(null);
				},
				onConfirm: handleConfirmDelete,
				isDeleting: deleteMutation.isPending
			})
		]
	});
}
//#endregion
export { ProspectsPage as component };
