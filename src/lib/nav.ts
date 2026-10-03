import {
  LayoutDashboard,
  Users2,
  CalendarDays,
  MessageSquarePlus,
  MessagesSquare,
  RadioTower,
  ReceiptText,
  BarChart3,
  Activity,
  UserCog,
  Package,
  Workflow,
  ScrollText,
  DatabaseBackup,
  ShieldCheck,
  FolderKanban,
  FileSpreadsheet,
  ShoppingCart,
  PhoneCall,
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
      { title: "Follow UP", url: "/follow-ups", icon: PhoneCall },
      { title: "Meetings", url: "/meetings", icon: CalendarDays },
      { title: "Quotations", url: "/quotations", icon: FileSpreadsheet },
      { title: "Orders", url: "/orders", icon: ShoppingCart },
      { title: "Projects", url: "/projects", icon: FolderKanban },
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
    items: [{ title: "Expenses", url: "/expenses", icon: ReceiptText }],
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
      { title: "Role Management", url: "/admin/roles", icon: ShieldCheck },
      { title: "Services", url: "/admin/services", icon: Package },
      { title: "SMS Gateway", url: "/admin/sms-gateway", icon: RadioTower },
      { title: "Agent Reports", url: "/admin/agent-reports", icon: Activity },
      { title: "Stage Management", url: "/admin/stages", icon: Workflow },
      { title: "Stage History", url: "/admin/stage-history", icon: ScrollText },
      { title: "Data Backup", url: "/admin/data-backup", icon: DatabaseBackup },
    ],
  },
];
