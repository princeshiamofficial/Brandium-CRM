import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate, f as Outlet, g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime, d as DialogContent, f as DialogDescription, h as DialogTitle, l as Dialog, m as DialogPortal, p as DialogOverlay, u as DialogClose } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { Dt as DatabaseBackup, J as Package, Jt as ChartColumn, K as PanelLeft, Kt as CheckCheck, L as Receipt, Ot as CreditCard, Q as MessageSquarePlus, Wt as ChevronDown, Xt as CalendarDays, Z as MessagesSquare, Zt as CalendarClock, a as Wallet, c as UsersRound, f as UserCog, h as Trophy, i as Workflow, in as BanknoteX, j as ScrollText, l as User, ln as Activity, nn as Bell, r as X, sn as ArrowRight, st as LayoutDashboard, tt as LogOut, ut as History, y as Target } from "../_libs/lucide-react.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-gunzrkKA.mjs";
import { n as useAuth } from "./auth-B2XYmJf_.mjs";
import { a as DropdownMenuLabel, d as DropdownMenuTrigger, i as DropdownMenuItem, n as DropdownMenuContent, s as DropdownMenuSeparator, t as DropdownMenu } from "./dropdown-menu-BfBJVxb8.mjs";
import { r as crmUsersQueryOptions } from "./admin-users-PfRz3lH5.mjs";
import { t as AccountSuspendedModal } from "./account-suspended-modal-DBU2JbqA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-CTQWIB2_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Sheet = Dialog;
var SheetPortal = DialogPortal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = DialogContent.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = DialogTitle.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = DialogDescription.displayName;
var navGroups = [
	{
		label: "Workspace",
		items: [
			{
				title: "Dashboard",
				url: "/dashboard",
				icon: LayoutDashboard
			},
			{
				title: "Prospects",
				url: "/prospects",
				icon: UsersRound
			},
			{
				title: "Opportunities",
				url: "/opportunities",
				icon: Target
			},
			{
				title: "Follow Ups",
				url: "/follow-ups",
				icon: CalendarClock
			},
			{
				title: "Meetings",
				url: "/meetings",
				icon: CalendarDays
			},
			{
				title: "Won Sales",
				url: "/won-sales",
				icon: Trophy
			},
			{
				title: "Denied Payments",
				url: "/denied-payments",
				icon: BanknoteX
			}
		]
	},
	{
		label: "Communication",
		items: [{
			title: "Send SMS",
			url: "/sms/send",
			icon: MessageSquarePlus
		}, {
			title: "SMS Logs",
			url: "/sms/logs",
			icon: MessagesSquare
		}]
	},
	{
		label: "Finance",
		items: [
			{
				title: "Billing",
				url: "/billing",
				icon: Receipt
			},
			{
				title: "Client Balances",
				url: "/client-balances",
				icon: Wallet
			},
			{
				title: "Billing History",
				url: "/billing-history",
				icon: History
			}
		]
	},
	{
		label: "Analytics",
		items: [{
			title: "Reports",
			url: "/reports",
			icon: ChartColumn
		}, {
			title: "Agent Activity",
			url: "/agent-activity",
			icon: Activity
		}]
	},
	{
		label: "Administration",
		adminOnly: true,
		items: [
			{
				title: "Users",
				url: "/admin/users",
				icon: UserCog
			},
			{
				title: "Services",
				url: "/admin/services",
				icon: Package
			},
			{
				title: "Agent Reports",
				url: "/admin/agent-reports",
				icon: Activity
			},
			{
				title: "Stage Management",
				url: "/admin/stages",
				icon: Workflow
			},
			{
				title: "Stage History",
				url: "/admin/stage-history",
				icon: ScrollText
			},
			{
				title: "Data Backup",
				url: "/admin/data-backup",
				icon: DatabaseBackup
			}
		]
	}
];
function initials(name) {
	return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "U";
}
function NavList({ collapsed, onNavigate }) {
	const { isAdmin } = useAuth();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	if (collapsed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "flex flex-col gap-3 py-2 px-1 items-center",
		children: navGroups.filter((group) => !group.adminOnly || isAdmin).map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "bg-white dark:bg-card rounded-3xl p-1.5 shadow-xs border border-slate-200/70 dark:border-border flex flex-col items-center gap-1.5 w-11",
			children: group.items.map((item) => {
				const active = pathname === item.url;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: item.url,
					onClick: onNavigate,
					title: item.title,
					className: cn("size-8 rounded-full flex items-center justify-center transition-all", active ? "bg-[#67B239] text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-muted"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-4 shrink-0" })
				}, item.url);
			})
		}, group.label))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "flex flex-col gap-5 px-3 py-4",
		children: navGroups.filter((group) => !group.adminOnly || isAdmin).map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-300/80",
			children: group.label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-0.5",
			children: group.items.map((item) => {
				const active = pathname === item.url;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: item.url,
					onClick: onNavigate,
					className: cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors", active ? "bg-[#7AC142] font-semibold text-white shadow-xs" : "text-slate-200 hover:bg-white/10 hover:text-white"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: item.title
					})]
				}) }, item.url);
			})
		})] }, group.label))
	});
}
function Brand({ collapsed }) {
	if (collapsed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-16 items-center justify-center px-1",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/dashboard",
			className: "size-11 rounded-full bg-white dark:bg-card border border-slate-200/70 dark:border-border shadow-xs flex items-center justify-center p-1.5 transition-transform hover:scale-105",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/logo.png",
				alt: "Brandium Logo",
				className: "size-8 object-contain"
			})
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-20 items-center justify-center border-b border-slate-200/80 dark:border-border bg-white dark:bg-card px-3 shadow-xs",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/dashboard",
			className: "flex items-center justify-center w-full",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/logo.png",
				alt: "Brandium Logo",
				className: "h-14 w-auto max-w-full object-contain transition-all"
			})
		})
	});
}
function AppShell({ children }) {
	const [collapsed, setCollapsed] = (0, import_react.useState)(false);
	const [mobileOpen, setMobileOpen] = (0, import_react.useState)(false);
	const { profile, user, role, signOut } = useAuth();
	const { data: usersList } = useQuery(crmUsersQueryOptions());
	const currentUserRecord = usersList?.find((u) => u.id === user?.id || u.email.toLowerCase() === (user?.email || profile?.email || "").toLowerCase());
	const currentAvatarUrl = currentUserRecord?.avatar_url || user?.user_metadata?.["avatar_url"];
	const name = currentUserRecord?.name?.trim() || profile?.full_name?.trim() || user?.email || "User";
	const displayEmail = currentUserRecord?.email?.trim() || user?.email || profile?.email || "";
	const isSuspended = Boolean(currentUserRecord) && (currentUserRecord?.status === "Inactive" || currentUserRecord?.status === "Deleted" || Boolean(currentUserRecord?.is_deleted));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen bg-[#EEEFF2] dark:bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: cn("hidden shrink-0 transition-[width,background-color] duration-200 md:sticky md:top-0 md:block md:h-screen", collapsed ? "w-16 bg-[#EEEFF2] dark:bg-background border-r-0" : "w-64 border-r border-[#0B3364]/30 bg-[#0B3364] text-white"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { collapsed }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("overflow-y-auto no-scrollbar", collapsed ? "h-[calc(100vh-4rem)]" : "h-[calc(100vh-5rem)]"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavList, { collapsed })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: mobileOpen,
				onOpenChange: setMobileOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
					side: "left",
					className: "w-72 p-0 bg-[#0B3364] text-white border-[#0B3364]/30",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { collapsed: false }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavList, {
							collapsed: false,
							onNavigate: () => setMobileOpen(false)
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-slate-200/80 bg-white/80 dark:bg-slate-900/80 dark:border-slate-800 px-3 backdrop-blur-md shadow-2xs md:px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "md:hidden",
							"aria-label": "Open navigation",
							onClick: () => setMobileOpen(true),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/dashboard",
							className: "flex items-center gap-2 md:hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/logo.png",
								alt: "Brandium",
								className: "h-7 w-auto object-contain"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "hidden md:inline-flex",
							"aria-label": "Toggle sidebar",
							onClick: () => setCollapsed((v) => !v),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex items-center gap-1 sm:gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "icon",
									className: "relative size-9 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
									"aria-label": "Notifications",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "absolute top-1.5 right-1.5 flex h-2 w-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-[#67B239] opacity-75" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-[#67B239]" })]
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								align: "end",
								className: "w-84 sm:w-92 p-0 shadow-2xl border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl animate-in fade-in-50 zoom-in-95",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "size-7 rounded-lg bg-[#67B239]/15 flex items-center justify-center text-[#67B239]",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
												className: "font-bold text-xs text-foreground tracking-tight",
												children: "Notifications"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground",
												children: "Stay updated on recent sales activity"
											})] })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] bg-[#67B239] text-white font-semibold px-2 py-0.5 rounded-full shadow-2xs",
											children: "3 New"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "divide-y divide-slate-100 dark:divide-slate-800/60 max-h-80 overflow-y-auto text-xs",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all cursor-pointer flex items-start gap-3 group",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-4" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex-1 min-w-0 space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center justify-between gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold text-foreground text-xs truncate",
															children: "New Sales Won Deal"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground font-mono shrink-0",
															children: "10m ago"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "text-muted-foreground text-[11px] leading-snug",
														children: [
															"AurevixSoft signed",
															" ",
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "font-medium text-foreground",
																children: "৳125,000"
															}),
															" retainer contract."
														]
													})]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all cursor-pointer flex items-start gap-3 group",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "size-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "size-4" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex-1 min-w-0 space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center justify-between gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold text-foreground text-xs truncate",
															children: "Follow-up Scheduled"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground font-mono shrink-0",
															children: "1h ago"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-muted-foreground text-[11px] leading-snug",
														children: "Follow-up call scheduled with GreenTech BD today at 3:00 PM."
													})]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all cursor-pointer flex items-start gap-3 group",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "size-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-4" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex-1 min-w-0 space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center justify-between gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold text-foreground text-xs truncate",
															children: "Payment Cleared"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground font-mono shrink-0",
															children: "3h ago"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "text-muted-foreground text-[11px] leading-snug",
														children: [
															"Payment of ",
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "font-medium text-foreground",
																children: "৳125,000"
															}),
															" ",
															"credited for Invoice #INV-2026-801."
														]
													})]
												})]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between px-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "ghost",
											size: "sm",
											className: "h-7 text-[11px] text-muted-foreground hover:text-foreground gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "size-3.5 text-[#67B239]" }), "Mark all read"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/agent-activity",
											className: "text-[11px] font-medium text-[#67B239] hover:underline flex items-center gap-1",
											children: ["View Activity ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3" })]
										})]
									})
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									className: "h-9 gap-1.5 px-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
										className: "size-8.5 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
											src: currentAvatarUrl || void 0,
											alt: name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
											className: "bg-[#67B239] text-white text-[11px] font-bold",
											children: initials(name)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5 text-muted-foreground" })]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								align: "end",
								className: "w-56",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, {
										className: "font-normal",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-sm font-medium",
												children: name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-xs text-muted-foreground",
												children: displayEmail
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-[11px] uppercase tracking-wide text-muted-foreground",
												children: role ?? "agent"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										disabled: true,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "mr-2 size-4" }), " Profile"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: () => void signOut(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "mr-2 size-4" }), " Log out"]
									})
								]
							})] })]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 p-4 md:p-6",
					children
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountSuspendedModal, {
				open: isSuspended,
				userName: name,
				userEmail: displayEmail,
				status: currentUserRecord?.status || "Inactive"
			})
		]
	});
}
function AuthenticatedLayout() {
	const { session, loading } = useAuth();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (!loading && !session) navigate({
			to: "/login",
			replace: true
		});
	}, [
		loading,
		session,
		navigate
	]);
	if (loading || !session) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-muted/30",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
//#endregion
export { AuthenticatedLayout as component };
