import { t as runMySQLQuery } from "./mysql-api-BWYhfGzd.mjs";
import { n as generateUUID, t as checkDatabaseConnection } from "./mysql-client-k5RcJc-f.mjs";
import { t as authenticateXamppUser } from "./auth.functions-PTTTgR3L.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-BUqJxCCy.js
var FluentDatabaseQueryBuilder = class {
	tableName;
	filters = [];
	orderCol = null;
	orderAsc = true;
	rangeStart = null;
	rangeEnd = null;
	pendingInsert = [];
	pendingUpdate = null;
	pendingDelete = false;
	constructor(tableName) {
		this.tableName = tableName;
	}
	select(_columns, _options) {
		return this;
	}
	eq(column, value) {
		this.filters.push((item) => item[column] === value);
		return this;
	}
	neq(column, value) {
		this.filters.push((item) => item[column] !== value);
		return this;
	}
	gte(column, value) {
		this.filters.push((item) => item[column] >= value);
		return this;
	}
	gt(column, value) {
		this.filters.push((item) => item[column] > value);
		return this;
	}
	lt(column, value) {
		this.filters.push((item) => item[column] < value);
		return this;
	}
	lte(column, value) {
		this.filters.push((item) => item[column] <= value);
		return this;
	}
	in(column, values) {
		this.filters.push((item) => values.includes(item[column]));
		return this;
	}
	ilike(column, pattern) {
		const searchVal = pattern.replace(/%/g, "").toLowerCase();
		this.filters.push((item) => {
			const val = item[column];
			return val ? String(val).toLowerCase().includes(searchVal) : false;
		});
		return this;
	}
	like(column, pattern) {
		const searchVal = pattern.replace(/%/g, "");
		this.filters.push((item) => {
			const val = item[column];
			return val ? String(val).includes(searchVal) : false;
		});
		return this;
	}
	or(conditionsStr) {
		const conditions = conditionsStr.split(",");
		this.filters.push((item) => {
			return conditions.some((cond) => {
				const parts = cond.split(".");
				const col = parts[0];
				const op = parts[1];
				const val = parts[2];
				if (!col || item[col] === void 0 || item[col] === null) return false;
				const strVal = String(item[col]).toLowerCase();
				const searchVal = (val || "").replace(/%/g, "").toLowerCase();
				if (op === "ilike" || op === "like") return strVal.includes(searchVal);
				return strVal === searchVal;
			});
		});
		return this;
	}
	order(column, options) {
		this.orderCol = column;
		this.orderAsc = options?.ascending ?? true;
		return this;
	}
	range(from, to) {
		this.rangeStart = from;
		this.rangeEnd = to;
		return this;
	}
	limit(count) {
		this.rangeStart = 0;
		this.rangeEnd = count - 1;
		return this;
	}
	insert(rowOrRows) {
		const items = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows];
		this.pendingInsert = items;
		return this;
	}
	update(patch) {
		this.pendingUpdate = patch;
		return this;
	}
	delete() {
		this.pendingDelete = true;
		return this;
	}
	async executeDirectMySQLQuery() {
		try {
			const res = await runMySQLQuery(`SELECT * FROM \`${this.tableName}\`;`);
			if (res.success && Array.isArray(res.data)) {
				let rows = res.data;
				for (const filterFn of this.filters) rows = rows.filter(filterFn);
				if (this.orderCol) {
					const col = this.orderCol;
					const asc = this.orderAsc;
					rows.sort((a, b) => {
						const valA = a[col];
						const valB = b[col];
						if (valA < valB) return asc ? -1 : 1;
						if (valA > valB) return asc ? 1 : -1;
						return 0;
					});
				}
				if (this.rangeStart !== null && this.rangeEnd !== null) rows = rows.slice(this.rangeStart, this.rangeEnd + 1);
				return rows;
			}
		} catch (err) {
			console.error(`Error querying MySQL table ${this.tableName}:`, err);
		}
		return [];
	}
	async performMutation() {
		if (this.pendingInsert.length > 0) {
			for (const item of this.pendingInsert) {
				const id = item["id"] || generateUUID();
				const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
				const record = {
					...item,
					id,
					created_at: item["created_at"] || now,
					updated_at: item["updated_at"] || now
				};
				const keys = Object.keys(record);
				const values = Object.values(record);
				const placeholders = keys.map(() => "?").join(", ");
				const columns = keys.map((k) => `\`${k}\``).join(", ");
				await runMySQLQuery(`INSERT INTO \`${this.tableName}\` (${columns}) VALUES (${placeholders});`, values);
			}
			return this.pendingInsert;
		}
		const rows = await this.executeDirectMySQLQuery();
		if (this.pendingUpdate) {
			const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
			for (const r of rows) {
				const id = r?.id;
				if (id) {
					const patch = {
						...this.pendingUpdate,
						updated_at: now
					};
					const keys = Object.keys(patch);
					const values = Object.values(patch);
					const setClause = keys.map((k) => `\`${k}\` = ?`).join(", ");
					await runMySQLQuery(`UPDATE \`${this.tableName}\` SET ${setClause} WHERE \`id\` = ?;`, [...values, id]);
				}
			}
		} else if (this.pendingDelete) for (const r of rows) {
			const id = r?.id;
			if (id) await runMySQLQuery(`DELETE FROM \`${this.tableName}\` WHERE \`id\` = ?;`, [id]);
		}
		return rows;
	}
	async then(onfulfilled) {
		const data = this.pendingInsert.length > 0 || this.pendingUpdate || this.pendingDelete ? await this.performMutation() : await this.executeDirectMySQLQuery();
		const result = {
			data,
			count: data.length,
			error: null
		};
		return Promise.resolve(onfulfilled ? onfulfilled(result) : result);
	}
	async single() {
		return {
			data: (this.pendingInsert.length > 0 || this.pendingUpdate || this.pendingDelete ? await this.performMutation() : await this.executeDirectMySQLQuery())[0] || null,
			error: null
		};
	}
	async maybeSingle() {
		return {
			data: (this.pendingInsert.length > 0 || this.pendingUpdate || this.pendingDelete ? await this.performMutation() : await this.executeDirectMySQLQuery())[0] || null,
			error: null
		};
	}
};
/**
* Standalone Supabase Proxy Client
* Replaces @supabase/supabase-js completely with direct MySQL execution.
*/
var supabase = {
	from(tableName) {
		return new FluentDatabaseQueryBuilder(tableName);
	},
	rpc(_functionName, _params) {
		return Promise.resolve({
			data: null,
			error: null
		});
	},
	auth: {
		async getSession() {
			return {
				data: { session: null },
				error: null
			};
		},
		async getUser() {
			return {
				data: { user: null },
				error: null
			};
		},
		async signInWithPassword(credentials) {
			if (!checkDatabaseConnection()) return {
				data: {
					user: null,
					session: null
				},
				error: { message: "Database connection error. Unable to reach server." }
			};
			const email = String(credentials?.["email"] || "").toLowerCase().trim();
			const password = String(credentials?.["password"] || "");
			if (!email || !password) return {
				data: {
					user: null,
					session: null
				},
				error: { message: "Please provide both email and password." }
			};
			try {
				const res = await authenticateXamppUser({ data: {
					email,
					password
				} });
				if (res && typeof res.success === "boolean") {
					if (!res.success || !res.user) return {
						data: {
							user: null,
							session: null
						},
						error: { message: res.error || "Invalid email or password. Please check your credentials." }
					};
					const userObj = {
						id: res.user.id,
						email: res.user.email,
						user_metadata: {
							full_name: res.user.name,
							role: res.user.role
						}
					};
					return {
						data: {
							user: userObj,
							session: {
								access_token: `auth_jwt_${res.user.id}_${Date.now()}`,
								user: userObj
							}
						},
						error: null
					};
				}
			} catch (err) {
				return {
					data: {
						user: null,
						session: null
					},
					error: { message: err?.message || "Authentication error connecting to MySQL database." }
				};
			}
			return {
				data: {
					user: null,
					session: null
				},
				error: { message: "Invalid email or password. User account not found in database." }
			};
		},
		async signOut() {
			return { error: null };
		},
		onAuthStateChange(_callback) {
			return { data: { subscription: { unsubscribe: () => {} } } };
		}
	}
};
//#endregion
export { supabase as t };
