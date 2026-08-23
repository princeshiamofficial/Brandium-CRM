import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      order: (
        col: string,
        opts?: { ascending?: boolean },
      ) => Promise<{ data: unknown[]; error: unknown }>;
    };
  };
};

// 12 Mandatory Example Services Dataset
const demoServices: CrmService[] = [
  {
    id: "srv-1",
    name: "Product Photography",
    description: "High-end studio & e-commerce product catalog shoot.",
    icon: "Camera",
    status: "Active",
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 40).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "srv-2",
    name: "Graphics Design",
    description: "Social media banners, ad creatives, and print designs.",
    icon: "Palette",
    status: "Active",
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 38).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "srv-3",
    name: "Monthly Plan",
    description: "All-in-one monthly digital marketing & telesales management.",
    icon: "Calendar",
    status: "Active",
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 35).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "srv-4",
    name: "Website Development",
    description: "Custom responsive React, Next.js, and WordPress websites.",
    icon: "Globe",
    status: "Active",
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 32).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "srv-5",
    name: "Celebrity Video Ads",
    description: "Commercial video ads featuring popular celebrities.",
    icon: "Video",
    status: "Active",
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "srv-6",
    name: "TVC",
    description: "Television Commercial production & broadcast formatting.",
    icon: "Tv",
    status: "Active",
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 28).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: "srv-7",
    name: "OVC",
    description: "Online Video Commercials optimized for social media.",
    icon: "PlayCircle",
    status: "Active",
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "srv-8",
    name: "Voice-Over Video Ads",
    description: "Professional voice-over narration with dynamic visuals.",
    icon: "Mic",
    status: "Active",
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 22).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: "srv-9",
    name: "Corporate AV",
    description: "Corporate Audio-Visual presentations & company profiles.",
    icon: "Film",
    status: "Active",
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 9).toISOString(),
  },
  {
    id: "srv-10",
    name: "Influencer Video Ads",
    description: "Influencer endorsement videos for TikTok, Instagram & FB.",
    icon: "Star",
    status: "Active",
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: "srv-11",
    name: "Motion Video Ads",
    description: "2D/3D motion graphics animation and visual FX.",
    icon: "Sparkles",
    status: "Active",
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 11).toISOString(),
  },
  {
    id: "srv-12",
    name: "Logo Design",
    description: "Custom brand identity, vector logos, and brand guidelines.",
    icon: "Brush",
    status: "Active",
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
];

export async function fetchServices(search?: string): Promise<CrmService[]> {
  try {
    const { data, error } = await dynamicDb
      .from("services")
      .select("*")
      .eq("is_deleted", false)
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return applySearchToServices(demoServices, search);
    }

    const mapped: CrmService[] = (data as Record<string, unknown>[]).map((s) => ({
      id: String(s["id"]),
      name: String(s["name"] || "Service"),
      description: (s["description"] as string) || null,
      icon: (s["icon"] as string) || "Layers",
      status: (s["status"] as ServiceStatus) || "Active",
      is_deleted: Boolean(s["is_deleted"]),
      created_at: String(s["created_at"] || new Date().toISOString()),
      updated_at: String(s["updated_at"] || new Date().toISOString()),
    }));

    return applySearchToServices(mapped, search);
  } catch {
    return applySearchToServices(demoServices, search);
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

  const now = new Date().toISOString();
  const newService: CrmService = {
    id: `srv-${Date.now()}`,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    icon: input.icon || "Layers",
    status: input.status || "Active",
    is_deleted: false,
    created_at: now,
    updated_at: now,
  };

  demoServices.unshift(newService);
  return newService;
}

export async function updateService(id: string, input: CreateServiceInput): Promise<CrmService> {
  const target = demoServices.find((s) => s.id === id);
  if (!target) throw new Error("Service not found.");

  target.name = input.name.trim();
  target.description = input.description?.trim() || null;
  if (input.icon) target.icon = input.icon;
  if (input.status) target.status = input.status;
  target.updated_at = new Date().toISOString();

  return target;
}

export async function toggleServiceStatus(id: string, newStatus: ServiceStatus): Promise<boolean> {
  const target = demoServices.find((s) => s.id === id);
  if (!target) throw new Error("Service not found.");

  target.status = newStatus;
  target.updated_at = new Date().toISOString();
  return true;
}

/**
 * Never hard-delete historical services! Perform soft-delete / set to inactive.
 */
export async function softDeleteService(id: string): Promise<boolean> {
  const target = demoServices.find((s) => s.id === id);
  if (!target) throw new Error("Service not found.");

  target.status = "Inactive";
  target.is_deleted = true;
  target.updated_at = new Date().toISOString();
  return true;
}

export const servicesQueryOptions = (search?: string) =>
  queryOptions({
    queryKey: ["crm-services", search],
    queryFn: () => fetchServices(search),
  });
