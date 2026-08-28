import { queryOptions } from "@tanstack/react-query";
import { runMySQLQuery } from "@/lib/mysql-api";
import { generateUUID, getMySQLTimestamp } from "@/lib/mysql-client";

export type ServiceStatus = "Active" | "Inactive" | "Deleted";

export type CrmService = {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  status: ServiceStatus;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateServiceInput = {
  name: string;
  description?: string | null | undefined;
  icon?: string | undefined;
  status?: ServiceStatus | undefined;
};

export async function fetchServices(search?: string): Promise<CrmService[]> {
  try {
    const res = await runMySQLQuery<Record<string, unknown>[]>(
      "SELECT id, name, description, icon, is_active, created_at, updated_at FROM `services` WHERE is_active = 1 ORDER BY name ASC;",
    );

    if (!res.success || !Array.isArray(res.data)) {
      return [];
    }

    const mapped: CrmService[] = res.data.map((s) => ({
      id: String(s["id"]),
      name: String(s["name"] || "Service"),
      description: (s["description"] as string) || null,
      icon: (s["icon"] as string) || "Layers",
      status: Number(s["is_active"] ?? 1) === 1 ? "Active" : "Inactive",
      is_deleted: false,
      created_at: String(s["created_at"] || new Date().toISOString()),
      updated_at: String(s["updated_at"] || new Date().toISOString()),
    }));

    return applySearchToServices(mapped, search);
  } catch (err) {
    console.warn("fetchServices MySQL error:", err);
    return [];
  }
}

function applySearchToServices(list: CrmService[], search?: string): CrmService[] {
  let activeList = list.filter((s) => !s.is_deleted);
  if (search && search.trim() !== "") {
    const q = search.toLowerCase().trim();
    activeList = activeList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)),
    );
  }
  return activeList;
}

export async function createService(input: CreateServiceInput): Promise<CrmService> {
  if (!input.name || !input.name.trim()) {
    throw new Error("Service name is required.");
  }

  const id = generateUUID();
  const now = getMySQLTimestamp();

  const res = await runMySQLQuery(
    `INSERT INTO \`services\` (\`id\`, \`name\`, \`description\`, \`icon\`, \`is_active\`, \`created_at\`, \`updated_at\`)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      input.name.trim(),
      input.description?.trim() || null,
      input.icon || "Layers",
      input.status === "Inactive" ? 0 : 1,
      now,
      now,
    ],
  );

  if (!res.success) {
    throw new Error(res.error || "Failed to create service in database.");
  }

  return {
    id,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    icon: input.icon || "Layers",
    status: input.status || "Active",
    is_deleted: false,
    created_at: now,
    updated_at: now,
  };
}

export async function updateService(id: string, input: CreateServiceInput): Promise<CrmService> {
  const now = getMySQLTimestamp();

  await runMySQLQuery(
    `UPDATE \`services\` SET \`name\` = ?, \`description\` = ?, \`icon\` = ?, \`is_active\` = ?, \`updated_at\` = ? WHERE \`id\` = ?;`,
    [
      input.name.trim(),
      input.description?.trim() || null,
      input.icon || "Layers",
      input.status === "Inactive" ? 0 : 1,
      now,
      id,
    ],
  );

  return {
    id,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    icon: input.icon || "Layers",
    status: input.status || "Active",
    is_deleted: false,
    created_at: now,
    updated_at: now,
  };
}

export async function toggleServiceStatus(id: string, newStatus: ServiceStatus): Promise<boolean> {
  const now = getMySQLTimestamp();
  const res = await runMySQLQuery(
    "UPDATE `services` SET `is_active` = ?, `updated_at` = ? WHERE `id` = ?;",
    [newStatus === "Active" ? 1 : 0, now, id],
  );
  return Boolean(res.success);
}

export async function softDeleteService(id: string): Promise<boolean> {
  const now = getMySQLTimestamp();
  const res = await runMySQLQuery(
    "UPDATE `services` SET `is_active` = 0, `updated_at` = ? WHERE `id` = ?;",
    [now, id],
  );
  return Boolean(res.success);
}

export const servicesQueryOptions = (search?: string) =>
  queryOptions({
    queryKey: ["crm-services", search],
    queryFn: () => fetchServices(search),
  });
