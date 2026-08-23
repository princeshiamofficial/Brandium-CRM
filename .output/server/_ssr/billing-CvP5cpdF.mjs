import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { t as Card } from "./card-CtX3ithx.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as StatCard } from "./stat-card-C9FEmuAx.mjs";
import { Bt as CircleAlert, C as SquarePen, Et as DollarSign, L as Receipt, Ot as CreditCard, P as RotateCcw, R as Printer, V as Plus, Yt as Calendar, an as Ban, bt as Eye, ct as Layers, dt as Hash, ht as FileText, k as Search, l as User, r as X, v as Trash2, wt as EllipsisVertical, zt as CircleCheck } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B85j8UA0.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useAuth } from "./auth-vDqZlo-r.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { d as DropdownMenuTrigger, i as DropdownMenuItem, n as DropdownMenuContent, s as DropdownMenuSeparator, t as DropdownMenu } from "./dropdown-menu-BfBJVxb8.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-Cmlz_mk1.mjs";
import { l as format } from "../_libs/date-fns.mjs";
import { t as Calendar$1 } from "./calendar-BkciPy-j.mjs";
import { a as invoicesQueryOptions, o as recordInvoicePayment, r as deleteInvoice, t as cancelInvoice } from "./billing-CWM0hDlq.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as AddInvoiceDialog } from "./add-invoice-dialog-I6mcNJw0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/billing-CvP5cpdF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PAYMENT_METHODS = [
	"Bank Transfer",
	"bKash",
	"Nagad",
	"Cash",
	"Card"
];
function formatCurrency$1(amount) {
	return `৳${Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
function BillingRecordPaymentModal({ open, onOpenChange, invoice }) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [amountStr, setAmountStr] = (0, import_react.useState)("");
	const [method, setMethod] = (0, import_react.useState)("Bank Transfer");
	const [trxRef, setTrxRef] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const currentDue = invoice?.due_amount || 0;
	const payAmount = Number(amountStr) || 0;
	const projectedDue = Math.max(0, currentDue - payAmount);
	const paymentMutation = useMutation({
		mutationFn: async () => {
			if (!invoice) throw new Error("Invoice not found.");
			if (payAmount <= 0) throw new Error("Payment amount must be greater than 0.");
			if (payAmount > currentDue) toast.info("Payment amount exceeds current due balance. Excess will clear invoice completely.");
			return recordInvoicePayment({
				invoice_id: invoice.id,
				amount: payAmount,
				payment_method: method,
				transaction_reference: trxRef || null,
				notes: notes || null
			}, user);
		},
		onSuccess: (res) => {
			toast.success(`Payment of ${formatCurrency$1(payAmount)} recorded! New status: ${res.status}.`);
			setAmountStr("");
			setTrxRef("");
			setNotes("");
			onOpenChange(false);
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to record payment.");
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
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "size-5 text-[#67B239]" }),
						"Record Payment for ",
						invoice?.invoice_number
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
					className: "text-xs",
					children: [
						"Client: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: invoice?.prospect_name }),
						" · Total:",
						" ",
						formatCurrency$1(invoice?.total_amount || 0),
						" · Current Due:",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-amber-600 font-semibold",
							children: formatCurrency$1(currentDue)
						})
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-2 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "pay_amount",
									className: "text-xs font-semibold",
									children: "Payment Amount (৳)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute left-3 top-2.5 text-xs font-bold text-muted-foreground",
										children: "৳"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "pay_amount",
										type: "number",
										placeholder: `Max due: ${currentDue}`,
										value: amountStr,
										onChange: (e) => setAmountStr(e.target.value),
										className: "pl-7 font-mono text-sm font-semibold"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between items-center text-[11px] text-muted-foreground pt-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "text-[#67B239] hover:underline font-medium",
										onClick: () => setAmountStr(String(currentDue)),
										children: [
											"Pay Full Due (",
											formatCurrency$1(currentDue),
											")"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Projected Due: ", formatCurrency$1(projectedDue)] })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								htmlFor: "pay_method",
								className: "text-xs font-semibold flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-3.5 text-blue-600" }), "Payment Method"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: method,
								onValueChange: (val) => setMethod(val),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "pay_method",
									className: "text-xs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Method" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PAYMENT_METHODS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: m,
									className: "text-xs",
									children: m
								}, m)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								htmlFor: "trx_ref",
								className: "text-xs font-semibold flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: "size-3.5 text-slate-500" }), "Transaction Reference / TrxID (Optional)"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "trx_ref",
								placeholder: "e.g. TRX-EBL-992011 / BKSH-9928172X",
								value: trxRef,
								onChange: (e) => setTrxRef(e.target.value),
								className: "font-mono text-xs"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								htmlFor: "pay_notes",
								className: "text-xs font-semibold flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5 text-slate-500" }), "Payment Notes (Optional)"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "pay_notes",
								placeholder: "Add bank deposit slip notes or payment remarks...",
								rows: 2,
								value: notes,
								onChange: (e) => setNotes(e.target.value),
								className: "text-xs"
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
						disabled: paymentMutation.isPending,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5",
						onClick: () => paymentMutation.mutate(),
						disabled: paymentMutation.isPending || payAmount <= 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "size-3.5" }), paymentMutation.isPending ? "Recording Payment..." : "Record Payment"]
					})]
				})
			]
		})
	});
}
function formatCurrency(amount) {
	return `৳${Number(amount || 0).toLocaleString("en-US", {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2
	})}`;
}
function BillingPage() {
	const queryClient = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [dateRange, setDateRange] = (0, import_react.useState)(void 0);
	const [calOpen, setCalOpen] = (0, import_react.useState)(false);
	const [payModalState, setPayModalState] = (0, import_react.useState)({
		open: false,
		invoice: null
	});
	const [isAddInvoiceOpen, setIsAddInvoiceOpen] = (0, import_react.useState)(false);
	const [editInvoiceState, setEditInvoiceState] = (0, import_react.useState)(null);
	const filters = {
		search,
		status: statusFilter,
		from_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : void 0,
		to_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : void 0
	};
	const { data: rawInvoices = [], isLoading } = useQuery(invoicesQueryOptions(filters));
	const invoices = Array.isArray(rawInvoices) ? rawInvoices : [];
	const totalInvoiceCount = invoices.length;
	const totalBilledRevenue = invoices.reduce((acc, curr) => acc + curr.total_amount, 0);
	const totalPaidRevenue = invoices.reduce((acc, curr) => acc + curr.paid_amount, 0);
	const totalDueRevenue = invoices.reduce((acc, curr) => acc + curr.due_amount, 0);
	const cancelMutation = useMutation({
		mutationFn: (id) => cancelInvoice(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
			toast.success("Invoice marked as cancelled.");
		},
		onError: (err) => {
			toast.error(err.message || "Failed to cancel invoice.");
		}
	});
	const deleteMutation = useMutation({
		mutationFn: (id) => deleteInvoice(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
			queryClient.invalidateQueries({ queryKey: ["opportunities"] });
			queryClient.invalidateQueries({ queryKey: ["opportunity-summary"] });
			queryClient.invalidateQueries({ queryKey: ["prospects"] });
			queryClient.invalidateQueries({ queryKey: ["denied-payments"] });
			queryClient.invalidateQueries({ queryKey: ["won-sales"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			toast.success("Invoice deleted successfully.");
		},
		onError: (err) => {
			toast.error(err.message || "Failed to delete invoice.");
		}
	});
	const resetFilters = () => {
		setSearch("");
		setStatusFilter("all");
		setDateRange(void 0);
	};
	const printInvoice = (inv) => {
		const printWindow = window.open("", "_blank");
		if (!printWindow) {
			window.print();
			return;
		}
		printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${inv.invoice_number}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #0f172a; }
            .brand { font-size: 18px; font-weight: bold; color: #67B239; }
            .section { margin-top: 24px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
            .box { background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
            .val { font-size: 16px; font-weight: bold; margin-top: 4px; color: #0f172a; }
            .amount-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; }
            .due { color: #e11d48; font-size: 18px; font-weight: 900; }
            .paid { color: #16a34a; font-weight: bold; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">Brandium Telesales CRM</div>
              <div class="title">INVOICE: ${inv.invoice_number}</div>
            </div>
            <div style="text-align: right;">
              <div><strong>Status:</strong> ${inv.status}</div>
              <div><strong>Bill Date:</strong> ${inv.bill_date}</div>
              <div><strong>Due Date:</strong> ${inv.due_date}</div>
            </div>
          </div>
          <div class="section grid">
            <div class="box">
              <div class="label">Billed To</div>
              <div class="val">${inv.prospect_name}</div>
              <div>${inv.business_name || ""}</div>
              <div>${inv.client_phone || ""}</div>
              <div>${inv.client_email || ""}</div>
            </div>
            <div class="box">
              <div class="label">Service Description</div>
              <div class="val">${inv.description}</div>
              <div style="margin-top: 8px; font-size: 13px; color: #64748b;">Created by: ${inv.created_by_name || "TSE Agent"}</div>
            </div>
          </div>
          <div class="section box" style="margin-top: 24px;">
            <div class="amount-row"><span>Total Amount:</span><strong>${formatCurrency(inv.total_amount)}</strong></div>
            <div class="amount-row"><span class="paid">Paid Amount:</span><strong class="paid">${formatCurrency(inv.paid_amount)}</strong></div>
            <div class="amount-row" style="border-bottom: none; font-size: 18px;"><span class="due">Due Balance:</span><strong class="due">${formatCurrency(inv.due_amount)}</strong></div>
          </div>
          <script>
            window.onload = function() { window.print(); };
          <\/script>
        </body>
      </html>
    `);
		printWindow.document.close();
	};
	const exportSingleInvoicePDF = (inv) => {
		printInvoice(inv);
		toast.success(`Generated printable PDF for ${inv.invoice_number}`);
	};
	const getStatusBadge = (status) => {
		switch (status) {
			case "Paid": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				className: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-md",
				children: "Paid"
			});
			case "Partially Paid": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				className: "bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-md",
				children: "Partially Paid"
			});
			case "Pending": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				className: "bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 text-xs font-semibold px-2.5 py-0.5 rounded-md",
				children: "Pending"
			});
			case "Cancelled": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "outline",
				className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 text-xs font-semibold px-2.5 py-0.5 rounded-md",
				children: "Cancelled"
			});
			default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "outline",
				children: status
			});
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-2 rounded-xl bg-[#67B239]/10 text-[#67B239]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "size-6 sm:size-7" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-xl sm:text-2xl font-bold tracking-tight text-foreground",
						children: "Billing & Invoices"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs sm:text-sm text-muted-foreground mt-0.5",
						children: "Client billing, invoice creation, payment recording, and financial due calculations."
					})] })]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => {
						setEditInvoiceState(null);
						setIsAddInvoiceOpen(true);
					},
					className: "bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5 w-full sm:w-auto h-10 px-4 rounded-xl font-semibold shadow-xs transition-all cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Add Bill / Create Invoice"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Invoices",
						value: String(totalInvoiceCount),
						icon: Receipt,
						colorScheme: "pastelPurple"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Billed",
						value: formatCurrency(totalBilledRevenue),
						icon: DollarSign,
						colorScheme: "pastelTeal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Collected (Paid)",
						value: formatCurrency(totalPaidRevenue),
						icon: CircleCheck,
						colorScheme: "pastelEmerald"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Outstanding Due Balance",
						value: formatCurrency(totalDueRevenue),
						icon: CircleAlert,
						colorScheme: "pastelPeach"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col md:flex-row md:items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative w-full md:max-w-xs lg:max-w-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Search client, business, invoice #...",
							value: search,
							onChange: (e) => setSearch(e.target.value),
							className: "pl-9 pr-8 h-9 text-xs sm:text-sm bg-white dark:bg-card rounded-xl border-slate-200 dark:border-border"
						}),
						search && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setSearch(""),
							className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 w-full md:w-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: statusFilter,
							onValueChange: (val) => setStatusFilter(val),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
								className: "flex-1 sm:flex-none sm:w-40 h-9 text-xs rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-3.5 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Statuses" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All Statuses"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Pending",
									children: "Pending"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Partially Paid",
									children: "Partially Paid"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Paid",
									children: "Paid"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Cancelled",
									children: "Cancelled"
								})
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
							open: calOpen,
							onOpenChange: setCalOpen,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									className: `flex-1 sm:flex-none h-9 px-3 text-xs font-normal rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border gap-2 ${dateRange?.from ? "text-foreground font-medium" : "text-muted-foreground"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3.5" }), dateRange?.from ? dateRange.to ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										format(dateRange.from, "MMM d"),
										" –",
										" ",
										format(dateRange.to, "MMM d, yyyy")
									] }) : format(dateRange.from, "MMM d, yyyy") : "Date Range"]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
								className: "w-auto p-0",
								align: "end",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
									mode: "range",
									selected: dateRange,
									onSelect: (range) => {
										setDateRange(range);
										if (range?.to) setCalOpen(false);
									},
									numberOfMonths: 2,
									initialFocus: true
								}), dateRange?.from && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "border-t p-2 flex justify-end",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "sm",
										className: "text-xs",
										onClick: () => {
											setDateRange(void 0);
											setCalOpen(false);
										},
										children: "Clear dates"
									})
								})]
							})]
						}),
						(search || statusFilter !== "all" || dateRange) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "icon",
							onClick: resetFilters,
							title: "Reset Filters",
							className: "h-9 w-9 rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border text-muted-foreground hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" })
						})
					]
				})]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
				children: Array.from({ length: 8 }).map((_, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-white dark:bg-card border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-start",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-32 rounded-md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-20 rounded-md" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-16 rounded-md" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-full rounded" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-full rounded" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-full rounded" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 w-full rounded-xl" })
					]
				}, idx))
			}) : invoices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "bg-white dark:bg-card border-slate-200/80 dark:border-slate-800 shadow-xs p-12 text-center rounded-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "size-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-bold text-foreground text-base",
						children: "No billing records match your search filters"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-1 max-w-sm mx-auto",
						children: "Create a new invoice or adjust the filter parameters above."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => {
							setEditInvoiceState(null);
							setIsAddInvoiceOpen(true);
						},
						className: "mt-4 bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5 text-xs rounded-xl cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), "Create First Invoice"]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
				children: invoices.map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-white dark:bg-card border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate",
									title: inv.business_name || inv.prospect_name,
									children: inv.business_name || inv.prospect_name || "Client Business"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground font-mono font-medium mt-0.5",
									children: ["ID: ", inv.invoice_number.replace(/^INV-/, "") || inv.id]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 shrink-0",
								children: [getStatusBadge(inv.status), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										className: "h-7 w-7 rounded-lg text-slate-500 hover:text-foreground hover:bg-slate-100 dark:hover:bg-muted",
										title: "More actions",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "size-4" })
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
									align: "end",
									className: "w-48 rounded-xl shadow-lg",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onClick: () => {
												setEditInvoiceState(inv);
												setIsAddInvoiceOpen(true);
											},
											className: "cursor-pointer gap-2 text-xs font-medium text-slate-700 dark:text-slate-200",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "size-3.5 text-blue-600" }), "Edit Bill"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											disabled: inv.status === "Paid" || inv.status === "Cancelled",
											onClick: () => setPayModalState({
												open: true,
												invoice: inv
											}),
											className: "cursor-pointer gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-3.5 text-emerald-600" }), "Mark Paid"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											disabled: inv.status === "Cancelled" || inv.status === "Paid",
											onClick: () => {
												if (confirm(`Are you sure you want to cancel Bill ${inv.invoice_number}?`)) cancelMutation.mutate(inv.id);
											},
											className: "cursor-pointer gap-2 text-xs font-medium text-slate-700 dark:text-slate-300",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "size-3.5 text-amber-600" }), "Cancel Bill"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											disabled: deleteMutation.isPending,
											onClick: () => {
												if (confirm(`Are you sure you want to delete Bill ID ${inv.invoice_number}?`)) deleteMutation.mutate(inv.id);
											},
											className: "cursor-pointer gap-2 text-xs font-medium text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/50",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5 text-rose-600" }), "Delete Bill"]
										})
									]
								})] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 pt-3 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground font-medium",
										children: "Total Amount:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-slate-950 dark:text-slate-50 font-mono text-sm",
										children: formatCurrency(inv.total_amount)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground font-medium",
										children: "Paid Amount:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-emerald-600 dark:text-emerald-400 font-mono",
										children: formatCurrency(inv.paid_amount)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-t border-slate-200/80 dark:border-slate-800 my-1.5" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground font-medium",
										children: "Due Amount:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-rose-600 dark:text-rose-400 font-mono text-sm",
										children: formatCurrency(inv.due_amount)
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-2.5 border-t border-slate-100 dark:border-slate-800 mt-2 gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3.5 text-slate-500 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Bill Date: ", inv.bill_date] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3.5 text-slate-500 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Due Date: ", inv.due_date] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-slate-100 dark:border-slate-800 pt-2 mt-2 space-y-1 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3.5 text-slate-500 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "truncate",
									children: [
										"Created By:",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-foreground font-semibold",
											children: inv.created_by_name || "TSE Agent"
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 text-muted-foreground truncate",
								title: inv.description,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5 text-slate-500 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-foreground font-medium truncate",
									children: inv.description || "Sales Won - Service"
								})]
							})]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "bg-[#f0f5fc] dark:bg-muted/40 p-2 sm:p-2.5 rounded-xl mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									className: "bg-[#fdf6e9] hover:bg-[#faebd0] text-amber-900 border-[#f2deba] font-bold text-[11px] h-8 px-1 rounded-lg gap-1 cursor-pointer",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/billing-history",
										children: ["View ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3" })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									className: "bg-[#e1effe] hover:bg-[#d0e5fc] text-blue-900 border-[#c3ddfd] font-bold text-[11px] h-8 px-1 rounded-lg gap-1 cursor-pointer",
									onClick: () => exportSingleInvoicePDF(inv),
									children: ["PDF ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									className: "bg-white hover:bg-slate-100 text-slate-800 border-slate-200 font-bold text-[11px] h-8 px-1 rounded-lg gap-1 cursor-pointer",
									onClick: () => printInvoice(inv),
									children: ["Print ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-3" })]
								})
							]
						})
					})]
				}, inv.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BillingRecordPaymentModal, {
				open: payModalState.open,
				onOpenChange: (open) => setPayModalState((prev) => ({
					...prev,
					open
				})),
				invoice: payModalState.invoice
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddInvoiceDialog, {
				open: isAddInvoiceOpen,
				onOpenChange: setIsAddInvoiceOpen,
				invoiceToEdit: editInvoiceState
			})
		]
	});
}
//#endregion
export { BillingPage as component };
