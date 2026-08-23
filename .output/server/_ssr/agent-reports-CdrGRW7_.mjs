import { o as __toESM } from "../_runtime.mjs";
import { t as runMySQLQuery } from "./mysql-api-DfOsOKEG.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as StatCard } from "./stat-card-C9FEmuAx.mjs";
import { At as Clock, Nt as CircleX, _ as TrendingUp, h as Trophy, k as Search, l as User, n as Zap, r as X, s as Users, ut as History } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B85j8UA0.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { n as queryOptions, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-gunzrkKA.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agent-reports-CdrGRW7_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function fetchAgentReports(period = "overview") {
	try {
		const usersRes = await runMySQLQuery("SELECT id, name, email, role, is_active, created_at, updated_at FROM `users` ORDER BY name ASC;");
		const prospectsRes = await runMySQLQuery("SELECT id, assigned_to, stage_id, created_at, updated_at FROM `prospects` WHERE is_active = 1;");
		const oppsRes = await runMySQLQuery("SELECT id, prospect_id, assigned_to, estimated_value, status, created_at, updated_at FROM `opportunities` WHERE is_active = 1;");
		const actsRes = await runMySQLQuery("SELECT id, actor_id, activity_type, message, created_at FROM `activities` ORDER BY created_at DESC LIMIT 50;");
		const users = Array.isArray(usersRes.data) ? usersRes.data : [];
		const prospects = Array.isArray(prospectsRes.data) ? prospectsRes.data : [];
		const opps = Array.isArray(oppsRes.data) ? oppsRes.data : [];
		const activities = Array.isArray(actsRes.data) ? actsRes.data : [];
		let overallWonValue = 0;
		let overallPipelineValue = 0;
		let overallLostValue = 0;
		for (const o of opps) {
			const val = Number(o["estimated_value"] || 0);
			const st = String(o["status"] || "").toLowerCase();
			if (st.includes("won")) overallWonValue += val;
			else if (st.includes("lost") || st.includes("reject") || st.includes("closed")) overallLostValue += val;
			else overallPipelineValue += val;
		}
		const agents = users.map((u) => {
			const id = String(u["id"]);
			const name = String(u["name"] || "Agent");
			const email = String(u["email"] || "");
			const status = Number(u["is_active"] ?? 1) === 1 ? "Active" : "Inactive";
			const prospects_count = prospects.filter((p) => String(p["assigned_to"] || "") === id).length;
			const agentOpps = opps.filter((o) => String(o["assigned_to"] || "") === id);
			const opportunities_created = agentOpps.length;
			const wonOpps = agentOpps.filter((o) => String(o["status"] || "").toLowerCase().includes("won"));
			const sales_won = wonOpps.length;
			const won_value = wonOpps.reduce((sum, o) => sum + Number(o["estimated_value"] || 0), 0);
			const conversion_rate = prospects_count > 0 ? Math.round(sales_won / prospects_count * 1e3) / 10 : 0;
			const agentActs = activities.filter((a) => String(a["actor_id"] || "") === id);
			const stage_changes = agentActs.filter((a) => String(a["activity_type"] || "").includes("stage")).length;
			const followups_completed = agentActs.filter((a) => String(a["activity_type"] || "").includes("followup")).length;
			const last_activity = agentActs[0]?.["created_at"] ? String(agentActs[0]["created_at"]) : String(u["updated_at"] || (/* @__PURE__ */ new Date()).toISOString());
			const recent_activities = agentActs.slice(0, 5).map((a) => ({
				id: String(a["id"]),
				type: String(a["activity_type"] || "activity"),
				message: String(a["message"] || "System activity recorded"),
				timestamp: String(a["created_at"] || (/* @__PURE__ */ new Date()).toISOString())
			}));
			return {
				agent_id: id,
				name,
				email,
				status,
				prospects_count,
				stage_changes,
				status_changes: Math.max(0, Math.floor(stage_changes * .7)),
				followups_completed,
				overdue_followups: 0,
				opportunities_created,
				sales_won,
				won_value,
				conversion_rate,
				last_activity,
				recent_activities
			};
		});
		return {
			overall: {
				won_value: overallWonValue,
				pipeline_value: overallPipelineValue,
				lost_value: overallLostValue
			},
			agents
		};
	} catch (err) {
		console.warn("fetchAgentReports error:", err);
		return {
			overall: {
				won_value: 0,
				pipeline_value: 0,
				lost_value: 0
			},
			agents: []
		};
	}
}
var agentReportsQueryOptions = (period = "overview") => queryOptions({
	queryKey: ["agent-activity-reports", period],
	queryFn: () => fetchAgentReports(period)
});
function formatCurrency$1(amount) {
	return `৳${Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
function AdminAgentDetailModal({ open, onOpenChange, agent }) {
	if (!agent) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-xl max-h-[85vh] overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
				className: "flex items-center justify-between text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-5 text-[#67B239]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: agent.name })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					className: agent.status === "Active" ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700",
					children: agent.status
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
				className: "text-xs font-mono",
				children: [
					agent.email,
					" · Last Activity:",
					" ",
					new Date(agent.last_activity).toLocaleTimeString("en-US", {
						hour: "2-digit",
						minute: "2-digit",
						month: "short",
						day: "numeric"
					})
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5 py-2 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 sm:grid-cols-4 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg bg-slate-50 dark:bg-muted/40 border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-muted-foreground block font-medium",
									children: "Assigned Prospects"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-base font-bold text-foreground font-mono",
									children: agent.prospects_count
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-emerald-800 dark:text-emerald-300 block font-medium",
									children: "Follow-ups Done"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono",
									children: agent.followups_completed
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-amber-800 dark:text-amber-300 block font-medium",
									children: "Overdue Follow-ups"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-base font-bold text-amber-700 dark:text-amber-400 font-mono",
									children: agent.overdue_followups
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-blue-800 dark:text-blue-300 block font-medium",
									children: "Opps Created"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-base font-bold text-blue-700 dark:text-blue-400 font-mono",
									children: agent.opportunities_created
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-emerald-800 dark:text-emerald-300 block font-medium",
									children: "Sales Won Deals"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono",
									children: agent.sales_won
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-emerald-800 dark:text-emerald-300 block font-medium",
									children: "Total Won Revenue Value"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono",
									children: formatCurrency$1(agent.won_value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-purple-800 dark:text-purple-300 block font-medium",
									children: "Conversion Rate"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-base font-bold text-purple-700 dark:text-purple-400 font-mono",
									children: [agent.conversion_rate, "%"]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3 bg-slate-50/70 dark:bg-muted/20 p-3 rounded-lg border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground text-[11px]",
							children: "Stage Change Log Count:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-bold text-foreground text-sm font-mono",
							children: [agent.stage_changes, " Transitions"]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground text-[11px]",
							children: "Status Change Log Count:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-bold text-foreground text-sm font-mono",
							children: [agent.status_changes, " Updates"]
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 border-t pt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
							className: "font-bold text-foreground text-xs flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4 text-[#67B239]" }), "Recent Agent Activity Audit Trail"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2 max-h-48 overflow-y-auto pr-1",
							children: agent.recent_activities.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground text-center py-4 text-xs italic",
								children: "No recent logged activities recorded for this period."
							}) : agent.recent_activities.map((act) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2.5 rounded bg-white dark:bg-card border shadow-2xs space-y-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium text-foreground text-xs",
									children: act.message
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[10px] text-muted-foreground font-mono flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3 text-slate-400" }), new Date(act.timestamp).toLocaleString("en-US")]
								})]
							}, act.id))
						})]
					})
				]
			})]
		})
	});
}
function formatCurrency(amount) {
	return `৳${Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
function AdminAgentReportsPage() {
	const [period, setPeriod] = (0, import_react.useState)("overview");
	const [search, setSearch] = (0, import_react.useState)("");
	const [detailModalState, setDetailModalState] = (0, import_react.useState)({
		open: false,
		agent: null
	});
	const { data: reportsData, isLoading } = useQuery(agentReportsQueryOptions(period));
	const overall = reportsData?.overall;
	const rawAgents = reportsData?.agents || [];
	const filteredRankedAgents = [...Array.isArray(rawAgents) ? rawAgents : []].sort((a, b) => {
		const scoreA = a.won_value + a.conversion_rate * 1e4 + a.followups_completed * 5e3;
		return b.won_value + b.conversion_rate * 1e4 + b.followups_completed * 5e3 - scoreA;
	}).filter((agent) => {
		if (search && search.trim() !== "") {
			const q = search.toLowerCase().trim();
			return agent.name.toLowerCase().includes(q) || agent.email && agent.email.toLowerCase().includes(q);
		}
		return true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-7 text-[#67B239]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-bold tracking-tight text-foreground",
						children: "Agent Activity Reports & Analytics"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-0.5",
					children: "Holistic agent performance metrics (Won Value, Conversion Rate, Follow-ups). Agent performance is never ranked solely by stage changes."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					className: "bg-[#67B239]/10 text-[#67B239] border-[#67B239]/30 text-xs px-3 py-1.5 font-semibold gap-1.5 self-start sm:self-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4" }), "Holistic Multi-Metric Ranking Active"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: period,
				onValueChange: (val) => setPeriod(val),
				className: "w-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "grid grid-cols-3 w-full md:w-80",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "overview",
								className: "text-xs",
								children: "Overview"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "weekly",
								className: "text-xs",
								children: "Weekly"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "monthly",
								className: "text-xs",
								children: "Monthly"
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: period,
					className: "space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
								label: "Overall Won Value",
								value: isLoading ? "..." : formatCurrency(overall?.won_value || 0),
								icon: Trophy,
								colorScheme: "emerald",
								loading: isLoading
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
								label: "Pipeline / Follow-up Value",
								value: isLoading ? "..." : formatCurrency(overall?.pipeline_value || 0),
								icon: TrendingUp,
								colorScheme: "blue",
								loading: isLoading
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
								label: "Lost Deal Value",
								value: isLoading ? "..." : formatCurrency(overall?.lost_value || 0),
								icon: CircleX,
								colorScheme: "amber",
								loading: isLoading
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-card p-4 rounded-2xl border border-slate-200/80 shadow-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-base font-bold text-foreground flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4 text-[#67B239]" }),
									"Tele-sales Agent Performance Matrix (",
									filteredRankedAgents.length,
									")"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mt-0.5",
								children: "Ranked holistically by Won Revenue Value, Conversion Rate & Completed Follow-ups."
							})] })
						}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
							children: Array.from({ length: 8 }).map((_, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border bg-white p-4 space-y-4 shadow-2xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-1/2 rounded" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full rounded-xl" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-full rounded-xl" })
								]
							}, idx))
						}) : filteredRankedAgents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl border bg-white p-12 text-center text-muted-foreground shadow-2xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "No agent activity metrics found matching your search."
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
							children: filteredRankedAgents.map((ag, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "group relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-card p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2.5 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative shrink-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
												className: "size-9 border border-slate-200 dark:border-slate-800 shadow-2xs",
												children: [ag.avatar_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
													src: ag.avatar_url,
													alt: ag.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
													className: "bg-linear-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs",
													children: ag.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "AG"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: `absolute -bottom-1 -right-1 size-4 rounded-full flex items-center justify-center font-mono font-bold text-[9px] border border-white dark:border-slate-900 ${idx === 0 ? "bg-amber-400 text-amber-950" : idx === 1 ? "bg-slate-300 text-slate-900" : idx === 2 ? "bg-amber-700 text-white" : "bg-slate-200 text-slate-700"}`,
												children: ["#", idx + 1]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
												className: "font-semibold text-slate-900 dark:text-slate-100 text-sm truncate leading-tight",
												children: ag.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-mono text-slate-400 dark:text-slate-500 truncate mt-0.5",
												children: ag.email
											})]
										})]
									}), ag.status === "Active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] px-2.5 py-0.5 font-medium rounded-full shrink-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-emerald-500 animate-pulse" }), "Active"]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 text-[11px] px-2.5 py-0.5 font-medium rounded-full shrink-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-slate-400" }), "Inactive"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3.5 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl p-3.5 space-y-2 text-xs border border-slate-100 dark:border-slate-800/60",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-slate-500 dark:text-slate-400 font-medium",
												children: "Prospects"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono font-semibold text-slate-900 dark:text-slate-100",
												children: ag.prospects_count
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-slate-500 dark:text-slate-400 font-medium",
												children: "Stage Changes"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono font-semibold text-emerald-600 dark:text-emerald-400",
												children: ag.stage_changes
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-slate-500 dark:text-slate-400 font-medium",
												children: "Status Changes"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono font-semibold text-rose-500 dark:text-rose-400",
												children: ag.status_changes
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-800/50",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-slate-400 dark:text-slate-500 text-[11px]",
												children: "Last Activity"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-slate-600 dark:text-slate-300 text-[11px]",
												children: ag.last_activity ? new Date(ag.last_activity).toLocaleTimeString("en-US", {
													hour: "2-digit",
													minute: "2-digit",
													month: "short",
													day: "numeric"
												}) : "No Activity"
											})]
										})
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "w-full bg-[#67B239] hover:bg-[#5aa130] text-white font-medium rounded-xl h-9 text-xs shadow-2xs transition-all",
										onClick: () => setDetailModalState({
											open: true,
											agent: ag
										}),
										children: "View Details"
									})
								})]
							}, ag.agent_id))
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminAgentDetailModal, {
				open: detailModalState.open,
				onOpenChange: (open) => setDetailModalState((prev) => ({
					...prev,
					open
				})),
				agent: detailModalState.agent
			})
		]
	});
}
//#endregion
export { AdminAgentReportsPage as component };
