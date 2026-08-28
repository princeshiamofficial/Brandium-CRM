"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type User = {
  id: string;
  email?: string;
  user_metadata: {
    full_name?: string;
    role?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type Session = {
  access_token: string;
  user: User;
  [key: string]: unknown;
};

export type AppRole = "admin" | "agent";

type Profile = { id: string; full_name: string | null; email: string | null };

export type AuthSession = {
  session: Session;
  user: User;
  profile: Profile;
  role: AppRole;
};

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  setAuthenticatedDbSession: (userId: string, name: string, email: string, role: AppRole) => void;
  signInAsDevUser: (name: string, email: string, role: AppRole) => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const SESSION_STORAGE_KEY = "brandium_user_session";

function buildAuthObjects(
  userId: string,
  name: string,
  email: string,
  role: AppRole,
): { user: User; session: Session; profile: Profile } {
  const user: User = {
    id: userId,
    app_metadata: { provider: "email" },
    user_metadata: { full_name: name, role },
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email,
    phone: "",
    role: "authenticated",
    updated_at: new Date().toISOString(),
  };

  const session: Session = {
    access_token: `jwt_${userId}_${Date.now()}`,
    token_type: "bearer",
    expires_in: 3600 * 24 * 30,
    refresh_token: `refresh_${userId}_${Date.now()}`,
    user,
  };

  const profile: Profile = { id: userId, full_name: name, email };

  return { user, session, profile };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored =
          localStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem("brandium_dev_session");
        if (stored) {
          const parsed = JSON.parse(stored) as {
            session: Session;
            profile: Profile;
            role: AppRole;
          };
          if (parsed?.session && parsed?.role) {
            setSession(parsed.session);
            setProfile(parsed.profile);
            setRole(parsed.role);
          }
        }
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const setAuthenticatedDbSession = (
    userId: string,
    name: string,
    email: string,
    userRole: AppRole,
  ) => {
    const { user, session: sess, profile: prof } = buildAuthObjects(userId, name, email, userRole);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({ session: sess, user, profile: prof, role: userRole }),
        );
      } catch {
        // Ignore
      }
    }

    setSession(sess);
    setProfile(prof);
    setRole(userRole);
    setLoading(false);
  };

  const signInAsDevUser = (name: string, email: string, userRole: AppRole) => {
    setAuthenticatedDbSession(`usr_${Date.now()}`, name, email, userRole);
  };

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    profile,
    role,
    loading,
    isAdmin: role === "admin",
    signOut: async () => {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(SESSION_STORAGE_KEY);
          localStorage.removeItem("brandium_dev_session");
          localStorage.removeItem("brandium_sid");
        } catch {
          // Ignore
        }
      }
      setSession(null);
      setProfile(null);
      setRole(null);
    },
    setAuthenticatedDbSession,
    signInAsDevUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
