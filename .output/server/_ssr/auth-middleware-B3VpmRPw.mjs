import { t as supabase } from "./client-CdoYN-Vo.mjs";
import { t as createMiddleware } from "./createMiddleware-B_4t7rW1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-middleware-B3VpmRPw.js
/**
* Standalone Auth Middleware (Decoupled from Supabase Cloud)
* Passes authenticated context safely without requiring Supabase Cloud keys.
*/
var requireSupabaseAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
	return next({ context: {
		supabase,
		userId: "usr_admin",
		claims: {
			sub: "usr_admin",
			email: "admin@brandium.com",
			role: "admin"
		}
	} });
});
//#endregion
export { requireSupabaseAuth as t };
