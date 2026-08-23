import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Clock,
  User,
  Building,
  History,
  RotateCw,
  Sparkles,
  Phone,
  Calendar,
  Layers,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";
import * as Icons from "lucide-react";

import { PageHeader } from "@/components/placeholder-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { stageHistoryDetailsQuery } from "@/lib/stage-history";

const stageHistorySearchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  search: z.string().optional(),
  agent: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/admin/stage-history")({
  validateSearch: (search) => stageHistorySearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Stage History | Brandium Telesales CRM" },
      { name: "description", content: "Audit trail of pipeline stage changes." },
      { property: "og:title", content: "Stage History | Brandium Telesales CRM" },
      { property: "og:description", content: "Audit trail of pipeline stage changes." },
    ],
  }),
  component: StageHistoryPage,
});

function StageHistoryPage() {
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState(searchParams.search || "");
  const [debouncedSearch] = useDebounce(searchTerm, 400);

  const currentPage = Math.max(1, Number(searchParams.page || 1));

  const history = useQuery(
    stageHistoryDetailsQuery({
      page: currentPage,
      search: debouncedSearch,
      agent: searchParams.agent,
      from: searchParams.from,
      to: searchParams.to,
    }),
  );

  const updateFilter = (key: string, value: string | undefined) => {
    navigate({
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        [key]: value || undefined,
        page: 1,
      }),
    });
  };

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        page: newPage,
      }),
    });
  };

  const totalEntries = history.data?.count || 0;
  const pageCount = history.data?.pageCount || 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage History"
        description="Audit trail of all pipeline stage changes across the system."
      >
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 cursor-pointer bg-white dark:bg-card"
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: ["stage-history-details"],
            })
          }
        >
          <RotateCw
            className={`size-3.5 ${history.isFetching ? "animate-spin text-primary" : ""}`}
          />
          Refresh Log
        </Button>
      </PageHeader>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search prospect, phone, stage or note..."
            className="pl-9 bg-white dark:bg-card rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-white dark:bg-card p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-muted-foreground px-2 font-medium">From</span>
            <Input
              type="date"
              className="w-34 h-8 text-xs border-0 shadow-none focus-visible:ring-0"
              value={searchParams.from || ""}
              onChange={(e) => updateFilter("from", e.target.value)}
            />
            <span className="text-xs text-muted-foreground px-1 font-medium">To</span>
            <Input
              type="date"
              className="w-34 h-8 text-xs border-0 shadow-none focus-visible:ring-0"
              value={searchParams.to || ""}
              onChange={(e) => updateFilter("to", e.target.value)}
            />
          </div>

          {(searchTerm || searchParams.from || searchParams.to || searchParams.agent) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              onClick={() => {
                setSearchTerm("");
                navigate({ search: { page: 1 } });
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* History Table */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b bg-slate-50/80 dark:bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3.5 w-36">Timestamp</th>
                <th className="px-4 py-3.5">Prospect</th>
                <th className="px-4 py-3.5">Stage Transition</th>
                <th className="px-4 py-3.5">Changed By</th>
                <th className="px-4 py-3.5">Audit Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {history.isPending ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-24 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-8 w-44 rounded-lg" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-6 w-56 rounded-full" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-6 w-32 rounded-lg" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-48 rounded" />
                    </td>
                  </tr>
                ))
              ) : (history.data?.data || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
                    <History className="mx-auto size-9 mb-2 opacity-30 text-slate-400" />
                    <p className="font-bold text-foreground text-sm">No stage transitions found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Stage updates made from Prospects or Schedule Meeting will appear here in
                      real-time.
                    </p>
                  </td>
                </tr>
              ) : (
                history.data?.data.map((item) => {
                  const fromColor = item.from_stage_color || "#2563EB";
                  const toColor = item.to_stage_color || "#16A34A";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-muted/30 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {format(new Date(item.changed_at), "MMM d, yyyy")}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="size-3" />
                            {format(new Date(item.changed_at), "h:mm:ss a")}
                          </span>
                        </div>
                      </td>

                      {/* Prospect */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            className="font-bold text-foreground hover:text-primary transition-colors text-left cursor-pointer"
                            onClick={() =>
                              navigate({
                                to: "/prospects",
                                search: { search: item.prospect_name },
                              })
                            }
                          >
                            {item.prospect_name}
                          </button>
                          {item.prospect_business && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Building className="size-3" />
                              {item.prospect_business}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Transition */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border"
                            style={{
                              backgroundColor: `${fromColor}15`,
                              color: fromColor,
                              borderColor: `${fromColor}35`,
                            }}
                          >
                            <span
                              className="size-1.5 rounded-full inline-block"
                              style={{ backgroundColor: fromColor }}
                            />
                            {item.from_stage_name || "New Lead"}
                          </span>
                          <ArrowRight className="size-3 text-slate-400 shrink-0" />
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border shadow-2xs"
                            style={{
                              backgroundColor: `${toColor}15`,
                              color: toColor,
                              borderColor: `${toColor}35`,
                            }}
                          >
                            <span
                              className="size-1.5 rounded-full inline-block"
                              style={{ backgroundColor: toColor }}
                            />
                            {item.to_stage_name}
                          </span>
                        </div>
                      </td>

                      {/* Changed By */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-black border border-slate-200/80 dark:border-slate-700">
                            {(item.changer_name || "A").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-foreground">
                              {item.changer_name || "System"}
                            </span>
                            <span className="text-[9px] text-muted-foreground truncate max-w-28">
                              {item.changer_email || "agent@brandium.io"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Notes / Reason */}
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-muted-foreground max-w-xs line-clamp-2 italic">
                          {item.note || "Standard stage transition recorded."}
                        </p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-muted/20">
          <div className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-bold text-foreground">
              {history.data?.data.length ? (currentPage - 1) * 15 + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-bold text-foreground">
              {Math.min(currentPage * 15, totalEntries)}
            </span>{" "}
            of <span className="font-bold text-foreground">{totalEntries}</span> transition records
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs font-semibold rounded-lg cursor-pointer bg-white dark:bg-card"
              disabled={currentPage <= 1 || history.isPending}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft className="mr-1 size-3.5" />
              Previous
            </Button>
            <span className="text-xs font-bold px-2 text-foreground">
              {currentPage} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs font-semibold rounded-lg cursor-pointer bg-white dark:bg-card"
              disabled={currentPage >= pageCount || history.isPending}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
              <ChevronRight className="ml-1 size-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
