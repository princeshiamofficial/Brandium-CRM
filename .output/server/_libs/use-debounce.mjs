import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "./@floating-ui/react-dom+[...].mjs";
//#region node_modules/use-debounce/dist/index.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function c(e, u, c, i) {
	const l = (0, import_react.useRef)(null), a = (0, import_react.useRef)(0), o = (0, import_react.useRef)(0), s = (0, import_react.useRef)(null), f = (0, import_react.useRef)([]), d = (0, import_react.useRef)(), m = (0, import_react.useRef)(), h = (0, import_react.useRef)(e), v = (0, import_react.useRef)(!0), g = (0, import_react.useRef)(), x = (0, import_react.useRef)();
	h.current = e;
	const E = "undefined" != typeof window, b = !u && 0 !== u && E;
	if ("function" != typeof e) throw new TypeError("Expected a function");
	u = +u || 0;
	const p = !!(c = c || {}).leading, y = !("trailing" in c) || !!c.trailing, w = !!c.flushOnExit && y, T = "maxWait" in c, O = "debounceOnServer" in c && !!c.debounceOnServer, F = T ? Math.max(+c.maxWait || 0, u) : null, L = (0, import_react.useMemo)(() => {
		const r = (r) => {
			const n = f.current, t = d.current;
			return f.current = d.current = null, a.current = r, o.current = o.current || r, m.current = h.current.apply(t, n);
		}, n = (r, n) => {
			b && cancelAnimationFrame(s.current), s.current = b ? requestAnimationFrame(r) : setTimeout(r, n);
		}, t = (r) => {
			if (!v.current) return !1;
			const n = r - l.current;
			return !l.current || n >= u || n < 0 || T && r - a.current >= F;
		}, e = (n) => (s.current = null, y && f.current ? r(n) : (f.current = d.current = null, m.current)), c = () => {
			const r = Date.now();
			if (p && o.current === a.current && L(), t(r)) return e(r);
			if (!v.current) return;
			const i = u - (r - l.current), s = T ? Math.min(i, F - (r - a.current)) : i;
			n(c, s);
		}, L = () => {
			i && i({});
		}, A = (...e) => {
			if (!E && !O) return;
			const i = Date.now(), o = t(i);
			var h;
			if (f.current = e, d.current = this, l.current = i, w && !g.current && (g.current = () => {
				var r;
				"hidden" === (null == (r = globalThis.document) ? void 0 : r.visibilityState) && x.current.flush();
			}, null == (h = globalThis.document) || null == h.addEventListener || h.addEventListener("visibilitychange", g.current)), o) {
				if (!s.current && v.current) return a.current = l.current, n(c, u), p ? r(l.current) : m.current;
				if (T) return n(c, u), r(l.current);
			}
			return s.current || n(c, u), m.current;
		};
		return A.cancel = () => {
			const r = s.current;
			r && (b ? cancelAnimationFrame(s.current) : clearTimeout(s.current)), a.current = 0, f.current = l.current = d.current = s.current = null, r && i && i({});
		}, A.isPending = () => !!s.current, A.flush = () => s.current ? e(Date.now()) : m.current, A;
	}, [
		p,
		T,
		u,
		F,
		y,
		w,
		b,
		E,
		O,
		i
	]);
	return x.current = L, (0, import_react.useEffect)(() => (v.current = !0, () => {
		var r;
		w && x.current.flush(), g.current && (null == (r = globalThis.document) || null == r.removeEventListener || r.removeEventListener("visibilitychange", g.current), g.current = null), v.current = !1;
	}), [w]), L;
}
function i(r, n) {
	return r === n;
}
function l(n, t, l) {
	const a = l && l.equalityFn || i, o = (0, import_react.useRef)(n), [, s] = (0, import_react.useState)({}), f = c((0, import_react.useCallback)((r) => {
		o.current = r, s({});
	}, [s]), t, l, s), d = (0, import_react.useRef)(n);
	return a(d.current, n) || (f(n), d.current = n), [o.current, f];
}
//#endregion
export { l as t };
