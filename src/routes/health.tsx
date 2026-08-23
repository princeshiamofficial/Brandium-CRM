import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Database, RefreshCw, ShieldCheck, Server } from "lucide-react";
import { checkDatabaseHealth } from "@/lib/auth.functions";

export const Route = createFileRoute("/health")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "System & Database Health | Brandium CRM" },
      { name: "description", content: "Live database connection health and system status." },
    ],
  }),
  component: HealthPage,
});

type HealthData = {
  success: boolean;
  database: string;
  version: string;
  userCount: number;
  error?: string;
  checkedAt?: string;
};

function HealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchHealth() {
    setLoading(true);
    try {
      const res = await checkDatabaseHealth();
      setHealth({
        ...res,
        checkedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setHealth({
        success: false,
        database: "u603955686_brandiumcrm",
        version: "Unknown",
        userCount: 0,
        error: errObj?.message || "Database connection test failed.",
        checkedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchHealth();
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Database className="size-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Database Health</h1>
              <p className="text-xs text-slate-400">Brandium CRM MySQL Status</p>
            </div>
          </div>

          <button
            onClick={() => void fetchHealth()}
            disabled={loading}
            className="size-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Status"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Status Card */}
        <div className="my-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Database Connection</span>
          {health?.success ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ONLINE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
              <XCircle className="size-3.5" />
              <span>OFFLINE</span>
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-left mb-6">
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <p className="text-[11px] font-medium text-slate-400 mb-0.5">Database Name</p>
            <p className="text-xs font-bold text-slate-200 truncate">
              {health?.database || "u603955686_brandiumcrm"}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <p className="text-[11px] font-medium text-slate-400 mb-0.5">Active Users</p>
            <p className="text-xs font-bold text-slate-200">
              {health ? `${health.userCount} Users` : "..."}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 col-span-2">
            <p className="text-[11px] font-medium text-slate-400 mb-0.5">MySQL Server Version</p>
            <p className="text-xs font-bold text-slate-200 truncate">
              {health?.version || "Loading..."}
            </p>
          </div>
        </div>

        {/* Timestamp / Error Notice */}
        {health?.error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs text-left mb-4">
            <p className="font-semibold mb-0.5">Connection Warning:</p>
            <p className="opacity-90 leading-relaxed">{health.error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Checked: {health?.checkedAt ? new Date(health.checkedAt).toLocaleTimeString() : "Now"}</span>
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <ShieldCheck className="size-3 text-emerald-400" /> MySQL 8.0/MariaDB
          </span>
        </div>
      </div>
    </div>
  );
}
