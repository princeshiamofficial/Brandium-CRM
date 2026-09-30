"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { format } from "date-fns";
import {
  ArrowRight,
  Building,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  RotateCw,
  ScrollText,
  Search,
  Users,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { stageHistoryDetailsQuery } from "@/lib/stage-history";
import { parseNotesToArray } from "@/lib/stages";
import { agentOptionsQueryOptions } from "@/lib/won-sales";

const PAGE_SIZE = 15;

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "S";

function StageChip({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: `${color}15`, color, borderColor: `${color}40` }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </span>
  );
}

export default function StageHistoryPageWrapper() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
      <StageHistoryPage />
    </Suspense>
  );
}

function StageHistoryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const urlAgent = searchParams.get("agent") || undefined;
  const urlFrom = searchParams.get("from") || undefined;
  const urlTo = searchParams.get("to") || undefined;
  const currentPage = Math.max(1, Number(searchParams.get("page") || "1"));

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [debouncedSearch] = useDebounce(searchTerm, 400);

  const history = useQuery(
    stageHistoryDetailsQuery({
      page: currentPage,
      search: debouncedSearch,
      agent: urlAgent,
      from: urlFrom,
      to: urlTo,
    }),
  );
  const { data: agents = [] } = useQuery(agentOptionsQueryOptions());

  const setParams = (updates: Record<string, string | undefined>, resetPage = true) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    if (resetPage) params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const rows = history.data?.data ?? [];
  const totalEntries = history.data?.count ?? 0;
  const pageCount = history.data?.pageCount ?? 1;
  const hasFilters = Boolean(searchTerm || urlFrom || urlTo || urlAgent);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <ScrollText className="size-7 text-[#67B239]" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Stage History</h1>
            <p className="text-sm text-muted-foreground">
              Audit trail of every pipeline stage change.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-1.5 cursor-pointer bg-white dark:bg-card"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["stage-history-details"] })}
        >
          <RotateCw className={history.isFetching ? "size-4 animate-spin" : "size-4"} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search prospect, phone, stage or note..."
            className="pl-9 pr-8 bg-white dark:bg-card"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={urlAgent ?? "all"}
            onValueChange={(val: string) => setParams({ agent: val === "all" ? undefined : val })}
          >
            <SelectTrigger className="w-44 bg-white dark:bg-card gap-2 text-xs">
              <Users className="size-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">All Users</SelectItem>
              {agents.map((ag) => (
                <SelectItem key={ag.id} value={ag.id}>
                  {ag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 rounded-md border bg-white dark:bg-card px-2">
            <Calendar className="size-3.5 text-muted-foreground" />
            <Input
              type="date"
              aria-label="From date"
              className="h-8 w-34 border-0 px-1 text-xs shadow-none focus-visible:ring-0"
              value={urlFrom || ""}
              onChange={(e) => setParams({ from: e.target.value })}
            />
            <span className="text-xs text-muted-foreground">–</span>
            <Input
              type="date"
              aria-label="To date"
              className="h-8 w-34 border-0 px-1 text-xs shadow-none focus-visible:ring-0"
              value={urlTo || ""}
              onChange={(e) => setParams({ to: e.target.value })}
            />
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs text-destructive hover:text-destructive"
              onClick={() => {
                setSearchTerm("");
                router.push("?page=1");
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-xl border bg-card rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 w-12.5 font-semibold">SL</TableHead>
                  <TableHead className="min-w-36 font-semibold">Date & Time</TableHead>
                  <TableHead className="min-w-44 font-semibold">Prospect</TableHead>
                  <TableHead className="min-w-64 font-semibold">Stage Change</TableHead>
                  <TableHead className="min-w-44 font-semibold">Changed By</TableHead>
                  <TableHead className="pr-6 min-w-56 font-semibold">Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.isPending ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell colSpan={6} className="py-4 px-6">
                        <Skeleton className="h-12 w-full rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                      <History className="size-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-foreground">No stage changes found</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {hasFilters
                          ? "Try clearing search or filters."
                          : "Stage updates from Prospects and meetings will appear here."}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((item, index) => {
                    const noteText = parseNotesToArray(item.note).join(" · ");
                    return (
                      <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="pl-6 text-muted-foreground text-xs font-medium">
                          {(currentPage - 1) * PAGE_SIZE + index + 1}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          <div className="flex items-center gap-1 font-medium text-foreground">
                            <Calendar className="size-3 text-slate-400" />
                            {format(new Date(item.changed_at), "MMM d, yyyy")}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="size-3 text-slate-400" />
                            {format(new Date(item.changed_at), "h:mm a")}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-56">
                          <button
                            type="button"
                            className="font-medium text-foreground text-sm hover:text-[#67B239] truncate block max-w-full text-left cursor-pointer"
                            onClick={() =>
                              router.push(
                                `/prospects?search=${encodeURIComponent(item.prospect_name)}`,
                              )
                            }
                          >
                            {item.prospect_name}
                          </button>
                          {item.prospect_business && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                              <Building className="size-3 shrink-0" />
                              {item.prospect_business}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <StageChip
                              name={item.from_stage_name || "New Lead"}
                              color={item.from_stage_color || "#64748B"}
                            />
                            <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
                            <StageChip
                              name={item.to_stage_name}
                              color={item.to_stage_color || "#16A34A"}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar className="size-8 border border-border/70 shadow-2xs">
                              {item.changer_avatar && (
                                <AvatarImage
                                  src={item.changer_avatar}
                                  alt={item.changer_name || ""}
                                />
                              )}
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                {getInitials(item.changer_name || "System")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {item.changer_name || "System"}
                              </p>
                              {item.changer_email && (
                                <p className="text-xs font-mono text-muted-foreground truncate max-w-40">
                                  {item.changer_email}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="pr-6 max-w-xs">
                          {noteText ? (
                            <p
                              className="text-xs text-muted-foreground line-clamp-2"
                              title={noteText}
                            >
                              {noteText}
                            </p>
                          ) : (
                            <span className="text-xs text-muted-foreground/60">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t px-6 py-3 text-xs">
            <span className="text-muted-foreground">
              Showing {rows.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–
              {Math.min(currentPage * PAGE_SIZE, totalEntries)} of {totalEntries}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                Page {currentPage} of {pageCount}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                disabled={currentPage <= 1 || history.isPending}
                onClick={() => setParams({ page: String(currentPage - 1) }, false)}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                disabled={currentPage >= pageCount || history.isPending}
                onClick={() => setParams({ page: String(currentPage + 1) }, false)}
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
