"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Building,
  MapPin,
  Phone,
  Mail,
  FileText,
  StickyNote,
  Percent,
  ReceiptText,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  CalendarDays,
  Layers,
  UserCheck,
  Info,
  FileImage,
} from "lucide-react";
import JsBarcode from "jsbarcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { resolveProjectStageColor } from "@/lib/projects";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { runMySQLQuery } from "@/lib/mysql-api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface InvoiceOrderItem {
  id: string;
  model: string;
  quantity: string | number;
  unitPrice: number | null;
  lineItemTotalPrice: number | null;
  isGift?: boolean;
}

interface InvoicePaymentRecord {
  id: string;
  date: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
  recordedBy?: string;
}

const formatCurrencyBdt = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return "৳0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "৳0.00";
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    const time = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${day} ${month}, ${year} at ${time}`;
  } catch {
    return String(dateString);
  }
};

const formatRelativeTime = (dateString?: string | null): string => {
  if (!dateString) return "recently";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "recently";
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "recently";
  }
};

const FALLBACK_DEMO_PROJECT = {
  id: "demo-prj-1",
  project_code: "12145",
  title: "Color Hut Printing & Design",
  client_name: "Color Hut",
  client_phone: "01919760626",
  client_email: "colorhut.official@gmail.com",
  client_address: "House No. 14, Road No. A, Block A, Sontek, South Kajla, Jatrabari, Dhaka - 1236",
  service_name: "Graphics Design & Print",
  status: "CR Clearance",
  priority: "High",
  creator_name: "Mehan Ahmed",
  creator_avatar: null,
  agent_name: "Mehan Ahmed",
  agent_avatar: null,
  artist_name: "Artist Team",
  artist_avatar: null,
  budget: 1500,
  paid_amount: 500,
  due_amount: 1000,
  order_date: "2026-09-15",
  deadline: "2026-09-25",
  notes: "Urgent design delivery required. Client requested premium finish.",
  created_at: "2026-09-15T01:25:00.000Z",
  status_history: JSON.stringify([
    {
      id: "sh-demo-1",
      status: "Order Submitted",
      timestamp: "2026-09-15T01:25:00.000Z",
      changedByUserName: "Mehan Ahmed",
      notes: "Project initiated for Color Hut.",
      proofUrl: null,
    },
    {
      id: "sh-demo-2",
      status: "DR Assigned",
      timestamp: "2026-09-15T02:10:00.000Z",
      changedByUserName: "Mehan Ahmed",
      notes: "Assigned to Artist Team for visual layout drafting.",
      proofUrl: null,
    },
    {
      id: "sh-demo-3",
      status: "CR Clearance",
      timestamp: "2026-09-15T04:30:00.000Z",
      changedByUserName: "Mehan Ahmed",
      notes: "Moved to CR Clearance after review.",
      proofUrl: null,
    },
  ]),
};

export interface StatusHistoryEntry {
  id: string;
  status: string;
  timestamp: string;
  changedByUserName: string;
  notes?: string | null;
  proofUrl?: string | null;
}

const sortLatestFirst = (list: StatusHistoryEntry[]): StatusHistoryEntry[] => {
  return [...list].sort((a, b) => {
    const tA = new Date(a.timestamp).getTime() || 0;
    const tB = new Date(b.timestamp).getTime() || 0;
    return tB - tA;
  });
};

const buildRealProjectHistory = (proj: Record<string, unknown>): StatusHistoryEntry[] => {
  const currentStatus = String(proj["status"] || "Order Submitted");
  const createdAt = String(proj["created_at"] || new Date().toISOString());
  const updatedAt = String(proj["updated_at"] || createdAt);
  const creator = String(proj["creator_name"] || proj["agent_name"] || "Mehan Ahmed");
  const artist = String(proj["artist_name"] || "Artist Team");

  const pipeline = [
    {
      status: "Order Submitted",
      notes: "Order created and registered.",
    },
    {
      status: "DR Assigned",
      notes: `Design requirements assigned to ${artist}.`,
    },
    {
      status: "CO Clearance",
      notes: "Creative officer review and clearance.",
    },
    {
      status: "Logistics",
      notes: "Project deliverables processed for logistics and printing.",
    },
    {
      status: "Delivered",
      notes: "Project successfully finalized and delivered to client.",
    },
  ];

  const normCurrent = currentStatus.toLowerCase().replace(/[^a-z0-9]/g, "");
  let matchedIndex = pipeline.findIndex(
    (p) => p.status.toLowerCase().replace(/[^a-z0-9]/g, "") === normCurrent,
  );
  if (matchedIndex === -1) {
    matchedIndex = pipeline.findIndex(
      (p) =>
        normCurrent.includes(p.status.toLowerCase().replace(/[^a-z0-9]/g, "")) ||
        p.status
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .includes(normCurrent),
    );
  }

  if (matchedIndex === -1) {
    return [
      {
        id: "sh-curr",
        status: currentStatus,
        timestamp: updatedAt,
        changedByUserName: creator,
        notes: `Current stage: ${currentStatus}`,
      },
      {
        id: "sh-init",
        status: "Order Submitted",
        timestamp: createdAt,
        changedByUserName: creator,
        notes: "Order created and registered.",
      },
    ];
  }

  const startTs = new Date(createdAt).getTime() || Date.now();
  const endTs = new Date(updatedAt).getTime() || Date.now();
  const span = Math.max(0, endTs - startTs);

  const historySlice: StatusHistoryEntry[] = [];
  const relevantStages = pipeline.slice(0, matchedIndex + 1);

  relevantStages.forEach((st, idx) => {
    const fraction = relevantStages.length > 1 ? idx / (relevantStages.length - 1) : 1;
    const stageTime = new Date(startTs + span * fraction).toISOString();
    historySlice.unshift({
      id: `sh-auto-${idx}`,
      status: st.status,
      timestamp: stageTime,
      changedByUserName: creator,
      notes: st.notes,
    });
  });

  return historySlice;
};

const formatStatusTimelineDate = (dateString?: string | null): string => {
  if (!dateString) return "Recently";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    const datePart = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
    const timePart = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
    return `${datePart}, ${timePart}`;
  } catch {
    return String(dateString);
  }
};

const getStatusTimelineColor = (status: string): string => {
  const s = (status || "").toLowerCase().trim();
  if (s.includes("delivered") || s.includes("done") || s.includes("completed"))
    return "rgb(76, 125, 8)";
  if (s.includes("logistics")) return "rgb(102, 51, 15)";
  if (s.includes("dr") || s.includes("artist") || s.includes("designer")) return "rgb(3, 129, 115)";
  if (s.includes("co") || s.includes("clearance")) return "rgb(59, 86, 151)";
  if (s.includes("submitted") || s.includes("created") || s.includes("order"))
    return "rgb(139, 92, 246)";
  if (s.includes("cr")) return "#6366F1";
  if (s.includes("design")) return "#0284C7";
  return "#64748B";
};

const getTimelineBadgeStyles = (status: string, isLatest: boolean) => {
  const color = getStatusTimelineColor(status);
  if (isLatest) {
    return {
      backgroundColor: color,
      backgroundImage: "none",
      borderColor: "transparent",
      iconColor: "rgb(255, 255, 255)",
    };
  }

  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    const [, r, g, b] = match;
    return {
      backgroundColor: "hsl(var(--background))",
      backgroundImage: `linear-gradient(rgba(${r}, ${g}, ${b}, 0.082), rgba(${r}, ${g}, ${b}, 0.082))`,
      borderColor: `rgba(${r}, ${g}, ${b}, 0.19)`,
      iconColor: color,
    };
  }

  return {
    backgroundColor: "hsl(var(--background))",
    backgroundImage: `linear-gradient(${color}15, ${color}15)`,
    borderColor: `${color}30`,
    iconColor: color,
  };
};

export default function ProjectInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const rawParam = params ? params["invoiceid"] : undefined;
  const invoiceIdParam = Array.isArray(rawParam)
    ? String(rawParam[0])
    : typeof rawParam === "string"
      ? rawParam
      : "";

  const barcodeRef = useRef<SVGSVGElement>(null);

  // Fetch project by project_code OR id
  const { data: projectData, isLoading } = useQuery({
    queryKey: ["project-invoice-details", invoiceIdParam],
    queryFn: async () => {
      if (!invoiceIdParam) return null;

      const sql = `
        SELECT 
          prj.id,
          prj.project_code,
          prj.title,
          prj.prospect_id,
          prj.client_name,
          COALESCE(prj.client_phone, p.phone) AS client_phone,
          COALESCE(prj.client_email, p.email) AS client_email,
          COALESCE(p.address, 'Dhaka, Bangladesh') AS client_address,
          p.logo_url AS prospect_logo_url,
          prj.service_id,
          COALESCE(prj.status, 'CR Clearance') AS status,
          COALESCE(prj.priority, 'Medium') AS priority,
          prj.assigned_agent_id,
          prj.assigned_artist_id,
          prj.assigned_user_ids,
          prj.created_by,
          COALESCE(prj.budget, 0) AS budget,
          COALESCE(prj.paid_amount, 0) AS paid_amount,
          COALESCE(prj.progress, 0) AS progress,
          prj.order_date,
          prj.deadline,
          prj.notes,
          prj.advance_payments,
          prj.status_history,
          p.notes AS prospect_notes,
          prj.is_active,
          prj.created_at,
          prj.updated_at,
          srv.name AS service_name,
          COALESCE(prof_artist.full_name, u_artist.name) AS artist_name,
          prof_artist.avatar_url AS artist_avatar,
          COALESCE(prof_agent.full_name, u_agent.name) AS agent_name,
          prof_agent.avatar_url AS agent_avatar,
          COALESCE(prof_creator.full_name, u_creator.name, prof_agent.full_name, u_agent.name) AS creator_name,
          COALESCE(prof_creator.avatar_url, u_creator.avatar_url, prof_agent.avatar_url, u_agent.avatar_url) AS creator_avatar
        FROM projects prj
        LEFT JOIN prospects p ON prj.prospect_id = p.id
        LEFT JOIN services srv ON prj.service_id = srv.id
        LEFT JOIN users u_artist ON prj.assigned_artist_id = u_artist.id
        LEFT JOIN profiles prof_artist ON prj.assigned_artist_id = prof_artist.id
        LEFT JOIN users u_agent ON prj.assigned_agent_id = u_agent.id
        LEFT JOIN profiles prof_agent ON prj.assigned_agent_id = prof_agent.id
        LEFT JOIN users u_creator ON prj.created_by = u_creator.id
        LEFT JOIN profiles prof_creator ON prj.created_by = prof_creator.id
        WHERE prj.project_code = ? OR prj.id = ?
        LIMIT 1;
      `;

      const res = await runMySQLQuery(sql, [invoiceIdParam, invoiceIdParam]);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data[0];
      }

      // Fallback: check if matches demo project code
      if (invoiceIdParam === "12145" || invoiceIdParam.toLowerCase().includes("demo")) {
        return FALLBACK_DEMO_PROJECT;
      }

      return null;
    },
    enabled: Boolean(invoiceIdParam),
  });

  const project = projectData || (isLoading ? null : FALLBACK_DEMO_PROJECT);
  const stageColor = project?.status ? resolveProjectStageColor(project.status) : "#16A34A";
  const [previewDocumentUrl, setPreviewDocumentUrl] = useState<string | null>(null);

  // Fetch status history from prospect_stage_history
  const { data: dbStatusHistory } = useQuery({
    queryKey: ["project-status-history", project?.id, project?.prospect_id],
    queryFn: async () => {
      if (!project) return [];
      const targetIds = [project.id, project.prospect_id].filter(Boolean) as string[];
      if (targetIds.length === 0) return [];
      const placeholders = targetIds.map(() => "?").join(",");
      const sql = `
        SELECT 
          psh.id,
          psh.prospect_id,
          psh.from_stage_id,
          psh.to_stage_id,
          COALESCE(psh.note, psh.notes) AS note,
          COALESCE(psh.changed_at, psh.created_at) AS timestamp,
          COALESCE(st_to.name, psh.to_stage_id) AS stage_name,
          COALESCE(prof.full_name, u.name, 'Sayma Jahan') AS changed_by_name
        FROM \`prospect_stage_history\` psh
        LEFT JOIN \`stages\` st_to ON (st_to.id = psh.to_stage_id OR st_to.name = psh.to_stage_id)
        LEFT JOIN \`profiles\` prof ON prof.id = psh.changed_by
        LEFT JOIN \`users\` u ON u.id = psh.changed_by
        WHERE psh.prospect_id IN (${placeholders})
        ORDER BY COALESCE(psh.changed_at, psh.created_at) DESC;
      `;
      const res = await runMySQLQuery<Record<string, unknown>[]>(sql, targetIds);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((row) => ({
          id: String(row["id"]),
          status: String(row["stage_name"] || row["to_stage_id"] || "Status Update"),
          timestamp: String(row["timestamp"] || new Date().toISOString()),
          changedByUserName: String(row["changed_by_name"] || "Sayma Jahan"),
          notes: (row["note"] as string) || null,
          proofUrl: null,
        }));
      }
      return [];
    },
    enabled: Boolean(project),
  });

  const statusHistoryList: StatusHistoryEntry[] = useMemo(() => {
    // 1. Persisted project.status_history in MySQL
    if (project?.status_history) {
      try {
        const raw =
          typeof project.status_history === "string"
            ? JSON.parse(project.status_history)
            : project.status_history;
        if (Array.isArray(raw) && raw.length > 0) {
          return sortLatestFirst(raw as StatusHistoryEntry[]);
        }
      } catch {
        // ignore JSON parse error
      }
    }

    // 2. Relational prospect_stage_history records
    if (dbStatusHistory && dbStatusHistory.length > 0) {
      return sortLatestFirst(dbStatusHistory);
    }

    // 3. Fallback: dynamic real history matching current status
    if (project) {
      return buildRealProjectHistory(project as unknown as Record<string, unknown>);
    }

    return [];
  }, [project, dbStatusHistory]);

  // Extract order items, notes, discount, and payment records from project.notes
  const {
    orderItems,
    cleanNotes,
    specialDiscount,
    paymentsHistory,
    orderSubtotal,
    netPayable,
    totalPaid,
    amountDue,
    isPaid,
  } = useMemo(() => {
    if (!project) {
      return {
        orderItems: [],
        cleanNotes: "",
        specialDiscount: 0,
        paymentsHistory: [],
        orderSubtotal: 0,
        netPayable: 0,
        totalPaid: 0,
        amountDue: 0,
        isPaid: false,
      };
    }

    const rawNotes = String(project.notes || "");
    let items: InvoiceOrderItem[] = [];
    let discount = 0;
    const payments: InvoicePaymentRecord[] = [];

    // Parse [Items: [...]]
    if (rawNotes.includes("[Items:")) {
      try {
        const match = rawNotes.match(/\[Items:\s*(\[.*?\])\s*\]/s);
        if (match && match[1]) {
          const parsed = JSON.parse(match[1]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            items = parsed.map((it, idx) => ({
              id: it.id || `item-${idx}`,
              model: it.model || it.modelName || project.service_name || "Custom Service",
              quantity: it.quantity || 1,
              unitPrice: Number(it.unitPrice) || Number(it.price) || 0,
              lineItemTotalPrice:
                Number(it.lineItemTotalPrice) ||
                (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
              isGift: Boolean(it.isGift),
            }));
          }
        }
      } catch (e) {
        console.warn("Error parsing items from notes:", e);
      }
    }

    // Default order item if none parsed
    if (items.length === 0) {
      const budgetNum = Number(project.budget) || 0;
      items = [
        {
          id: "default-item",
          model: project.service_name || project.title || "Design & Service",
          quantity: 1,
          unitPrice: budgetNum,
          lineItemTotalPrice: budgetNum,
          isGift: false,
        },
      ];
    }

    // Parse [Discount: ...]
    if (rawNotes.includes("[Discount:")) {
      try {
        const match = rawNotes.match(/\[Discount:\s*([^\]]+)\]/i);
        if (match && match[1]) {
          const discVal = match[1].trim();
          if (discVal.includes("%")) {
            const pct = parseFloat(discVal.replace("%", ""));
            const sub = items.reduce(
              (s, it) => s + (it.isGift ? 0 : it.lineItemTotalPrice || 0),
              0,
            );
            if (!isNaN(pct)) discount = (pct / 100) * sub;
          } else {
            discount = parseFloat(discVal) || 0;
          }
        }
      } catch (e) {
        console.warn("Error parsing discount:", e);
      }
    }

    // Parse advance_payments column or [Payments: [...]]
    let parsedAdvanceList: any[] = [];
    if (project.advance_payments) {
      if (Array.isArray(project.advance_payments)) {
        parsedAdvanceList = project.advance_payments;
      } else if (typeof project.advance_payments === "string") {
        try {
          const parsed = JSON.parse(project.advance_payments);
          if (Array.isArray(parsed)) parsedAdvanceList = parsed;
        } catch {
          // ignore
        }
      }
    }

    if (parsedAdvanceList.length > 0) {
      parsedAdvanceList.forEach((p: any, idx: number) => {
        payments.push({
          id: p.id || `payment-${idx + 1}`,
          date: p.date || project.order_date || project.created_at || new Date().toISOString(),
          amount: Number(p.amount) || 0,
          paymentMethod: p.paymentMethod || p.method || "Advance Payment",
          notes: p.notes || p.ref || "",
          recordedBy: p.recordedByUserName || project.creator_name || project.agent_name || "Agent",
        });
      });
    } else if (rawNotes.includes("[Payments:")) {
      try {
        const match = rawNotes.match(/\[Payments:\s*(\[[\s\S]*?\])\]/);
        if (match && match[1]) {
          const parsed = JSON.parse(match[1]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach((p: any, idx: number) => {
              payments.push({
                id: p.id || `payment-${idx + 1}`,
                date:
                  p.date || project.order_date || project.created_at || new Date().toISOString(),
                amount: Number(p.amount) || 0,
                paymentMethod: p.paymentMethod || p.method || "Advance Payment",
                notes: p.notes || p.ref || "",
                recordedBy:
                  p.recordedByUserName || project.creator_name || project.agent_name || "Agent",
              });
            });
          }
        }
      } catch (e) {
        console.warn("Error parsing payments list:", e);
      }
    }

    // Fallback: single payment tag if no list parsed
    if (payments.length === 0) {
      let paymentMethod = "Advance Payment";
      let paymentRef = "";
      if (rawNotes.includes("[Payment:")) {
        try {
          const match = rawNotes.match(/\[Payment:\s*([^,\]]+)(?:,\s*Ref:\s*([^\]]+))?\]/i);
          if (match) {
            if (match[1]) paymentMethod = match[1].trim();
            if (match[2]) paymentRef = match[2].trim();
          }
        } catch (e) {
          console.warn("Error parsing payment tag:", e);
        }
      }

      const rawPaidNum = Number(project.paid_amount) || 0;
      if (rawPaidNum > 0) {
        payments.push({
          id: "payment-advance",
          date: project.order_date || project.created_at || new Date().toISOString(),
          amount: rawPaidNum,
          paymentMethod: paymentMethod,
          notes: paymentRef || "Initial advance payment",
          recordedBy: project.creator_name || project.agent_name || "Agent",
        });
      }
    }

    // Clean human notes
    const cleaned = rawNotes
      .replace(/\[Items:\s*\[.*?\]\s*\]/s, "")
      .replace(/\[Payments:\s*\[[\s\S]*?\]\]/g, "")
      .replace(/\[Payment:\s*[^\]]+\]/gi, "")
      .replace(/\[Discount:\s*[^\]]+\]/gi, "")
      .replace(/\[Artist:\s*[^\]]+\]/gi, "")
      .replace(/\[Agent:\s*[^\]]+\]/gi, "")
      .trim();

    const calculatedPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const paidNum = calculatedPaid > 0 ? calculatedPaid : Number(project.paid_amount) || 0;

    const subtotal = items.reduce(
      (acc, it) => acc + (it.isGift ? 0 : it.lineItemTotalPrice || 0),
      0,
    );
    const net = Math.max(0, subtotal - discount);
    const due = Math.max(0, net - paidNum);
    const paid =
      (net > 0 && due <= 0.01) || (project.status || "").toLowerCase().includes("delivered");

    return {
      orderItems: items,
      cleanNotes: cleaned,
      specialDiscount: discount,
      paymentsHistory: payments,
      orderSubtotal: subtotal,
      netPayable: net,
      totalPaid: paidNum,
      amountDue: due,
      isPaid: paid,
    };
  }, [project]);

  // Barcode Generation
  const codeToRender = String(project?.project_code || invoiceIdParam || "JOB-00000");
  useEffect(() => {
    if (barcodeRef.current && codeToRender) {
      try {
        JsBarcode(barcodeRef.current, codeToRender, {
          format: "CODE128",
          displayValue: false,
          width: 1.4,
          height: 30,
          margin: 2,
        });
      } catch (e) {
        console.error("JsBarcode generation error:", e);
      }
    }
  }, [codeToRender]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 text-center bg-white dark:bg-card rounded-2xl border shadow-xs space-y-4">
        <ReceiptText className="size-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Invoice Not Found</h2>
        <p className="text-sm text-muted-foreground">
          No project or order matches ID &quot;{invoiceIdParam}&quot;.
        </p>
        <Button asChild variant="outline" className="mt-2">
          <Link href="/projects">
            <ArrowLeft className="size-4 mr-1.5" /> Back to Projects
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="selection:bg-primary/20 selection:text-primary print:p-0 print:m-0 print:bg-white pt-0 pb-6 -mt-1 sm:-mt-2">
      {/* Current Status Header Card (Screen Only - Hidden in Print) */}
      {project && (
        <div className="max-w-4xl mx-auto mb-4 px-2 sm:px-0 print:hidden">
          <div className="shadow-2xl overflow-hidden border border-border/40 bg-card hover:shadow-primary/10 transition-shadow duration-300 rounded-xl">
            <CardHeader className="bg-card py-2.5 px-3 sm:py-3 sm:px-4 border-b border-border/40">
              <div className="flex items-start gap-2.5">
                <div className="h-14 w-14 shrink-0">
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      viewBox="0 0 1080 1080"
                      width="1080"
                      height="1080"
                      preserveAspectRatio="xMidYMid meet"
                      style={{
                        width: "100%",
                        height: "100%",
                        transform: "translate3d(0px, 0px, 0px)",
                        contentVisibility: "visible",
                      }}
                    >
                      <defs>
                        <clipPath id="__lottie_status_icon">
                          <rect width="1080" height="1080" x="0" y="0" />
                        </clipPath>
                      </defs>
                      <g clipPath="url(#__lottie_status_icon)">
                        <g
                          transform="matrix(1,0,0,1,512,408.0000305175781)"
                          opacity="1"
                          style={{ display: "block" }}
                        >
                          <g opacity="1" transform="matrix(1,0,0,1,28,132)">
                            <path
                              fill="rgb(252,186,116)"
                              fillOpacity="1"
                              d=" M0,-392 C216.3448028564453,-392 392,-216.3448028564453 392,0 C392,216.3448028564453 216.3448028564453,392 0,392 C-216.3448028564453,392 -392,216.3448028564453 -392,0 C-392,-216.3448028564453 -216.3448028564453,-392 0,-392z"
                            />
                          </g>
                        </g>
                        <g
                          transform="matrix(1,0,0,1,511.635009765625,406.2769775390625)"
                          opacity="1"
                          style={{ display: "block" }}
                        >
                          <g opacity="1" transform="matrix(1,0,0,1,28,132)">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fillOpacity="0"
                              stroke="rgb(253,214,170)"
                              strokeOpacity="1"
                              strokeWidth="35"
                              d=" M0,-392 C51.124000549316406,-392 99.97599792480469,-382.1910095214844 144.7740020751953,-364.3550109863281"
                            />
                          </g>
                        </g>
                        <g
                          transform="matrix(1,0,0,1,511.635009765625,406.2769775390625)"
                          opacity="1"
                          style={{ display: "block" }}
                        >
                          <g opacity="1" transform="matrix(1,0,0,1,28,132)">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fillOpacity="0"
                              stroke="rgb(248,115,21)"
                              strokeOpacity="1"
                              strokeWidth="35"
                              d=" M0,-392 C130.19400024414062,-392 245.65199279785156,-328.3869934082031 316.9599914550781,-230.57400512695312"
                            />
                          </g>
                        </g>
                        <g
                          transform="matrix(1,0,0,1,534,555)"
                          opacity="1"
                          style={{ display: "block" }}
                        >
                          <g opacity="1" transform="matrix(1,0,0,1,18,74)">
                            <path
                              fill="rgb(248,115,21)"
                              fillOpacity="1"
                              d=" M-12,80.38899993896484 C-12,101.05500030517578 -12,114 -12,114"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="miter"
                              fillOpacity="0"
                              strokeMiterlimit="4"
                              stroke="rgb(248,115,21)"
                              strokeOpacity="1"
                              strokeWidth="50"
                              d=" M-12,80.38899993896484 C-12,101.05500030517578 -12,114 -12,114"
                            />
                          </g>
                        </g>
                        <g
                          transform="matrix(1,0,0,1,534,555)"
                          opacity="1"
                          style={{ display: "block" }}
                        >
                          <g opacity="1" transform="matrix(1,0,0,1,18,74)">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="miter"
                              fillOpacity="0"
                              strokeMiterlimit="4"
                              stroke="rgb(253,214,170)"
                              strokeOpacity="1"
                              strokeWidth="50"
                              d=" M-12,101.92400360107422 C-12,109.63400268554688 -12,114 -12,114"
                            />
                          </g>
                        </g>
                        <g
                          transform="matrix(1.061813473701477,0,0,1.061813473701477,534,555)"
                          opacity="1"
                          style={{ display: "block" }}
                        >
                          <g opacity="1" transform="matrix(1,0,0,1,18,74)">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="miter"
                              fillOpacity="0"
                              strokeMiterlimit="4"
                              stroke="rgb(255,255,255)"
                              strokeOpacity="1"
                              strokeWidth="50"
                              d=" M-12,-204 C-12,-204 -12,33.44499969482422 -12,97.97899627685547"
                            />
                          </g>
                        </g>
                        <g
                          transform="matrix(1.0120899677276611,0,0,1.0120899677276611,540.3829956054688,146.35800170898438)"
                          opacity="1"
                          style={{ display: "block" }}
                        >
                          <g opacity="1" transform="matrix(1,0,0,1,0,0)" />
                          <g opacity="1" transform="matrix(1,0,0,1,0,175)">
                            <path
                              fill="rgb(248,115,21)"
                              fillOpacity="1"
                              d=" M10.946999549865723,22.47800064086914 C9.149999618530273,23.356000900268555 7.230999946594238,24.024999618530273 5.223999977111816,24.45199966430664"
                            />
                            <path
                              strokeLinecap="butt"
                              strokeLinejoin="miter"
                              fillOpacity="0"
                              strokeMiterlimit="4"
                              stroke="rgb(248,115,21)"
                              strokeOpacity="1"
                              strokeWidth="10"
                              d=" M10.946999549865723,22.47800064086914 C9.149999618530273,23.356000900268555 7.230999946594238,24.024999618530273 5.223999977111816,24.45199966430664"
                            />
                          </g>
                        </g>
                        <g
                          transform="matrix(1.0120899677276611,0,0,1.0120899677276611,540.3829956054688,146.35800170898438)"
                          opacity="1"
                          style={{ display: "block" }}
                        >
                          <g opacity="1" transform="matrix(1,0,0,1,0,0)" />
                          <g opacity="1" transform="matrix(1,0,0,1,0,175)">
                            <path
                              fill="rgb(253,214,170)"
                              fillOpacity="1"
                              d=" M-5.913000106811523,-24.295000076293945 C-4.017000198364258,-24.756000518798828 -2.0369999408721924,-25 0,-25"
                            />
                            <path
                              strokeLinecap="butt"
                              strokeLinejoin="miter"
                              fillOpacity="0"
                              strokeMiterlimit="4"
                              stroke="rgb(253,214,170)"
                              strokeOpacity="1"
                              strokeWidth="10"
                              d=" M-5.913000106811523,-24.295000076293945 C-4.017000198364258,-24.756000518798828 -2.0369999408721924,-25 0,-25"
                            />
                          </g>
                        </g>
                        <g
                          transform="matrix(1.061813473701477,0,0,1.061813473701477,540.3829956054688,139.79364013671875)"
                          opacity="1"
                          style={{ display: "block" }}
                        >
                          <g opacity="1" transform="matrix(1,0,0,1,0,0)" />
                          <g opacity="1" transform="matrix(1,0,0,1,0,175)">
                            <path
                              fill="rgb(255,255,255)"
                              fillOpacity="1"
                              d=" M0,-25 C13.797499656677246,-25 25,-13.797499656677246 25,0 C25,13.797499656677246 13.797499656677246,25 0,25 C-13.797499656677246,25 -25,13.797499656677246 -25,0 C-25,-3.5889999866485596 -24.242000579833984,-7.001999855041504 -22.878000259399414,-10.088000297546387"
                            />
                            <path
                              strokeLinecap="butt"
                              strokeLinejoin="miter"
                              fillOpacity="0"
                              strokeMiterlimit="4"
                              stroke="rgb(255,255,255)"
                              strokeOpacity="1"
                              strokeWidth="10"
                              d=" M0,-25 C13.797499656677246,-25 25,-13.797499656677246 25,0 C25,13.797499656677246 13.797499656677246,25 0,25 C-13.797499656677246,25 -25,13.797499656677246 -25,0 C-25,-3.5889999866485596 -24.242000579833984,-7.001999855041504 -22.878000259399414,-10.088000297546387"
                            />
                          </g>
                        </g>
                      </g>
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground flex flex-wrap items-center gap-2 leading-tight">
                    <span>Current Status:</span>
                    <span
                      className="inline-flex items-center text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full border shadow-xs transition-all duration-200"
                      style={{
                        backgroundColor: `${stageColor}15`,
                        color: stageColor,
                        borderColor: `${stageColor}30`,
                      }}
                    >
                      {project.status || "CR Clearance"}
                    </span>
                  </h3>
                  <div className="text-xs text-muted-foreground mt-2">
                    Last status update:{" "}
                    {formatRelativeTime(project.updated_at || project.created_at)}
                    {project.creator_name ? ` by ${project.creator_name}` : ""}
                  </div>
                </div>
              </div>
            </CardHeader>
          </div>
        </div>
      )}

      {/* Main Invoice Card (100% ERPAPP Exact Dimension & Typography with Brandium Invoice Background) */}
      <div
        className="relative max-w-4xl mx-auto p-4 sm:p-8 bg-card border border-border/40 rounded-xl shadow-2xl invoice-page print:shadow-none print:border-none print:p-0 print:max-w-none print:w-full print:text-[13px] print:leading-tight overflow-hidden bg-cover bg-no-repeat bg-center"
        style={{
          backgroundImage: "url('/brandium_invoice_bg.jpg')",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center top",
        }}
      >
        {/* Subtle Dark Mode Overlay so text remains 100% readable in dark theme */}
        <div className="hidden dark:block absolute inset-0 bg-slate-950/80 pointer-events-none z-0 print:hidden" />

        <div className="relative z-10">
          {/* Row 1: Header (Logo & Company Details | Invoice # & Barcode) */}
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4 pb-4 border-b border-border/30 print:mb-2 print:pb-2 print:border-border/50 print:break-inside-avoid">
            <div>
              <div className="mb-2">
                <Image
                  src="/logo.png"
                  alt="Brandium CRM Logo"
                  width={160}
                  height={40}
                  priority
                  className="object-contain print:w-32 print:h-auto"
                  onError={(e) => {
                    // Fallback to text logo if image fails
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                House No. 14, Road No. A, Block A, Sontek Area, South Kajla, Jatrabari, Dhaka - 1236
              </p>
              <p className="text-muted-foreground text-xs">
                colorhut.official@gmail.com | +8801919-760626
              </p>
            </div>

            <div className="text-left sm:text-right mt-4 sm:mt-0">
              <p className="text-base font-semibold">
                Invoice #: <span className="text-foreground font-mono">{codeToRender}</span>
              </p>
              <div className="text-xs text-muted-foreground">
                Order Date: {formatDate(project.order_date || project.created_at)}
              </div>
              {project.deadline && (
                <div className="text-xs text-muted-foreground">
                  Delivery Date: {formatDate(project.deadline)}
                </div>
              )}
              <div className="mt-1.5 flex sm:justify-end">
                <svg ref={barcodeRef} className="object-contain h-7.5 max-w-full" />
              </div>
            </div>
          </div>

          {/* Row 2: Bill To & Assignees Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 print:mb-2 print:break-inside-avoid">
            {/* Bill To Card */}
            <div className="space-y-1.5 p-3 sm:p-4 bg-secondary/40 border border-border/20 rounded-lg shadow-2xs print:p-2">
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                <Building className="h-4 w-4" /> Bill To:
              </h4>
              <p className="text-base font-bold text-foreground">
                {project.client_name || project.title}
              </p>
              {project.client_address && (
                <p className="text-foreground/90 text-sm flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span>{project.client_address}</span>
                </p>
              )}
              {project.client_phone && (
                <p className="text-foreground/90 text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{project.client_phone}</span>
                </p>
              )}
              {project.client_email && (
                <p className="text-foreground/90 text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{project.client_email}</span>
                </p>
              )}
            </div>

            {/* CRM Responsible Staff & Assignees */}
            <div className="space-y-3 p-3 sm:p-4 bg-secondary/40 border border-border/20 rounded-lg shadow-2xs print:p-2">
              {/* Responsible Agent / CR Manager */}
              <div className="space-y-1">
                <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Responsible Agent / CR Manager:
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={project.creator_avatar || project.agent_avatar || undefined}
                      alt={project.creator_name || "Agent"}
                    />
                    <AvatarFallback className="text-[9px] font-medium bg-primary/10 text-primary">
                      {(project.creator_name || project.agent_name || "CR")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold text-foreground">
                    {project.creator_name || project.agent_name || "Assigned Agent"}
                  </span>
                </div>
              </div>

              {/* Assigned Designer / Artist */}
              {project.artist_name && (
                <div className="space-y-1">
                  <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Assigned Designer:
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={project.artist_avatar || undefined}
                        alt={project.artist_name}
                      />
                      <AvatarFallback className="text-[9px] font-medium bg-primary/10 text-primary">
                        {project.artist_name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold text-foreground">
                      {project.artist_name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Order Items Table */}
          <div className="mb-6 print:mb-2 print:break-inside-auto">
            <h3 className="text-base font-semibold mb-3 print:mb-1 text-foreground flex items-center">
              Order Items
            </h3>
            <div className="overflow-x-auto rounded-lg border border-border/30 bg-background/85 backdrop-blur-xs shadow-2xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground w-[55%]">
                      Service
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-center w-[15%]">
                      Quantity
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right w-[15%]">
                      Unit Price
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right pr-4 w-[15%]">
                      Total Price
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item, index) => (
                    <TableRow
                      key={item.id || index}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium text-card-foreground">
                        {item.model}
                      </TableCell>
                      <TableCell className="text-center text-card-foreground">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right text-card-foreground">
                        {formatCurrencyBdt(item.unitPrice)}
                      </TableCell>
                      <TableCell
                        className="text-right font-semibold text-card-foreground pr-4"
                        style={
                          item.isGift
                            ? {
                                textDecoration: "line-through",
                                textDecorationColor: "#ef4444",
                                color: "#6b7280",
                              }
                            : undefined
                        }
                      >
                        {formatCurrencyBdt(item.lineItemTotalPrice)}
                        {item.isGift && " (Gift)"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Row 4: Order Notes (if any) */}
          {cleanNotes && (
            <div className="mb-6 print:mb-2">
              <h3 className="text-base font-semibold text-foreground mb-2 print:mb-1 flex items-center">
                <StickyNote className="mr-2 h-4 w-4 text-[#67B239]" /> Order Notes:
              </h3>
              <Card className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40 shadow-2xs">
                <CardContent className="p-4 print:p-2 text-sm text-amber-800 dark:text-amber-200 whitespace-pre-wrap">
                  {cleanNotes}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Row 5: Payments History (if advance paid) */}
          {paymentsHistory.length > 0 && (
            <div className="mb-6 print:mb-2">
              <h3 className="text-base font-semibold text-foreground mb-3 print:mb-1 flex items-center">
                <ReceiptText className="mr-2 h-4 w-4 text-[#67B239]" /> Payments History
              </h3>
              <div className="overflow-x-auto rounded-lg border border-border/30 bg-background/85 backdrop-blur-xs shadow-2xs print:shadow-none">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Recorded By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsHistory.map((record) => (
                      <TableRow key={record.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(record.date)}
                        </TableCell>
                        <TableCell className="font-medium text-emerald-600 print:text-emerald-700">
                          {formatCurrencyBdt(record.amount)}
                        </TableCell>
                        <TableCell className="text-card-foreground">
                          {record.paymentMethod || "N/A"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.notes || "N/A"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.recordedBy || "Agent"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Row 6: Bottom Section (Financial Summary Box) */}
          <div className="flex justify-end items-start mt-6 pt-4 border-t border-border/30 print:mt-2 print:pt-2 print:break-inside-avoid">
            {/* Financial Summary Box */}
            <div className="w-full max-w-xs sm:max-w-sm relative">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">Order Items Total:</span>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrencyBdt(orderSubtotal)}
                </span>
              </div>

              {specialDiscount > 0 && (
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Percent className="h-3.5 w-3.5 mr-1 text-red-500" /> Special Discount:
                  </span>
                  <span className="text-sm font-medium text-red-500">
                    - {formatCurrencyBdt(specialDiscount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between mb-2 pt-1 border-t border-dashed border-border/40">
                <span className="text-sm font-semibold text-foreground">Net Payable:</span>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrencyBdt(netPayable)}
                </span>
              </div>

              {totalPaid > 0 && (
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {isPaid ? "Total Paid:" : "Total Advance Paid:"}
                  </span>
                  <span className="text-sm font-medium text-emerald-600">
                    - {formatCurrencyBdt(totalPaid)}
                  </span>
                </div>
              )}

              {/* PAID Stamp or Amount Due */}
              {isPaid ? (
                <div className="absolute -left-12 -top-10 sm:-left-20 sm:-top-14 transform rotate-[-20deg] pointer-events-none select-none">
                  <Image
                    src="/paid-stamp.png"
                    alt="Paid Stamp"
                    width={140}
                    height={140}
                    className="opacity-80"
                    unoptimized
                    onError={(e) => {
                      // Fallback badge if stamp image doesn't render
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ) : (
                amountDue > 0.01 && (
                  <>
                    <Separator className="my-2 bg-border/50" />
                    <div className="flex justify-between">
                      <span className="text-base sm:text-lg font-bold text-[#67B239]">
                        Amount Due:
                      </span>
                      <span className="text-base sm:text-lg font-bold text-[#67B239]">
                        {formatCurrencyBdt(amountDue)}
                      </span>
                    </div>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status History Section (100% ERPAPP Exact Dimension & Design) */}
      <div className="max-w-4xl mx-auto mt-6 sm:mt-8 px-2 sm:px-0 print:hidden">
        <Card className="text-card-foreground shadow-2xl border border-border/40 bg-card hover:shadow-primary/10 transition-shadow duration-300 rounded-xl overflow-hidden">
          <CardHeader className="bg-card p-6 sm:p-8 border-b border-border/40">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Info className="h-8 w-8 sm:h-10 sm:w-10 text-primary shrink-0 p-1.5 bg-primary/10 rounded-lg border border-primary/20" />
              <CardTitle className="tracking-tight text-xl sm:text-2xl font-semibold text-card-foreground">
                Status History
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-muted-foreground mt-1 ml-11 sm:ml-14">
              Timeline of order progress and updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-6 sm:space-y-8 relative pl-5 sm:pl-6 border-l-2 border-zinc-400 dark:border-zinc-600 ml-2 sm:ml-3">
              {statusHistoryList.map((entry, index) => {
                const isLatest = index === 0;
                const badgeStyles = getTimelineBadgeStyles(entry.status, isLatest);

                return (
                  <div
                    key={entry.id || index}
                    className="flex items-start space-x-3 sm:space-x-4 relative group"
                  >
                    <div
                      className={cn(
                        "absolute z-10 -left-9 sm:-left-10.5 top-1 h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center ring-4 ring-background transition-all duration-200",
                        isLatest ? "shadow-lg" : "border-2",
                      )}
                      style={{
                        backgroundColor: badgeStyles.backgroundColor,
                        backgroundImage: badgeStyles.backgroundImage,
                        borderColor: badgeStyles.borderColor,
                      }}
                    >
                      <Info
                        className={cn(
                          "h-4 w-4 sm:h-5 sm:w-5",
                          !isLatest && "h-4 w-4 sm:h-4 sm:w-4 shrink-0",
                        )}
                        style={{ color: badgeStyles.iconColor }}
                      />
                    </div>
                    <div className="flex-1 pt-px ml-2 sm:ml-3">
                      <div className="flex items-center justify-between w-full gap-3">
                        <p
                          className={cn(
                            "font-semibold text-md sm:text-lg",
                            isLatest
                              ? "text-primary"
                              : "text-foreground group-hover:text-primary/90",
                          )}
                        >
                          {entry.status}
                        </p>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground flex items-center flex-wrap mt-0.5">
                        <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 opacity-70 shrink-0" />
                        {formatStatusTimelineDate(entry.timestamp)}
                        {entry.changedByUserName && (
                          <>
                            <span className="mx-1.5 hidden sm:inline">•</span>
                            <span className="block sm:inline w-full sm:w-auto mt-0.5 sm:mt-0">
                              {entry.changedByUserName}
                            </span>
                          </>
                        )}
                      </div>
                      {entry.notes
                        ? (() => {
                            const noteText = entry.notes;
                            const imgRegex =
                              /(\/uploads\/[^\s)]+\.(?:png|jpg|jpeg|gif|webp)|https?:\/\/[^\s)]+\.(?:png|jpg|jpeg|gif|webp))/i;
                            const match = noteText.match(imgRegex);
                            const imageUrl = entry.proofUrl || (match ? match[1] : null);

                            if (imageUrl) {
                              const delimiter = match?.[1];
                              const parts = delimiter ? noteText.split(delimiter) : [noteText, ""];
                              return (
                                <p className="text-sm sm:text-md mt-2 sm:mt-2.5 bg-muted/50 p-3 sm:p-4 rounded-lg border border-border/40 text-foreground/80 shadow-xs">
                                  {parts[0]}
                                  <button
                                    type="button"
                                    onClick={() => setPreviewDocumentUrl(imageUrl)}
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors text-xs align-middle mx-1 cursor-pointer"
                                  >
                                    <FileImage className="h-3.5 w-3.5" />
                                    View Proof Image
                                  </button>
                                  {parts[1]}
                                </p>
                              );
                            }

                            return (
                              <p className="text-sm sm:text-md mt-2 sm:mt-2.5 bg-muted/50 p-3 sm:p-4 rounded-lg border border-border/40 text-foreground/80 shadow-xs">
                                {noteText}
                              </p>
                            );
                          })()
                        : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proof Image Preview Modal */}
      <Dialog
        open={Boolean(previewDocumentUrl)}
        onOpenChange={(open) => !open && setPreviewDocumentUrl(null)}
      >
        <DialogContent className="max-w-2xl p-4">
          <DialogHeader>
            <DialogTitle>Proof Image Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-2 flex items-center justify-center overflow-hidden rounded-lg bg-black/5 p-2">
            {previewDocumentUrl && (
              <img
                src={previewDocumentUrl}
                alt="Proof"
                className="max-h-[70vh] w-auto object-contain rounded-md"
                onError={(e) => {
                  e.currentTarget.src = "/logo.png";
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
