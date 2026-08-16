/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createMySQLSession, deleteMySQLSession, getMySQLSession } from "@/lib/auth.functions";

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

// Only a tiny session token ID is kept in localStorage (not user data)
const SESSION_TOKEN_KEY = "brandium_sid";

function getStoredSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

function setStoredSessionId(sid: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_TOKEN_KEY, sid);
  } catch {
    // ignore
  }
}

function clearStoredSessionId() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    // Also clean up old key if present
    localStorage.removeItem("brandium_dev_session");
  } catch {
    // ignore
  }
}

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

  // On mount: restore session from MySQL using stored session ID
  useEffect(() => {
    const sid = getStoredSessionId();

    if (sid) {
      // Fetch session data from MySQL
      getMySQLSession({ data: { sessionId: sid } })
        .then((res) => {
          if (res?.success && res.session) {
            const {
              user,
              session: sess,
              profile: prof,
            } = buildAuthObjects(
              res.session.userId,
              res.session.userName,
              res.session.userEmail,
              res.session.userRole,
            );
            setSession(sess);
            setProfile(prof);
            setRole(res.session.userRole);
            void user; // used via buildAuthObjects
          } else {
            // Session expired or not found in MySQL — clear token
            clearStoredSessionId();
            setSession(null);
            setProfile(null);
            setRole(null);
          }
        })
        .catch(() => {
          // If MySQL unreachable, fall back to old localStorage session (migration safety)
          try {
            const old = localStorage.getItem("brandium_dev_session");
            if (old) {
              const parsed = JSON.parse(old) as AuthSession;
              setSession(parsed.session);
              setProfile(parsed.profile);
              setRole(parsed.role);
            }
          } catch {
            // ignore
          }
        })
        .finally(() => setLoading(false));
      return;
    }

    // No session ID — check supabase fallback (no-op in MySQL mode)
    supabase.auth.getSession().then(() => {
      setLoading(false);
    });
  }, []);

  const setAuthenticatedDbSession = (
    userId: string,
    name: string,
    email: string,
    userRole: AppRole,
  ) => {
    const sid = `sid_${userId}_${Date.now()}`;
    const { user, session: sess, profile: prof } = buildAuthObjects(userId, name, email, userRole);

    // Store session in MySQL (server-side)
    createMySQLSession({
      data: { sessionId: sid, userId, userEmail: email, userName: name, userRole },
    }).catch(() => {
      // Fallback: keep session in localStorage if MySQL unavailable
      localStorage.setItem(
        "brandium_dev_session",
        JSON.stringify({ session: sess, user, profile: prof, role: userRole }),
      );
    });

    // Store only the tiny session token ID locally
    setStoredSessionId(sid);
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
      const sid = getStoredSessionId();
      if (sid) {
        // Delete session from MySQL
        deleteMySQLSession({ data: { sessionId: sid } }).catch(() => {});
      }
      clearStoredSessionId();
      await supabase.auth.signOut();
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
