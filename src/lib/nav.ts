import {
  LayoutDashboard,
  Users2,
  Target,
  CalendarClock,
  CalendarDays,
  Trophy,
  BanknoteX,
  MessageSquarePlus,
  MessagesSquare,
  Receipt,
  Wallet,
  History,
  BarChart3,
  Activity,
  UserCog,
  Package,
  Workflow,
  ScrollText,
  DatabaseBackup,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  adminOnly?: boolean;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Prospects", url: "/prospects", icon: Users2 },
      { title: "Opportunities", url: "/opportunities", icon: Target },
      { title: "Follow Ups", url: "/follow-ups", icon: CalendarClock },
      { title: "Meetings", url: "/meetings", icon: CalendarDays },
      { title: "Won Sales", url: "/won-sales", icon: Trophy },
      { title: "Denied Payments", url: "/denied-payments", icon: BanknoteX },
    ],
  },
  {
    label: "Communication",
    items: [
      { title: "Send SMS", url: "/sms/send", icon: MessageSquarePlus },
      { title: "SMS Logs", url: "/sms/logs", icon: MessagesSquare },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Billing", url: "/billing", icon: Receipt },
      { title: "Client Balances", url: "/client-balances", icon: Wallet },
      { title: "Billing History", url: "/billing-history", icon: History },
    ],
  },
  {
    label: "Analytics",
    items: [
      { title: "Reports", url: "/reports", icon: BarChart3 },
      { title: "Agent Activity", url: "/agent-activity", icon: Activity },
    ],
  },
  {
    label: "Administration",
    adminOnly: true,
    items: [
      { title: "Users", url: "/admin/users", icon: UserCog },
      { title: "Services", url: "/admin/services", icon: Package },
      { title: "Agent Reports", url: "/admin/agent-reports", icon: Activity },
      { title: "Stage Management", url: "/admin/stages", icon: Workflow },
      { title: "Stage History", url: "/admin/stage-history", icon: ScrollText },
      { title: "Data Backup", url: "/admin/data-backup", icon: DatabaseBackup },
    ],
  },
];
