import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Dt as Database, E as ShieldCheck, I as RefreshCw, Pt as CircleX } from "../_libs/lucide-react.mjs";
import { r as checkDatabaseHealth } from "./auth.functions-BS8w8YXV.mjs";
import { t as Route } from "./health-CjwDjfsm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/health-DwEk_6OE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HealthPage() {
	const initialData = Route.useLoaderData();
	const [health, setHealth] = (0, import_react.useState)(initialData);
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function refreshHealth() {
		setLoading(true);
		try {
			const res = await checkDatabaseHealth();
			setHealth({
				...res,
				checkedAt: (/* @__PURE__ */ new Date()).toISOString()
			});
		} catch {
			setHealth((prev) => ({
				...prev,
				checkedAt: (/* @__PURE__ */ new Date()).toISOString()
			}));
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans select-none",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between pb-6 border-b border-slate-800",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-base font-bold text-white tracking-tight",
								children: "Database Health"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-slate-400",
								children: "Brandium CRM MySQL Status"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => void refreshHealth(),
						disabled: loading,
						className: "size-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50",
						title: "Refresh Status",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-4 ${loading ? "animate-spin" : ""}` })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "my-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold text-slate-400",
						children: "Database Connection"
					}), health?.success ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-emerald-400 animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ONLINE" })]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "OFFLINE" })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 text-left mb-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3.5 rounded-xl bg-slate-800/40 border border-slate-800",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-medium text-slate-400 mb-0.5",
								children: "Database Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-bold text-slate-200 truncate",
								children: health?.database || "u603955686_brandiumcrm"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3.5 rounded-xl bg-slate-800/40 border border-slate-800",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-medium text-slate-400 mb-0.5",
								children: "Active Users"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-bold text-slate-200",
								children: health ? `${health.userCount} Users` : "..."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-medium text-slate-400 mb-0.5",
								children: "MySQL Server Version"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-bold text-slate-200 truncate",
								children: health?.version || "10.11.10-MariaDB"
							})]
						})
					]
				}),
				health?.error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-3 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs text-left mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold mb-0.5",
						children: "Connection Warning:"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "opacity-90 leading-relaxed",
						children: health.error
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Checked: ", health?.checkedAt ? new Date(health.checkedAt).toLocaleTimeString() : "Now"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1 text-slate-400 font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3 text-emerald-400" }), " MySQL 8.0/MariaDB"]
					})]
				})
			]
		})
	});
}
//#endregion
export { HealthPage as component };
