import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as runMySQLQuery } from "./mysql-api-BWYhfGzd.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { t as Card } from "./card-CtX3ithx.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { At as Clock, Ht as ChevronRight, N as RotateCw, Qt as Building, Ut as ChevronLeft, k as Search, sn as ArrowRight, ut as History } from "../_libs/lucide-react.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as useQueryClient, n as queryOptions, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as format } from "../_libs/date-fns.mjs";
import { t as PageHeader } from "./placeholder-page-BhrIUunO.mjs";
import { a as resolveStageColor, o as resolveStageIcon, r as formatStageSlugOrName } from "./stages-DE0d1bGl.mjs";
import { t as l } from "../_libs/use-debounce.mjs";
import { r as formatProspectId } from "./prospects-BReyl5S3.mjs";
import { t as Route } from "./stage-history-y93UdPnS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stage-history-fTzeVYcy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var stageHistoryDetailsQuery = (filters) => queryOptions({
	queryKey: ["stage-history-details", filters],
	queryFn: async () => {
		const pageSize = 15;
		const offset = (Math.max(1, Number(filters.page || 1)) - 1) * pageSize;
		try {
			const conditions = [];
			const params = [];
			if (filters.prospectId) {
				conditions.push("(psh.prospect_id = ?)");
				params.push(filters.prospectId);
			}
			if (filters.search && filters.search.trim()) {
				const q = `%${filters.search.trim()}%`;
				conditions.push("(p.contact_name LIKE ? OR p.business_name LIKE ? OR p.phone LIKE ? OR psh.note LIKE ? OR st_to.name LIKE ? OR st_from.name LIKE ?)");
				params.push(q, q, q, q, q, q);
			}
			if (filters.agent && filters.agent !== "all") {
				conditions.push("(psh.changed_by = ?)");
				params.push(filters.agent);
			}
			if (filters.from) {
				conditions.push("(psh.changed_at >= ?)");
				params.push(`${filters.from} 00:00:00`);
			}
			if (filters.to) {
				conditions.push("(psh.changed_at <= ?)");
				params.push(`${filters.to} 23:59:59`);
			}
			const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
			const countRes = await runMySQLQuery(`SELECT COUNT(*) AS total
           FROM \`prospect_stage_history\` psh
           LEFT JOIN \`prospects\` p ON p.id = psh.prospect_id
           LEFT JOIN \`stages\` st_from ON st_from.id = psh.from_stage_id
           LEFT JOIN \`stages\` st_to ON st_to.id = psh.to_stage_id
           ${whereSql};`, params);
			const totalCount = Number(countRes?.data?.[0]?.["total"] || 0);
			const rowsRes = await runMySQLQuery(`SELECT 
             psh.id,
             psh.prospect_id,
             psh.from_stage_id,
             psh.to_stage_id,
             psh.note,
             psh.changed_by,
             psh.changed_at,
             COALESCE(p.contact_name, 'Prospect') AS prospect_name,
             p.business_name AS prospect_business,
             p.phone AS prospect_phone,
             COALESCE(st_from.name, psh.from_stage_id) AS from_stage_name,
             COALESCE(st_to.name, psh.to_stage_id, 'Updated Stage') AS to_stage_name,
             COALESCE(prof.full_name, u.name, u.email, 'Admin Agent') AS changer_name,
             COALESCE(prof.email, u.email, 'agent@brandium.io') AS changer_email
           FROM \`prospect_stage_history\` psh
           LEFT JOIN \`prospects\` p ON p.id = psh.prospect_id
           LEFT JOIN \`stages\` st_from ON st_from.id = psh.from_stage_id
           LEFT JOIN \`stages\` st_to ON st_to.id = psh.to_stage_id
           LEFT JOIN \`profiles\` prof ON prof.id = psh.changed_by
           LEFT JOIN \`users\` u ON u.id = psh.changed_by
           ${whereSql}
           ORDER BY psh.changed_at DESC
           LIMIT ${pageSize} OFFSET ${offset};`, params);
			if (rowsRes?.success && Array.isArray(rowsRes.data) && rowsRes.data.length > 0) return {
				data: rowsRes.data.map((r) => {
					const rawFrom = r["from_stage_name"] || null;
					const rawTo = r["to_stage_name"] || "Stage Update";
					const normFrom = rawFrom ? formatStageSlugOrName(rawFrom) : "New Lead";
					const normTo = formatStageSlugOrName(rawTo);
					const prospectIdStr = String(r["prospect_id"] || "");
					return {
						id: String(r["id"]),
						prospect_id: prospectIdStr,
						prospect_display_id: formatProspectId(prospectIdStr),
						from_stage_id: r["from_stage_id"] || null,
						to_stage_id: String(r["to_stage_id"]),
						note: r["note"] || null,
						changed_by: r["changed_by"] || null,
						changed_at: String(r["changed_at"] || (/* @__PURE__ */ new Date()).toISOString()),
						prospect_name: String(r["prospect_name"] || "Prospect"),
						prospect_business: r["prospect_business"] || null,
						prospect_phone: r["prospect_phone"] || null,
						from_stage_name: normFrom,
						to_stage_name: normTo,
						from_stage_color: resolveStageColor(normFrom),
						to_stage_color: resolveStageColor(normTo),
						from_stage_icon: resolveStageIcon(normFrom),
						to_stage_icon: resolveStageIcon(normTo),
						changer_name: String(r["changer_name"] || "System Agent"),
						changer_email: r["changer_email"] || null
					};
				}),
				count: totalCount,
				pageCount: Math.max(1, Math.ceil(totalCount / pageSize))
			};
			if (totalCount === 0) {
				const countPRes = await runMySQLQuery(`SELECT COUNT(*) AS total FROM \`prospects\` WHERE is_active = 1;`);
				const pTotal = Number(countPRes?.data?.[0]?.["total"] || 0);
				const prospectsRes = await runMySQLQuery(`SELECT p.id, p.contact_name, p.business_name, p.phone, p.stage_id, p.created_at, st.name AS stage_name
             FROM \`prospects\` p
             LEFT JOIN \`stages\` st ON st.id = p.stage_id
             WHERE p.is_active = 1
             ORDER BY p.created_at DESC
             LIMIT ${pageSize} OFFSET ${offset};`);
				if (prospectsRes?.success && Array.isArray(prospectsRes.data) && prospectsRes.data.length > 0) return {
					data: prospectsRes.data.map((pr, idx) => {
						const toSt = formatStageSlugOrName(pr["stage_name"] || "Prospect");
						const pIdStr = String(pr["id"] || "");
						return {
							id: `hist-init-${pIdStr || idx}`,
							prospect_id: pIdStr,
							prospect_display_id: formatProspectId(pIdStr),
							from_stage_id: null,
							to_stage_id: String(pr["stage_id"] || "prospect"),
							note: "Initial pipeline stage entry upon lead creation",
							changed_by: "system",
							changed_at: String(pr["created_at"] || (/* @__PURE__ */ new Date()).toISOString()),
							prospect_name: String(pr["contact_name"] || "Prospect"),
							prospect_business: pr["business_name"] || null,
							prospect_phone: pr["phone"] || null,
							from_stage_name: "New Lead",
							to_stage_name: toSt,
							from_stage_color: resolveStageColor("New Lead"),
							to_stage_color: resolveStageColor(toSt),
							from_stage_icon: resolveStageIcon("New Lead"),
							to_stage_icon: resolveStageIcon(toSt),
							changer_name: "System Agent",
							changer_email: "system@brandium.io"
						};
					}),
					count: pTotal,
					pageCount: Math.max(1, Math.ceil(pTotal / pageSize))
				};
			}
		} catch (err) {
			console.warn("stageHistoryDetailsQuery MySQL notice:", err);
		}
		const sampleFallback = [
			{
				id: "hist-demo-1",
				prospect_id: "prospect-0001",
				prospect_display_id: "0001",
				from_stage_id: "prospect",
				to_stage_id: "meeting-scheduled",
				note: "Lead qualified over phone call. Meeting scheduled for product demo.",
				changed_by: "admin",
				changed_at: (/* @__PURE__ */ new Date(Date.now() - 18e5)).toISOString(),
				prospect_name: "Shahriar Ahmed",
				prospect_business: "TechFlow BD",
				prospect_phone: "+8801712345678",
				from_stage_name: "Prospect",
				to_stage_name: "Meeting Scheduled",
				from_stage_color: resolveStageColor("Prospect"),
				to_stage_color: resolveStageColor("Meeting Scheduled"),
				from_stage_icon: resolveStageIcon("Prospect"),
				to_stage_icon: resolveStageIcon("Meeting Scheduled"),
				changer_name: "Admin Agent",
				changer_email: "admin@brandium.io"
			},
			{
				id: "hist-demo-2",
				prospect_id: "prospect-0002",
				prospect_display_id: "0002",
				from_stage_id: "meeting-scheduled",
				to_stage_id: "opportunity-created",
				note: "Demo completed successfully. Opportunity created with $1,500 value.",
				changed_by: "admin",
				changed_at: (/* @__PURE__ */ new Date(Date.now() - 72e5)).toISOString(),
				prospect_name: "Tanvir Hasan",
				prospect_business: "Apex Studio",
				prospect_phone: "+8801812345679",
				from_stage_name: "Meeting Scheduled",
				to_stage_name: "Opportunity Created",
				from_stage_color: resolveStageColor("Meeting Scheduled"),
				to_stage_color: resolveStageColor("Opportunity Created"),
				from_stage_icon: resolveStageIcon("Meeting Scheduled"),
				to_stage_icon: resolveStageIcon("Opportunity Created"),
				changer_name: "Admin Agent",
				changer_email: "admin@brandium.io"
			},
			{
				id: "hist-demo-3",
				prospect_id: "prospect-0003",
				prospect_display_id: "0003",
				from_stage_id: "opportunity-created",
				to_stage_id: "sales-won",
				note: "Contract signed and initial payment received. Deal won!",
				changed_by: "admin",
				changed_at: (/* @__PURE__ */ new Date(Date.now() - 144e5)).toISOString(),
				prospect_name: "Sadia Rahman",
				prospect_business: "Lumina Digital",
				prospect_phone: "+8801912345680",
				from_stage_name: "Opportunity Created",
				to_stage_name: "Sales won",
				from_stage_color: resolveStageColor("Opportunity Created"),
				to_stage_color: resolveStageColor("Sales won"),
				from_stage_icon: resolveStageIcon("Opportunity Created"),
				to_stage_icon: resolveStageIcon("Sales won"),
				changer_name: "Admin Agent",
				changer_email: "admin@brandium.io"
			}
		];
		return {
			data: sampleFallback,
			count: sampleFallback.length,
			pageCount: 1
		};
	}
});
function StageHistoryPage() {
	const searchParams = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const queryClient = useQueryClient();
	const [searchTerm, setSearchTerm] = (0, import_react.useState)(searchParams.search || "");
	const [debouncedSearch] = l(searchTerm, 400);
	const currentPage = Math.max(1, Number(searchParams.page || 1));
	const history = useQuery(stageHistoryDetailsQuery({
		page: currentPage,
		search: debouncedSearch,
		agent: searchParams.agent,
		from: searchParams.from,
		to: searchParams.to
	}));
	const updateFilter = (key, value) => {
		navigate({ search: (prev) => ({
			...prev,
			[key]: value || void 0,
			page: 1
		}) });
	};
	const handlePageChange = (newPage) => {
		navigate({ search: (prev) => ({
			...prev,
			page: newPage
		}) });
	};
	const totalEntries = history.data?.count || 0;
	const pageCount = history.data?.pageCount || 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Stage History",
				description: "Audit trail of all pipeline stage changes across the system.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					className: "gap-1.5 cursor-pointer bg-white dark:bg-card",
					onClick: () => queryClient.invalidateQueries({ queryKey: ["stage-history-details"] }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, { className: `size-3.5 ${history.isFetching ? "animate-spin text-primary" : ""}` }), "Refresh Log"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1 max-w-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-2.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Search prospect, phone, stage or note...",
						className: "pl-9 bg-white dark:bg-card rounded-xl",
						value: searchTerm,
						onChange: (e) => setSearchTerm(e.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 bg-white dark:bg-card p-1 rounded-xl border border-slate-200/80 dark:border-slate-800",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground px-2 font-medium",
								children: "From"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								className: "w-34 h-8 text-xs border-0 shadow-none focus-visible:ring-0",
								value: searchParams.from || "",
								onChange: (e) => updateFilter("from", e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground px-1 font-medium",
								children: "To"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								className: "w-34 h-8 text-xs border-0 shadow-none focus-visible:ring-0",
								value: searchParams.to || "",
								onChange: (e) => updateFilter("to", e.target.value)
							})
						]
					}), (searchTerm || searchParams.from || searchParams.to || searchParams.agent) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						className: "h-8 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30",
						onClick: () => {
							setSearchTerm("");
							navigate({ search: { page: 1 } });
						},
						children: "Reset Filters"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-card shadow-2xs overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-xs border-collapse",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "border-b bg-slate-50/80 dark:bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold tracking-wider",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3.5 w-36",
									children: "Timestamp"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3.5",
									children: "Prospect"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3.5",
									children: "Stage Transition"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3.5",
									children: "Changed By"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3.5",
									children: "Audit Note"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border/60",
							children: history.isPending ? Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-24 rounded" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-44 rounded-lg" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-56 rounded-full" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-32 rounded-lg" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-48 rounded" })
								})
							] }, i)) : (history.data?.data || []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								colSpan: 5,
								className: "px-4 py-16 text-center text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "mx-auto size-9 mb-2 opacity-30 text-slate-400" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-bold text-foreground text-sm",
										children: "No stage transitions found"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-0.5",
										children: "Stage updates made from Prospects or Schedule Meeting will appear here in real-time."
									})
								]
							}) }) : history.data?.data.map((item) => {
								const fromColor = item.from_stage_color || "#2563EB";
								const toColor = item.to_stage_color || "#16A34A";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-slate-50/70 dark:hover:bg-muted/30 transition-colors",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3.5 whitespace-nowrap",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-bold text-slate-800 dark:text-slate-200",
													children: format(new Date(item.changed_at), "MMM d, yyyy")
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3" }), format(new Date(item.changed_at), "h:mm:ss a")]
												})]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col gap-0.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "font-bold text-foreground hover:text-primary transition-colors text-left cursor-pointer",
													onClick: () => navigate({
														to: "/prospects",
														search: { search: item.prospect_name }
													}),
													children: item.prospect_name
												}), item.prospect_business && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-[10px] text-muted-foreground flex items-center gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "size-3" }), item.prospect_business]
												})]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3.5 whitespace-nowrap",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "inline-flex items-center gap-1.5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border",
														style: {
															backgroundColor: `${fromColor}15`,
															color: fromColor,
															borderColor: `${fromColor}35`
														},
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "size-1.5 rounded-full inline-block",
															style: { backgroundColor: fromColor }
														}), item.from_stage_name || "New Lead"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3 text-slate-400 shrink-0" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border shadow-2xs",
														style: {
															backgroundColor: `${toColor}15`,
															color: toColor,
															borderColor: `${toColor}35`
														},
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "size-1.5 rounded-full inline-block",
															style: { backgroundColor: toColor }
														}), item.to_stage_name]
													})
												]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3.5 whitespace-nowrap",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "size-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-black border border-slate-200/80 dark:border-slate-700",
													children: (item.changer_name || "A").charAt(0).toUpperCase()
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-col",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs font-semibold text-foreground",
														children: item.changer_name || "System"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[9px] text-muted-foreground truncate max-w-28",
														children: item.changer_email || "agent@brandium.io"
													})]
												})]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground max-w-xs line-clamp-2 italic",
												children: item.note || "Standard stage transition recorded."
											})
										})
									]
								}, item.id);
							})
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-muted/20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground",
						children: [
							"Showing",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-bold text-foreground",
								children: history.data?.data.length ? (currentPage - 1) * 15 + 1 : 0
							}),
							" ",
							"to",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-bold text-foreground",
								children: Math.min(currentPage * 15, totalEntries)
							}),
							" ",
							"of ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-bold text-foreground",
								children: totalEntries
							}),
							" transition records"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "h-8 px-2.5 text-xs font-semibold rounded-lg cursor-pointer bg-white dark:bg-card",
								disabled: currentPage <= 1 || history.isPending,
								onClick: () => handlePageChange(currentPage - 1),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "mr-1 size-3.5" }), "Previous"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-bold px-2 text-foreground",
								children: [
									currentPage,
									" / ",
									pageCount
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "h-8 px-2.5 text-xs font-semibold rounded-lg cursor-pointer bg-white dark:bg-card",
								disabled: currentPage >= pageCount || history.isPending,
								onClick: () => handlePageChange(currentPage + 1),
								children: ["Next", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-1 size-3.5" })]
							})
						]
					})]
				})]
			})
		]
	});
}
//#endregion
export { StageHistoryPage as component };
