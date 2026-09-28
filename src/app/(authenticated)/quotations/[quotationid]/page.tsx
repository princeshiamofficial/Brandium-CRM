"use client";

import React, { useEffect, useRef, useMemo } from "react";
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
  ScrollText,
} from "lucide-react";
import JsBarcode from "jsbarcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { resolveQuotationStageColor } from "@/lib/quotations";
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

interface QuotationOrderItem {
  id: string;
  model: string;
  quantity: string | number;
  unitPrice: number | null;
  lineItemTotalPrice: number | null;
  isGift?: boolean;
}

interface QuotationPaymentRecord {
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

const formatDateOnly = (dateString?: string | null): string => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${day} ${month}, ${year}`;
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

export interface QuotationRecord {
  id: string;
  quotation_code: string;
  title: string;
  prospect_id?: string | null;
  client_name: string;
  client_phone?: string | null;
  client_email?: string | null;
  client_address?: string | null;
  prospect_logo_url?: string | null;
  service_id?: string | null;
  service_name?: string | null;
  status: string;
  priority: string;
  assigned_agent_id?: string | null;
  assigned_artist_id?: string | null;
  assigned_user_ids?: string | null;
  created_by?: string | null;
  creator_name?: string | null;
  creator_avatar?: string | null;
  agent_name?: string | null;
  agent_avatar?: string | null;
  artist_name?: string | null;
  artist_avatar?: string | null;
  budget: number | string;
  paid_amount: number | string;
  due_amount?: number | string;
  progress?: number | string;
  order_date?: string | null;
  deadline?: string | null;
  notes?: string | null;
  prospect_notes?: string | null;
  advance_payments?: string | any[] | null;
  status_history?: string | any[] | null;
  is_active?: number | boolean;
  created_at: string;
  updated_at?: string;
}

const QUOTATION_TERMS = [
  "All Prices Exclude VAT/Taxes",
  "Media Buying Costs Billed Separately",
  "Third-Party Production Costs Additional",
  "Additional Revisions Chargeable free till 3 requests (After that charge will be applicable)",
  "Out-of-Scope Work Will Be Invoiced Separately",
  "Work Begins After Payment Confirmation",
  "Approved Work Is Non-Refundable",
];

const FALLBACK_DEMO_QUOTATION: QuotationRecord = {
  id: "demo-prj-1",
  quotation_code: "12145",
  title: "Color Hut Printing & Design",
  prospect_id: "0009",
  client_name: "Color Hut",
  client_phone: "01919760626",
  client_email: "colorhut.official@gmail.com",
  client_address: "House No. 14, Road No. A, Block A, Sontek, South Kajla, Jatrabari, Dhaka - 1236",
  service_name: "Graphics Design & Print",
  status: "Draft",
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
  updated_at: "2026-09-15T04:30:00.000Z",
  advance_payments: null,
  status_history: JSON.stringify([
    {
      id: "sh-demo-1",
      status: "Draft",
      timestamp: "2026-09-15T01:25:00.000Z",
      changedByUserName: "Mehan Ahmed",
      notes: "Quotation drafted for Color Hut.",
      proofUrl: null,
    },
    {
      id: "sh-demo-2",
      status: "Sent",
      timestamp: "2026-09-15T02:10:00.000Z",
      changedByUserName: "Mehan Ahmed",
      notes: "Quotation sent to the client.",
      proofUrl: null,
    },
    {
      id: "sh-demo-3",
      status: "Under Review",
      timestamp: "2026-09-15T04:30:00.000Z",
      changedByUserName: "Mehan Ahmed",
      notes: "Client is reviewing the quotation.",
      proofUrl: null,
    },
  ]),
};

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawParam = params ? params["quotationid"] : undefined;
  const quotationIdParam = Array.isArray(rawParam)
    ? String(rawParam[0])
    : typeof rawParam === "string"
      ? rawParam
      : "";

  const barcodeRef = useRef<SVGSVGElement>(null);

  // Fetch quotation by quotation_code, id, prospect_id, or fallback to latest real quotation
  const { data: quotationData, isLoading } = useQuery<QuotationRecord | null>({
    queryKey: ["quotation-details", quotationIdParam],
    queryFn: async (): Promise<QuotationRecord | null> => {
      const cleanParam = (quotationIdParam || "").trim();

      const baseSelect = `
        SELECT 
          prj.id,
          prj.quotation_code,
          prj.title,
          prj.prospect_id,
          prj.client_name,
          COALESCE(prj.client_phone, p.phone) AS client_phone,
          COALESCE(prj.client_email, p.email) AS client_email,
          COALESCE(prj.client_address, p.address, 'Dhaka, Bangladesh') AS client_address,
          p.logo_url AS prospect_logo_url,
          prj.service_id,
          COALESCE(prj.status, 'Draft') AS status,
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
          COALESCE(srv.name, prj.service_id, 'Design & Creative Service') AS service_name,
          COALESCE(prof_artist.full_name, u_artist.name) AS artist_name,
          prof_artist.avatar_url AS artist_avatar,
          COALESCE(prof_agent.full_name, u_agent.name) AS agent_name,
          prof_agent.avatar_url AS agent_avatar,
          COALESCE(prof_creator.full_name, u_creator.name, prof_agent.full_name, u_agent.name) AS creator_name,
          COALESCE(prof_creator.avatar_url, u_creator.avatar_url, prof_agent.avatar_url, u_agent.avatar_url) AS creator_avatar
        FROM quotations prj
        LEFT JOIN prospects p ON prj.prospect_id = p.id
        LEFT JOIN services srv ON (prj.service_id = srv.id OR prj.service_id = srv.name)
        LEFT JOIN users u_artist ON prj.assigned_artist_id = u_artist.id
        LEFT JOIN profiles prof_artist ON prj.assigned_artist_id = prof_artist.id
        LEFT JOIN users u_agent ON prj.assigned_agent_id = u_agent.id
        LEFT JOIN profiles prof_agent ON prj.assigned_agent_id = prof_agent.id
        LEFT JOIN users u_creator ON prj.created_by = u_creator.id
        LEFT JOIN profiles prof_creator ON prj.created_by = prof_creator.id
      `;

      // 1. Try matching specific quotation by code, id, or prospect_id
      if (
        cleanParam &&
        cleanParam.toLowerCase() !== "id" &&
        cleanParam !== "undefined" &&
        cleanParam !== "null"
      ) {
        const sqlMatch = `
          ${baseSelect}
          WHERE prj.quotation_code = ? 
             OR prj.id = ? 
             OR prj.prospect_id = ?
             OR prj.quotation_code = CONCAT('QT-', ?)
             OR REPLACE(prj.quotation_code, 'QT-', '') = ?
             OR prj.quotation_code LIKE CONCAT('%', ?, '%')
             OR prj.title LIKE CONCAT('%', ?, '%')
             OR prj.client_name LIKE CONCAT('%', ?, '%')
          LIMIT 1;
        `;

        const res = await runMySQLQuery<QuotationRecord[]>(sqlMatch, [
          cleanParam,
          cleanParam,
          cleanParam,
          cleanParam,
          cleanParam,
          cleanParam,
          cleanParam,
          cleanParam,
        ]);

        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          return res.data[0] as unknown as QuotationRecord;
        }

        // 2. Check if param matches a prospect in prospects table
        const prospectSql = `
          SELECT 
            p.id AS prospect_id,
            CONCAT('QT-', SUBSTRING(REPLACE(p.id, '-', ''), -4)) AS quotation_code,
            COALESCE(p.business_name, p.contact_name, 'New Quotation') AS title,
            COALESCE(p.business_name, p.contact_name, 'Client') AS client_name,
            p.phone AS client_phone,
            p.email AS client_email,
            COALESCE(p.address, 'Dhaka, Bangladesh') AS client_address,
            p.logo_url AS prospect_logo_url,
            p.service_id,
            COALESCE(st.name, p.stage_id, 'Draft') AS status,
            'Medium' AS priority,
            p.assigned_to AS assigned_agent_id,
            p.assigned_artist_id,
            p.created_by,
            0 AS budget,
            0 AS paid_amount,
            0 AS progress,
            DATE(p.created_at) AS order_date,
            DATE(DATE_ADD(p.created_at, INTERVAL 10 DAY)) AS deadline,
            p.notes,
            NULL AS advance_payments,
            NULL AS status_history,
            p.notes AS prospect_notes,
            1 AS is_active,
            p.created_at,
            p.updated_at,
            COALESCE(srv.name, p.service_id, 'Design Service') AS service_name,
            COALESCE(prof_artist.full_name, u_artist.name) AS artist_name,
            prof_artist.avatar_url AS artist_avatar,
            COALESCE(prof_agent.full_name, u_agent.name) AS agent_name,
            prof_agent.avatar_url AS agent_avatar,
            COALESCE(prof_creator.full_name, u_creator.name) AS creator_name,
            COALESCE(prof_creator.avatar_url, u_creator.avatar_url) AS creator_avatar
          FROM prospects p
          LEFT JOIN services srv ON (p.service_id = srv.id OR p.service_id = srv.name)
          LEFT JOIN stages st ON (p.stage_id = st.id OR p.stage_id = st.name)
          LEFT JOIN users u_artist ON p.assigned_artist_id = u_artist.id
          LEFT JOIN profiles prof_artist ON p.assigned_artist_id = prof_artist.id
          LEFT JOIN users u_agent ON p.assigned_to = u_agent.id
          LEFT JOIN profiles prof_agent ON p.assigned_to = prof_agent.id
          LEFT JOIN users u_creator ON p.created_by = u_creator.id
          LEFT JOIN profiles prof_creator ON p.created_by = prof_creator.id
          WHERE p.id = ? OR p.phone = ? OR p.email = ?
          LIMIT 1;
        `;
        const prospectRes = await runMySQLQuery<QuotationRecord[]>(prospectSql, [
          cleanParam,
          cleanParam,
          cleanParam,
        ]);
        if (prospectRes.success && Array.isArray(prospectRes.data) && prospectRes.data.length > 0) {
          return prospectRes.data[0] as unknown as QuotationRecord;
        }
      }

      // 3. Fallback: Query the latest real active quotation from MySQL
      const fallbackSql = `
        ${baseSelect}
        ORDER BY prj.updated_at DESC, prj.created_at DESC
        LIMIT 1;
      `;
      const fallbackRes = await runMySQLQuery<QuotationRecord[]>(fallbackSql);
      if (fallbackRes.success && Array.isArray(fallbackRes.data) && fallbackRes.data.length > 0) {
        return fallbackRes.data[0] as unknown as QuotationRecord;
      }

      return null;
    },
    enabled: true,
  });

  const quotation: QuotationRecord | null =
    quotationData || (isLoading ? null : FALLBACK_DEMO_QUOTATION);
  const stageColor = quotation?.status ? resolveQuotationStageColor(quotation.status) : "#16A34A";
  // Extract order items, notes, discount, and payment records from quotation.notes
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
    if (!quotation) {
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

    const rawNotes = String(quotation.notes || "");
    let items: QuotationOrderItem[] = [];
    let discount = 0;
    const payments: QuotationPaymentRecord[] = [];

    // Parse [Items: [...]]
    if (rawNotes.includes("[Items:")) {
      try {
        const match = rawNotes.match(/\[Items:\s*(\[.*?\])\s*\]/s);
        if (match && match[1]) {
          const parsed = JSON.parse(match[1]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            items = parsed.map((it, idx) => ({
              id: it.id || `item-${idx}`,
              model: it.model || it.modelName || quotation.service_name || "Custom Service",
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
      const budgetNum = Number(quotation.budget) || 0;
      items = [
        {
          id: "default-item",
          model: quotation.service_name || quotation.title || "Design & Service",
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
    if (quotation.advance_payments) {
      if (Array.isArray(quotation.advance_payments)) {
        parsedAdvanceList = quotation.advance_payments;
      } else if (typeof quotation.advance_payments === "string") {
        try {
          const parsed = JSON.parse(quotation.advance_payments);
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
          date: p.date || quotation.order_date || quotation.created_at || new Date().toISOString(),
          amount: Number(p.amount) || 0,
          paymentMethod: p.paymentMethod || p.method || "Advance Payment",
          notes: p.notes || p.ref || "",
          recordedBy:
            p.recordedByUserName || quotation.creator_name || quotation.agent_name || "Agent",
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
                  p.date ||
                  quotation.order_date ||
                  quotation.created_at ||
                  new Date().toISOString(),
                amount: Number(p.amount) || 0,
                paymentMethod: p.paymentMethod || p.method || "Advance Payment",
                notes: p.notes || p.ref || "",
                recordedBy:
                  p.recordedByUserName || quotation.creator_name || quotation.agent_name || "Agent",
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

      const rawPaidNum = Number(quotation.paid_amount) || 0;
      if (rawPaidNum > 0) {
        payments.push({
          id: "payment-advance",
          date: quotation.order_date || quotation.created_at || new Date().toISOString(),
          amount: rawPaidNum,
          paymentMethod: paymentMethod,
          notes: paymentRef || "Initial advance payment",
          recordedBy: quotation.creator_name || quotation.agent_name || "Agent",
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
    const paidNum = calculatedPaid > 0 ? calculatedPaid : Number(quotation.paid_amount) || 0;

    const subtotal = items.reduce(
      (acc, it) => acc + (it.isGift ? 0 : it.lineItemTotalPrice || 0),
      0,
    );
    const net = Math.max(0, subtotal - discount);
    const due = Math.max(0, net - paidNum);
    const paid = net > 0 && due <= 0.01;

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
  }, [quotation]);

  // Barcode Generation
  const codeToRender = String(quotation?.quotation_code || quotationIdParam || "QT-00000");
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
      <div className="w-full max-w-[210mm] mx-auto p-4 sm:p-6 space-y-6">
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

  if (!quotation) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 text-center bg-white dark:bg-card rounded-2xl border shadow-xs space-y-4">
        <ReceiptText className="size-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Quotation Not Found</h2>
        <p className="text-sm text-muted-foreground">
          No quotation or order matches ID &quot;{quotationIdParam}&quot;.
        </p>
        <Button asChild variant="outline" className="mt-2">
          <Link href="/quotations">
            <ArrowLeft className="size-4 mr-1.5" /> Back to Quotations
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="selection:bg-primary/20 selection:text-primary print:p-0 print:m-0 print:bg-white pt-0 pb-6 -mt-1 sm:-mt-2">
      {/* Current Status Header Card (Screen Only - Hidden in Print) */}
      {quotation && (
        <div className="w-full max-w-[210mm] mx-auto mb-4 px-2 sm:px-0 print:hidden">
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
                      {quotation.status || "Draft"}
                    </span>
                  </h3>
                  <div className="text-xs text-muted-foreground mt-2">
                    Last status update:{" "}
                    {formatRelativeTime(quotation.updated_at || quotation.created_at)}
                    {quotation.creator_name ? ` by ${quotation.creator_name}` : ""}
                  </div>
                </div>
              </div>
            </CardHeader>
          </div>
        </div>
      )}

      {/* Main Quotation Card - Fixed A4 Dimensions (210mm x 297mm) */}
      <div className="w-full overflow-x-auto py-2 sm:py-4 flex justify-center print:p-0 print:overflow-visible print:block">
        <div
          className="relative w-[210mm] min-h-[297mm] mx-auto bg-card border border-border/40 rounded-xl shadow-2xl invoice-page overflow-hidden bg-cover bg-no-repeat bg-center print:shadow-none print:border-none print:rounded-none print:m-0 print:p-0 print:w-[210mm] print:h-[297mm] print:text-[13px] print:leading-tight pt-[38mm] pb-[30mm] px-[16mm] flex flex-col justify-between"
          style={{
            width: "210mm",
            minHeight: "297mm",
            backgroundImage: "url('/brandium_invoice_bg.jpg')",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center top",
          }}
        >
          {/* Subtle Dark Mode Overlay so text remains 100% readable in dark theme */}
          <div className="hidden dark:block absolute inset-0 bg-slate-950/80 pointer-events-none z-0 print:hidden" />

          <div className="relative z-10 flex-1 flex flex-col justify-between">
            <div>
              {/* Row 2: Bill To & Quotation Meta (Clean Transparent Letterhead Design) */}
              <div className="grid grid-cols-2 gap-6 mb-6 pb-4 border-b border-border/20 print:mb-3 print:pb-2 print:break-inside-avoid items-start">
                {/* Bill To Info */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-[#67B239]" />
                    <span>Bill To:</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-foreground">
                    {quotation.client_name || quotation.title}
                  </p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {quotation.client_address && (
                      <p className="flex items-start gap-1.5 leading-relaxed">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                        <span>{quotation.client_address}</span>
                      </p>
                    )}
                    {quotation.client_phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{quotation.client_phone}</span>
                      </p>
                    )}
                    {quotation.client_email && (
                      <p className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{quotation.client_email}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Quotation Meta Info */}
                <div className="flex flex-col items-end justify-start space-y-2 text-right">
                  <div className="inline-flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Quotation No:
                    </span>
                    <span className="font-mono font-bold text-base text-primary bg-primary/5 px-2.5 py-0.5 rounded border border-primary/20">
                      #{quotation.quotation_code || quotation.id}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-[#67B239] shrink-0" />
                        <span>Quotation Date:</span>
                      </span>
                      <span className="font-semibold text-foreground whitespace-nowrap">
                        {formatDate(quotation.order_date || quotation.created_at)}
                      </span>
                    </div>

                    {quotation.deadline && (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>Valid Until:</span>
                        </span>
                        <span className="font-semibold text-foreground whitespace-nowrap">
                          {formatDateOnly(quotation.deadline)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 3: Order Items Table */}
              <div className="mb-6 print:mb-2 print:break-inside-auto">
                <h3 className="text-base font-semibold mb-3 print:mb-1 text-foreground flex items-center">
                  Quotation Items
                </h3>
                <div className="overflow-x-auto rounded-lg border border-border/30 bg-background/85 backdrop-blur-xs shadow-2xs">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs uppercase tracking-wider text-muted-foreground w-[52%]">
                          Service
                        </TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-center whitespace-nowrap w-[16%]">
                          Quantity
                        </TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right whitespace-nowrap w-[16%]">
                          Unit Price
                        </TableHead>
                        <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right whitespace-nowrap pr-4 w-[16%]">
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
                          <TableCell className="text-center text-card-foreground whitespace-nowrap">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right text-card-foreground whitespace-nowrap">
                            {formatCurrencyBdt(item.unitPrice)}
                          </TableCell>
                          <TableCell
                            className="text-right font-semibold text-card-foreground whitespace-nowrap pr-4"
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
                    <StickyNote className="mr-2 h-4 w-4 text-[#67B239]" /> Quotation Notes:
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
                        <TableRow className="border-border/40 hover:bg-transparent">
                          <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap h-9 px-3">
                            Date
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap h-9 px-3">
                            Amount
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap h-9 px-3">
                            Method
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap h-9 px-3">
                            Notes
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap h-9 px-3">
                            Recorded By
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentsHistory.map((record) => (
                          <TableRow
                            key={record.id}
                            className="hover:bg-muted/50 transition-colors border-border/30"
                          >
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap py-2 px-3">
                              {formatDate(record.date)}
                            </TableCell>
                            <TableCell className="text-xs font-semibold text-emerald-600 print:text-emerald-700 whitespace-nowrap py-2 px-3">
                              {formatCurrencyBdt(record.amount)}
                            </TableCell>
                            <TableCell className="text-xs text-card-foreground whitespace-nowrap py-2 px-3">
                              {record.paymentMethod || "N/A"}
                            </TableCell>
                            <TableCell
                              className="text-xs text-muted-foreground whitespace-nowrap py-2 px-3"
                              title={record.notes || undefined}
                            >
                              {record.notes || "N/A"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap py-2 px-3">
                              {record.recordedBy || "Agent"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>

            <div>
              {/* Terms & Conditions (bottom-left, above the summary divider) */}
              <div className="max-w-[55%] mt-6 print:mt-2 print:break-inside-avoid">
                <h4 className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#0a2e5c] dark:text-slate-200">
                  <ScrollText className="size-3.5 text-[#67B239]" /> Terms & Conditions
                </h4>
                <ol className="list-decimal pl-4 space-y-0.5 text-[11px] leading-snug text-muted-foreground">
                  {QUOTATION_TERMS.map((term) => (
                    <li key={term}>{term}</li>
                  ))}
                </ol>
              </div>

              {/* Row 6: Bottom Section (Financial Summary Box) */}
              <div className="flex justify-end items-start mt-4 pt-4 border-t border-border/30 print:mt-2 print:pt-2 print:break-inside-avoid">
                {/* Financial Summary Box */}
                <div className="w-full max-w-xs sm:max-w-sm relative">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Items Total:</span>
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
                          <span className="text-base sm:text-lg font-bold text-[#EF1E1E] dark:text-red-400">
                            Amount Due:
                          </span>
                          <span className="text-base sm:text-lg font-bold text-[#EF1E1E] dark:text-red-400">
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
        </div>
      </div>
    </div>
  );
}
