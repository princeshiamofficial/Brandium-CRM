import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { t as Card } from "./card-CtX3ithx.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as StatCard } from "./stat-card-C9FEmuAx.mjs";
import { B as PowerOff, C as SquarePen, Lt as CirclePlay, Nt as CircleX, T as Sparkles, V as Plus, Y as Mic, Yt as Calendar, ct as Layers, en as Brush, ft as Globe, k as Search, m as Tv, mt as Film, o as Video, q as Palette, r as X, v as Trash2, x as Star, z as Power, zt as CircleCheck } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B85j8UA0.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as updateService, i as toggleServiceStatus, n as servicesQueryOptions, r as softDeleteService, t as createService } from "./services-HfiGgUt4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/services-WSSa8Fn0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SERVICE_ICONS = [
	"Camera",
	"Palette",
	"Calendar",
	"Globe",
	"Video",
	"Tv",
	"PlayCircle",
	"Mic",
	"Film",
	"Star",
	"Sparkles",
	"Brush",
	"Layers"
];
function AdminServiceModal({ open, onOpenChange, service }) {
	const queryClient = useQueryClient();
	const [name, setName] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [icon, setIcon] = (0, import_react.useState)("Layers");
	const [status, setStatus] = (0, import_react.useState)("Active");
	const isEditing = !!service;
	(0, import_react.useEffect)(() => {
		if (service) {
			setName(service.name || "");
			setDescription(service.description || "");
			setIcon(service.icon || "Layers");
			setStatus(service.status || "Active");
		} else {
			setName("");
			setDescription("");
			setIcon("Layers");
			setStatus("Active");
		}
	}, [service, open]);
	const saveMutation = useMutation({
		mutationFn: async () => {
			if (!name || !name.trim()) throw new Error("Service name is required.");
			if (isEditing && service) return updateService(service.id, {
				name: name.trim(),
				description: description.trim() || null,
				icon,
				status
			});
			else return createService({
				name: name.trim(),
				description: description.trim() || null,
				icon,
				status
			});
		},
		onSuccess: (res) => {
			toast.success(`Service "${res.name}" ${isEditing ? "updated" : "created"} successfully!`);
			onOpenChange(false);
			queryClient.invalidateQueries({ queryKey: ["crm-services"] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to save service.");
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2 text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-5 text-[#67B239]" }), isEditing ? `Edit Service (${service?.name})` : "Add New Service Offering"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-xs",
					children: "Configure sales service offerings and descriptions."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-2 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								htmlFor: "srv_name",
								className: "text-xs font-semibold",
								children: ["Service Name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-red-500",
									children: "*"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "srv_name",
								placeholder: "e.g. Celebrity Video Ads",
								value: name,
								onChange: (e) => setName(e.target.value),
								className: "text-xs"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "srv_desc",
								className: "text-xs font-semibold",
								children: "Description / Offer Package Scope"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "srv_desc",
								placeholder: "Describe deliverables, video production scope, or features...",
								rows: 3,
								value: description,
								onChange: (e) => setDescription(e.target.value),
								className: "text-xs leading-relaxed"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									htmlFor: "srv_icon",
									className: "text-xs font-semibold",
									children: ["Icon Category ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-red-500",
										children: "*"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: icon,
									onValueChange: setIcon,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "srv_icon",
										className: "text-xs",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Icon" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SERVICE_ICONS.map((ic) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: ic,
										className: "text-xs",
										children: ic
									}, ic)) })]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									htmlFor: "srv_status",
									className: "text-xs font-semibold",
									children: ["Status ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-red-500",
										children: "*"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: status,
									onValueChange: (val) => setStatus(val),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "srv_status",
										className: "text-xs",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Status" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Active",
										children: "Active"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Inactive",
										children: "Inactive"
									})] })]
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "gap-2 sm:gap-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => onOpenChange(false),
						disabled: saveMutation.isPending,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5",
						onClick: () => saveMutation.mutate(),
						disabled: saveMutation.isPending || !name,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }), saveMutation.isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Service"]
					})]
				})
			]
		})
	});
}
var ICON_MAP = {
	Camera: Star,
	Palette,
	Calendar,
	Globe,
	Video,
	Tv,
	PlayCircle: CirclePlay,
	Mic,
	Film,
	Star,
	Sparkles,
	Brush,
	Layers
};
function renderServiceIcon(iconName) {
	const IconComp = ICON_MAP[iconName] || Layers;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconComp, { className: "size-4 text-[#67B239]" });
}
function AdminServicesPage() {
	const queryClient = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const [modalState, setModalState] = (0, import_react.useState)({
		open: false,
		service: null
	});
	const { data: services = [], isLoading } = useQuery(servicesQueryOptions(search));
	const totalServicesCount = services.length;
	const activeCount = services.filter((s) => s.status === "Active").length;
	const inactiveCount = services.filter((s) => s.status === "Inactive").length;
	const toggleMutation = useMutation({
		mutationFn: async ({ id, status }) => {
			return toggleServiceStatus(id, status);
		},
		onSuccess: (_, vars) => {
			toast.success(`Service status set to ${vars.status}.`);
			queryClient.invalidateQueries({ queryKey: ["crm-services"] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to toggle service status.");
		}
	});
	const softDeleteMutation = useMutation({
		mutationFn: async (id) => {
			return softDeleteService(id);
		},
		onSuccess: () => {
			toast.success("Service set to Inactive to preserve historical record integrity.");
			queryClient.invalidateQueries({ queryKey: ["crm-services"] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to set service inactive.");
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-7 text-[#67B239]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-bold tracking-tight text-foreground",
						children: "Service Management"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-0.5",
					children: "Configure CRM service offerings. Historical services are soft-deleted/set inactive to maintain audit history."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5 self-start sm:self-auto",
					onClick: () => setModalState({
						open: true,
						service: null
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Add New Service"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Services",
						value: String(totalServicesCount),
						icon: Layers,
						colorScheme: "indigo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Active Services",
						value: String(activeCount),
						icon: CircleCheck,
						colorScheme: "emerald"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Inactive Services",
						value: String(inactiveCount),
						icon: CircleX,
						colorScheme: "amber"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative max-w-sm flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Search name, business, phone...",
							value: search,
							onChange: (e) => setSearch(e.target.value),
							className: "pl-9 pr-8 bg-white"
						}),
						search && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setSearch(""),
							className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "bg-white dark:bg-card border-slate-200/80 shadow-xs overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left border-collapse text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b bg-slate-50/80 dark:bg-muted/50 font-semibold text-muted-foreground uppercase tracking-wider",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3.5 px-4",
									children: "Icon & Service Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3.5 px-4",
									children: "Description Scope"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3.5 px-4",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3.5 px-4",
									children: "Created At"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3.5 px-4",
									children: "Last Updated"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3.5 px-4 text-right",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border/60",
							children: isLoading ? Array.from({ length: 5 }).map((_, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 6,
								className: "py-4 px-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full rounded" })
							}) }, idx)) : services.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								colSpan: 6,
								className: "py-12 text-center text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-8 mx-auto text-slate-300 mb-2" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold text-foreground",
										children: "No services match your search"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-0.5",
										children: "Add a service or clear your search terms."
									})
								]
							}) }) : services.map((srv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3.5 px-4 max-w-56",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 font-bold text-foreground text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-7 w-7 rounded bg-[#67B239]/10 flex items-center justify-center shrink-0",
												children: renderServiceIcon(srv.icon)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: srv.name })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3.5 px-4 max-w-72",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground line-clamp-2",
											title: srv.description || "",
											children: srv.description || "No detailed description provided."
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3.5 px-4 whitespace-nowrap",
										children: srv.status === "Active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											className: "bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-2 py-0.5 gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3" }), "Active"]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "outline",
											className: "text-slate-500 border-slate-300 text-[10px] px-2 py-0.5 gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3 text-slate-400" }), "Inactive"]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-muted-foreground",
										children: new Date(srv.created_at).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-muted-foreground",
										children: new Date(srv.updated_at).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3.5 px-4 text-right whitespace-nowrap",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-end gap-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													variant: "ghost",
													size: "sm",
													className: "h-7 px-2 text-xs gap-1",
													onClick: () => setModalState({
														open: true,
														service: srv
													}),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "size-3.5 text-blue-600" }), "Edit"]
												}),
												srv.status === "Active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "ghost",
													size: "sm",
													className: "h-7 w-7 p-0 text-amber-600 hover:bg-amber-50",
													title: "Deactivate Service",
													disabled: toggleMutation.isPending,
													onClick: () => {
														toggleMutation.mutate({
															id: srv.id,
															status: "Inactive"
														});
													},
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PowerOff, { className: "size-3.5" })
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "ghost",
													size: "sm",
													className: "h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-50",
													title: "Activate Service",
													disabled: toggleMutation.isPending,
													onClick: () => {
														toggleMutation.mutate({
															id: srv.id,
															status: "Active"
														});
													},
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Power, { className: "size-3.5" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "ghost",
													size: "sm",
													className: "h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50",
													title: "Soft-delete (Set Inactive to protect history)",
													disabled: softDeleteMutation.isPending,
													onClick: () => {
														if (confirm(`Set "${srv.name}" to inactive? Historical invoices and deals referencing this service will be preserved.`)) softDeleteMutation.mutate(srv.id);
													},
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
												})
											]
										})
									})
								]
							}, srv.id))
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminServiceModal, {
				open: modalState.open,
				onOpenChange: (open) => setModalState((prev) => ({
					...prev,
					open
				})),
				service: modalState.service
			})
		]
	});
}
//#endregion
export { AdminServicesPage as component };
