import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { g as TriangleAlert } from "../_libs/lucide-react.mjs";
import { n as useAuth } from "./auth-CgRTR6JY.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-xg-4wkRV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-suspended-modal-T4IuKKqY.js
var import_jsx_runtime = require_jsx_runtime();
function AccountSuspendedModal({ open, onOpenChange }) {
	const { signOut } = useAuth();
	if (!open) return null;
	const handleConfirmLogout = () => {
		signOut();
		if (onOpenChange) onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open,
		onOpenChange: (isOpen) => {
			if (!isOpen) handleConfirmLogout();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, {
			className: "sm:max-w-md bg-background border shadow-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, {
				className: "flex items-center gap-2 text-xl font-bold text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-6 w-6 text-destructive shrink-0" }), "Account Suspended"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, {
				className: "pt-2 text-sm text-muted-foreground leading-relaxed",
				children: "Your account has been suspended by an administrator. You will now be logged out. Please contact support if you believe this is an error."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end pt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					onClick: handleConfirmLogout,
					className: "bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold px-6 cursor-pointer",
					children: "OK"
				})
			})]
		})
	});
}
//#endregion
export { AccountSuspendedModal as t };
