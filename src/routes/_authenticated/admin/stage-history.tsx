import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";

import { PageHeader } from "@/components/placeholder-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { stageHistoryDetailsQuery } from "@/lib/stage-history";

const stageHistorySearchSchema = z.object({
  page: z.number().catch(1),
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
  const [searchTerm, setSearchTerm] = useState(searchParams.search || "");
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  const history = useQuery(
    stageHistoryDetailsQuery({
      ...searchParams,
      search: debouncedSearch,
    }),
  );

  const updateFilter = (key: string, value: string | undefined) => {
    navigate({
      search: (prev: Record<string, unknown>) => ({ ...prev, [key]: value || undefined, page: 1 }),
    });
  };

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev: Record<string, unknown>) => ({ ...prev, page: newPage }),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage History"
        description="Audit trail of all pipeline stage changes across the system."
      />

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search prospect or notes..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Input
              type="date"
              className="w-37.5"
              value={searchParams.from || ""}
              onChange={(e) => updateFilter("from", e.target.value)}
            />
            <span className="text-muted-foreground text-xs">to</span>
            <Input
              type="date"
              className="w-37.5"
              value={searchParams.to || ""}
              onChange={(e) => updateFilter("to", e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setSearchTerm("");
              navigate({ search: { page: 1 } });
            }}
          >
            <Filter className="size-4" />
          </Button>
        </div>
      </div>

      {/* History List */}
      <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3">Date/Time</th>
                <th className="px-4 py-3">Prospect</th>
                <th className="px-4 py-3">Transition</th>
                <th className="px-4 py-3">Changed By</th>
                <th className="px-4 py-3">Notes/Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {history.isPending ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-8 w-40" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-6 w-48" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                  </tr>
                ))
              ) : history.data?.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    <History className="mx-auto size-8 mb-2 opacity-20" />
                    No stage history found.
                  </td>
                </tr>
              ) : (
                history.data?.data.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {format(new Date(item.changed_at), "MMM d, yyyy")}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3" />
                          {format(new Date(item.changed_at), "h:mm a")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{item.prospect_name}</span>
                        {item.prospect_business && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Building className="size-3" />
                            {item.prospect_business}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] h-5">
                          {item.from_stage_name || "New Lead"}
                        </Badge>
                        <ArrowRight className="size-3 text-muted-foreground" />
                        <Badge className="text-[10px] h-5 bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100">
                          {item.to_stage_name}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                          {(item.changer_name || "?").charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs">{item.changer_name || "System"}</span>
                          <span className="text-[9px] text-muted-foreground truncate max-w-30">
                            {item.changer_email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-muted-foreground max-w-xs line-clamp-2 italic">
                        {item.note || "No notes provided."}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3 bg-muted/20">
          <div className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">{history.data?.data.length || 0}</span> of{" "}
            <span className="font-medium text-foreground">{history.data?.count || 0}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={searchParams.page <= 1 || history.isPending}
              onClick={() => handlePageChange(searchParams.page - 1)}
            >
              <ChevronLeft className="mr-1 size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={searchParams.page >= (history.data?.pageCount || 1) || history.isPending}
              onClick={() => handlePageChange(searchParams.page + 1)}
            >
              Next
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
