import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon, ChevronDown, Users2 } from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { agentsQuery } from "@/lib/follow-ups";

export type DashboardGreetingBannerProps = {
  selectedAgent?: string;
  onAgentChange?: (agentId: string | undefined) => void;
  selectedDateRange?: string;
  onDateRangeChange?: (range: string) => void;
};

export function DashboardGreetingBanner({
  selectedAgent,
  onAgentChange,
  selectedDateRange = "This Month",
  onDateRangeChange,
}: DashboardGreetingBannerProps) {
  const { profile, user, isAdmin } = useAuth();
  const rawName =
    profile?.full_name?.trim() ||
    (user?.user_metadata?.["full_name"] as string) ||
    user?.email ||
    "Mehan";
  const firstName = rawName.split(" ")[0] || "Mehan";

  const agents = useQuery({ ...agentsQuery(), enabled: isAdmin });

  const [dateRange, setDateRange] = useState(selectedDateRange);
  const [selectedAgentLabel, setSelectedAgentLabel] = useState("All Agents");

  const handleDateSelect = (range: string) => {
    setDateRange(range);
    onDateRangeChange?.(range);
  };

  const handleAgentSelect = (agentId: string | undefined, label: string) => {
    setSelectedAgentLabel(label);
    onAgentChange?.(agentId);
  };

  return (
    <div className="w-full">
      {/* Separate Compact Filter Cards (Not Full Width) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Separate Card: Select Agent */}
        <div className="bg-white dark:bg-card rounded-xl border border-[#E1E6ED] dark:border-border shadow-2xs px-4 py-2.5 flex items-center gap-3 w-fit">
          <div className="flex items-center gap-2">
            <Users2 className="size-4 text-[#7AC142] shrink-0" />
            <span className="text-xs font-bold text-[#7AC142] dark:text-[#9ED968] tracking-wide">
              Select Agent
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="bg-[#F5F7FA] hover:bg-slate-200/80 dark:bg-muted dark:hover:bg-muted/80 text-[#0A2E5C] dark:text-foreground text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border-0 outline-none cursor-pointer">
              <span>{selectedAgentLabel}</span>
              <ChevronDown className="size-3 text-[#5A6B85] dark:text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem onClick={() => handleAgentSelect(undefined, "All Agents")}>
                All Agents
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAgentSelect(user?.id, "Assigned to Me")}>
                Assigned to Me
              </DropdownMenuItem>
              {isAdmin &&
                (agents.data ?? []).map((a) => (
                  <DropdownMenuItem key={a.id} onClick={() => handleAgentSelect(a.id, a.name)}>
                    {a.name}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Separate Card: Filter Date Range */}
        <div className="bg-white dark:bg-card rounded-xl border border-[#E1E6ED] dark:border-border shadow-2xs px-4 py-2.5 flex items-center gap-3 w-fit">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 text-[#7AC142] shrink-0" />
            <span className="text-xs font-bold text-[#7AC142] dark:text-[#9ED968] tracking-wide">
              Filter
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="bg-[#F5F7FA] hover:bg-slate-200/80 dark:bg-muted dark:hover:bg-muted/80 text-[#0A2E5C] dark:text-foreground text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border-0 outline-none cursor-pointer">
              <CalendarIcon className="size-3 text-[#5A6B85] dark:text-muted-foreground" />
              <span>{dateRange}</span>
              <ChevronDown className="size-3 text-[#5A6B85] dark:text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {["Today", "This Week", "This Month", "This Quarter", "This Year"].map((range) => (
                <DropdownMenuItem key={range} onClick={() => handleDateSelect(range)}>
                  {range}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
