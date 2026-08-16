import { queryOptions } from "@tanstack/react-query";
import bcrypt from "bcryptjs";
import { supabase } from "@/integrations/supabase/client";
import { generateUUID } from "@/lib/mysql-client";
import {
  createMySQLUser,
  fetchMySQLUsers,
  resetMySQLUserPassword,
  softDeleteMySQLUser,
  toggleMySQLUserStatus,
  updateMySQLUser,
  updateMySQLUserAvatar,
} from "@/lib/auth.functions";

export type CrmUserRole = "ADMIN" | "AGENT";
export type CrmUserStatus = "Active" | "Inactive" | "Deleted";

export type CrmUser = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: CrmUserRole;
  status: CrmUserStatus;
  avatar_url?: string | null | undefined;
  is_deleted: boolean;
  deleted_at?: string | null | undefined;
  created_at: string;
  updated_at: string;
};

export type CreateCrmUserInput = {
  name: string;
  email: string;
  password_hash: string;
  role: CrmUserRole;
  status: CrmUserStatus;
  avatar_url?: string | null | undefined;
};

export type UpdateCrmUserInput = {
  name: string;
  email: string;
  role: CrmUserRole;
  status: CrmUserStatus;
  avatar_url?: string | null | undefined;
};

// Safe DB accessor wrapper
const dynamicDb = supabase as unknown as {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (
        col: string,
        val: unknown,
      ) => {
        order: (
          col: string,
          opts?: { ascending?: boolean },
        ) => Promise<{ data: unknown[]; error: unknown }>;
      };
    };
  };
};

export function hashPasswordBcrypt(plaintext: string): string {
  return bcrypt.hashSync(plaintext, 10);
}

export function verifyPasswordBcrypt(plaintext: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(plaintext, hash);
  } catch {
    return false;
  }
}

// Fallback seed accounts in memory
export const demoCrmUsers: CrmUser[] = [
  {
    id: "usr-admin-1",
    name: "Mehan Ahmed (System Admin)",
    email: "admin@example.com",
    password_hash: hashPasswordBcrypt("Admin@12345"),
    role: "ADMIN",
    status: "Active",
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "usr-admin-2",
    name: "Mehan Ahmed",
    email: "mehan.ahmed.official@gmail.com",
    password_hash: hashPasswordBcrypt("Admin@12345"),
    role: "ADMIN",
    status: "Active",
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "usr-agent-0",
    name: "Agent User",
    email: "agent@brandium.com",
    password_hash: hashPasswordBcrypt("Agent@12345"),
    role: "AGENT",
    status: "Active",
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "usr-agent-1",
    name: "Tanvir Hasan",
    email: "tanvir.agent@brandium.com",
    password_hash: hashPasswordBcrypt("Agent@12345"),
    role: "AGENT",
    status: "Active",
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "usr-agent-2",
    name: "Nusrat Jahan",
    email: "nusrat.agent@brandium.com",
    password_hash: hashPasswordBcrypt("Agent@12345"),
    role: "AGENT",
    status: "Active",
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "usr-agent-3",
    name: "Rafiqul Islam",
    email: "rafiq.agent@brandium.com",
    password_hash: hashPasswordBcrypt("Agent@12345"),
    role: "AGENT",
    status: "Inactive",
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
];

// Global in-memory avatar cache (bypasses localStorage while keeping avatars visible)
const userAvatarMemoryMap = new Map<string, string>();

export async function fetchCrmUsers(search?: string): Promise<CrmUser[]> {
  try {
    const res = await fetchMySQLUsers();
    if (res && res.success && Array.isArray(res.users) && res.users.length > 0) {
      const mapped: CrmUser[] = res.users.map((u) => {
        const userId = String(u["id"]);
        const dbAvatar = u["avatar_url"] ? String(u["avatar_url"]) : null;
        const memoryAvatar = userAvatarMemoryMap.get(userId);
        const avatarUrl = memoryAvatar !== undefined ? memoryAvatar : dbAvatar;
        if (avatarUrl) {
          userAvatarMemoryMap.set(userId, avatarUrl);
        }
        return {
          id: userId,
          name: String(u["name"] || "User"),
          email: String(u["email"] || ""),
          password_hash: String(u["password_hash"] || ""),
          role: (u["role"] as CrmUserRole) || "AGENT",
          status: (u["status"] as CrmUserStatus) || "Active",
          avatar_url: avatarUrl,
          is_deleted: Boolean(u["is_deleted"]),
          deleted_at: (u["deleted_at"] as string) || null,
          created_at: String(u["created_at"] || new Date().toISOString()),
          updated_at: String(u["updated_at"] || new Date().toISOString()),
        };
      });
      return applySearchToUsers(mapped, search);
    }
  } catch {
    // Fallback to direct db query
  }

  try {
    const { data, error } = await dynamicDb
      .from("users")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      const merged = demoCrmUsers.map((u) => {
        const memoryAvatar = userAvatarMemoryMap.get(u.id);
        return {
          ...u,
          avatar_url: memoryAvatar !== undefined ? memoryAvatar : u.avatar_url || null,
        };
      });
      return applySearchToUsers(merged, search);
    }

    const mapped: CrmUser[] = (data as Record<string, unknown>[]).map((u) => {
      const userId = String(u["id"]);
      const dbAvatar = u["avatar_url"] ? String(u["avatar_url"]) : null;
      const memoryAvatar = userAvatarMemoryMap.get(userId);
      const avatarUrl = memoryAvatar !== undefined ? memoryAvatar : dbAvatar;
      if (avatarUrl) {
        userAvatarMemoryMap.set(userId, avatarUrl);
      }
      return {
        id: userId,
        name: String(u["name"] || "User"),
        email: String(u["email"] || ""),
        password_hash: String(u["password_hash"] || ""),
        role: (u["role"] as CrmUserRole) || "AGENT",
        status: (u["status"] as CrmUserStatus) || "Active",
        avatar_url: avatarUrl,
        is_deleted: Boolean(u["is_deleted"]),
        deleted_at: (u["deleted_at"] as string) || null,
        created_at: String(u["created_at"] || new Date().toISOString()),
        updated_at: String(u["updated_at"] || new Date().toISOString()),
      };
    });

    return applySearchToUsers(mapped, search);
  } catch {
    const merged = demoCrmUsers.map((u) => {
      const memoryAvatar = userAvatarMemoryMap.get(u.id);
      return {
        ...u,
        avatar_url: memoryAvatar !== undefined ? memoryAvatar : u.avatar_url || null,
      };
    });
    return applySearchToUsers(merged, search);
  }
}

function applySearchToUsers(list: CrmUser[], search?: string): CrmUser[] {
  let activeList = list.filter((u) => !u.is_deleted);
  if (search && search.trim() !== "") {
    const q = search.toLowerCase().trim();
    activeList = activeList.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.status.toLowerCase().includes(q),
    );
  }
  return activeList;
}

export async function fetchCrmUserById(id: string): Promise<CrmUser | null> {
  const users = await fetchCrmUsers();
  return users.find((u) => u.id === id) || null;
}

export async function createCrmUser(input: CreateCrmUserInput): Promise<CrmUser> {
  // Validate email format
  if (!input.email || !input.email.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }
  // Validate name
  if (!input.name || !input.name.trim()) {
    throw new Error("User full name is required.");
  }

  // Check unique email
  const existing = demoCrmUsers.find(
    (u) => u.email.toLowerCase() === input.email.toLowerCase() && !u.is_deleted,
  );
  if (existing) {
    throw new Error(`A user account with email "${input.email}" already exists.`);
  }

  // Hash password using bcrypt
  const hashedPassword = hashPasswordBcrypt(input.password_hash);
  const now = new Date().toISOString();
  const userId = generateUUID();

  try {
    await createMySQLUser({
      data: {
        userId,
        name: input.name.trim(),
        email: input.email.toLowerCase().trim(),
        passwordHash: hashedPassword,
        role: input.role,
        status: input.status,
        avatarUrl: input.avatar_url || null,
      },
    });
  } catch (err) {
    console.error("Create MySQL User Error:", err);
  }

  const newUser: CrmUser = {
    id: userId,
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    password_hash: hashedPassword,
    role: input.role,
    status: input.status,
    avatar_url: input.avatar_url || null,
    is_deleted: false,
    created_at: now,
    updated_at: now,
  };

  demoCrmUsers.unshift(newUser);
  return newUser;
}

export async function updateCrmUser(id: string, input: UpdateCrmUserInput): Promise<CrmUser> {
  const inputEmail = input.email.toLowerCase().trim();

  // Find existing target by ID or matching email
  let target = demoCrmUsers.find((u) => u.id === id || u.email.toLowerCase() === inputEmail);

  // Check unique email among OTHER active accounts
  const duplicate = demoCrmUsers.find(
    (u) =>
      u.id !== id && u.id !== target?.id && u.email.toLowerCase() === inputEmail && !u.is_deleted,
  );
  if (duplicate) {
    throw new Error(`Another user account with email "${input.email}" already exists.`);
  }

  if (!target) {
    target = {
      id,
      name: input.name.trim(),
      email: inputEmail,
      password_hash: "",
      role: input.role,
      status: input.status,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    demoCrmUsers.unshift(target);
  } else {
    target.id = id;
    target.name = input.name.trim();
    target.email = inputEmail;
    target.role = input.role;
    target.status = input.status;
    target.updated_at = new Date().toISOString();
  }

  try {
    await updateMySQLUser({
      data: {
        userId: id,
        name: input.name.trim(),
        email: inputEmail,
        role: input.role,
        status: input.status,
      },
    });
  } catch (err) {
    console.error("Update MySQL User Error:", err);
  }

  // Keep dev session in sync if updating active session user
  if (typeof window !== "undefined") {
    try {
      const devRaw = localStorage.getItem("brandium_dev_session");
      if (devRaw) {
        const devSession = JSON.parse(devRaw);
        if (
          devSession?.profile?.id === id ||
          devSession?.profile?.email?.toLowerCase() === inputEmail ||
          devSession?.user?.id === id
        ) {
          devSession.profile.full_name = input.name.trim();
          devSession.profile.email = inputEmail;
          if (devSession.user) {
            devSession.user.email = inputEmail;
            if (devSession.user.user_metadata) {
              devSession.user.user_metadata.full_name = input.name.trim();
            }
          }
          localStorage.setItem("brandium_dev_session", JSON.stringify(devSession));
        }
      }
    } catch {
      // Ignore
    }
  }

  return target;
}

export async function resetUserPassword(userId: string, newPlaintext: string): Promise<boolean> {
  if (!newPlaintext || newPlaintext.length < 6) {
    throw new Error("New password must be at least 6 characters long.");
  }

  const target = demoCrmUsers.find((u) => u.id === userId);
  if (!target) throw new Error("User account not found.");

  const hashed = hashPasswordBcrypt(newPlaintext);
  target.password_hash = hashed;
  target.updated_at = new Date().toISOString();

  try {
    await resetMySQLUserPassword({ data: { userId, passwordHash: hashed } });
  } catch (err) {
    console.error("Reset MySQL User Password Error:", err);
  }

  return true;
}

export async function changeOwnPassword(
  userId: string,
  currentPlaintext: string,
  newPlaintext: string,
): Promise<boolean> {
  const target = demoCrmUsers.find((u) => u.id === userId);
  if (!target) throw new Error("User account not found.");

  // Verify current password with bcrypt
  const isMatch = verifyPasswordBcrypt(currentPlaintext, target.password_hash);
  if (!isMatch) {
    throw new Error("Current password entered is incorrect.");
  }

  return resetUserPassword(userId, newPlaintext);
}

export async function toggleUserStatus(userId: string, newStatus: CrmUserStatus): Promise<boolean> {
  const target = demoCrmUsers.find((u) => u.id === userId);
  if (target) {
    target.status = newStatus;
    target.updated_at = new Date().toISOString();
  }

  try {
    await toggleMySQLUserStatus({ data: { userId, status: newStatus } });
  } catch (err) {
    console.error("Toggle MySQL User Status Error:", err);
  }

  return true;
}

export async function softDeleteCrmUser(userId: string): Promise<boolean> {
  const target = demoCrmUsers.find((u) => u.id === userId);
  if (target?.email === "admin@example.com" || target?.email === "agent@brandium.com") {
    throw new Error("System default demo accounts cannot be deleted.");
  }
  if (target) {
    target.is_deleted = true;
    target.status = "Deleted";
    target.deleted_at = new Date().toISOString();
    target.updated_at = new Date().toISOString();
  }

  try {
    await softDeleteMySQLUser({ data: { userId } });
  } catch (err) {
    console.error("Soft Delete MySQL User Error:", err);
  }

  return true;
}

export async function updateUserAvatar(userId: string, avatarUrl: string): Promise<boolean> {
  const newAvatar = avatarUrl || null;
  const now = new Date().toISOString();

  // Save to in-memory avatar cache (guarantees UI displays image without saving in localStorage)
  if (newAvatar) {
    userAvatarMemoryMap.set(userId, newAvatar);
  } else {
    userAvatarMemoryMap.delete(userId);
  }

  const target = demoCrmUsers.find((u) => u.id === userId);
  if (target) {
    target.avatar_url = newAvatar;
    target.updated_at = now;
  }

  // Directly update XAMPP MySQL Database (`users` and `user_avatars` tables) via Server Function
  try {
    await updateMySQLUserAvatar({ data: { userId, avatarUrl: newAvatar || "" } });
  } catch (err) {
    console.error("Direct MySQL Avatar Server Function Error:", err);
  }

  return true;
}

export const crmUsersQueryOptions = (search?: string) =>
  queryOptions({
    queryKey: ["crm-users", search],
    queryFn: () => fetchCrmUsers(search),
  });

export const crmUserDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["crm-user", id],
    queryFn: () => fetchCrmUserById(id),
  });
