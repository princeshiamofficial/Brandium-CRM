import { o as __toESM } from "../_runtime.mjs";
import { t as runMySQLQuery } from "./mysql-api-HtgmsbU7.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B85j8UA0.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { n as queryOptions, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as useAuth } from "./auth-DcRLmhBr.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { s as useCreateFollowUp, t as agentsQuery } from "./follow-ups-Gcl3jszN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/follow-up-dialog-Do-rGQAi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function prospectOptionsQuery() {
	return queryOptions({
		queryKey: ["prospect-options-follow-up"],
		queryFn: async () => {
			try {
				const res = await runMySQLQuery("SELECT id, contact_name, business_name FROM `prospects` WHERE is_active = 1 ORDER BY contact_name ASC;");
				if (res.success && Array.isArray(res.data)) return res.data;
			} catch (err) {
				console.warn("prospectOptionsQuery MySQL notice:", err);
			}
			return [];
		}
	});
}
function defaultDueAt() {
	const d = /* @__PURE__ */ new Date();
	d.setDate(d.getDate() + 1);
	d.setHours(10, 0, 0, 0);
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function FollowUpDialog({ open, onOpenChange, prospectId, prospectLabel }) {
	const { user, profile, isAdmin } = useAuth();
	const createMutation = useCreateFollowUp();
	const prospects = useQuery({
		...prospectOptionsQuery(),
		enabled: open && !prospectId
	});
	const agents = useQuery({
		...agentsQuery(),
		enabled: open
	});
	const agentList = (0, import_react.useMemo)(() => {
		const rawAgents = Array.isArray(agents.data) ? agents.data : [];
		return [...user ? [{
			id: user.id,
			name: `${profile?.full_name || user.email || "Current User"} (Me)`
		}] : [], ...rawAgents].filter((v, i, self) => i === self.findIndex((t) => t.id === v.id));
	}, [
		user,
		profile?.full_name,
		agents.data
	]);
	const [selectedProspect, setSelectedProspect] = (0, import_react.useState)(prospectId ?? "");
	const [assignedTo, setAssignedTo] = (0, import_react.useState)(user?.id ?? "");
	const [dueAt, setDueAt] = (0, import_react.useState)(defaultDueAt());
	const [note, setNote] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setSelectedProspect(prospectId ?? "");
		setDueAt(defaultDueAt());
		setNote("");
		if (user?.id) setAssignedTo(user.id);
		else if (agentList.length > 0 && agentList[0]) setAssignedTo(agentList[0].id);
	}, [
		open,
		prospectId,
		user?.id,
		agentList
	]);
	const submit = () => {
		if (!selectedProspect) {
			toast.error("Select a prospect first");
			return;
		}
		if (!user?.id) return;
		createMutation.mutate({
			prospect_id: selectedProspect,
			assigned_to: assignedTo || user.id,
			created_by: user.id,
			due_at: new Date(dueAt).toISOString(),
			...note.trim() ? { note: note.trim() } : {}
		}, {
			onSuccess: () => {
				toast.success("Follow-up scheduled");
				onOpenChange(false);
			},
			onError: (error) => toast.error(error.message)
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Schedule follow-up" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: prospectLabel ? `Add the next follow-up for ${prospectLabel}.` : "Pick a prospect, a date and time, and add a note for context." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						!prospectId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Prospect" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: selectedProspect,
								onValueChange: setSelectedProspect,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select prospect" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (prospects.data ?? []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: String(p["id"]),
									children: p["business_name"] ? `${String(p["contact_name"])} — ${String(p["business_name"])}` : String(p["contact_name"] ?? "")
								}, String(p["id"]))) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Assigned agent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: assignedTo || (agentList[0]?.id ?? ""),
								onValueChange: setAssignedTo,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select agent" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: agentList.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: a.id,
									children: a.name
								}, a.id)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "follow-up-due",
								children: "Date & time to schedule"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "follow-up-due",
								type: "datetime-local",
								value: dueAt,
								onChange: (e) => setDueAt(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "follow-up-note",
								children: "Note"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "follow-up-note",
								value: note,
								onChange: (e) => setNote(e.target.value),
								placeholder: "What should be discussed on this call?",
								rows: 3
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: submit,
					disabled: createMutation.isPending,
					children: createMutation.isPending ? "Saving..." : "Schedule follow-up"
				})] })
			]
		})
	});
}
//#endregion
export { FollowUpDialog as t };
