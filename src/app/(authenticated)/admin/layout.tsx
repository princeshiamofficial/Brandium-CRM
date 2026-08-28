"use client";

import { type ReactNode } from "react";
import { Link } from "@/components/navigation-link";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, role } = useAuth();

  if (role === null) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md rounded-xl border bg-background p-10 text-center shadow-sm my-12">
        <div className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-5" />
        </div>
        <h1 className="text-lg font-semibold">403 — Access denied</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This area is restricted to administrators.
        </p>
        <Button asChild className="mt-5" variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
