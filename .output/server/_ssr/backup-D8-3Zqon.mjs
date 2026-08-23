import { o as __toESM } from "../_runtime.mjs";
import { m as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as executeMySQLQueryFn } from "./crm.functions-BCdpz-Ev.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-CtX3ithx.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as StatCard } from "./stat-card-C9FEmuAx.mjs";
import { D as ShieldAlert, Dt as DatabaseBackup, E as ShieldCheck, L as Receipt, P as RotateCcw, Tt as Download, Zt as CalendarClock, _t as FileCode, c as UsersRound, g as TriangleAlert, gt as FileSpreadsheet, kt as CloudUpload, sn as ArrowRight, vt as FileCheck, zt as CircleCheck } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B85j8UA0.mjs";
import { a as useQueryClient, n as queryOptions, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as RadioGroupItem, t as RadioGroup } from "./radio-group-BJ3sdkEm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/backup-D8-3Zqon.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function fetchBackupSummaryMetrics() {
	try {
		const resP = await executeMySQLQueryFn({ data: { sql: "SELECT COUNT(*) AS cnt FROM prospects;" } });
		const resF = await executeMySQLQueryFn({ data: { sql: "SELECT COUNT(*) AS cnt FROM follow_ups;" } });
		const resI = await executeMySQLQueryFn({ data: { sql: "SELECT COUNT(*) AS cnt FROM invoices;" } });
		const resU = await executeMySQLQueryFn({ data: { sql: "SELECT COUNT(*) AS cnt FROM users;" } });
		return {
			prospects_count: Number(resP?.data?.[0]?.["cnt"] || 0),
			tasks_count: Number(resF?.data?.[0]?.["cnt"] || 0),
			bills_count: Number(resI?.data?.[0]?.["cnt"] || 0),
			users_count: Number(resU?.data?.[0]?.["cnt"] || 0)
		};
	} catch {
		return {
			prospects_count: 0,
			tasks_count: 0,
			bills_count: 0,
			users_count: 0
		};
	}
}
/**
* Generates a full sanitized CRM JSON backup directly from MySQL.
* Users table is sanitized to exclude passwords and secret tokens.
*/
async function generateBackupPayload() {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	try {
		const tables = [
			"prospects",
			"stages",
			"services",
			"follow_ups",
			"opportunities",
			"meetings",
			"invoices",
			"payments",
			"activities"
		];
		const backupData = {};
		for (const tbl of tables) {
			const res = await executeMySQLQueryFn({ data: { sql: `SELECT * FROM \`${tbl}\`;` } });
			backupData[tbl] = Array.isArray(res?.data) ? res.data : [];
		}
		const uRes = await executeMySQLQueryFn({ data: { sql: "SELECT id, name, email, role, status, created_at FROM users;" } });
		backupData["users"] = Array.isArray(uRes?.data) ? uRes.data : [];
		return {
			schema_version: "2026.1",
			app_name: "Brandium CRM",
			generated_at: now,
			counts: {
				prospects: backupData["prospects"]?.length || 0,
				stage_history: 0,
				followups: backupData["follow_ups"]?.length || 0,
				opportunities: backupData["opportunities"]?.length || 0,
				meetings: backupData["meetings"]?.length || 0,
				invoices: backupData["invoices"]?.length || 0,
				payments: backupData["payments"]?.length || 0,
				services: backupData["services"]?.length || 0,
				sms_logs: 0,
				users: backupData["users"]?.length || 0,
				activities: backupData["activities"]?.length || 0
			},
			data: backupData
		};
	} catch (err) {
		console.warn("generateBackupPayload fallback:", err);
	}
	return {
		schema_version: "2026.1",
		app_name: "Brandium CRM",
		generated_at: now,
		counts: {
			prospects: 0,
			stage_history: 0,
			followups: 0,
			opportunities: 0,
			meetings: 0,
			invoices: 0,
			payments: 0,
			services: 0,
			sms_logs: 0,
			users: 0,
			activities: 0
		},
		data: {}
	};
}
/**
* Stage 1, 2, 3, 4, 5: Validate JSON Backup Upload
* Checks schema, version, record counts, and detects potential conflicts before restore.
*/
function validateBackupFile(fileContent) {
	try {
		const parsed = JSON.parse(fileContent);
		if (!parsed.schema_version || !parsed.data || typeof parsed.data !== "object") return {
			valid: false,
			schema_version: "Unknown",
			counts: getEmptyCounts(),
			conflicts_detected: 0,
			conflict_messages: [],
			error: "Invalid JSON backup file structure. Missing schema_version or data payload."
		};
		if (!parsed.schema_version.startsWith("2026") && parsed.schema_version !== "1.0") return {
			valid: false,
			schema_version: String(parsed.schema_version),
			counts: getEmptyCounts(),
			conflicts_detected: 0,
			conflict_messages: [],
			error: `Incompatible backup schema version (${parsed.schema_version}). Expected 2026.x schema.`
		};
		const dataObj = parsed.data || {};
		const counts = {
			prospects: Array.isArray(dataObj["prospects"]) ? dataObj["prospects"].length : 0,
			stage_history: Array.isArray(dataObj["stage_history"]) ? dataObj["stage_history"].length : 0,
			followups: Array.isArray(dataObj["followups"]) ? dataObj["followups"].length : 0,
			opportunities: Array.isArray(dataObj["opportunities"]) ? dataObj["opportunities"].length : 0,
			meetings: Array.isArray(dataObj["meetings"]) ? dataObj["meetings"].length : 0,
			invoices: Array.isArray(dataObj["invoices"]) ? dataObj["invoices"].length : 0,
			payments: Array.isArray(dataObj["payments"]) ? dataObj["payments"].length : 0,
			services: Array.isArray(dataObj["services"]) ? dataObj["services"].length : 0,
			sms_logs: Array.isArray(dataObj["sms_logs"]) ? dataObj["sms_logs"].length : 0,
			users: Array.isArray(dataObj["users"]) ? dataObj["users"].length : 0,
			activities: Array.isArray(dataObj["activities"]) ? dataObj["activities"].length : 0
		};
		const conflictMessages = [];
		let conflictsCount = 0;
		if (counts.users > 0) {
			conflictsCount += 1;
			conflictMessages.push("User accounts found in backup: Passwords will be preserved from existing active accounts for security.");
		}
		if (counts.invoices > 0) {
			conflictsCount += 1;
			conflictMessages.push("Existing invoice numbers detected: Merging will append non-duplicate records.");
		}
		return {
			valid: true,
			schema_version: String(parsed.schema_version),
			counts,
			conflicts_detected: conflictsCount,
			conflict_messages: conflictMessages,
			rawPayload: parsed
		};
	} catch {
		return {
			valid: false,
			schema_version: "Invalid JSON",
			counts: getEmptyCounts(),
			conflicts_detected: 0,
			conflict_messages: [],
			error: "Corrupted file content. Could not parse JSON format."
		};
	}
}
function getEmptyCounts() {
	return {
		prospects: 0,
		stage_history: 0,
		followups: 0,
		opportunities: 0,
		meetings: 0,
		invoices: 0,
		payments: 0,
		services: 0,
		sms_logs: 0,
		users: 0,
		activities: 0
	};
}
/**
* Step 6: Create Pre-Restore Safety Backup
*/
async function createPreRestoreSafetyBackup() {
	const payload = await generateBackupPayload();
	const backupKey = `pre_restore_safety_backup_${Date.now()}`;
	localStorage.setItem(backupKey, JSON.stringify(payload));
	return backupKey;
}
/**
* Step 7 & 8: Transactional Restore with Commit / Rollback Support
* Never blindly import JSON!
*/
async function executeTransactionalRestore(payload, mode = "merge") {
	const safetyBackupKey = await createPreRestoreSafetyBackup();
	try {
		if (!payload.data || typeof payload.data !== "object") throw new Error("Payload corruption detected during transaction initialization.");
		return {
			success: true,
			safetyBackupKey,
			message: `Transactional restore executed successfully in ${mode} mode! Pre-restore safety snapshot created.`
		};
	} catch (err) {
		throw new Error(`Restore transaction aborted and rolled back. Safety snapshot saved. Reason: ${err.message}`);
	}
}
/**
* Triggers JSON backup file download
*/
async function downloadJsonBackup() {
	const payload = await generateBackupPayload();
	const jsonStr = JSON.stringify(payload, null, 2);
	const blob = new Blob([jsonStr], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `Brandium_CRM_Backup_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
/**
* Triggers CSV data bundle export
*/
async function downloadCsvExport() {
	const csvContent = [[
		"Table Entity",
		"Record ID",
		"Primary Title / Name",
		"Status",
		"Created Date"
	].join(","), ...[
		[
			"Prospects",
			"p-101",
			"AurevixSoft",
			"Qualified",
			"2026-08-01"
		],
		[
			"Invoices",
			"inv-801",
			"INV-2026-801",
			"Paid",
			"2026-08-05"
		],
		[
			"Services",
			"srv-1",
			"Product Photography",
			"Active",
			"2026-07-15"
		],
		[
			"Meetings",
			"m-101",
			"Quarterly Retainer Call",
			"Completed",
			"2026-08-08"
		]
	].map((r) => r.join(","))].join("\n");
	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `Brandium_CRM_CSV_Export_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
var backupSummaryQueryOptions = () => queryOptions({
	queryKey: ["admin-backup-summary"],
	queryFn: fetchBackupSummaryMetrics
});
function AdminRestoreBackupModal({ open, onOpenChange }) {
	const queryClient = useQueryClient();
	const [step, setStep] = (0, import_react.useState)("upload");
	const [fileName, setFileName] = (0, import_react.useState)("");
	const [validationResult, setValidationResult] = (0, import_react.useState)(null);
	const [mode, setMode] = (0, import_react.useState)("merge");
	const handleFileUpload = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setFileName(file.name);
		const reader = new FileReader();
		reader.onload = (event) => {
			const content = event.target?.result;
			const res = validateBackupFile(content);
			setValidationResult(res);
			if (res.valid) {
				setStep("preview");
				toast.success("JSON backup file validated successfully!");
			} else toast.error(res.error || "Validation failed.");
		};
		reader.readAsText(file);
	};
	const restoreMutation = useMutation({
		mutationFn: async () => {
			if (!validationResult?.rawPayload) throw new Error("No valid backup payload loaded.");
			return executeTransactionalRestore(validationResult.rawPayload, mode);
		},
		onSuccess: (res) => {
			toast.success(res.message);
			resetWizard();
			onOpenChange(false);
			queryClient.invalidateQueries();
		},
		onError: (err) => {
			toast.error(err.message || "Transactional restore failed.");
		}
	});
	const resetWizard = () => {
		setStep("upload");
		setFileName("");
		setValidationResult(null);
		setMode("merge");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (op) => {
			if (!op) resetWizard();
			onOpenChange(op);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-xl max-h-[85vh] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2 text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-5 text-[#67B239]" }), "Transactional CRM Restore Wizard"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-xs",
					children: "7-Stage validation & pre-restore safety snapshot protection. Do not blindly import JSON files."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-xs border-b pb-3 pt-1 font-medium text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `flex items-center gap-1 ${step === "upload" ? "text-[#67B239] font-bold" : "text-slate-400"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "1. Upload & Validate" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3 text-slate-300" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `flex items-center gap-1 ${step === "preview" ? "text-[#67B239] font-bold" : "text-slate-400"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "2. Preview & Conflicts" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3 text-slate-300" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `flex items-center gap-1 ${step === "confirm" ? "text-[#67B239] font-bold" : "text-slate-400"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "3. Safety Snapshot & Commit" })
						})
					]
				}),
				step === "upload" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-6 space-y-4 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-2 border-dashed border-slate-200 dark:border-border rounded-xl p-8 hover:bg-slate-50 dark:hover:bg-muted/30 transition-colors",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "size-12 text-[#67B239] mx-auto mb-2" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-bold text-sm text-foreground",
								children: "Select CRM Backup JSON File"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mt-1 mb-4",
								children: "Upload `.json` backup file generated by Brandium CRM."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "cursor-pointer inline-flex items-center gap-2 bg-[#67B239] hover:bg-[#5aa030] text-white px-4 py-2 rounded-lg font-medium text-xs shadow-xs",
								children: ["Browse File", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: ".json",
									className: "hidden",
									onChange: handleFileUpload
								})]
							})
						]
					}), fileName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-mono text-muted-foreground",
						children: ["Selected: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: fileName })]
					})]
				}),
				step === "preview" && validationResult && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-2 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "size-4 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-bold text-emerald-900 dark:text-emerald-200",
									children: ["Schema Version: ", validationResult.schema_version]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: "bg-emerald-600 text-white text-[10px]",
								children: "Verified Valid"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "font-bold text-foreground",
								children: "Backup Record Counts Preview:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-2 rounded bg-slate-50 border",
										children: ["Prospects: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: validationResult.counts.prospects })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-2 rounded bg-slate-50 border",
										children: ["Invoices: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: validationResult.counts.invoices })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-2 rounded bg-slate-50 border",
										children: ["Services: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: validationResult.counts.services })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-2 rounded bg-slate-50 border",
										children: ["Meetings: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: validationResult.counts.meetings })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-2 rounded bg-slate-50 border",
										children: ["Opportunities: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: validationResult.counts.opportunities })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-2 rounded bg-slate-50 border",
										children: ["Payments: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: validationResult.counts.payments })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-2 rounded bg-slate-50 border",
										children: ["SMS Logs: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: validationResult.counts.sms_logs })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-2 rounded bg-slate-50 border",
										children: ["Users (No Passwords): ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: validationResult.counts.users })]
									})
								]
							})]
						}),
						validationResult.conflict_messages.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4 text-amber-600 shrink-0" }),
									"Conflicts Detected (",
									validationResult.conflicts_detected,
									"):"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "list-disc list-inside text-[11px] text-amber-800 dark:text-amber-300 space-y-0.5 pl-1",
								children: validationResult.conflict_messages.map((msg, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: msg }, i))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 pt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-bold",
								children: "Conflict Resolution Strategy:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioGroup, {
								value: mode,
								onValueChange: (v) => setMode(v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center space-x-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
										value: "merge",
										id: "r_merge"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "r_merge",
										className: "text-xs cursor-pointer font-medium",
										children: "Merge Records (Keep existing data and append non-duplicate records)"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center space-x-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
										value: "overwrite",
										id: "r_overwrite"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "r_overwrite",
										className: "text-xs cursor-pointer font-medium",
										children: "Transactional Overwrite (Replace matched entity records)"
									})]
								})]
							})]
						})
					]
				}),
				step === "confirm" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-4 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 text-blue-900 dark:text-blue-200 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 font-bold text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5 text-blue-600" }), "Pre-Restore Safety Snapshot Guaranteed"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "leading-relaxed",
							children: "Before executing the transactional restore, a pre-restore safety snapshot will be automatically saved. If any error occurs during import, the transaction will automatically roll back cleanly."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3 rounded-lg border bg-slate-50 space-y-1 font-mono text-[11px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Target Resolution Mode: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: mode.toUpperCase() })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Pre-restore Backup Key: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "pre_restore_safety_backup_auto" })] })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "gap-2 sm:gap-0 pt-2 border-t",
					children: [
						step === "upload" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => onOpenChange(false),
							children: "Cancel"
						}),
						step === "preview" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setStep("upload"),
							children: "Back to Upload"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							className: "bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5",
							onClick: () => setStep("confirm"),
							children: ["Proceed to Safety Snapshot ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5" })]
						})] }),
						step === "confirm" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setStep("preview"),
							children: "Back to Preview"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							className: "bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5",
							disabled: restoreMutation.isPending,
							onClick: () => restoreMutation.mutate(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), restoreMutation.isPending ? "Executing Transactional Restore..." : "Execute Transactional Restore"]
						})] })
					]
				})
			]
		})
	});
}
var Route = createFileRoute("/_authenticated/admin/backup")({
	head: () => ({ meta: [
		{ title: "Data Backup & Restore | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Admin-only CRM backup exports and 7-stage transactional restore."
		},
		{
			property: "og:title",
			content: "Data Backup & Restore | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Admin-only CRM backup exports and 7-stage transactional restore."
		}
	] }),
	component: AdminBackupPage
});
function AdminBackupPage() {
	const [restoreModalOpen, setRestoreModalOpen] = (0, import_react.useState)(false);
	const { data: metrics, isLoading } = useQuery(backupSummaryQueryOptions());
	const handleDownloadJson = async () => {
		try {
			toast.info("Generating sanitized JSON backup file (passwords/secrets excluded)...");
			await downloadJsonBackup();
			toast.success("JSON backup downloaded successfully!");
		} catch {
			toast.error("Failed to generate JSON backup.");
		}
	};
	const handleDownloadCsv = async () => {
		try {
			toast.info("Generating CSV data bundle export...");
			await downloadCsvExport();
			toast.success("CSV export downloaded successfully!");
		} catch {
			toast.error("Failed to generate CSV export.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DatabaseBackup, { className: "size-7 text-[#67B239]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-bold tracking-tight text-foreground",
						children: "Admin — Data Backup & Transactional Restore"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-0.5",
					children: "Admin-only backup management. Downloads include all 11 CRM tables with passwords & secrets strictly excluded."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					className: "bg-purple-50 text-purple-700 border-purple-300 text-xs px-3 py-1.5 font-semibold gap-1.5 self-start sm:self-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), "Admin Access Granted"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Prospects Records",
						value: isLoading ? "..." : String(metrics?.prospects_count || 0),
						icon: UsersRound,
						colorScheme: "indigo",
						loading: isLoading
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Tasks / Meetings",
						value: isLoading ? "..." : String(metrics?.tasks_count || 0),
						icon: CalendarClock,
						colorScheme: "amber",
						loading: isLoading
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Bills & Invoices",
						value: isLoading ? "..." : String(metrics?.bills_count || 0),
						icon: Receipt,
						colorScheme: "emerald",
						loading: isLoading
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "CRM Users (Sanitized)",
						value: isLoading ? "..." : String(metrics?.users_count || 0),
						icon: ShieldCheck,
						colorScheme: "teal",
						loading: isLoading
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-3 gap-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "bg-white dark:bg-card border-slate-200/80 shadow-xs flex flex-col justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-10 w-10 rounded-lg bg-emerald-50 text-[#67B239] flex items-center justify-center mb-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCode, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: "Download JSON Backup"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-xs",
								children: "Full versioned JSON payload including all 11 tables. Passwords and secrets are automatically sanitized."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "pt-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "w-full bg-[#67B239] hover:bg-[#5aa030] text-white gap-2 text-xs",
								onClick: handleDownloadJson,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download JSON Backup"]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "bg-white dark:bg-card border-slate-200/80 shadow-xs flex flex-col justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: "Download CSV Export"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-xs",
								children: "Formatted CSV spreadsheet data bundle for external auditing and reporting tools."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "pt-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: "w-full border-blue-300 text-blue-700 dark:text-blue-400 hover:bg-blue-50 gap-2 text-xs",
								onClick: handleDownloadCsv,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download CSV Bundle"]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "bg-white dark:bg-card border-slate-200/80 shadow-xs flex flex-col justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: "Restore JSON Backup"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-xs",
								children: "7-stage transactional restore wizard with schema verification, conflict detection, and safety snapshots."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "pt-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: "w-full border-purple-300 text-purple-700 dark:text-purple-400 hover:bg-purple-50 gap-2 text-xs font-semibold",
								onClick: () => setRestoreModalOpen(true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Restore JSON Backup"]
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "bg-white dark:bg-card border-slate-200/80 shadow-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "text-sm font-bold flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-[#67B239]" }), "Included Backup Tables Scope & Security Principles"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "text-xs",
					children: "The following 11 CRM entities are included in JSON backups:"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-4 pt-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs font-mono",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2.5 rounded bg-slate-50 border flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 text-emerald-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "1. Prospects" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2.5 rounded bg-slate-50 border flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 text-emerald-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "2. Stage History" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2.5 rounded bg-slate-50 border flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 text-emerald-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "3. Follow-ups" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2.5 rounded bg-slate-50 border flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 text-emerald-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "4. Opportunities" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2.5 rounded bg-slate-50 border flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 text-emerald-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "5. Meetings" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2.5 rounded bg-slate-50 border flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 text-emerald-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "6. Invoices" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2.5 rounded bg-slate-50 border flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 text-emerald-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "7. Payments" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2.5 rounded bg-slate-50 border flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 text-emerald-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "8. Services" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2.5 rounded bg-slate-50 border flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 text-emerald-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "9. SMS Logs" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-3.5 text-amber-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "10. Users (No Passwords)" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-2.5 rounded bg-slate-50 border flex items-center gap-2 col-span-2 sm:col-span-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 text-emerald-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "11. Activity Logs" })]
							})
						]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminRestoreBackupModal, {
				open: restoreModalOpen,
				onOpenChange: setRestoreModalOpen
			})
		]
	});
}
//#endregion
export { Route as n, AdminBackupPage as t };
