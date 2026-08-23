import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Reusable stage engine entry point.
 */
export const changeProspectStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        prospectId: z.string().min(1),
        stageId: z.string().min(1),
        note: z.string().trim().max(1000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: result, error } = await context.supabase.rpc("change_prospect_stage", {
      p_prospect_id: data.prospectId,
      p_stage_id: data.stageId,
      ...(data.note ? { p_note: data.note } : {}),
    });

    if (error) throw new Error((error as { message: string }).message);

    return result as unknown as {
      changed: boolean;
      history_id?: string;
      from_stage_id?: string | null;
      stage_id: string;
      stage_name: string;
    };
  });

export const createStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        name: z.string().trim().min(1).max(100),
        stage_group: z.string().trim().min(1).max(50),
        sort_order: z.number().int().min(0),
        is_follow_up: z.boolean().default(false),
        color: z.string().optional(),
        icon: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    // Permission check should be handled by RLS, but we can verify role here if needed
    const { data: profile } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .single();

    if (!profile) throw new Error("Unauthorized: Only admins can manage stages");

    const { data: result, error } = await context.supabase
      .from("stages")
      .insert({
        name: data.name,
        stage_group: data.stage_group,
        sort_order: data.sort_order,
        is_follow_up: data.is_follow_up,
        color: data.color ?? null,
        icon: data.icon ?? null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      if ((error as { code?: string }).code === "23505")
        throw new Error("A stage with this name already exists");
      throw new Error((error as { message: string }).message);
    }
    return result as unknown as { id: string; name: string } | null;
  });

export const updateStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().min(1),
        name: z.string().trim().min(1).max(100).optional(),
        stage_group: z.string().trim().min(1).max(50).optional(),
        sort_order: z.number().int().min(0).optional(),
        is_follow_up: z.boolean().optional(),
        is_active: z.boolean().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .single();

    if (!profile) throw new Error("Unauthorized: Only admins can manage stages");

    // Check if it's a system stage and trying to change protected fields
    if (data.name || data.is_active === false) {
      const { data: stage } = await context.supabase
        .from("stages")
        .select("is_system")
        .eq("id", data.id)
        .single();

      if ((stage as Record<string, unknown> | null)?.["is_system"]) {
        if (data.is_active === false) throw new Error("System stages cannot be deactivated");
        // We allow changing name, but maybe with a warning in UI?
      }
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (data.name !== undefined) updatePayload["name"] = data.name;
    if (data.stage_group !== undefined) updatePayload["stage_group"] = data.stage_group;
    if (data.sort_order !== undefined) updatePayload["sort_order"] = data.sort_order;
    if (data.is_follow_up !== undefined) updatePayload["is_follow_up"] = data.is_follow_up;
    if (data.is_active !== undefined) updatePayload["is_active"] = data.is_active;
    if (data.color !== undefined) updatePayload["color"] = data.color ?? null;
    if (data.icon !== undefined) updatePayload["icon"] = data.icon ?? null;

    const { data: result, error } = await context.supabase
      .from("stages")
      .update(updatePayload as Record<string, unknown>)
      .eq("id", data.id)
      .select()
      .single();

    if (error) {
      if ((error as { code?: string }).code === "23505")
        throw new Error("A stage with this name already exists");
      throw new Error((error as { message: string }).message);
    }
    return result as unknown as { id: string; name: string } | null;
  });

export const deleteStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .single();

    if (!profile) throw new Error("Unauthorized: Only admins can manage stages");

    // Check if system stage
    const { data: stage } = await context.supabase
      .from("stages")
      .select("is_system")
      .eq("id", data.id)
      .single();

    if ((stage as Record<string, unknown> | null)?.["is_system"]) {
      throw new Error("System stages cannot be deleted");
    }

    // Check if referenced by history
    const { count } = await context.supabase
      .from("prospect_stage_history")
      .select("id", { count: "exact" })
      .or(`from_stage_id.eq.${data.id},to_stage_id.eq.${data.id}`);

    if (count && count > 0) {
      throw new Error("Cannot delete stage that is referenced by history. Deactivate it instead.");
    }

    const { error } = await context.supabase.from("stages").delete().eq("id", data.id);
    if (error) throw new Error((error as { message?: string })?.message || "Delete failed");
    return { success: true };
  });
