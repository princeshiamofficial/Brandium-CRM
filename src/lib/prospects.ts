import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { formatStageSlugOrName } from "@/lib/stages";
import { runMySQLQuery } from "@/lib/mysql-api";
import {
  saveMySQLProspect,
  fetchMySQLProspects,
  deleteMySQLProspect,
  updateMySQLProspect,
} from "./prospects.functions";

export const prospectFiltersSchema = z.object({
  page: z.number().catch(1),
  search: z.string().optional(),
  stage: z.string().optional(),
  agent: z.string().optional(),
  service: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type ProspectFilters = z.infer<typeof prospectFiltersSchema>;

export type Prospect = {
  id: string;
  contact_name: string;
  business_name: string | null;
  designation: string | null;
  phone: string | null;
  alternative_phone: string | null;
  email: string | null;
  address: string | null;
  service_id: string | null;
  stage_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  notes: string | null;
  artist?: string | null | undefined;
  created_at: string;
  updated_at: string;
  // Joined fields
  service_name?: string | undefined;
  stage_name?: string | undefined;
  stage_group?: string | undefined;
  stage_color?: string | null | undefined;
  stage_icon?: string | null | undefined;
  assigned_agent_name?: string | undefined;
  creator_name?: string | undefined;
};

export function getProspectArtistName(prospect: {
  artist?: string | null | undefined;
  assigned_agent_name?: string | null | undefined;
  notes?: string | null | undefined;
}): string {
  if (prospect.artist && prospect.artist.trim() && prospect.artist.toLowerCase() !== "none") {
    return prospect.artist.trim();
  }

  if (prospect.notes) {
    const match = prospect.notes.match(/\[Artist:\s*([^\]]+)\]/i);
    if (match && match[1] && match[1].trim() && match[1].toLowerCase() !== "none") {
      return match[1].trim();
    }
  }

  if (
    prospect.assigned_agent_name &&
    prospect.assigned_agent_name.trim() &&
    prospect.assigned_agent_name.toLowerCase() !== "unknown"
  ) {
    return prospect.assigned_agent_name.trim();
  }

  return "Unassigned";
}

export function getProspectAgentName(prospect: {
  assigned_agent_name?: string | null | undefined;
  creator_name?: string | null | undefined;
  notes?: string | null | undefined;
}): string {
  if (prospect.notes) {
    const match = prospect.notes.match(/\[Agent:\s*([^\]]+)\]/i);
    if (match && match[1] && match[1].trim() && match[1].toLowerCase() !== "none") {
      return match[1].trim();
    }
  }

  if (
    prospect.assigned_agent_name &&
    prospect.assigned_agent_name.trim() &&
    prospect.assigned_agent_name.toLowerCase() !== "unknown" &&
    prospect.assigned_agent_name.toLowerCase() !== "agent"
  ) {
    return prospect.assigned_agent_name.trim();
  }

  if (
    prospect.creator_name &&
    prospect.creator_name.trim() &&
    prospect.creator_name.toLowerCase() !== "system"
  ) {
    return prospect.creator_name.trim();
  }

  return "Mehan Ahmed";
}

export const prospectsQuery = (filters: ProspectFilters, _userId: string, _isAdmin: boolean) =>
  queryOptions({
    queryKey: ["prospects", filters],
    queryFn: async () => {
      const pageSize = 10;
      const from = (filters.page - 1) * pageSize;
      let fetchedRows: Prospect[] = [];

      let mysqlSuccess = false;
      // 1. Fetch directly from local MySQL database `brandium_crm` via API bridge
      try {
        const res = await runMySQLQuery<Record<string, unknown>[]>(
          `SELECT 
            p.*,
            s.name AS service_name,
            COALESCE(st.name, p.stage_id, 'Prospect') AS stage_name,
            st.stage_group AS stage_group,
            st.color AS stage_color,
            st.icon AS stage_icon,
            u_assign.name AS assigned_agent_name,
            u_create.name AS creator_name
          FROM \`prospects\` p
          LEFT JOIN \`services\` s ON p.service_id = s.id
          LEFT JOIN \`stages\` st ON (p.stage_id = st.id OR p.stage_id = REPLACE(st.id, '-', '_') OR p.stage_id = st.name)
          LEFT JOIN \`users\` u_assign ON p.assigned_to = u_assign.id
          LEFT JOIN \`users\` u_create ON p.created_by = u_create.id
          WHERE (p.is_active = 1 OR p.is_active IS NULL)
          ORDER BY p.created_at DESC;`,
        );

        if (res?.success && Array.isArray(res.data)) {
          mysqlSuccess = true;
          fetchedRows = res.data.map((p) => {
            const stId = String(p["stage_id"] || "");
            return {
              id: String(p["id"]),
              contact_name: String(p["contact_name"] || "Client"),
              business_name: (p["business_name"] as string) || null,
              designation: (p["designation"] as string) || null,
              phone: (p["phone"] as string) || null,
              alternative_phone: (p["alternative_phone"] as string) || null,
              email: (p["email"] as string) || null,
              address: (p["address"] as string) || null,
              service_id: (p["service_id"] as string) || null,
              stage_id: stId || null,
              assigned_to: (p["assigned_to"] as string) || null,
              created_by: (p["created_by"] as string) || null,
              notes: (p["notes"] as string) || null,
              created_at: String(p["created_at"] || new Date().toISOString()),
              updated_at: String(p["updated_at"] || new Date().toISOString()),
              service_name: (p["service_name"] as string) || undefined,
              stage_name: String(p["stage_name"] || formatStageSlugOrName(stId) || "Prospect"),
              stage_group: (p["stage_group"] as string) || "new",
              stage_color: (p["stage_color"] as string) || null,
              stage_icon: (p["stage_icon"] as string) || null,
              assigned_agent_name: (p["assigned_agent_name"] as string) || undefined,
              creator_name: (p["creator_name"] as string) || undefined,
            } as Prospect;
          });
        }
      } catch (err) {
        console.warn("prospectsQuery API error:", err);
      }

      // Fallback with server function if direct query failed
      if (!mysqlSuccess) {
        try {
          const mysqlRes = await fetchMySQLProspects();
          if (mysqlRes?.success && Array.isArray(mysqlRes.prospects)) {
            mysqlSuccess = true;
            fetchedRows = mysqlRes.prospects.map((p) => {
              const stId = String(p["stage_id"] || "");
              return {
                id: String(p["id"]),
                contact_name: String(p["contact_name"] || "Client"),
                business_name: (p["business_name"] as string) || null,
                designation: (p["designation"] as string) || null,
                phone: (p["phone"] as string) || null,
                alternative_phone: (p["alternative_phone"] as string) || null,
                email: (p["email"] as string) || null,
                address: (p["address"] as string) || null,
                service_id: (p["service_id"] as string) || null,
                stage_id: stId || null,
                assigned_to: (p["assigned_to"] as string) || null,
                created_by: (p["created_by"] as string) || null,
                notes: (p["notes"] as string) || null,
                created_at: String(p["created_at"] || new Date().toISOString()),
                updated_at: String(p["updated_at"] || new Date().toISOString()),
                service_name: (p["service_name"] as string) || undefined,
                stage_name: String(p["stage_name"] || formatStageSlugOrName(stId) || "Prospect"),
                stage_group: (p["stage_group"] as string) || "new",
                stage_color: (p["stage_color"] as string) || null,
                stage_icon: (p["stage_icon"] as string) || null,
                assigned_agent_name: (p["assigned_agent_name"] as string) || undefined,
                creator_name: (p["creator_name"] as string) || undefined,
              } as Prospect;
            });
          }
        } catch {
          // ignore
        }
      }

      // Apply in-memory filtering
      let rows = fetchedRows;
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        rows = rows.filter(
          (p) =>
            p.contact_name.toLowerCase().includes(q) ||
            (p.business_name && p.business_name.toLowerCase().includes(q)) ||
            (p.phone && p.phone.includes(q)) ||
            (p.alternative_phone && p.alternative_phone.includes(q)) ||
            (p.email && p.email.toLowerCase().includes(q)) ||
            (p.designation && p.designation.toLowerCase().includes(q)) ||
            (p.address && p.address.toLowerCase().includes(q)) ||
            (p.service_name && p.service_name.toLowerCase().includes(q)) ||
            (p.stage_name && p.stage_name.toLowerCase().includes(q)) ||
            (p.notes && p.notes.toLowerCase().includes(q)) ||
            (p.assigned_agent_name && p.assigned_agent_name.toLowerCase().includes(q)) ||
            (p.creator_name && p.creator_name.toLowerCase().includes(q)),
        );
      }
      if (filters.stage && filters.stage !== "all") {
        const target = filters.stage.replace(/[-_]/g, " ").toLowerCase();
        rows = rows.filter((p) => {
          if (p.stage_id === filters.stage) return true;
          const sName = (p.stage_name || "").toLowerCase();
          if (target.includes("follow") && sName.includes("follow")) return true;
          if (target.includes("opportunity") && sName.includes("opportunity")) return true;
          if (
            (target.includes("won") || target.includes("sales")) &&
            (sName.includes("won") || sName.includes("sales"))
          )
            return true;
          if (target.includes("prospect") && sName.includes("prospect")) return true;
          return sName.includes(target) || target.includes(sName);
        });
      }
      if (filters.agent && filters.agent !== "all") {
        rows = rows.filter((p) => p.assigned_to === filters.agent);
      }
      if (filters.service && filters.service !== "all") {
        rows = rows.filter((p) => p.service_id === filters.service);
      }
      if (filters.from) {
        rows = rows.filter((p) => p.created_at >= filters.from!);
      }
      if (filters.to) {
        rows = rows.filter((p) => p.created_at <= filters.to!);
      }

      const totalCount = rows.length;
      const paginated = rows.slice(from, from + pageSize);
      return {
        data: paginated,
        count: totalCount,
        pageCount: Math.ceil(totalCount / pageSize) || 1,
      };
    },
  });

export const prospectsStatsQuery = (_userId: string, _isAdmin: boolean) =>
  queryOptions({
    queryKey: ["prospects-stats"],
    queryFn: async () => {
      let allProspects: Record<string, unknown>[] = [];
      try {
        const res = await runMySQLQuery<Record<string, unknown>[]>(
          `SELECT 
            p.id,
            p.stage_id,
            COALESCE(st.name, p.stage_id, 'Prospect') AS stage_name
          FROM \`prospects\` p
          LEFT JOIN \`stages\` st ON (p.stage_id = st.id OR p.stage_id = REPLACE(st.id, '-', '_') OR p.stage_id = st.name)
          WHERE (p.is_active = 1 OR p.is_active IS NULL) 
          ORDER BY p.created_at DESC;`,
        );
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          allProspects = res.data;
        }
      } catch {
        // Fallback
      }

      if (allProspects.length === 0) {
        try {
          const mysqlRes = await fetchMySQLProspects();
          if (
            mysqlRes?.success &&
            Array.isArray(mysqlRes.prospects) &&
            mysqlRes.prospects.length > 0
          ) {
            allProspects = mysqlRes.prospects;
          }
        } catch {
          // Fallback
        }
      }

      const totalProspects = allProspects.length;
      let salesWon = 0;
      let activeProspects = 0;
      let pendingTasks = 0;
      let followUps = 0;
      const stageCounts: Record<string, number> = {};

      for (const p of allProspects) {
        const rawStage = String(
          (p["stage_name"] as string) || (p["stage_id"] as string) || "Prospect",
        );
        const stageName = rawStage.toLowerCase();
        const isWon = stageName.includes("won") || stageName.includes("sales won");
        const isFollowUp = stageName.includes("follow");
        const isPending =
          isFollowUp ||
          stageName.includes("opportunity") ||
          stageName.includes("prospect") ||
          stageName.includes("meeting") ||
          stageName.includes("quotation");

        if (isWon) salesWon++;
        else activeProspects++;
        if (isPending) pendingTasks++;
        if (isFollowUp) followUps++;

        const trimmedKey = rawStage.trim();
        stageCounts[trimmedKey] = (stageCounts[trimmedKey] || 0) + 1;
      }

      const successRate =
        totalProspects > 0 ? ((salesWon / totalProspects) * 100).toFixed(1) + "%" : "0.0%";

      return {
        totalProspects,
        activeProspects,
        salesWon,
        pendingTasks,
        followUps,
        stageCounts,
        successRate,
      };
    },
  });

export type CreateProspectInput = {
  contact_name: string;
  business_name?: string | null | undefined;
  designation?: string | null | undefined;
  phone?: string | null | undefined;
  alternative_phone?: string | null | undefined;
  email?: string | null | undefined;
  address?: string | null | undefined;
  service_id?: string | null | undefined;
  stage_id?: string | null | undefined;
  assigned_to?: string | null | undefined;
  created_by?: string | null | undefined;
  notes?: string | null | undefined;
};

export function formatProspectId(id?: string | null): string {
  if (!id) return "0001";
  const trimmed = id.trim();
  // If already numeric like "0001", "12", "5"
  if (/^\d+$/.test(trimmed)) {
    return trimmed.padStart(4, "0");
  }
  // If format is like "prospect-1786569978392"
  const match = trimmed.match(/^prospect-(\d+)$/i);
  if (match && match[1]) {
    const last4 = match[1].slice(-4);
    return last4.padStart(4, "0");
  }
  return trimmed;
}

export async function generateNextProspectId(): Promise<string> {
  try {
    const res = await runMySQLQuery<Record<string, unknown>[]>(
      "SELECT `id` FROM `prospects` ORDER BY `created_at` DESC;",
    );
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      let maxNum = 0;
      for (const row of res.data) {
        const idStr = String(row["id"] || "");
        // Match pure numeric or 0001 format
        const numMatch = idStr.match(/^0*(\d+)$/);
        if (numMatch && numMatch[1]) {
          const n = parseInt(numMatch[1], 10);
          if (n > maxNum && n < 1000000) {
            maxNum = n;
          }
        }
      }

      if (maxNum > 0) {
        return String(maxNum + 1).padStart(4, "0");
      }

      // If existing IDs are all timestamps, compute count + 1
      const count = res.data.length;
      return String(count + 1).padStart(4, "0");
    }
    return "0001";
  } catch {
    return "0001";
  }
}

export async function createProspect(input: CreateProspectInput): Promise<Prospect> {
  const nextId = await generateNextProspectId();
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  const newProspect: Prospect = {
    id: nextId,
    contact_name: input.contact_name,
    business_name: input.business_name || null,
    designation: input.designation || null,
    phone: input.phone || null,
    alternative_phone: input.alternative_phone || null,
    email: input.email || null,
    address: input.address || null,
    service_id: input.service_id || null,
    stage_id: input.stage_id || null,
    assigned_to: input.assigned_to || null,
    created_by: input.created_by || null,
    notes: input.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    service_name: undefined,
    stage_name: "Prospect",
    stage_group: "new",
    assigned_agent_name: undefined,
    creator_name: undefined,
  };

  // 1. Direct INSERT query via API bridge into MySQL `brandium_crm.prospects` table
  const insertSql = `
    INSERT INTO \`prospects\` (
      \`id\`, \`contact_name\`, \`business_name\`, \`designation\`, \`phone\`,
      \`alternative_phone\`, \`email\`, \`address\`, \`service_id\`, \`stage_id\`,
      \`assigned_to\`, \`created_by\`, \`notes\`, \`is_active\`, \`created_at\`, \`updated_at\`
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    ON DUPLICATE KEY UPDATE
      \`contact_name\` = VALUES(\`contact_name\`),
      \`business_name\` = VALUES(\`business_name\`),
      \`designation\` = VALUES(\`designation\`),
      \`phone\` = VALUES(\`phone\`),
      \`alternative_phone\` = VALUES(\`alternative_phone\`),
      \`email\` = VALUES(\`email\`),
      \`address\` = VALUES(\`address\`),
      \`service_id\` = VALUES(\`service_id\`),
      \`stage_id\` = VALUES(\`stage_id\`),
      \`assigned_to\` = VALUES(\`assigned_to\`),
      \`created_by\` = VALUES(\`created_by\`),
      \`notes\` = VALUES(\`notes\`),
      \`updated_at\` = VALUES(\`updated_at\`);
  `;

  const insertParams = [
    nextId,
    input.contact_name,
    input.business_name || null,
    input.designation || null,
    input.phone || null,
    input.alternative_phone || null,
    input.email || null,
    input.address || null,
    input.service_id || null,
    input.stage_id || null,
    input.assigned_to || null,
    input.created_by || null,
    input.notes || null,
    now,
    now,
  ];

  const res = await runMySQLQuery(insertSql, insertParams);
  if (!res?.success) {
    console.warn("Direct MySQL Query insert warning:", res?.error);
  }

  // 2. Secondary: server function sync
  saveMySQLProspect({
    data: {
      id: newProspect.id,
      contact_name: input.contact_name,
      business_name: input.business_name || null,
      designation: input.designation || null,
      phone: input.phone || null,
      alternative_phone: input.alternative_phone || null,
      email: input.email || null,
      address: input.address || null,
      service_id: input.service_id || null,
      stage_id: input.stage_id || null,
      assigned_to: input.assigned_to || null,
      created_by: input.created_by || null,
      notes: input.notes || null,
    },
  }).catch((e) => console.warn("saveMySQLProspect error notice:", e));

  return newProspect;
}

export async function deleteProspect(prospectId: string): Promise<boolean> {
  if (!prospectId) return false;

  await runMySQLQuery("DELETE FROM `prospects` WHERE `id` = ?", [prospectId]);
  deleteMySQLProspect({ data: { id: prospectId } }).catch(() => {});

  return true;
}

export async function updateProspect(
  prospectId: string,
  input: Partial<CreateProspectInput>,
): Promise<boolean> {
  if (!prospectId) return false;
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  const updateSql = `
    UPDATE \`prospects\` SET
      \`contact_name\` = COALESCE(?, \`contact_name\`),
      \`business_name\` = ?,
      \`designation\` = ?,
      \`phone\` = ?,
      \`alternative_phone\` = ?,
      \`email\` = ?,
      \`address\` = ?,
      \`service_id\` = ?,
      \`stage_id\` = ?,
      \`assigned_to\` = ?,
      \`created_by\` = ?,
      \`notes\` = ?,
      \`updated_at\` = ?
    WHERE \`id\` = ?
  `;

  const updateParams = [
    input.contact_name || null,
    input.business_name || null,
    input.designation || null,
    input.phone || null,
    input.alternative_phone || null,
    input.email || null,
    input.address || null,
    input.service_id || null,
    input.stage_id || null,
    input.assigned_to || null,
    input.created_by || null,
    input.notes || null,
    now,
    prospectId,
  ];

  await runMySQLQuery(updateSql, updateParams);
  updateMySQLProspect({
    data: {
      id: prospectId,
      contact_name: input.contact_name || "",
      business_name: input.business_name || null,
      designation: input.designation || null,
      phone: input.phone || null,
      alternative_phone: input.alternative_phone || null,
      email: input.email || null,
      address: input.address || null,
      service_id: input.service_id || null,
      stage_id: input.stage_id || null,
      assigned_to: input.assigned_to || null,
      created_by: input.created_by || null,
      notes: input.notes || null,
    },
  }).catch(() => {});

  return true;
}
