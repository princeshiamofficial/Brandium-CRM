import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { I as RefreshCw } from "../_libs/lucide-react.mjs";
import { i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B85j8UA0.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { c as stagesQuery, u as useChangeProspectStage } from "./stages-xq1z1ngm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/change-stage-dialog-CbXU5CRm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_STAGES = [
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
function getBadgeColor(stageName) {
	const name = (stageName || "").toLowerCase();
	if (name.includes("won") || name.includes("sales")) return "bg-[#67B239] text-white";
	if (name.includes("prospect") || name.includes("lead")) return "bg-blue-600 text-white";
	if (name.includes("follow")) return "bg-teal-600 text-white";
	if (name.includes("opportunity")) return "bg-orange-500 text-white";
	if (name.includes("dnp")) return "bg-amber-500 text-white";
	if (name.includes("switched")) return "bg-purple-600 text-white";
	if (name.includes("invalid")) return "bg-rose-600 text-white";
	if (name.includes("not_interested") || name.includes("not interested")) return "bg-slate-600 text-white";
	if (name.includes("denied")) return "bg-red-700 text-white";
	return "bg-indigo-600 text-white";
}
function ChangeStageDialog({ target, onOpenChange, onStageChange }) {
	const stages = useQuery(stagesQuery());
	const mutation = useChangeProspectStage();
	const availableStages = stages.data && stages.data.length > 0 ? stages.data : DEFAULT_STAGES;
	const [stageId, setStageId] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const currentStageName = target?.currentStageName || "Prospect";
	(0, import_react.useEffect)(() => {
		if (target) {
			const match = availableStages.find((s) => s.id === target.stageId || s.name.toLowerCase() === (target.currentStageName || "").toLowerCase());
			setStageId(match ? match.id : availableStages[0]?.id || "prospect");
		} else setStageId("");
		setNote("");
	}, [target, availableStages]);
	availableStages.find((s) => s.id === stageId);
	const submit = async () => {
		if (!target || !stageId) return;
		const trimmed = note.trim();
		const targetObj = availableStages.find((s) => s.id === stageId);
		await mutation.mutateAsync({
			prospectId: target.id,
			stageId,
			stageName: targetObj?.name || "Stage Update",
			...trimmed ? { note: trimmed } : {}
		});
		if (onStageChange) onStageChange(stageId, targetObj?.name || "");
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: Boolean(target),
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-white dark:bg-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "size-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#67B239] font-bold flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight",
						children: "Update Stage"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5",
						children: target ? `Move ${target.label} to a new pipeline stage.` : ""
					})] })]
				}),
				target && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-slate-50/80 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-slate-500 dark:text-slate-400 font-medium",
						children: "Current Status"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							className: `${getBadgeColor(currentStageName)} font-bold text-xs px-2.5 py-0.5 rounded-lg border-0 shadow-2xs`,
							children: currentStageName
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 pt-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "stage",
							className: "text-xs font-bold text-slate-700 dark:text-slate-300",
							children: "New Stage"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: stageId,
							onValueChange: (val) => {
								setStageId(val);
								const name = availableStages.find((s) => s.id === val)?.name ?? "";
								onStageChange?.(val, name);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "stage",
								className: "h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select a stage" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
								className: "max-h-60 rounded-xl shadow-xl border-slate-200 dark:border-slate-800",
								children: availableStages.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: s.id,
									className: "text-xs sm:text-sm font-semibold cursor-pointer rounded-lg",
									children: s.name
								}, s.id))
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "note",
							className: "text-xs font-bold text-slate-700 dark:text-slate-300",
							children: ["Note / Reason ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-slate-400 font-normal",
								children: "(Optional)"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "note",
							placeholder: "Why is this prospect moving stage?",
							value: note,
							onChange: (e) => setNote(e.target.value),
							rows: 3,
							className: "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm rounded-xl focus:bg-white dark:focus:bg-card transition-all resize-none"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "pt-2 gap-2 sm:gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => onOpenChange(false),
						disabled: mutation.isPending,
						className: "font-bold text-xs sm:text-sm h-9.5 rounded-xl border-slate-200/90 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: submit,
						disabled: !stageId || mutation.isPending,
						className: "bg-[#67B239] hover:bg-[#5AA030] text-white font-bold text-xs sm:text-sm h-9.5 rounded-xl shadow-2xs transition-all cursor-pointer",
						children: mutation.isPending ? "Saving..." : "Update Stage"
					})]
				})
			]
		})
	});
}
//#endregion
export { ChangeStageDialog as t };
