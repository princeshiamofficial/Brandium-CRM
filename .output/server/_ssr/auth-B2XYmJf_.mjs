import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as deleteMySQLSession, o as getMySQLSession, r as createMySQLSession } from "./auth.functions-DaU64VEk.mjs";
import { t as supabase } from "./client-3zgUx5oP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-B2XYmJf_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AuthContext = (0, import_react.createContext)(void 0);
var SESSION_TOKEN_KEY = "brandium_sid";
function getStoredSessionId() {
	if (typeof window === "undefined") return null;
	try {
		return localStorage.getItem(SESSION_TOKEN_KEY);
	} catch {
		return null;
	}
}
function setStoredSessionId(sid) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(SESSION_TOKEN_KEY, sid);
	} catch {}
}
function clearStoredSessionId() {
	if (typeof window === "undefined") return;
	try {
		localStorage.removeItem(SESSION_TOKEN_KEY);
		localStorage.removeItem("brandium_dev_session");
	} catch {}
}
function buildAuthObjects(userId, name, email, role) {
	const user = {
		id: userId,
		app_metadata: { provider: "email" },
		user_metadata: {
			full_name: name,
			role
		},
		aud: "authenticated",
		created_at: (/* @__PURE__ */ new Date()).toISOString(),
		email,
		phone: "",
		role: "authenticated",
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	};
	return {
		user,
		session: {
			access_token: `jwt_${userId}_${Date.now()}`,
			token_type: "bearer",
			expires_in: 2592e3,
			refresh_token: `refresh_${userId}_${Date.now()}`,
			user
		},
		profile: {
			id: userId,
			full_name: name,
			email
		}
	};
}
function AuthProvider({ children }) {
	const [session, setSession] = (0, import_react.useState)(null);
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [role, setRole] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const sid = getStoredSessionId();
		if (sid) {
			getMySQLSession({ data: { sessionId: sid } }).then((res) => {
				if (res?.success && res.session) {
					const { user, session: sess, profile: prof } = buildAuthObjects(res.session.userId, res.session.userName, res.session.userEmail, res.session.userRole);
					setSession(sess);
					setProfile(prof);
					setRole(res.session.userRole);
				} else {
					clearStoredSessionId();
					setSession(null);
					setProfile(null);
					setRole(null);
				}
			}).catch(() => {
				try {
					const old = localStorage.getItem("brandium_dev_session");
					if (old) {
						const parsed = JSON.parse(old);
						setSession(parsed.session);
						setProfile(parsed.profile);
						setRole(parsed.role);
					}
				} catch {}
			}).finally(() => setLoading(false));
			return;
		}
		supabase.auth.getSession().then(() => {
			setLoading(false);
		});
	}, []);
	const setAuthenticatedDbSession = (userId, name, email, userRole) => {
		const sid = `sid_${userId}_${Date.now()}`;
		const { user, session: sess, profile: prof } = buildAuthObjects(userId, name, email, userRole);
		createMySQLSession({ data: {
			sessionId: sid,
			userId,
			userEmail: email,
			userName: name,
			userRole
		} }).catch(() => {
			localStorage.setItem("brandium_dev_session", JSON.stringify({
				session: sess,
				user,
				profile: prof,
				role: userRole
			}));
		});
		setStoredSessionId(sid);
		setSession(sess);
		setProfile(prof);
		setRole(userRole);
		setLoading(false);
	};
	const signInAsDevUser = (name, email, userRole) => {
		setAuthenticatedDbSession(`usr_${Date.now()}`, name, email, userRole);
	};
	const value = {
		session,
		user: session?.user ?? null,
		profile,
		role,
		loading,
		isAdmin: role === "admin",
		signOut: async () => {
			const sid = getStoredSessionId();
			if (sid) deleteMySQLSession({ data: { sessionId: sid } }).catch(() => {});
			clearStoredSessionId();
			await supabase.auth.signOut();
			setSession(null);
			setProfile(null);
			setRole(null);
		},
		setAuthenticatedDbSession,
		signInAsDevUser
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
//#endregion
export { useAuth as n, AuthProvider as t };
