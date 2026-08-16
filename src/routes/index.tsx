import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Brandium Telesales CRM" },
      {
        name: "description",
        content: "Telesales CRM for prospects, opportunities, follow-ups and billing.",
      },
      { property: "og:title", content: "Brandium Telesales CRM" },
      {
        property: "og:description",
        content: "Telesales CRM for prospects, opportunities, follow-ups and billing.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    void navigate({ to: session ? "/dashboard" : "/login", replace: true });
  }, [loading, session, navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-muted/30">
      <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
    </div>
  );
}
