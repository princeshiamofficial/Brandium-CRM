import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { L as Receipt } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B85j8UA0.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useAuth } from "./auth-CgRTR6JY.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { n as createInvoice, s as updateInvoice } from "./billing-Bgyh3wU7.mjs";
import { i as prospectsOptionsQuery } from "./meetings-Di5D--6a.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/add-invoice-dialog-Ce6on1ss.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AddInvoiceDialog({ open, onOpenChange, invoiceToEdit, defaultProspectId, onSuccess }) {
	const queryClient = useQueryClient();
	const { user } = useAuth();
	const [prospectId, setProspectId] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [totalAmountStr, setTotalAmountStr] = (0, import_react.useState)("");
	const [billDate, setBillDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
	const [dueDate, setDueDate] = (0, import_react.useState)(new Date(Date.now() + 12096e5).toISOString().split("T")[0]);
	const [notes, setNotes] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (open) {
			if (invoiceToEdit) {
				setProspectId(invoiceToEdit.prospect_id || "");
				setDescription(invoiceToEdit.description || "");
				setTotalAmountStr(String(invoiceToEdit.total_amount || ""));
				setBillDate(invoiceToEdit.bill_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
				setDueDate(invoiceToEdit.due_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
				setNotes(invoiceToEdit.notes || "");
			} else {
				setProspectId(defaultProspectId || "");
				setDescription("");
				setTotalAmountStr("");
				setBillDate((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
				setDueDate(new Date(Date.now() + 12096e5).toISOString().split("T")[0]);
				setNotes("");
			}
		}
	}, [
		open,
		invoiceToEdit,
		defaultProspectId
	]);
	const { data: prospectOptions = [] } = useQuery({
		...prospectsOptionsQuery(),
		enabled: open
	});
	const saveMutation = useMutation({
		mutationFn: async () => {
			if (!prospectId) throw new Error("Please select a client prospect.");
			if (!description || !description.trim()) throw new Error("Please enter a service description.");
			const amount = Number(totalAmountStr);
			if (!amount || amount <= 0) throw new Error("Please enter a valid invoice total amount.");
			if (invoiceToEdit) return updateInvoice(invoiceToEdit.id, {
				prospect_id: prospectId,
				description: description.trim(),
				total_amount: amount,
				bill_date: billDate,
				due_date: dueDate,
				notes: notes.trim() || null
			});
			return createInvoice({
				prospect_id: prospectId,
				description: description.trim(),
				total_amount: amount,
				bill_date: billDate,
				due_date: dueDate,
				notes: notes.trim() || null
			}, user);
		},
		onSuccess: (inv) => {
			toast.success(invoiceToEdit ? `Invoice ${inv.invoice_number} updated successfully!` : `Invoice ${inv.invoice_number} created successfully!`);
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
			queryClient.invalidateQueries({ queryKey: ["opportunities"] });
			queryClient.invalidateQueries({ queryKey: ["opportunity-summary"] });
			queryClient.invalidateQueries({ queryKey: ["prospects"] });
			queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
			onOpenChange(false);
			if (onSuccess) onSuccess();
		},
		onError: (err) => {
			toast.error(err.message || "Failed to save invoice.");
		}
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		saveMutation.mutate();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-lg p-6 max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
				className: "pb-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "text-xl font-bold tracking-tight text-foreground flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "size-5 text-[#67B239]" }), invoiceToEdit ? `Edit Bill (${invoiceToEdit.invoice_number})` : "Create New Invoice"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-xs text-muted-foreground",
					children: invoiceToEdit ? "Update invoice financial amounts, service item descriptions, and due dates." : "Generate an official invoice for a prospect or client. Initial status will be Pending."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "space-y-4 pt-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "invoice-prospect",
							className: "text-xs font-semibold text-foreground",
							children: ["Select Client / Prospect ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-destructive",
								children: "*"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: prospectId,
							onValueChange: setProspectId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "invoice-prospect",
								className: "h-10 text-sm rounded-xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a prospect..." })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
								className: "max-h-60",
								children: prospectOptions.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: p.id,
									children: p.business_name ? `${p.business_name} (${p.contact_name})` : p.contact_name
								}, p.id))
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "invoice-desc",
							className: "text-xs font-semibold text-foreground",
							children: ["Item / Service Description ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-destructive",
								children: "*"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "invoice-desc",
							placeholder: "e.g. Website Design & Development (Phase 1)",
							value: description,
							onChange: (e) => setDescription(e.target.value),
							className: "h-10 text-sm rounded-xl focus-visible:ring-[#67B239]",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "invoice-amount",
							className: "text-xs font-semibold text-foreground",
							children: ["Total Amount (৳) ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-destructive",
								children: "*"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute left-3 top-2.5 text-muted-foreground font-mono font-bold text-sm",
								children: "৳"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "invoice-amount",
								type: "number",
								min: "1",
								step: "any",
								placeholder: "50000",
								value: totalAmountStr,
								onChange: (e) => setTotalAmountStr(e.target.value),
								className: "pl-8 h-10 text-sm rounded-xl font-mono focus-visible:ring-[#67B239]",
								required: true
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								htmlFor: "invoice-bill-date",
								className: "text-xs font-semibold text-foreground",
								children: ["Bill Date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-destructive",
									children: "*"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "invoice-bill-date",
								type: "date",
								value: billDate,
								onChange: (e) => setBillDate(e.target.value),
								className: "h-10 text-sm rounded-xl focus-visible:ring-[#67B239]",
								required: true
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								htmlFor: "invoice-due-date",
								className: "text-xs font-semibold text-foreground",
								children: ["Due Date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-destructive",
									children: "*"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "invoice-due-date",
								type: "date",
								value: dueDate,
								onChange: (e) => setDueDate(e.target.value),
								className: "h-10 text-sm rounded-xl focus-visible:ring-[#67B239]",
								required: true
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "invoice-notes",
							className: "text-xs font-semibold text-foreground",
							children: "Notes & Terms"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "invoice-notes",
							rows: 2,
							placeholder: "e.g. 50% advance received, balance payable upon delivery.",
							value: notes,
							onChange: (e) => setNotes(e.target.value),
							className: "resize-none text-sm rounded-xl focus-visible:ring-[#67B239]"
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
							disabled: saveMutation.isPending,
							className: "h-10 px-6 rounded-xl bg-[#67B239] hover:bg-[#5AA030] text-white font-semibold text-sm shadow-sm transition-all cursor-pointer",
							children: saveMutation.isPending ? invoiceToEdit ? "Saving Changes..." : "Creating Invoice..." : invoiceToEdit ? "Update Invoice" : "Create Invoice"
						})]
					})
				]
			})]
		})
	});
}
//#endregion
export { AddInvoiceDialog as t };
