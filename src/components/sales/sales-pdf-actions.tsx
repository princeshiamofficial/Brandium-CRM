"use client";

import { useState } from "react";
import { Download, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadSalesPdf, printSalesPdf, type SalesPdfData } from "@/lib/sales-pdf";

type Busy = "print" | "download" | null;

/** "Print" and "Download PDF" buttons for an order invoice or quotation. */
export function SalesPdfActions({ getData }: { getData: () => SalesPdfData }) {
  const [busy, setBusy] = useState<Busy>(null);

  const run = async (kind: Exclude<Busy, null>) => {
    setBusy(kind);
    try {
      const data = getData();
      await (kind === "print" ? printSalesPdf(data) : downloadSalesPdf(data));
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Could not create the PDF", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => run("print")}
        disabled={busy !== null}
        className="cursor-pointer"
      >
        {busy === "print" ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
        ) : (
          <Printer className="mr-1.5 h-4 w-4" />
        )}
        Print
      </Button>
      <Button
        size="sm"
        onClick={() => run("download")}
        disabled={busy !== null}
        className="bg-[#67B239] hover:bg-[#5aa030] text-white cursor-pointer"
      >
        {busy === "download" ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-1.5 h-4 w-4" />
        )}
        Download PDF
      </Button>
    </div>
  );
}
