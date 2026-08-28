"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { crmUsersQueryOptions } from "@/lib/admin-users";
import {
  LogOut,
  PanelLeft,
  ChevronDown,
  User as UserIcon,
  Bell,
  CheckCheck,
  Trophy,
  CalendarClock,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { AccountSuspendedModal } from "@/components/account-suspended-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { navGroups } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Link } from "@/components/navigation-link";

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "U"
  );
}

function NavList({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { isAdmin } = useAuth();
  const pathname = usePathname();

  if (collapsed) {
    return (
      <nav className="flex flex-col gap-3 py-2 px-1 items-center">
        {navGroups
          .filter((group) => !group.adminOnly || isAdmin)
          .map((group) => (
            <div
              key={group.label}
              className="bg-white dark:bg-card rounded-3xl p-1.5 shadow-xs border border-slate-200/70 dark:border-border flex flex-col items-center gap-1.5 w-11"
            >
              {group.items.map((item) => {
                const active = pathname === item.url;
                return (
                  <Link
                    key={item.url}
                    href={item.url}
                    onClick={onNavigate}
                    title={item.title}
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center transition-all",
                      active
                        ? "bg-[#67B239] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-muted",
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />
                  </Link>
                );
              })}
            </div>
          ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-5 px-3 py-4">
      {navGroups
        .filter((group) => !group.adminOnly || isAdmin)
        .map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-300/80">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.url;
                return (
                  <li key={item.url}>
                    <Link
                      href={item.url}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-[#7AC142] font-semibold text-white shadow-xs"
                          : "text-slate-200 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
    </nav>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="flex h-16 items-center justify-center px-1">
        <Link
          href="/dashboard"
          className="size-11 rounded-full bg-white dark:bg-card border border-slate-200/70 dark:border-border shadow-xs flex items-center justify-center p-1.5 transition-transform hover:scale-105"
        >
          <img src="/logo.png" alt="Brandium Logo" className="size-8 object-contain" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-20 items-center justify-center border-b border-slate-200/80 dark:border-border bg-white dark:bg-card px-3 shadow-xs">
      <Link href="/dashboard" className="flex items-center justify-center w-full">
        <img
          src="/logo.png"
          alt="Brandium Logo"
          className="h-14 w-auto max-w-full object-contain transition-all"
        />
      </Link>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, user, role, signOut } = useAuth();

  const { data: usersList } = useQuery(crmUsersQueryOptions());
  const currentUserRecord = usersList?.find(
    (u) =>
      u.id === user?.id ||
      u.email.toLowerCase() === (user?.email || profile?.email || "").toLowerCase(),
  );

  const currentAvatarUrl =
    currentUserRecord?.avatar_url || (user?.user_metadata?.["avatar_url"] as string | undefined);
  const name =
    currentUserRecord?.name?.trim() || profile?.full_name?.trim() || user?.email || "User";
  const displayEmail = currentUserRecord?.email?.trim() || user?.email || profile?.email || "";

  const isSuspended =
    Boolean(currentUserRecord) &&
    (currentUserRecord?.status === "Inactive" ||
      currentUserRecord?.status === "Deleted" ||
      Boolean(currentUserRecord?.is_deleted));

  return (
    <div className="flex min-h-screen bg-[#EEEFF2] dark:bg-background">
      <aside
        className={cn(
          "hidden shrink-0 transition-[width,background-color] duration-200 md:sticky md:top-0 md:block md:h-screen",
          collapsed
            ? "w-16 bg-[#EEEFF2] dark:bg-background border-r-0"
            : "w-64 border-r border-[#0B3364]/30 bg-[#0B3364] text-white",
        )}
      >
        <Brand collapsed={collapsed} />
        <div
          className={cn(
            "overflow-y-auto no-scrollbar",
            collapsed ? "h-[calc(100vh-4rem)]" : "h-[calc(100vh-5rem)]",
          )}
        >
          <NavList collapsed={collapsed} />
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-[#0B3364] text-white border-[#0B3364]/30">
          <Brand collapsed={false} />
          <div className="h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar">
            <NavList collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-slate-200/80 bg-white/80 dark:bg-slate-900/80 dark:border-slate-800 px-3 backdrop-blur-md shadow-2xs md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <PanelLeft className="size-4" />
          </Button>

          <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
            <img src="/logo.png" alt="Brandium" className="h-7 w-auto object-contain" />
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            aria-label="Toggle sidebar"
            onClick={() => setCollapsed((v) => !v)}
          >
            <PanelLeft className="size-4" />
          </Button>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* Notification Bell Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative size-9 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  aria-label="Notifications"
                >
                  <Bell className="size-4.5" />
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#67B239] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#67B239]"></span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-84 sm:w-92 p-0 shadow-2xl border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl animate-in fade-in-50 zoom-in-95"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-[#67B239]/15 flex items-center justify-center text-[#67B239]">
                      <Bell className="size-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-foreground tracking-tight">
                        Notifications
                      </h4>
                      <p className="text-[10px] text-muted-foreground">
                        Stay updated on recent sales activity
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#67B239] text-white font-semibold px-2 py-0.5 rounded-full shadow-2xs">
                    3 New
                  </span>
                </div>

                {/* Stream Body */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-80 overflow-y-auto text-xs">
                  {/* Item 1 */}
                  <div className="p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all cursor-pointer flex items-start gap-3 group">
                    <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Trophy className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-foreground text-xs truncate">
                          New Sales Won Deal
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                          10m ago
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px] leading-snug">
                        AurevixSoft signed{" "}
                        <span className="font-medium text-foreground">৳125,000</span> retainer
                        contract.
                      </p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all cursor-pointer flex items-start gap-3 group">
                    <div className="size-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <CalendarClock className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-foreground text-xs truncate">
                          Follow-up Scheduled
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                          1h ago
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px] leading-snug">
                        Follow-up call scheduled with GreenTech BD today at 3:00 PM.
                      </p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all cursor-pointer flex items-start gap-3 group">
                    <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <CreditCard className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-foreground text-xs truncate">
                          Payment Cleared
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                          3h ago
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px] leading-snug">
                        Payment of <span className="font-medium text-foreground">৳125,000</span>{" "}
                        credited for Invoice #INV-2026-801.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between px-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                  >
                    <CheckCheck className="size-3.5 text-[#67B239]" />
                    Mark all read
                  </Button>
                  <Link
                    href="/agent-activity"
                    className="text-[11px] font-medium text-[#67B239] hover:underline flex items-center gap-1"
                  >
                    View Activity <ArrowRight className="size-3" />
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 gap-1.5 px-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Avatar className="size-8.5 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                    <AvatarImage src={currentAvatarUrl || undefined} alt={name} />
                    <AvatarFallback className="bg-[#67B239] text-white text-[11px] font-bold">
                      {initials(name)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="truncate text-sm font-medium">{name}</p>
                  <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {role ?? "agent"}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <UserIcon className="mr-2 size-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void signOut()}>
                  <LogOut className="mr-2 size-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      <AccountSuspendedModal
        open={isSuspended}
        userName={name}
        userEmail={displayEmail}
        status={currentUserRecord?.status || "Inactive"}
      />
    </div>
  );
}
