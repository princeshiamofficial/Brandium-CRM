import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { a as stringType, i as objectType, r as numberType, t as booleanType } from "../_libs/zod.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-DILuXelX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stages.functions-DU8Jg8eu.js
/**
* Reusable stage engine entry point.
*/
var changeProspectStage_createServerFn_handler = createServerRpc({
	id: "949e422fe576dceba0733980b7807562b0bfd4dc7a3a6e280bb7b244711796a9",
	name: "changeProspectStage",
	filename: "src/lib/stages.functions.ts"
}, (opts) => changeProspectStage.__executeServer(opts));
var changeProspectStage = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
	prospectId: stringType().min(1),
	stageId: stringType().min(1),
	note: stringType().trim().max(1e3).optional()
}).parse(input)).handler(changeProspectStage_createServerFn_handler, async ({ data, context }) => {
	const { data: result, error } = await context.supabase.rpc("change_prospect_stage", {
		p_prospect_id: data.prospectId,
		p_stage_id: data.stageId,
		...data.note ? { p_note: data.note } : {}
	});
	if (error) throw new Error(error.message);
	return result;
});
var createStage_createServerFn_handler = createServerRpc({
	id: "3a0ba4bb28b1821a429bff3b0dfe98a820a3257ec553d22bad11303405f1da8e",
	name: "createStage",
	filename: "src/lib/stages.functions.ts"
}, (opts) => createStage.__executeServer(opts));
var createStage = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
	name: stringType().trim().min(1).max(100),
	stage_group: stringType().trim().min(1).max(50),
	sort_order: numberType().int().min(0),
	is_follow_up: booleanType().default(false),
	color: stringType().optional(),
	icon: stringType().optional()
}).parse(input)).handler(createStage_createServerFn_handler, async ({ data, context }) => {
	const { data: profile } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").single();
	if (!profile) throw new Error("Unauthorized: Only admins can manage stages");
	const { data: result, error } = await context.supabase.from("stages").insert({
		name: data.name,
		stage_group: data.stage_group,
		sort_order: data.sort_order,
		is_follow_up: data.is_follow_up,
		color: data.color ?? null,
		icon: data.icon ?? null,
		is_active: true
	}).select().single();
	if (error) {
		if (error.code === "23505") throw new Error("A stage with this name already exists");
		throw new Error(error.message);
	}
	return result;
});
var updateStage_createServerFn_handler = createServerRpc({
	id: "0a01dd8c28cfb8624f3e5b9aba3936ef28f823a1e499f2259363646509560ef7",
	name: "updateStage",
	filename: "src/lib/stages.functions.ts"
}, (opts) => updateStage.__executeServer(opts));
var updateStage = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
	id: stringType().min(1),
	name: stringType().trim().min(1).max(100).optional(),
	stage_group: stringType().trim().min(1).max(50).optional(),
	sort_order: numberType().int().min(0).optional(),
	is_follow_up: booleanType().optional(),
	is_active: booleanType().optional(),
	color: stringType().optional(),
	icon: stringType().optional()
}).parse(input)).handler(updateStage_createServerFn_handler, async ({ data, context }) => {
	const { data: profile } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").single();
	if (!profile) throw new Error("Unauthorized: Only admins can manage stages");
	if (data.name || data.is_active === false) {
		const { data: stage } = await context.supabase.from("stages").select("is_system").eq("id", data.id).single();
		if (stage?.["is_system"]) {
			if (data.is_active === false) throw new Error("System stages cannot be deactivated");
		}
	}
	const updatePayload = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
	if (data.name !== void 0) updatePayload["name"] = data.name;
	if (data.stage_group !== void 0) updatePayload["stage_group"] = data.stage_group;
	if (data.sort_order !== void 0) updatePayload["sort_order"] = data.sort_order;
	if (data.is_follow_up !== void 0) updatePayload["is_follow_up"] = data.is_follow_up;
	if (data.is_active !== void 0) updatePayload["is_active"] = data.is_active;
	if (data.color !== void 0) updatePayload["color"] = data.color ?? null;
	if (data.icon !== void 0) updatePayload["icon"] = data.icon ?? null;
	const { data: result, error } = await context.supabase.from("stages").update(updatePayload).eq("id", data.id).select().single();
	if (error) {
		if (error.code === "23505") throw new Error("A stage with this name already exists");
		throw new Error(error.message);
	}
	return result;
});
var deleteStage_createServerFn_handler = createServerRpc({
	id: "f17761f879f5ed2354a80513baebfda01706eb946b488de7f7f91201c6214db3",
	name: "deleteStage",
	filename: "src/lib/stages.functions.ts"
}, (opts) => deleteStage.__executeServer(opts));
var deleteStage = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({ id: stringType().min(1) }).parse(input)).handler(deleteStage_createServerFn_handler, async ({ data, context }) => {
	const { data: profile } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").single();
	if (!profile) throw new Error("Unauthorized: Only admins can manage stages");
	const { data: stage } = await context.supabase.from("stages").select("is_system").eq("id", data.id).single();
	if (stage?.["is_system"]) throw new Error("System stages cannot be deleted");
	const { count } = await context.supabase.from("prospect_stage_history").select("id", { count: "exact" }).or(`from_stage_id.eq.${data.id},to_stage_id.eq.${data.id}`);
	if (count && count > 0) throw new Error("Cannot delete stage that is referenced by history. Deactivate it instead.");
	const { error } = await context.supabase.from("stages").delete().eq("id", data.id);
	if (error) throw new Error(error?.message || "Delete failed");
	return { success: true };
});
//#endregion
export { changeProspectStage_createServerFn_handler, createStage_createServerFn_handler, deleteStage_createServerFn_handler, updateStage_createServerFn_handler };
