"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Pencil,
  Trash2,
  MoreVertical,
  Hourglass,
  Eye,
  TriangleAlert,
  FileText,
  Download,
  Check,
  PlusCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { crmUsersQueryOptions, type CrmUser } from "@/lib/admin-users";
import { servicesQueryOptions } from "@/lib/services";
import {
  quotationsQueryOptions,
  useSaveQuotationMutation,
  useUpdateQuotationStatusMutation,
  useDeleteQuotationMutation,
  QUOTATION_WORKFLOW_STAGES,
  resolveQuotationStageColor,
  type CrmQuotationItem,
} from "@/lib/quotations";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { CreateQuotationDialog } from "@/components/quotations/create-quotation-dialog";
import { EditQuotationDialog } from "@/components/quotations/edit-quotation-dialog";

const ITEMS_PER_PAGE = 25;

function getContrastTextColor(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "#FFFFFF";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#0F172A" : "#FFFFFF";
}

function formatQuotationCardDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "Not set";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return String(dateInput);
  }
}

const DEMO_QUOTATIONS: CrmQuotationItem[] = [
  {
    id: "demo-prj-1",
    quotation_code: "12145",
    title: "Truelysell",
    business_name: "Truelysell",
    contact_name: "Truelysell",
    client_name: "Truelysell",
    client_phone: "+1 234 567 890",
    client_email: "truelysell@example.com",
    client_address: null,
    service_id: "srv-web-app",
    service_name: "Web App",
    stage_id: "Draft",
    stage_name: "Draft",
    stage_group: "in_progress",
    stage_color: "#3B82F6",
    stage_icon: "PlayCircle",
    priority: "High",
    assigned_agent_id: "agent-1",
    assigned_agent_name: "Agent One",
    assigned_agent_avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    assigned_artist_id: "artist-1",
    assigned_artist_name: "Artist One",
    assigned_artist_avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    created_by: "a0000000-0000-4000-8000-000000000001",
    creator_name: "Mehan Ahmed",
    creator_avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    budget: 350000,
    paid_amount: 150000,
    due_amount: 200000,
    progress: 15,
    order_date: "2023-10-01",
    deadline: "2023-10-15",
    assignees: [
      {
        id: "artist-1",
        name: "Artist One",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        role: "artist",
      },
      {
        id: "agent-1",
        name: "Agent One",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        role: "agent",
      },
    ],
    assigned_user_ids: ["artist-1", "agent-1"],
    notes: "Kofejob is a freelancers marketplace where you can post quotations & get instant help.",
    created_at: "2023-10-01T00:00:00.000Z",
    updated_at: "2023-10-01T00:00:00.000Z",
  },
  {
    id: "demo-prj-2",
    quotation_code: "12145",
    title: "Dreamschat",
    business_name: "Dreamschat",
    contact_name: "Dreamschat",
    client_name: "Dreamschat",
    client_phone: "+1 234 567 891",
    client_email: "dreamschat@example.com",
    client_address: null,
    service_id: "srv-web-app",
    service_name: "Web App",
    stage_id: "Sent",
    stage_name: "Sent",
    stage_group: "in_progress",
    stage_color: "#8B5CF6",
    stage_icon: "FileText",
    priority: "High",
    assigned_agent_id: "agent-2",
    assigned_agent_name: "Agent Two",
    assigned_agent_avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    assigned_artist_id: "artist-2",
    assigned_artist_name: "Artist Two",
    assigned_artist_avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    created_by: "a0000000-0000-4000-8000-000000000001",
    creator_name: "Mehan Ahmed",
    creator_avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    budget: 215000,
    paid_amount: 100000,
    due_amount: 115000,
    progress: 30,
    order_date: "2023-10-01",
    deadline: "2023-10-19",
    assignees: [
      {
        id: "artist-2",
        name: "Artist Two",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        role: "artist",
      },
    ],
    assigned_user_ids: ["artist-2"],
    notes: "Kofejob is a freelancers marketplace where you can post quotations & get instant help.",
    created_at: "2023-10-01T00:00:00.000Z",
    updated_at: "2023-10-01T00:00:00.000Z",
  },
  {
    id: "demo-prj-3",
    quotation_code: "12147",
    title: "Truelysell",
    business_name: "Truelysell Portal",
    contact_name: "Truelysell",
    client_name: "Truelysell",
    client_phone: "+1 234 567 892",
    client_email: "truelysell2@example.com",
    client_address: null,
    service_id: "srv-web-app",
    service_name: "Web App",
    stage_id: "Under Review",
    stage_name: "Under Review",
    stage_group: "in_progress",
    stage_color: "#F59E0B",
    stage_icon: "Video",
    priority: "High",
    assigned_agent_id: "agent-3",
    assigned_agent_name: "Agent Three",
    assigned_agent_avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    assigned_artist_id: "artist-3",
    assigned_artist_name: "Artist Three",
    assigned_artist_avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
    created_by: "a0000000-0000-4000-8000-000000000001",
    creator_name: "Mehan Ahmed",
    creator_avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    budget: 145000,
    paid_amount: 80000,
    due_amount: 65000,
    progress: 50,
    order_date: "2023-10-01",
    deadline: "2023-10-12",
    assignees: [],
    assigned_user_ids: [],
    notes: "Kofejob is a freelancers marketplace where you can post quotations & get instant help.",
    created_at: "2023-10-01T00:00:00.000Z",
    updated_at: "2023-10-01T00:00:00.000Z",
  },
  {
    id: "demo-prj-4",
    quotation_code: "12148",
    title: "Servbook",
    business_name: "Servbook",
    contact_name: "Servbook",
    client_name: "Servbook",
    client_phone: "+1 234 567 893",
    client_email: "servbook@example.com",
    client_address: null,
    service_id: "srv-web-app",
    service_name: "Web App",
    stage_id: "Accepted",
    stage_name: "Accepted",
    stage_group: "won",
    stage_color: "#16A34A",
    stage_icon: "Trophy",
    priority: "High",
    assigned_agent_id: "agent-4",
    assigned_agent_name: "Agent Four",
    assigned_agent_avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    assigned_artist_id: "artist-4",
    assigned_artist_name: "Artist Four",
    assigned_artist_avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
    created_by: "a0000000-0000-4000-8000-000000000001",
    creator_name: "Mehan Ahmed",
    creator_avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    budget: 215000,
    paid_amount: 215000,
    due_amount: 0,
    progress: 100,
    order_date: "2023-10-01",
    deadline: "2023-10-24",
    assignees: [],
    assigned_user_ids: [],
    notes: "Kofejob is a freelancers marketplace where you can post quotations & get instant help.",
    created_at: "2023-10-01T00:00:00.000Z",
    updated_at: "2023-10-01T00:00:00.000Z",
  },
];

export default function QuotationsPage() {
  const router = useRouter();
  const { user, profile, isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [quotationModal, setQuotationModal] = useState<{
    open: boolean;
    quotation: CrmQuotationItem | null;
  }>({
    open: false,
    quotation: null,
  });

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    quotation: CrmQuotationItem | null;
  }>({
    open: false,
    quotation: null,
  });

  const { data: quotationsData, isLoading: isQuotationsLoading } = useQuery(
    quotationsQueryOptions(user?.id, isAdmin),
  );

  const { data: usersData } = useQuery(crmUsersQueryOptions());
  const { data: servicesData } = useQuery(servicesQueryOptions());

  const quotations = useMemo(() => quotationsData?.quotations || [], [quotationsData]);
  const activeQuotations = useMemo(
    () => (quotations.length > 0 ? quotations : DEMO_QUOTATIONS),
    [quotations],
  );
  const stages = useMemo(
    () => quotationsData?.stages || QUOTATION_WORKFLOW_STAGES,
    [quotationsData],
  );
  const users = useMemo(() => (usersData as CrmUser[]) || [], [usersData]);
  const usersMap = useMemo(() => {
    const map = new Map<string, CrmUser>();
    users.forEach((u) => {
      map.set(u.id, u);
    });
    return map;
  }, [users]);
  const services = useMemo(() => servicesData || [], [servicesData]);

  const saveQuotationMutation = useSaveQuotationMutation();
  const updateStatusMutation = useUpdateQuotationStatusMutation();
  const deleteQuotationMutation = useDeleteQuotationMutation();

  const filteredQuotations = useMemo(() => {
    return activeQuotations.filter((p) => {
      if (!search.trim()) return true;

      const q = search.toLowerCase().trim();
      return (
        p.quotation_code.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        (p.business_name && p.business_name.toLowerCase().includes(q)) ||
        (p.contact_name && p.contact_name.toLowerCase().includes(q)) ||
        p.client_name.toLowerCase().includes(q) ||
        (p.client_phone && p.client_phone.toLowerCase().includes(q)) ||
        (p.service_name && p.service_name.toLowerCase().includes(q)) ||
        (p.assigned_artist_name && p.assigned_artist_name.toLowerCase().includes(q)) ||
        (p.assigned_agent_name && p.assigned_agent_name.toLowerCase().includes(q))
      );
    });
  }, [activeQuotations, search]);

  const handleExportCSV = () => {
    if (filteredQuotations.length === 0) {
      toast.error("No quotations to export.");
      return;
    }
    const headers = [
      "Quotation Code",
      "Title",
      "Client",
      "Phone",
      "Email",
      "Service",
      "Stage",
      "Priority",
      "Budget",
      "Paid",
      "Progress",
      "Deadline",
    ];
    const rows = filteredQuotations.map((p) => [
      p.quotation_code,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.client_name.replace(/"/g, '""')}"`,
      p.client_phone || "",
      p.client_email || "",
      p.service_name || "",
      p.stage_name,
      p.priority,
      p.budget,
      p.paid_amount,
      `${p.progress}%`,
      p.deadline || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `brandium_quotations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Quotations exported to CSV successfully!");
  };

  const totalPages = Math.max(1, Math.ceil(filteredQuotations.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedQuotations = filteredQuotations.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  const pageNumbers = (() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    let start = Math.max(1, safePage - 2);
    let end = Math.min(totalPages, safePage + 2);
    if (safePage < 3) end = 5;
    else if (safePage > totalPages - 2) start = totalPages - 4;
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  })();

  const openQuotation = (quotation: CrmQuotationItem) =>
    router.push(`/quotations/${quotation.quotation_code || quotation.id}`);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header (ERPAPP Quotation Management) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0a2e5c] dark:text-slate-100">
            Quotation Management
          </h1>
          <p className="text-sm text-muted-foreground">
            View, track, and manage all customer quotations.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="w-full sm:w-auto h-10 rounded-md shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <Download className="mr-2 size-4" /> Export
          </Button>
          <Button
            onClick={() => setQuotationModal({ open: true, quotation: null })}
            className="w-full sm:w-auto h-10 rounded-md bg-[#67B239] hover:bg-[#5aa030] text-white font-semibold shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <PlusCircle className="mr-2 size-5" /> Create New Quotation
          </Button>
        </div>
      </div>

      {/* 2. All Quotations Table Card (ERPAPP) */}
      <Card className="shadow-xl border bg-card rounded-lg overflow-hidden gap-0 py-0">
        <CardHeader className="border-b p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl text-card-foreground">All Quotations</CardTitle>
            <div className="relative w-full sm:w-auto sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search quotations..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 h-10 rounded-md bg-background w-full sm:w-72"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Quotation ID</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>CRM Contact</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isQuotationsLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={`skel-${i}`}>
                      <TableCell className="pl-6">
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-28 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Skeleton className="size-9 inline-block rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : pagedQuotations.length > 0 ? (
                  pagedQuotations.map((quotation) => {
                    const stageColor =
                      stages.find(
                        (st) =>
                          st.id === quotation.stage_id ||
                          st.name.toLowerCase() === quotation.stage_name.toLowerCase(),
                      )?.color || resolveQuotationStageColor(quotation.stage_name);
                    const creatorUser = quotation.created_by
                      ? usersMap.get(quotation.created_by)
                      : null;
                    const crmContact =
                      creatorUser?.name ||
                      quotation.creator_name ||
                      quotation.assigned_agent_name ||
                      profile?.full_name ||
                      "Admin";
                    const companyName =
                      quotation.title && quotation.title !== quotation.client_name
                        ? quotation.title
                        : quotation.service_name || "N/A";

                    return (
                      <TableRow key={quotation.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="pl-6 font-mono font-bold text-[#0a2e5c] dark:text-sky-300">
                          <Link
                            href={`/quotations/${quotation.quotation_code || quotation.id}`}
                            className="hover:underline"
                          >
                            {quotation.quotation_code || quotation.id}
                          </Link>
                        </TableCell>
                        <TableCell className="font-medium text-card-foreground">
                          {quotation.client_name}
                        </TableCell>
                        <TableCell className="text-card-foreground">{companyName}</TableCell>
                        <TableCell>
                          <Badge
                            className="border-transparent"
                            style={{
                              backgroundColor: stageColor,
                              color: getContrastTextColor(stageColor),
                            }}
                          >
                            {quotation.stage_name || "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-card-foreground">{crmContact}</TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {formatQuotationCardDate(quotation.created_at)}
                        </TableCell>
                        <TableCell className="pr-6 text-right whitespace-nowrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-9 cursor-pointer"
                                title="Quotation Actions"
                              >
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() => setQuotationModal({ open: true, quotation })}
                                className="cursor-pointer"
                              >
                                <Pencil className="mr-2 size-4" /> Edit Quotation
                              </DropdownMenuItem>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="cursor-pointer">
                                  <Hourglass className="mr-2 size-4" /> Change Status
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="p-1 space-y-0.5">
                                  {stages.map((st) => {
                                    const color = st.color || resolveQuotationStageColor(st.name);
                                    const isCurrent =
                                      quotation.stage_id === st.id ||
                                      quotation.stage_name.toLowerCase() === st.name.toLowerCase();
                                    return (
                                      <DropdownMenuItem
                                        key={st.id}
                                        onSelect={() =>
                                          updateStatusMutation.mutate({
                                            id: quotation.id,
                                            stage_id: st.id,
                                            stage_name: st.name,
                                          })
                                        }
                                        className="cursor-pointer focus:opacity-90"
                                        style={{
                                          backgroundColor: color,
                                          color: getContrastTextColor(color),
                                        }}
                                      >
                                        {st.name}
                                        {isCurrent && <Check className="ms-auto size-3.5" />}
                                      </DropdownMenuItem>
                                    );
                                  })}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuItem
                                onSelect={() => openQuotation(quotation)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 size-4" /> View / Print Quotation
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() => setDeleteModal({ open: true, quotation })}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 size-4" /> Delete Quotation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 h-75">
                      <FileText className="mx-auto size-12 opacity-50 mb-3 text-muted-foreground" />
                      <p className="text-lg text-muted-foreground font-medium">
                        {search ? "No quotations match your search." : "No quotations found."}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {search ? "Try a different search term." : "Start by creating a new one!"}
                      </p>
                      {!search && (
                        <Button
                          size="sm"
                          onClick={() => setQuotationModal({ open: true, quotation: null })}
                          className="mt-4 bg-[#67B239] hover:bg-[#5aa030] text-white cursor-pointer"
                        >
                          <PlusCircle className="mr-2 size-4" /> Create Quotation
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="py-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(Math.max(1, safePage - 1));
                    }}
                    aria-disabled={safePage === 1}
                    className={safePage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {pageNumbers.map((page, index) => (
                  <PaginationItem key={`${page}-${index}`}>
                    {page === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        isActive={safePage === page}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        className={cn(
                          safePage === page &&
                            "bg-[#67B239] text-white hover:bg-[#5aa030] hover:text-white",
                        )}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(Math.min(totalPages, safePage + 1));
                    }}
                    aria-disabled={safePage === totalPages}
                    className={safePage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>

      {/* 5. Create / Edit Quotation Dialogs (ERPAPP clone) */}
      {quotationModal.open && !quotationModal.quotation && (
        <CreateQuotationDialog
          open
          onOpenChange={(open: boolean) => setQuotationModal({ open, quotation: null })}
          services={services}
          allQuotations={quotations}
          onSave={async (data) => {
            await saveQuotationMutation.mutateAsync(data);
            setQuotationModal({ open: false, quotation: null });
          }}
          isSaving={saveQuotationMutation.isPending}
        />
      )}
      {quotationModal.open && quotationModal.quotation && (
        <EditQuotationDialog
          key={`${quotationModal.quotation.id}-${quotationModal.quotation.updated_at}`}
          open
          onOpenChange={(open: boolean) => setQuotationModal({ open, quotation: null })}
          quotation={quotationModal.quotation}
          services={services}
          onSave={async (data) => {
            await saveQuotationMutation.mutateAsync(data);
            setQuotationModal({ open: false, quotation: null });
          }}
          isSaving={saveQuotationMutation.isPending}
        />
      )}

      {/* 7. Delete Quotation Dialog (Exact Match to User Snippet) */}
      <AlertDialog
        open={deleteModal.open}
        onOpenChange={(open: boolean) => {
          if (!deleteQuotationMutation.isPending) {
            setDeleteModal({ open, quotation: null });
          }
        }}
      >
        <AlertDialogContent className="w-full max-w-lg bg-[#EEEFF2] dark:bg-slate-900 border border-[#E1E7EF] dark:border-slate-800 rounded-2xl p-6 shadow-lg gap-4 text-slate-900 dark:text-slate-100">
          <AlertDialogHeader className="flex flex-col space-y-2 text-left sm:text-left">
            <AlertDialogTitle className="text-lg font-semibold flex items-center gap-2 text-[#0f1729] dark:text-slate-100">
              <TriangleAlert className="h-6 w-6 text-[#dc2626] shrink-0 stroke-2" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#94a3b8] dark:text-slate-400 text-left mt-2 leading-5">
              This action cannot be undone. This will permanently delete the quotation for &quot;
              <span className="font-semibold text-[#94a3b8] dark:text-slate-300">
                {deleteModal.quotation?.title ||
                  deleteModal.quotation?.quotation_code ||
                  "this quotation"}
              </span>
              &quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-0">
            <AlertDialogCancel
              disabled={deleteQuotationMutation.isPending}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors h-10 px-4 py-2 mt-2 sm:mt-0 bg-[#EEEFF2] dark:bg-slate-800 border border-[#E1E7EF] dark:border-slate-700 text-[#0f1729] dark:text-slate-200 hover:bg-[#E1E7EF]/80 dark:hover:bg-slate-700 rounded-[10px] shadow-none cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteQuotationMutation.isPending}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors h-10 px-4 py-2 bg-[#dc2626] hover:bg-[#dc2626]/90 text-[#fafafa] rounded-[10px] shadow-none cursor-pointer border-0"
              onClick={async (e) => {
                e.preventDefault();
                if (deleteModal.quotation) {
                  await deleteQuotationMutation.mutateAsync(deleteModal.quotation.id);
                  setDeleteModal({ open: false, quotation: null });
                }
              }}
            >
              {deleteQuotationMutation.isPending ? "Deleting..." : "Yes, delete quotation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
