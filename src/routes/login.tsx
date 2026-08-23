import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, LogIn, Command, ShieldCheck, User } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AccountSuspendedModal } from "@/components/account-suspended-modal";
import { fetchMySQLUsers } from "@/lib/auth.functions";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in | Brandium Telesales CRM" },
      { name: "description", content: "Sign in to the Brandium Telesales CRM workspace." },
      { property: "og:title", content: "Sign in | Brandium Telesales CRM" },
      {
        property: "og:description",
        content: "Sign in to the Brandium Telesales CRM workspace.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { session, loading, setAuthenticatedDbSession } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [suspendedModalOpen, setSuspendedModalOpen] = useState(false);

  const isProduction =
    import.meta.env.PROD ||
    (typeof window !== "undefined" &&
      (window.location.hostname.includes("brandiumagency.com") ||
        (!window.location.hostname.includes("localhost") &&
          !window.location.hostname.includes("127.0.0.1"))));

  useEffect(() => {
    if (!loading && session) {
      void navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, session, navigate]);

  async function performLogin(targetEmail: string, targetPass: string) {
    setSubmitting(true);
    setEmail(targetEmail);
    setPassword(targetPass);

    try {
      const { users } = await fetchMySQLUsers();
      const target = users.find(
        (u) => String(u["email"] || "").toLowerCase() === targetEmail.trim().toLowerCase(),
      );
      if (
        target &&
        (String(target["status"] || "") !== "Active" || Boolean(target["is_deleted"]))
      ) {
        setSubmitting(false);
        setSuspendedModalOpen(true);
        return;
      }
    } catch {
      // Ignore
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: targetPass,
    });

    if (error || !data?.user) {
      setSubmitting(false);
      toast.error(error?.message || "Invalid email or password. Please check your credentials.");
      return;
    }

    const userId = data.user.id;
    const userName = data.user.user_metadata?.full_name || targetEmail.split("@")[0] || "User";
    const userRole = (data.user.user_metadata?.role || "agent") as "admin" | "agent";
    setAuthenticatedDbSession(userId, userName, targetEmail, userRole);

    setSubmitting(false);
    toast.success(`Signed in successfully as ${userName} (${userRole.toUpperCase()})!`);
    void navigate({ to: "/dashboard", replace: true });
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    await performLogin(email, password);
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#0B3364] select-none font-sans">
      {/* Full Screen Brand Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url('/brandium_login_bg.jpg')` }}
      />

      {/* Subtle Ambient Overlay Layer */}
      <div className="absolute inset-0 bg-slate-950/10 pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-t from-slate-950/20 via-transparent to-black/10 pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="relative z-10 p-6 md:p-8 lg:px-56 xl:px-80 flex items-center justify-between">
        <Link to="/login" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Brandium Logo"
            className="h-10 md:h-12 w-auto object-contain drop-shadow-md"
          />
        </Link>
      </header>

      {/* Main Centered Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-100 bg-white/85 backdrop-blur-2xl border border-white/90 shadow-[0_25px_60px_rgba(0,0,0,0.18)] rounded-[32px] p-8 md:p-9 text-center transition-all">
          {/* Top Minimal Square Icon */}
          <div className="size-11 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-800">
            <LogIn className="size-4 text-slate-800 stroke-2" />
          </div>

          {/* Heading & Subtitle */}
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">Sign In</h1>
          <p className="text-xs text-slate-500 font-normal leading-relaxed mb-6">
            Enter your details to access your account
          </p>

          {/* Login Form */}
          <form onSubmit={handleSignIn} className="space-y-3 text-left">
            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full h-11 rounded-xl bg-white border border-slate-200/80 shadow-2xs px-3.5 pl-10 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-11 rounded-xl bg-white border border-slate-200/80 shadow-2xs px-3.5 pl-10 pr-10 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={() => toast.info("Contact administrator to reset password.")}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl bg-[#0B3364] hover:bg-[#08264b] text-white font-semibold text-xs shadow-md shadow-[#0B3364]/20 transition-all cursor-pointer disabled:opacity-75 mt-1"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>

            {/* Instant Demo Login Buttons (Development / Demo Mode Only) */}
            {!isProduction && (
              <div className="pt-2 border-t border-slate-200/70 mt-5 space-y-2">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 text-center">
                  Instant Demo Access
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => void performLogin("admin@example.com", "Admin@12345")}
                    disabled={submitting}
                    className="h-10 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-75"
                  >
                    <ShieldCheck className="size-3.5 text-[#67B239]" />
                    <span>Admin Login</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => void performLogin("agent@brandium.com", "Agent@12345")}
                    disabled={submitting}
                    className="h-10 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-75"
                  >
                    <User className="size-3.5 text-blue-600" />
                    <span>Agent Login</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-10 p-6 text-center text-xs text-white/70 font-medium">
        © 2026 Brandium CRM. All rights reserved.
      </footer>

      {/* Account Suspended Dialog */}
      <AccountSuspendedModal open={suspendedModalOpen} onOpenChange={setSuspendedModalOpen} />
    </div>
  );
}
