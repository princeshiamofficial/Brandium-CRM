"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Receipt,
  Calendar as CalendarIcon,
  CreditCard,
  Building,
  TrendingUp,
  Tag,
  FileText,
  Trash2,
  Edit2,
  ExternalLink,
  DollarSign,
  Filter,
  X,
  TriangleAlert,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import {
  expensesQuery,
  expenseSummaryQuery,
  useAddExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  getCategoryBadgeClass,
  formatCurrencyBdt,
  type Expense,
} from "@/lib/expenses";

export default function ExpensesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [deleteExpenseTitle, setDeleteExpenseTitle] = useState("");
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [formAmount, setFormAmount] = useState<string>("");
  const [formPaymentMethod, setFormPaymentMethod] = useState<string>("Cash");
  const [formExpenseDate, setFormExpenseDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formVendor, setFormVendor] = useState("");
  const [formReferenceNo, setFormReferenceNo] = useState("");
  const [formReceiptUrl, setFormReceiptUrl] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const { data, isLoading } = useQuery(
    expensesQuery({
      search,
      category,
      payment_method: paymentMethod,
      from_date: fromDate,
      to_date: toDate,
      page,
      pageSize: 15,
    }),
  );

  const { data: summary, isLoading: isSummaryLoading } = useQuery(expenseSummaryQuery());

  const addMutation = useAddExpenseMutation();
  const updateMutation = useUpdateExpenseMutation();
  const deleteMutation = useDeleteExpenseMutation();

  const handleOpenAdd = () => {
    setFormTitle("");
    setFormCategory(EXPENSE_CATEGORIES[0]);
    setFormAmount("");
    setFormPaymentMethod("Cash");
    setFormExpenseDate(format(new Date(), "yyyy-MM-dd"));
    setFormVendor("");
    setFormReferenceNo("");
    setFormReceiptUrl("");
    setFormNotes("");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditExpense(exp);
    setFormTitle(exp.title);
    setFormCategory(exp.category);
    setFormAmount(String(exp.amount));
    setFormPaymentMethod(exp.payment_method);
    setFormExpenseDate(exp.expense_date);
    setFormVendor(exp.vendor || "");
    setFormReferenceNo(exp.reference_no || "");
    setFormReceiptUrl(exp.receipt_url || "");
    setFormNotes(exp.notes || "");
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error("Title is required.");
      return;
    }
    const numAmount = parseFloat(formAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }

    await addMutation.mutateAsync({
      title: formTitle.trim(),
      category: formCategory,
      amount: numAmount,
      payment_method: formPaymentMethod,
      expense_date: formExpenseDate,
      vendor: formVendor.trim() || null,
      reference_no: formReferenceNo.trim() || null,
      receipt_url: formReceiptUrl.trim() || null,
      notes: formNotes.trim() || null,
      recorded_by: user?.id || null,
    });
    setIsAddOpen(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editExpense) return;
    if (!formTitle.trim()) {
      toast.error("Title is required.");
      return;
    }
    const numAmount = parseFloat(formAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }

    await updateMutation.mutateAsync({
      id: editExpense.id,
      title: formTitle.trim(),
      category: formCategory,
      amount: numAmount,
      payment_method: formPaymentMethod,
      expense_date: formExpenseDate,
      vendor: formVendor.trim() || null,
      reference_no: formReferenceNo.trim() || null,
      receipt_url: formReceiptUrl.trim() || null,
      notes: formNotes.trim() || null,
    });
    setEditExpense(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteExpenseId) return;
    await deleteMutation.mutateAsync(deleteExpenseId);
    setDeleteExpenseId(null);
  };

  const totalPages = Math.ceil((data?.totalCount || 0) / 15) || 1;

  return (
    <div className="space-y-6 pb-12 font-['Golos_Text',sans-serif]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="h-6 w-6 text-[#67B239]" />
            Expenses Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor operating costs, vendor bills, and daily business expenditures.
          </p>
        </div>
        <div>
          <Button
            onClick={handleOpenAdd}
            className="bg-[#67B239] hover:bg-[#5aa030] text-white font-medium shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add New Expense
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              This Month
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#67B239]" />
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {formatCurrencyBdt(summary?.totalThisMonth || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Current calendar month</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              All-Time Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {formatCurrencyBdt(summary?.totalAllTime || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Total recorded company spend</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Transactions
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{summary?.totalCount || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Total expense entries</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Top Category
            </CardTitle>
            <Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-xl font-bold truncate text-foreground">
                {summary?.topCategory || "None"}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Largest expenditure group</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-card border border-border/60 rounded-xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search title, vendor, memo..."
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Category Filter */}
          <div>
            <Select
              value={category}
              onValueChange={(val) => {
                setCategory(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <Select
              value={paymentMethod}
              onValueChange={(val) => {
                setPaymentMethod(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {PAYMENT_METHODS.map((pm) => (
                  <SelectItem key={pm} value={pm}>
                    {pm}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Quick Reset */}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="h-9 text-xs px-2"
              title="From date"
            />
            <Input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              className="h-9 text-xs px-2"
              title="To date"
            />
            {(search || category !== "all" || paymentMethod !== "all" || fromDate || toDate) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                  setPaymentMethod("all");
                  setFromDate("");
                  setToDate("");
                  setPage(1);
                }}
                title="Reset filters"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b border-border/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Expense & Category</th>
                <th className="py-3 px-4">Vendor / Payee</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Receipt</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-36" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Skeleton className="h-8 w-8 mx-auto rounded-md" />
                    </td>
                  </tr>
                ))
              ) : data?.items?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Receipt className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-base font-semibold">No expenses found</p>
                    <p className="text-xs">Adjust your search or add a new expense record.</p>
                  </td>
                </tr>
              ) : (
                data?.items?.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    {/* Date */}
                    <td className="py-3.5 px-4 font-medium text-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {item.expense_date}
                      </div>
                    </td>

                    {/* Title & Category */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground text-sm">{item.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(
                            item.category,
                          )}`}
                        >
                          {item.category}
                        </Badge>
                        {item.reference_no && (
                          <span className="text-[11px] text-muted-foreground font-mono">
                            Ref: {item.reference_no}
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {item.notes}
                        </p>
                      )}
                    </td>

                    {/* Vendor */}
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {item.vendor ? (
                        <div className="flex items-center gap-1.5 text-foreground">
                          <Building className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{item.vendor}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">—</span>
                      )}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="secondary" className="text-xs font-normal">
                        <CreditCard className="h-3 w-3 mr-1 opacity-70" />
                        {item.payment_method}
                      </Badge>
                    </td>

                    {/* Receipt */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.receipt_url ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewReceiptUrl(item.receipt_url)}
                          className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 gap-1"
                        >
                          <ExternalLink className="h-3 w-3" /> View Doc
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">None</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="text-base font-bold text-foreground">
                        {formatCurrencyBdt(item.amount)}
                      </span>
                    </td>

                    {/* Actions Dropdown */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <span className="text-lg">⋮</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(item)}
                            className="text-xs cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-2 text-blue-500" />
                            Edit Expense
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setDeleteExpenseId(item.id);
                              setDeleteExpenseTitle(item.title);
                            }}
                            className="text-xs text-rose-600 focus:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border/60 gap-3 text-xs text-muted-foreground">
          <div>
            Showing {data?.items?.length || 0} of {data?.totalCount || 0} expenses
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3 text-xs"
            >
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 px-3 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Add / Edit Expense Dialog */}
      <Dialog
        open={isAddOpen || !!editExpense}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditExpense(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editExpense ? "Edit Expense" : "Record New Expense"}</DialogTitle>
            <DialogDescription>
              Enter the expenditure details below to save into the local database.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={editExpense ? handleSaveEdit : handleSaveAdd} className="space-y-4 py-2">
            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-foreground">
                Expense Title <span className="text-rose-500">*</span>
              </label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Office Internet Bill / Adobe Creative Cloud"
                required
                className="mt-1"
              />
            </div>

            {/* Category & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Category</label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Amount (BDT) <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="mt-1 font-semibold"
                />
              </div>
            </div>

            {/* Payment Method & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Payment Method</label>
                <Select value={formPaymentMethod} onValueChange={setFormPaymentMethod}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((pm) => (
                      <SelectItem key={pm} value={pm}>
                        {pm}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Expense Date</label>
                <Input
                  type="date"
                  value={formExpenseDate}
                  onChange={(e) => setFormExpenseDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Vendor & Reference No */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Vendor / Payee</label>
                <Input
                  value={formVendor}
                  onChange={(e) => setFormVendor(e.target.value)}
                  placeholder="e.g. Dot Internet / Daraz / Vendor"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Invoice / Memo #</label>
                <Input
                  value={formReferenceNo}
                  onChange={(e) => setFormReferenceNo(e.target.value)}
                  placeholder="e.g. INV-9021"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Receipt URL / Image Link */}
            <div>
              <label className="text-xs font-semibold text-foreground">
                Receipt / Voucher Link
              </label>
              <Input
                value={formReceiptUrl}
                onChange={(e) => setFormReceiptUrl(e.target.value)}
                placeholder="https://... or /uploads/..."
                className="mt-1"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-foreground">Additional Notes</label>
              <Textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Optional notes or remarks..."
                className="mt-1 resize-none h-18 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditExpense(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addMutation.isPending || updateMutation.isPending}
                className="bg-[#67B239] hover:bg-[#5aa030] text-white"
              >
                {addMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : editExpense ? (
                  "Save Changes"
                ) : (
                  "Record Expense"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Receipt Preview Dialog */}
      <Dialog open={!!previewReceiptUrl} onOpenChange={() => setPreviewReceiptUrl(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receipt / Document Preview</DialogTitle>
          </DialogHeader>
          <div className="p-2 flex items-center justify-center max-h-[70vh] overflow-auto">
            {previewReceiptUrl && (
              <img
                src={previewReceiptUrl}
                alt="Receipt Preview"
                className="max-h-[65vh] object-contain rounded-md shadow-xs"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  toast.error("Unable to render document image.");
                }}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewReceiptUrl(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Color Hut Radix Alert Delete Confirmation Dialog */}
      <Dialog open={!!deleteExpenseId} onOpenChange={() => setDeleteExpenseId(null)}>
        <DialogContent className="w-full max-w-lg bg-[#EEEFF2] dark:bg-slate-900 border border-[#E1E7EF] dark:border-slate-800 rounded-2xl p-6 shadow-lg gap-4 text-slate-900 dark:text-slate-100">
          <DialogHeader className="flex flex-col space-y-2 text-left sm:text-left">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2 text-[#0f1729] dark:text-slate-100">
              <TriangleAlert className="size-6 text-[#dc2626] stroke-2" />
              Are you absolutely sure?
            </DialogTitle>
            <DialogDescription className="text-sm text-[#94a3b8] dark:text-slate-400 text-left mt-2 leading-5">
              This action cannot be undone. This will permanently delete the expense entry for{" "}
              <span className="font-semibold text-[#94a3b8] dark:text-slate-300">
                "{deleteExpenseTitle}"
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteExpenseId(null)}
              className="h-10 px-4 py-2 mt-2 sm:mt-0 bg-[#EEEFF2] dark:bg-slate-800 border border-[#E1E7EF] dark:border-slate-700 text-[#0f1729] dark:text-slate-200 hover:bg-[#E1E7EF]/80 dark:hover:bg-slate-700 rounded-[10px] text-sm font-medium shadow-none cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
              className="h-10 px-4 py-2 bg-[#dc2626] hover:bg-[#dc2626]/90 text-[#fafafa] rounded-[10px] text-sm font-medium shadow-none cursor-pointer border-0"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Deleting...
                </>
              ) : (
                "Yes, delete expense"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
