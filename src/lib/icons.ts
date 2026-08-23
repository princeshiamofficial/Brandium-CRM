export type CRMIconItem = {
  name: string;
  label: string;
  defaultColor: string;
  tags: string[];
};

export const CRM_STAGE_ICONS: CRMIconItem[] = [
  // Status & Success
  {
    name: "Circle",
    label: "Default Circle",
    defaultColor: "#3B82F6",
    tags: ["circle", "dot", "default"],
  },
  {
    name: "CheckCircle2",
    label: "Success Circle",
    defaultColor: "#10B981",
    tags: ["check", "done", "success", "won"],
  },
  {
    name: "CheckCircle",
    label: "Check Circle",
    defaultColor: "#10B981",
    tags: ["check", "complete", "won"],
  },
  { name: "Check", label: "Checkmark", defaultColor: "#059669", tags: ["check", "ok", "yes"] },
  {
    name: "Trophy",
    label: "Trophy (Won)",
    defaultColor: "#10B981",
    tags: ["trophy", "winner", "deal", "sales"],
  },
  {
    name: "Award",
    label: "Award Medal",
    defaultColor: "#F59E0B",
    tags: ["award", "reward", "star"],
  },
  {
    name: "BadgeCheck",
    label: "Verified Badge",
    defaultColor: "#0EA5E9",
    tags: ["verified", "check", "badge"],
  },
  { name: "Star", label: "Star", defaultColor: "#F59E0B", tags: ["star", "favorite", "vip"] },
  {
    name: "Sparkles",
    label: "Sparkles",
    defaultColor: "#EC4899",
    tags: ["magic", "ai", "new", "fresh"],
  },
  {
    name: "Flame",
    label: "Hot / Flame",
    defaultColor: "#F97316",
    tags: ["hot", "fire", "urgent", "lead"],
  },
  {
    name: "Zap",
    label: "Lightning",
    defaultColor: "#EAB308",
    tags: ["fast", "quick", "energy", "instant"],
  },
  {
    name: "Target",
    label: "Target / Goal",
    defaultColor: "#8B5CF6",
    tags: ["target", "aim", "goal", "kpi"],
  },
  {
    name: "TrendingUp",
    label: "Trending Up",
    defaultColor: "#10B981",
    tags: ["growth", "sales", "increase", "up"],
  },

  // Calls & Phone
  {
    name: "Phone",
    label: "Phone",
    defaultColor: "#3B82F6",
    tags: ["call", "contact", "telesales"],
  },
  {
    name: "PhoneCall",
    label: "Calling",
    defaultColor: "#2563EB",
    tags: ["active", "call", "inbound"],
  },
  {
    name: "PhoneForwarded",
    label: "Forward Call",
    defaultColor: "#6366F1",
    tags: ["transfer", "forward"],
  },
  {
    name: "PhoneOff",
    label: "Phone Off",
    defaultColor: "#64748B",
    tags: ["switched off", "unreachable", "off"],
  },
  {
    name: "PhoneMissed",
    label: "Missed Call",
    defaultColor: "#F43F5E",
    tags: ["dnp", "missed", "did not pick"],
  },

  // Schedules & Follow-ups
  {
    name: "Clock",
    label: "Clock",
    defaultColor: "#64748B",
    tags: ["time", "wait", "pending", "history"],
  },
  {
    name: "Calendar",
    label: "Calendar",
    defaultColor: "#3B82F6",
    tags: ["date", "event", "schedule"],
  },
  {
    name: "CalendarClock",
    label: "Scheduled Time",
    defaultColor: "#8B5CF6",
    tags: ["schedule", "follow up", "due"],
  },
  {
    name: "CalendarCheck",
    label: "Meeting Done",
    defaultColor: "#10B981",
    tags: ["meeting", "completed"],
  },
  {
    name: "CalendarDays",
    label: "Calendar Days",
    defaultColor: "#0284C7",
    tags: ["agenda", "week", "planner"],
  },
  { name: "Timer", label: "Timer", defaultColor: "#F59E0B", tags: ["countdown", "reminder"] },

  // Leads & People
  {
    name: "UserPlus",
    label: "New Lead",
    defaultColor: "#3B82F6",
    tags: ["new", "lead", "add user", "prospect"],
  },
  {
    name: "Users",
    label: "Clients / Team",
    defaultColor: "#6366F1",
    tags: ["people", "group", "prospects"],
  },
  {
    name: "UserCheck",
    label: "Qualified Lead",
    defaultColor: "#10B981",
    tags: ["approved", "user check"],
  },
  {
    name: "UserX",
    label: "Unqualified Lead",
    defaultColor: "#EF4444",
    tags: ["lost", "rejected", "remove"],
  },

  // Deals, Money & Quotations
  {
    name: "DollarSign",
    label: "Dollar / Revenue",
    defaultColor: "#059669",
    tags: ["money", "sales", "price"],
  },
  {
    name: "CreditCard",
    label: "Payment / Card",
    defaultColor: "#8B5CF6",
    tags: ["payment", "billing", "invoice"],
  },
  {
    name: "Receipt",
    label: "Receipt",
    defaultColor: "#10B981",
    tags: ["bill", "invoice", "payment"],
  },
  {
    name: "Wallet",
    label: "Wallet",
    defaultColor: "#0D9488",
    tags: ["finance", "balance"],
  },
  {
    name: "FileText",
    label: "Quotation / Note",
    defaultColor: "#6366F1",
    tags: ["quotation", "proposal", "doc"],
  },
  {
    name: "FileCheck",
    label: "Proposal Accepted",
    defaultColor: "#10B981",
    tags: ["proposal", "contract", "approved"],
  },
  {
    name: "Briefcase",
    label: "Deal / Business",
    defaultColor: "#8B5CF6",
    tags: ["opportunity", "business", "work"],
  },
  {
    name: "Building",
    label: "Enterprise / Company",
    defaultColor: "#475569",
    tags: ["company", "b2b", "corp"],
  },

  // Messaging & Outreach
  {
    name: "Send",
    label: "Sent Outreach",
    defaultColor: "#0284C7",
    tags: ["send", "sent", "quotation sent"],
  },
  {
    name: "Mail",
    label: "Email",
    defaultColor: "#3B82F6",
    tags: ["email", "letter", "inbox"],
  },
  {
    name: "MailCheck",
    label: "Email Read",
    defaultColor: "#10B981",
    tags: ["email check", "opened"],
  },
  {
    name: "MessageSquare",
    label: "Message / SMS",
    defaultColor: "#06B6D4",
    tags: ["chat", "sms", "whatsapp"],
  },
  {
    name: "MessageCircle",
    label: "Comment / Chat",
    defaultColor: "#0EA5E9",
    tags: ["chat", "discussion"],
  },

  // Lost & Disqualified
  {
    name: "XCircle",
    label: "Lost / Rejected",
    defaultColor: "#EF4444",
    tags: ["lost", "cancel", "fail", "no"],
  },
  {
    name: "Ban",
    label: "Denied / Blocked",
    defaultColor: "#DC2626",
    tags: ["denied", "not interested", "block"],
  },
  {
    name: "Slash",
    label: "Invalid Number",
    defaultColor: "#94A3B8",
    tags: ["invalid", "wrong number", "bad"],
  },
  {
    name: "AlertCircle",
    label: "Attention Needed",
    defaultColor: "#F59E0B",
    tags: ["alert", "warning", "attention"],
  },
  {
    name: "AlertTriangle",
    label: "High Risk",
    defaultColor: "#F97316",
    tags: ["danger", "risk", "warning"],
  },
  {
    name: "HelpCircle",
    label: "Needs Info",
    defaultColor: "#64748B",
    tags: ["question", "clarify", "info"],
  },

  // Miscellaneous
  {
    name: "Layers",
    label: "Pipeline Stage",
    defaultColor: "#6366F1",
    tags: ["stages", "workflow", "stack"],
  },
  {
    name: "ListChecks",
    label: "Task List",
    defaultColor: "#10B981",
    tags: ["tasks", "checklist", "todo"],
  },
  {
    name: "Tag",
    label: "Category / Tag",
    defaultColor: "#EC4899",
    tags: ["tag", "label", "segment"],
  },
  {
    name: "Bookmark",
    label: "Bookmarked",
    defaultColor: "#8B5CF6",
    tags: ["saved", "flag", "star"],
  },
  {
    name: "Shield",
    label: "Secure",
    defaultColor: "#3B82F6",
    tags: ["protection", "verified"],
  },
  {
    name: "ShieldCheck",
    label: "Guaranteed",
    defaultColor: "#10B981",
    tags: ["guarantee", "secure", "trust"],
  },
  {
    name: "Heart",
    label: "Loyal Client",
    defaultColor: "#F43F5E",
    tags: ["vip", "favorite", "love"],
  },
  {
    name: "RefreshCw",
    label: "Retargeting",
    defaultColor: "#06B6D4",
    tags: ["retry", "refresh", "recycle"],
  },
  {
    name: "Lightbulb",
    label: "Idea / Discovery",
    defaultColor: "#F59E0B",
    tags: ["idea", "insight", "solution"],
  },
  {
    name: "Flag",
    label: "Milestone Flag",
    defaultColor: "#EF4444",
    tags: ["flag", "milestone", "priority"],
  },
  {
    name: "Bell",
    label: "Notification",
    defaultColor: "#F59E0B",
    tags: ["alert", "reminder", "bell"],
  },
];

export function getIconDefaultColor(iconName?: string | null): string {
  if (!iconName) return "#3B82F6";
  const item = CRM_STAGE_ICONS.find((i) => i.name.toLowerCase() === iconName.toLowerCase());
  return item?.defaultColor || "#3B82F6";
}
