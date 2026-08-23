import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-CtX3ithx.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { O as Send, S as Square, U as PhoneCall, X as MessageSquare, at as ListFilter, g as TriangleAlert, k as Search, s as Users, w as SquareCheckBig } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B85j8UA0.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as agentOptionsQueryOptions } from "./won-sales-KzBBTeTZ.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
import { n as useAuth } from "./auth-CgRTR6JY.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as sendSms, n as prospectsOptionsQuery, r as sendBulkSms, t as calculateSmsInfo } from "./sms-CF1PNd81.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sms.send-Cp3q3iPf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SmsBulkConfirmModal({ open, onOpenChange, recipients, message, onConfirmSend, isSending = false }) {
	const recipientCount = recipients.length;
	const smsInfo = calculateSmsInfo(message);
	const totalPartsNeeded = recipientCount * smsInfo.parts;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2 text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-5 text-amber-500 shrink-0" }), "Confirm Bulk SMS Broadcast"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "You are about to dispatch a bulk SMS broadcast. Please review details before confirming execution." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-2 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg bg-slate-50 dark:bg-card border p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground font-medium flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5 text-blue-600" }), "Recipients Count:"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-base font-bold text-foreground mt-1",
									children: [recipientCount, " Clients"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg bg-slate-50 dark:bg-card border p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground font-medium flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-3.5 text-[#67B239]" }), "Estimated Credits:"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-base font-bold text-[#67B239] mt-1",
									children: [totalPartsNeeded, " SMS Credits"]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between bg-slate-100 dark:bg-muted/50 p-2.5 rounded-md border text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Encoding format:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "font-mono text-[11px] bg-white dark:bg-background",
								children: smsInfo.isUnicode ? "Unicode (Bangla / Special)" : "GSM-7 (Standard English)"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-foreground",
								children: "Broadcast Message Preview:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-slate-50 dark:bg-muted/40 p-3 rounded-md border max-h-28 overflow-y-auto text-foreground italic leading-relaxed",
								children: [
									"\"",
									message,
									"\""
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded border border-amber-200 dark:border-amber-900/60",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Warning:" }), " Bulk dispatch cannot be paused after execution. Each recipient will receive an individual SMS message and log entry."]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "gap-2 sm:gap-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => onOpenChange(false),
						disabled: isSending,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5",
						onClick: onConfirmSend,
						disabled: isSending,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-3.5" }), isSending ? "Broadcasting SMS..." : `Confirm & Send (${recipientCount})`]
					})]
				})
			]
		})
	});
}
var PIPELINE_STAGES = [
	"Opportunity Created",
	"Follow-up",
	"Proposal Sent",
	"Negotiation",
	"Sales Won",
	"Denied Payment"
];
function SendSmsPage() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = (0, import_react.useState)("single");
	const [selectedProspectId, setSelectedProspectId] = (0, import_react.useState)("");
	const [singlePhone, setSinglePhone] = (0, import_react.useState)("");
	const [singleProspectName, setSingleProspectName] = (0, import_react.useState)("");
	const [singleMessage, setSingleMessage] = (0, import_react.useState)("");
	const [bulkFilterMode, setBulkFilterMode] = (0, import_react.useState)("manual");
	const [selectedStage, setSelectedStage] = (0, import_react.useState)("Opportunity Created");
	const [selectedAgentId, setSelectedAgentId] = (0, import_react.useState)("");
	const [bulkSearch, setBulkSearch] = (0, import_react.useState)("");
	const [selectedProspectIds, setSelectedProspectIds] = (0, import_react.useState)([]);
	const [bulkMessage, setBulkMessage] = (0, import_react.useState)("");
	const [confirmModalOpen, setConfirmModalOpen] = (0, import_react.useState)(false);
	const { data: prospectOptions = [] } = useQuery(prospectsOptionsQuery());
	const { data: agentOptions = [] } = useQuery(agentOptionsQueryOptions());
	const handleSelectSingleProspect = (id) => {
		setSelectedProspectId(id);
		const found = prospectOptions.find((p) => p.id === id);
		if (found) {
			setSinglePhone(found.phone || "");
			setSingleProspectName(found.contact_name || "");
		}
	};
	const singleMutation = useMutation({
		mutationFn: async () => {
			return sendSms(singlePhone, singleMessage, selectedProspectId || null, singleProspectName || void 0, "Single", user?.id, user?.email || "Agent");
		},
		onSuccess: (res) => {
			toast.success(`SMS dispatched successfully to ${singlePhone}! Log ID: ${res.apiResponseId}`);
			setSingleMessage("");
			queryClient.invalidateQueries({ queryKey: ["sms-logs"] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to send SMS.");
		}
	});
	let targetBulkRecipients = [];
	if (bulkFilterMode === "manual") targetBulkRecipients = prospectOptions.filter((p) => selectedProspectIds.includes(p.id) && Boolean(p.phone)).map((p) => ({
		prospect_id: p.id,
		prospect_name: p.contact_name,
		phone: p.phone
	}));
	else if (bulkFilterMode === "stage") targetBulkRecipients = prospectOptions.filter((p) => Boolean(p.phone)).map((p) => ({
		prospect_id: p.id,
		prospect_name: p.contact_name,
		phone: p.phone
	}));
	else if (bulkFilterMode === "agent") targetBulkRecipients = prospectOptions.filter((p) => Boolean(p.phone)).map((p) => ({
		prospect_id: p.id,
		prospect_name: p.contact_name,
		phone: p.phone
	}));
	const bulkMutation = useMutation({
		mutationFn: async () => {
			return sendBulkSms(targetBulkRecipients, bulkMessage, user?.id, user?.email || "Agent");
		},
		onSuccess: (res) => {
			toast.success(`Bulk SMS broadcast complete! ${res.successCount} sent successfully.`);
			setConfirmModalOpen(false);
			setBulkMessage("");
			setSelectedProspectIds([]);
			queryClient.invalidateQueries({ queryKey: ["sms-logs"] });
		},
		onError: (err) => {
			toast.error(err.message || "Bulk SMS dispatch failed.");
		}
	});
	const toggleSelectProspect = (id) => {
		if (selectedProspectIds.includes(id)) setSelectedProspectIds(selectedProspectIds.filter((item) => item !== id));
		else setSelectedProspectIds([...selectedProspectIds, id]);
	};
	const selectAllFilteredProspects = () => {
		const allIds = prospectOptions.filter((p) => Boolean(p.phone)).map((p) => p.id);
		setSelectedProspectIds(allIds);
	};
	const clearProspectSelection = () => {
		setSelectedProspectIds([]);
	};
	const singleSmsInfo = calculateSmsInfo(singleMessage);
	const bulkSmsInfo = calculateSmsInfo(bulkMessage);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "text-2xl font-bold tracking-tight text-foreground flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-6 text-[#67B239]" }), "Send SMS Gateway"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-0.5",
				children: "Dispatch single or bulk SMS broadcasts to prospects and clients."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: activeTab,
				onValueChange: (val) => setActiveTab(val),
				className: "w-full",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "grid w-full grid-cols-2 sm:w-80",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "single",
							className: "gap-1.5 text-xs font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-3.5" }), "Single SMS"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "bulk",
							className: "gap-1.5 text-xs font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5" }), "Bulk SMS"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "single",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-white dark:bg-card border-slate-200/80 shadow-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								className: "text-base flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4 text-[#67B239]" }), "Single SMS Dispatch Form"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-xs",
								children: "Select a prospect to auto-fill contact details or enter a recipient phone number directly."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "space-y-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "single_prospect",
												className: "text-xs font-semibold",
												children: "Select Prospect (Auto-fill Phone)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: selectedProspectId,
												onValueChange: handleSelectSingleProspect,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													id: "single_prospect",
													className: "text-xs",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a prospect..." })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: prospectOptions.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
													value: p.id,
													className: "text-xs",
													children: [
														p.contact_name,
														" ",
														p.business_name ? `(${p.business_name})` : ""
													]
												}, p.id)) })]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "recipient_phone",
												className: "text-xs font-semibold",
												children: "Recipient Phone Number"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneCall, { className: "absolute left-3 top-2.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: "recipient_phone",
													placeholder: "+8801700000000",
													value: singlePhone,
													onChange: (e) => setSinglePhone(e.target.value),
													className: "pl-9 font-mono text-xs"
												})]
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "single_msg",
												className: "text-xs font-semibold",
												children: "SMS Message Content"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												id: "single_msg",
												placeholder: "Type your SMS message here...",
												rows: 4,
												value: singleMessage,
												onChange: (e) => setSingleMessage(e.target.value),
												className: "text-xs leading-relaxed"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
															variant: "outline",
															className: "font-mono bg-white dark:bg-background",
															children: [singleSmsInfo.length, " chars"]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
															"(",
															singleSmsInfo.parts,
															" SMS Part",
															singleSmsInfo.parts > 1 ? "s" : "",
															")"
														] }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
															"· ",
															singleSmsInfo.remaining,
															" chars left in current part"
														] })
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "secondary",
													className: "text-[10px]",
													children: singleSmsInfo.isUnicode ? "Unicode (Bangla)" : "GSM-7 (English)"
												})]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex justify-end",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											className: "bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5 px-6",
											disabled: singleMutation.isPending || !singlePhone || !singleMessage,
											onClick: () => singleMutation.mutate(),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }), singleMutation.isPending ? "Sending SMS..." : "Send Single SMS"]
										})
									})
								]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "bulk",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-white dark:bg-card border-slate-200/80 shadow-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								className: "text-base flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4 text-[#67B239]" }), "Bulk SMS Broadcast Form"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-xs",
								children: "Target multiple prospects manually or filter audience by stage or assigned agent. Requires mandatory confirmation before broadcast."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "space-y-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "text-xs font-semibold flex items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListFilter, { className: "size-3.5 text-blue-600" }), "Audience Selection Method"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-1 sm:grid-cols-3 gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													type: "button",
													variant: bulkFilterMode === "manual" ? "default" : "outline",
													className: bulkFilterMode === "manual" ? "bg-[#67B239] hover:bg-[#5aa030] text-white" : "",
													size: "sm",
													onClick: () => setBulkFilterMode("manual"),
													children: "Select Multiple Prospects"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													type: "button",
													variant: bulkFilterMode === "stage" ? "default" : "outline",
													className: bulkFilterMode === "stage" ? "bg-[#67B239] hover:bg-[#5aa030] text-white" : "",
													size: "sm",
													onClick: () => setBulkFilterMode("stage"),
													children: "OR Select by Stage"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													type: "button",
													variant: bulkFilterMode === "agent" ? "default" : "outline",
													className: bulkFilterMode === "agent" ? "bg-[#67B239] hover:bg-[#5aa030] text-white" : "",
													size: "sm",
													onClick: () => setBulkFilterMode("agent"),
													children: "OR Select by Agent"
												})
											]
										})]
									}),
									bulkFilterMode === "manual" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2 border rounded-lg p-3 bg-slate-50/50 dark:bg-muted/30",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative flex-1 min-w-48",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2 size-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "Search prospects...",
													value: bulkSearch,
													onChange: (e) => setBulkSearch(e.target.value),
													className: "pl-8 h-8 text-xs bg-white dark:bg-background"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													variant: "outline",
													size: "sm",
													className: "h-8 text-xs",
													onClick: selectAllFilteredProspects,
													children: [
														"Select All (",
														prospectOptions.length,
														")"
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "ghost",
													size: "sm",
													className: "h-8 text-xs",
													onClick: clearProspectSelection,
													children: "Clear"
												})]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "max-h-48 overflow-y-auto divide-y divide-border/60 rounded-md border bg-white dark:bg-background",
											children: prospectOptions.filter((p) => !bulkSearch || p.contact_name.toLowerCase().includes(bulkSearch.toLowerCase())).map((p) => {
												const isSelected = selectedProspectIds.includes(p.id);
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-muted/40 cursor-pointer text-xs",
													onClick: () => toggleSelectProspect(p.id),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2",
														children: [
															isSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareCheckBig, { className: "size-4 text-[#67B239]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-4 text-slate-300" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "font-semibold text-foreground",
																children: p.contact_name
															}),
															p.business_name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "text-muted-foreground text-[11px]",
																children: [
																	"(",
																	p.business_name,
																	")"
																]
															})
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-mono text-muted-foreground text-[11px]",
														children: p.phone || "No phone"
													})]
												}, p.id);
											})
										})]
									}),
									bulkFilterMode === "stage" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5 border rounded-lg p-3 bg-slate-50/50 dark:bg-muted/30",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "stage_select",
											className: "text-xs font-semibold",
											children: "Target Prospect Stage"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: selectedStage,
											onValueChange: setSelectedStage,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												id: "stage_select",
												className: "text-xs bg-white dark:bg-background",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Stage" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PIPELINE_STAGES.map((stg) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: stg,
												className: "text-xs",
												children: stg
											}, stg)) })]
										})]
									}),
									bulkFilterMode === "agent" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5 border rounded-lg p-3 bg-slate-50/50 dark:bg-muted/30",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "agent_select",
											className: "text-xs font-semibold",
											children: "Target Assigned Tele-sales Agent"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: selectedAgentId,
											onValueChange: setSelectedAgentId,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												id: "agent_select",
												className: "text-xs bg-white dark:bg-background",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Agent" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: agentOptions.map((ag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: ag.id,
												className: "text-xs",
												children: ag.name
											}, ag.id)) })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 p-2.5 text-xs flex items-center justify-between text-blue-900 dark:text-blue-200 font-medium",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Selected Broadcast Audience:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											className: "bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs",
											children: [targetBulkRecipients.length, " Prospects Target"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "bulk_msg",
												className: "text-xs font-semibold",
												children: "Bulk Broadcast Message"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												id: "bulk_msg",
												placeholder: "Type bulk broadcast message content...",
												rows: 4,
												value: bulkMessage,
												onChange: (e) => setBulkMessage(e.target.value),
												className: "text-xs leading-relaxed"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
														variant: "outline",
														className: "font-mono bg-white dark:bg-background",
														children: [bulkSmsInfo.length, " chars"]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
														"(",
														bulkSmsInfo.parts,
														" SMS Part per recipient)"
													] })]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "secondary",
													className: "text-[10px]",
													children: bulkSmsInfo.isUnicode ? "Unicode (Bangla)" : "GSM-7 (English)"
												})]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex justify-end",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											className: "bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5 px-6",
											disabled: targetBulkRecipients.length === 0 || !bulkMessage,
											onClick: () => setConfirmModalOpen(true),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }),
												"Review & Broadcast Bulk SMS (",
												targetBulkRecipients.length,
												")"
											]
										})
									})
								]
							})]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmsBulkConfirmModal, {
				open: confirmModalOpen,
				onOpenChange: setConfirmModalOpen,
				recipients: targetBulkRecipients,
				message: bulkMessage,
				onConfirmSend: () => bulkMutation.mutate(),
				isSending: bulkMutation.isPending
			})
		]
	});
}
//#endregion
export { SendSmsPage as component };
