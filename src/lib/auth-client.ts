/**
 * Client-Side Authentication Service for Brandium CRM.
 * Authenticates directly against Next.js Route Handler `/api/auth/login` and local MySQL `users` table.
 */

export type AuthUser = {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    role?: string;
    [key: string]: unknown;
  };
};

export type SignInResult = {
  data: {
    user: AuthUser;
    session: {
      access_token: string;
      user: AuthUser;
    };
  } | null;
  error: { message: string } | null;
};

export async function signInWithPassword(credentials: {
  email: string;
  password: string;
}): Promise<SignInResult> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email.trim(),
        password: credentials.password,
      }),
    });

    const body = await res.json();

    if (!res.ok || !body.success || !body.user) {
      return {
        data: null,
        error: { message: body.error || "Invalid email or password." },
      };
    }

    const user: AuthUser = {
      id: body.user.id,
      email: body.user.email,
      user_metadata: {
        full_name: body.user.name,
        role: body.user.role,
      },
    };

    return {
      data: {
        user,
        session: {
          access_token: `jwt_${user.id}_${Date.now()}`,
          user,
        },
      },
      error: null,
    };
  } catch (err: unknown) {
    const errObj = err as { message?: string };
    return {
      data: null,
      error: { message: errObj.message || "Network or connection error." },
    };
  }
}
