import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { n as CardContent, t as Card } from "./card-CtX3ithx.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { D as ShieldAlert, E as ShieldCheck, G as PenLine, Nt as CircleX, V as Plus, Yt as Calendar, bt as Eye, d as UserPlus, et as Mail, f as UserCog, g as TriangleAlert, k as Search, kt as CloudUpload, l as User, lt as KeyRound, p as UserCheck, pt as Funnel, r as X, rt as Lock, s as Users, u as UserX, v as Trash2, wt as EllipsisVertical, xt as EyeOff, zt as CircleCheck } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B85j8UA0.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-gunzrkKA.mjs";
import { n as useAuth } from "./auth-CgRTR6JY.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as DropdownMenuLabel, d as DropdownMenuTrigger, i as DropdownMenuItem, n as DropdownMenuContent, r as DropdownMenuGroup, s as DropdownMenuSeparator, t as DropdownMenu } from "./dropdown-menu-BfBJVxb8.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as resetUserPassword, c as updateCrmUser, l as updateUserAvatar, n as createCrmUser, o as softDeleteCrmUser, r as crmUsersQueryOptions, s as toggleUserStatus, t as changeOwnPassword } from "./admin-users-D0OhtkyB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/users-Eua6ZCux.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Table = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: "relative w-full overflow-auto",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
		ref,
		className: cn("w-full caption-bottom text-sm", className),
		...props
	})
}));
Table.displayName = "Table";
var TableHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
	ref,
	className: cn("[&_tr]:border-b", className),
	...props
}));
TableHeader.displayName = "TableHeader";
var TableBody = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
	ref,
	className: cn("[&_tr:last-child]:border-0", className),
	...props
}));
TableBody.displayName = "TableBody";
var TableFooter = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", {
	ref,
	className: cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className),
	...props
}));
TableFooter.displayName = "TableFooter";
var TableRow = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
	ref,
	className: cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className),
	...props
}));
TableRow.displayName = "TableRow";
var TableHead = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
	ref,
	className: cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground has-[[role=checkbox]]:pr-0 *:[[role=checkbox]]:translate-y-0.5", className),
	...props
}));
TableHead.displayName = "TableHead";
var TableCell = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
	ref,
	className: cn("p-4 align-middle has-[[role=checkbox]]:pr-0 *:[[role=checkbox]]:translate-y-0.5", className),
	...props
}));
TableCell.displayName = "TableCell";
var TableCaption = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", {
	ref,
	className: cn("mt-4 text-sm text-muted-foreground", className),
	...props
}));
TableCaption.displayName = "TableCaption";
function AdminResetPasswordModal({ open, onOpenChange, user }) {
	const queryClient = useQueryClient();
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	const resetMutation = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("No user selected.");
			if (!newPassword || newPassword.length < 6) throw new Error("Password must be at least 6 characters long.");
			return resetUserPassword(user.id, newPassword);
		},
		onSuccess: () => {
			toast.success(`Password for ${user?.name} reset successfully!`);
			setNewPassword("");
			onOpenChange(false);
			queryClient.invalidateQueries({ queryKey: ["crm-users"] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to reset user password.");
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2 text-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-5 text-[#67B239]" }),
						"Reset User Password (",
						user?.name,
						")"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
					className: "text-xs",
					children: [
						"Set a new secure bcrypt password for account ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: user?.email }),
						"."
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-2 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "reset_new_pass",
							className: "text-xs font-semibold",
							children: ["New Password ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-red-500",
								children: "*"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "reset_new_pass",
							type: "password",
							placeholder: "Minimum 6 characters (e.g. Agent@2026!)",
							value: newPassword,
							onChange: (e) => setNewPassword(e.target.value),
							className: "text-xs font-mono"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded bg-amber-50 dark:bg-amber-950/40 p-2.5 border border-amber-200 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-4 shrink-0 text-amber-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Passwords are hashed automatically with bcrypt before database storage." })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "gap-2 sm:gap-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => onOpenChange(false),
						disabled: resetMutation.isPending,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5",
						onClick: () => resetMutation.mutate(),
						disabled: resetMutation.isPending || !newPassword || newPassword.length < 6,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }), resetMutation.isPending ? "Resetting Password..." : "Reset Password"]
					})]
				})
			]
		})
	});
}
function AdminChangeOwnPasswordModal({ open, onOpenChange }) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [currentPassword, setCurrentPassword] = (0, import_react.useState)("");
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const changeMutation = useMutation({
		mutationFn: async () => {
			const activeUserId = user?.id || "usr-admin-1";
			if (!currentPassword) throw new Error("Please enter your current password.");
			if (!newPassword || newPassword.length < 6) throw new Error("New password must be at least 6 characters long.");
			if (newPassword !== confirmPassword) throw new Error("New password and confirmation do not match.");
			return changeOwnPassword(activeUserId, currentPassword, newPassword);
		},
		onSuccess: () => {
			toast.success("Your password has been changed successfully!");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			onOpenChange(false);
			queryClient.invalidateQueries({ queryKey: ["crm-users"] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to change password.");
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2 text-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-5 text-[#67B239]" }),
						"Change My Password (",
						user?.email,
						")"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-xs",
					children: "Update your own account password securely."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-2 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								htmlFor: "current_pass",
								className: "text-xs font-semibold",
								children: ["Current Password ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-red-500",
									children: "*"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "current_pass",
								type: "password",
								placeholder: "Enter current password",
								value: currentPassword,
								onChange: (e) => setCurrentPassword(e.target.value),
								className: "text-xs font-mono"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								htmlFor: "new_pass",
								className: "text-xs font-semibold",
								children: ["New Password ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-red-500",
									children: "*"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "new_pass",
								type: "password",
								placeholder: "Minimum 6 characters",
								value: newPassword,
								onChange: (e) => setNewPassword(e.target.value),
								className: "text-xs font-mono"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									htmlFor: "confirm_pass",
									className: "text-xs font-semibold",
									children: ["Confirm New Password ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-red-500",
										children: "*"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "confirm_pass",
									type: "password",
									placeholder: "Re-enter new password",
									value: confirmPassword,
									onChange: (e) => setConfirmPassword(e.target.value),
									className: "text-xs font-mono"
								}),
								newPassword && confirmPassword && newPassword !== confirmPassword && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-red-500 font-medium pt-0.5",
									children: "Passwords do not match."
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "gap-2 sm:gap-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => onOpenChange(false),
						disabled: changeMutation.isPending,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5",
						onClick: () => changeMutation.mutate(),
						disabled: changeMutation.isPending || !currentPassword || !newPassword || newPassword.length < 6 || newPassword !== confirmPassword,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }), changeMutation.isPending ? "Updating Password..." : "Save New Password"]
					})]
				})
			]
		})
	});
}
function AdminSetAvatarModal({ open, onOpenChange, user }) {
	const queryClient = useQueryClient();
	const fileInputRef = (0, import_react.useRef)(null);
	const [avatarUrl, setAvatarUrl] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (user) setAvatarUrl(user.avatar_url || "");
	}, [user]);
	const updateAvatarMutation = useMutation({
		mutationFn: async (newUrl) => {
			if (!user) throw new Error("No user selected.");
			return updateUserAvatar(user.id, newUrl);
		},
		onSuccess: () => {
			toast.success("User avatar updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["crm-users"] });
			queryClient.invalidateQueries({ queryKey: ["crm-user-detail"] });
			onOpenChange(false);
		},
		onError: (err) => {
			toast.error(err.message || "Failed to update user avatar.");
		}
	});
	if (!user) return null;
	const handleFileUpload = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 2097152) {
				toast.error("Image file size should be less than 2MB.");
				return;
			}
			const reader = new FileReader();
			reader.onloadend = () => {
				if (typeof reader.result === "string") setAvatarUrl(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		updateAvatarMutation.mutate(avatarUrl.trim());
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCog, { className: "size-5 text-[#67B239] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "text-lg font-bold text-foreground",
						children: ["Set Avatar for ", user.name]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
					className: "text-sm text-slate-500 dark:text-slate-400",
					children: [
						"Manage the profile picture for ",
						user.email,
						"."
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "space-y-4 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileInputRef,
						type: "file",
						accept: "image/*",
						onChange: handleFileUpload,
						className: "hidden"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-sm font-semibold text-foreground",
								children: "Profile Picture"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-20 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs",
									children: avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: avatarUrl,
										alt: user.name,
										className: "size-full object-cover"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCog, { className: "size-9 text-[#67B239]/60 dark:text-slate-500" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "outline",
									className: "gap-2 px-4 py-2.5 h-auto text-sm font-medium border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground rounded-xl shadow-2xs",
									onClick: () => fileInputRef.current?.click(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "size-4 text-[#67B239]" }), "Upload Image"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-slate-400 dark:text-slate-500 pt-1",
								children: "Upload an image (JPG, PNG, GIF). Max 2MB."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
						className: "gap-2 sm:gap-2 pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							className: "px-5 py-2 h-auto text-sm font-medium border-slate-200 dark:border-slate-700 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-foreground rounded-xl",
							onClick: () => onOpenChange(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "px-5 py-2 h-auto text-sm font-medium bg-[#67B239] hover:bg-[#5aa030] text-white rounded-xl shadow-2xs transition-colors",
							disabled: updateAvatarMutation.isPending,
							children: updateAvatarMutation.isPending ? "Saving..." : "Save Changes"
						})]
					})
				]
			})]
		})
	});
}
function AdminEditUserInfoModal({ open, onOpenChange, user }) {
	const queryClient = useQueryClient();
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (user) {
			setName(user.name || "");
			setEmail(user.email || "");
		}
	}, [user]);
	const updateMutation = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("No user selected.");
			if (!name || !name.trim()) throw new Error("Please enter user full name.");
			if (!email || !email.includes("@")) throw new Error("Please enter a valid email address.");
			return updateCrmUser(user.id, {
				name: name.trim(),
				email: email.trim(),
				role: user.role,
				status: user.status
			});
		},
		onSuccess: (updated) => {
			toast.success(`User ${updated.name} updated successfully!`);
			queryClient.invalidateQueries({ queryKey: ["crm-users"] });
			onOpenChange(false);
		},
		onError: (err) => {
			toast.error(err.message || "Failed to update user account.");
		}
	});
	if (!user) return null;
	const handleSubmit = (e) => {
		e.preventDefault();
		updateMutation.mutate();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "size-5 text-[#67B239] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "text-lg font-bold text-foreground",
						children: ["Edit User Info — ", user.name]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-xs text-slate-500 dark:text-slate-400",
					children: "Update full name and email address for this user account."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "space-y-4 py-2 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "modal_user_name",
							className: "text-xs font-semibold",
							children: ["User Full Name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-red-500",
								children: "*"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "modal_user_name",
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "Full Name",
								className: "pl-9 text-xs",
								required: true
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "modal_user_email",
							className: "text-xs font-semibold",
							children: ["Email Address ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-red-500",
								children: "*"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "modal_user_email",
								type: "email",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								placeholder: "user@brandium.com",
								className: "pl-9 text-xs font-mono",
								required: true
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
						className: "gap-2 sm:gap-2 pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							className: "px-5 py-2 h-auto text-xs font-medium border-slate-200 dark:border-slate-700 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-foreground rounded-xl",
							onClick: () => onOpenChange(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "px-5 py-2 h-auto text-xs font-medium bg-[#67B239] hover:bg-[#5aa030] text-white rounded-xl shadow-2xs transition-colors",
							disabled: updateMutation.isPending,
							children: updateMutation.isPending ? "Saving..." : "Save Changes"
						})]
					})
				]
			})]
		})
	});
}
function AdminCreateUserModal({ open, onOpenChange }) {
	const queryClient = useQueryClient();
	const fileInputRef = (0, import_react.useRef)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [showConfirm, setShowConfirm] = (0, import_react.useState)(false);
	const [role, setRole] = (0, import_react.useState)("AGENT");
	const [avatarUrl, setAvatarUrl] = (0, import_react.useState)("");
	const resetForm = () => {
		setName("");
		setEmail("");
		setPassword("");
		setConfirmPassword("");
		setShowPassword(false);
		setShowConfirm(false);
		setRole("AGENT");
		setAvatarUrl("");
	};
	const handleFileUpload = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 2097152) {
				toast.error("Image file size should be less than 2MB.");
				return;
			}
			const reader = new FileReader();
			reader.onloadend = () => {
				if (typeof reader.result === "string") setAvatarUrl(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};
	const createMutation = useMutation({
		mutationFn: async () => {
			if (!name || !name.trim()) throw new Error("Please enter user full name.");
			if (!email || !email.includes("@")) throw new Error("Please enter a valid email address.");
			if (!password || password.length < 6) throw new Error("Initial password must be at least 6 characters long.");
			if (password !== confirmPassword) throw new Error("Passwords do not match. Please re-enter.");
			return createCrmUser({
				name: name.trim(),
				email: email.trim(),
				password_hash: password,
				role,
				status: "Active",
				avatar_url: avatarUrl.trim() || null
			});
		},
		onSuccess: (newUser) => {
			toast.success(`User ${newUser.name} created successfully!`);
			queryClient.invalidateQueries({ queryKey: ["crm-users"] });
			resetForm();
			onOpenChange(false);
		},
		onError: (err) => {
			toast.error(err.message || "Failed to create user account.");
		}
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		createMutation.mutate();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-5 text-[#67B239] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "text-lg font-bold text-foreground",
						children: "Create New User"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-xs text-slate-500 dark:text-slate-400",
					children: "Add a new Admin or Agent account to Brandium CRM."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "space-y-4 py-2 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "create_user_name",
							className: "text-xs font-semibold",
							children: ["User Full Name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-red-500",
								children: "*"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "create_user_name",
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "e.g. Mehan Ahmed",
								className: "pl-9 text-xs",
								required: true
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "create_user_email",
							className: "text-xs font-semibold",
							children: ["Email Address ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-red-500",
								children: "*"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "create_user_email",
								type: "email",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								placeholder: "user@brandium.com",
								className: "pl-9 text-xs font-mono",
								required: true
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								htmlFor: "create_user_pass",
								className: "text-xs font-semibold",
								children: ["Password ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-red-500",
									children: "*"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "create_user_pass",
										type: showPassword ? "text" : "password",
										value: password,
										onChange: (e) => setPassword(e.target.value),
										placeholder: "Min. 6 chars",
										className: "pl-9 pr-8 text-xs font-mono",
										required: true,
										minLength: 6
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setShowPassword((v) => !v),
										className: "absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors",
										tabIndex: -1,
										children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" })
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									htmlFor: "create_user_confirm_pass",
									className: "text-xs font-semibold",
									children: ["Confirm ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-red-500",
										children: "*"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "create_user_confirm_pass",
											type: showConfirm ? "text" : "password",
											value: confirmPassword,
											onChange: (e) => setConfirmPassword(e.target.value),
											placeholder: "Re-enter",
											className: `pl-9 pr-8 text-xs font-mono ${confirmPassword && password !== confirmPassword ? "border-red-400 focus-visible:ring-red-400" : confirmPassword && password === confirmPassword ? "border-green-400 focus-visible:ring-green-400" : ""}`,
											required: true
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setShowConfirm((v) => !v),
											className: "absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors",
											tabIndex: -1,
											children: showConfirm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" })
										})
									]
								}),
								confirmPassword && password !== confirmPassword && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-red-500",
									children: "Passwords do not match."
								}),
								confirmPassword && password === confirmPassword && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-green-600",
									children: "Passwords match ✓"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileInputRef,
						type: "file",
						accept: "image/*",
						onChange: handleFileUpload,
						className: "hidden"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-4 items-end",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Profile Picture"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-14 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs",
									children: avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: avatarUrl,
										alt: "avatar preview",
										className: "size-full object-cover"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-6 text-[#67B239]/50 dark:text-slate-500" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										variant: "outline",
										className: "gap-1.5 px-2.5 py-1.5 h-auto text-xs font-medium border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground rounded-xl shadow-2xs",
										onClick: () => fileInputRef.current?.click(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "size-3.5 text-[#67B239]" }), "Upload"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] text-slate-400 dark:text-slate-500 leading-tight",
										children: "JPG, PNG — max 2MB"
									})]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								htmlFor: "create_user_role",
								className: "text-xs font-semibold flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5 text-blue-600" }),
									"Select Role ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-red-500",
										children: "*"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: role,
								onValueChange: (val) => setRole(val),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "create_user_role",
									className: "text-xs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Role" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "AGENT",
									children: "AGENT"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "ADMIN",
									children: "ADMIN"
								})] })]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
						className: "gap-2 sm:gap-2 pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							className: "px-5 py-2 h-auto text-xs font-medium border-slate-200 dark:border-slate-700 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-foreground rounded-xl",
							onClick: () => onOpenChange(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "px-5 py-2 h-auto text-xs font-medium bg-[#67B239] hover:bg-[#5aa030] text-white rounded-xl shadow-2xs transition-colors",
							disabled: createMutation.isPending,
							children: createMutation.isPending ? "Creating..." : "Create User"
						})]
					})
				]
			})]
		})
	});
}
function AdminBanUserModal({ open, onOpenChange, user }) {
	const queryClient = useQueryClient();
	const isBanned = user?.status === "Inactive";
	const banMutation = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("No user selected.");
			return toggleUserStatus(user.id, isBanned ? "Active" : "Inactive");
		},
		onSuccess: () => {
			toast.success(isBanned ? `${user?.name} has been unbanned.` : `${user?.name} has been banned.`);
			queryClient.invalidateQueries({ queryKey: ["crm-users"] });
			onOpenChange(false);
		},
		onError: (err) => {
			toast.error(err.message || "Failed to update user status.");
		}
	});
	if (!user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: `h-6 w-6 ${isBanned ? "text-green-600" : "text-amber-500"}` }), "Are you sure?"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: isBanned ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				"You are about to unban the user \"",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold",
					children: user.name
				}),
				"\". They will be able to log in again."
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				"You are about to ban the user \"",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold",
					children: user.name
				}),
				"\". They will not be able to log in."
			] }) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				onClick: () => onOpenChange(false),
				disabled: banMutation.isPending,
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				className: isBanned ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white",
				onClick: () => banMutation.mutate(),
				disabled: banMutation.isPending,
				children: banMutation.isPending ? isBanned ? "Unbanning..." : "Banning..." : isBanned ? "Yes, Unban User" : "Yes, Ban User"
			})] })]
		})
	});
}
var getInitials = (name) => {
	if (!name) return "??";
	const names = name.trim().split(" ");
	const first = names[0] ?? "";
	const last = names[names.length - 1] ?? "";
	if (names.length === 1) return first.charAt(0).toUpperCase();
	return first.charAt(0).toUpperCase() + last.charAt(0).toUpperCase();
};
function AdminUsersPage() {
	const queryClient = useQueryClient();
	const { user } = useAuth();
	const [search, setSearch] = (0, import_react.useState)("");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("Active");
	const [resetPasswordModal, setResetPasswordModal] = (0, import_react.useState)({
		open: false,
		user: null
	});
	const [setAvatarModal, setSetAvatarModal] = (0, import_react.useState)({
		open: false,
		user: null
	});
	const [editUserInfoModal, setEditUserInfoModal] = (0, import_react.useState)({
		open: false,
		user: null
	});
	const [createUserModalOpen, setCreateUserModalOpen] = (0, import_react.useState)(false);
	const [changeOwnPasswordOpen, setChangeOwnPasswordOpen] = (0, import_react.useState)(false);
	const [banUserModal, setBanUserModal] = (0, import_react.useState)({
		open: false,
		user: null
	});
	const { data: users = [], isLoading } = useQuery(crmUsersQueryOptions(search));
	const filteredUsers = users.filter((u) => {
		if (statusFilter === "all") return true;
		return u.status === statusFilter;
	});
	const toggleStatusMutation = useMutation({
		mutationFn: async ({ userId, newStatus }) => {
			return toggleUserStatus(userId, newStatus);
		},
		onSuccess: (_, vars) => {
			toast.success(`User ${vars.newStatus === "Active" ? "activated" : "deactivated"} successfully.`);
			queryClient.invalidateQueries({ queryKey: ["crm-users"] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to toggle user status.");
		}
	});
	const softDeleteMutation = useMutation({
		mutationFn: async (userId) => {
			return softDeleteCrmUser(userId);
		},
		onSuccess: () => {
			toast.success("User account soft-deleted successfully.");
			queryClient.invalidateQueries({ queryKey: ["crm-users"] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to delete user account.");
		}
	});
	const getRoleBadge = (role) => {
		switch (role) {
			case "ADMIN": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				variant: "outline",
				className: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3 text-purple-600 dark:text-purple-400" }), " ADMIN"]
			});
			case "AGENT": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				variant: "outline",
				className: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "size-3 text-blue-600 dark:text-blue-400" }), " AGENT"]
			});
			default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "secondary",
				className: "text-xs font-semibold px-2.5 py-0.5 rounded-full",
				children: role
			});
		}
	};
	const getStatusBadge = (status) => {
		if (status === "Active") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			variant: "outline",
			className: "bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3 text-green-600 dark:text-green-400" }), " Active"]
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			variant: "destructive",
			className: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3 text-red-600 dark:text-red-400" }), " Inactive"]
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-7 text-[#67B239]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-bold tracking-tight text-foreground",
						children: "User Management"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 flex-wrap",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: statusFilter,
						onValueChange: (val) => setStatusFilter(val),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
							className: "w-36 bg-white dark:bg-card gap-2 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "size-3.5 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Users" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
							align: "end",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All Users"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Active",
									children: "Active Users"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "Inactive",
									children: "Inactive Users"
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5 cursor-pointer",
						onClick: () => setCreateUserModalOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Create New User"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative max-w-sm flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "text",
							name: "search_query",
							autoComplete: "off",
							autoCorrect: "off",
							autoCapitalize: "off",
							spellCheck: false,
							placeholder: "Search name, business, phone...",
							value: search,
							onChange: (e) => setSearch(e.target.value),
							className: "pl-9 pr-8 bg-white [&::-webkit-search-cancel-button]:hidden"
						}),
						search && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setSearch(""),
							className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "shadow-xl border bg-card rounded-lg overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
							className: "hover:bg-transparent",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "pl-6 w-12.5 font-semibold",
									children: "SL"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "w-15 font-semibold",
									children: "Avatar"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "min-w-35 font-semibold",
									children: "Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "min-w-45 font-semibold",
									children: "Email"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "min-w-25 font-semibold",
									children: "Role"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "min-w-32.5 font-semibold",
									children: "Created At"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "min-w-32.5 font-semibold",
									children: "Last Updated"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "min-w-25 font-semibold",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "pr-6 text-right min-w-20 font-semibold",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: isLoading ? Array.from({ length: 4 }).map((_, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							colSpan: 9,
							className: "py-4 px-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-full rounded" })
						}) }, idx)) : filteredUsers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							colSpan: 9,
							className: "py-12 text-center text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-8 mx-auto text-slate-300 mb-2" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold text-foreground",
									children: "No users match your filters"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mt-0.5",
									children: "Create a new user account or reset search/status filters."
								})
							]
						}) }) : filteredUsers.map((u, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
							className: "hover:bg-muted/50 transition-colors",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "pl-6 text-muted-foreground text-xs font-medium",
									children: index + 1
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
									className: "h-9 w-9 border border-border/70 shadow-2xs cursor-pointer hover:opacity-80 transition-opacity",
									title: "Click to set avatar",
									onClick: () => setSetAvatarModal({
										open: true,
										user: u
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
										src: u.avatar_url || void 0,
										alt: u.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
										className: "bg-primary/10 text-primary font-semibold text-xs",
										children: getInitials(u.name)
									})]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "font-medium text-foreground text-sm max-w-48 truncate",
									children: u.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-muted-foreground text-xs font-mono max-w-60 truncate",
									children: u.email
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "whitespace-nowrap",
									children: getRoleBadge(u.role)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "whitespace-nowrap text-xs text-muted-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3 text-slate-400" }), new Date(u.created_at).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric"
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "whitespace-nowrap text-xs text-muted-foreground",
									children: new Date(u.updated_at).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "whitespace-nowrap",
									children: getStatusBadge(u.status)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "pr-6 text-right whitespace-nowrap",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "ghost",
											size: "icon",
											className: "h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 rounded-full",
											title: "User Actions",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "sr-only",
												children: "Open menu"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "size-4" })]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
										align: "end",
										className: "w-60 p-1 rounded-[10px]",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, {
												className: "px-2 py-1.5 text-sm font-semibold",
												children: ["Actions for ", u.name]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, { className: "-mx-1 my-1 h-px bg-muted" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuGroup, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
													onClick: () => setEditUserInfoModal({
														open: true,
														user: u
													}),
													className: "cursor-pointer text-sm gap-2 rounded-md px-2 py-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "mr-2 h-4 w-4" }), " Edit Info"]
												}),
												u.id !== user?.id && u.role !== "ADMIN" && (u.status === "Active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
													disabled: toggleStatusMutation.isPending,
													onClick: () => setBanUserModal({
														open: true,
														user: u
													}),
													className: "cursor-pointer text-destructive focus:text-destructive text-sm gap-2 rounded-md px-2 py-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserX, { className: "mr-2 h-4 w-4 text-destructive" }), " Ban User"]
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
													disabled: toggleStatusMutation.isPending,
													onClick: () => setBanUserModal({
														open: true,
														user: u
													}),
													className: "cursor-pointer text-emerald-600 focus:text-emerald-700 text-sm gap-2 rounded-md px-2 py-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "mr-2 h-4 w-4 text-emerald-600" }), "Unban User"]
												})),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
													onClick: () => setSetAvatarModal({
														open: true,
														user: u
													}),
													className: "cursor-pointer text-sm gap-2 rounded-md px-2 py-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCog, { className: "mr-2 h-4 w-4" }), " Set Avatar"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
													onClick: () => setResetPasswordModal({
														open: true,
														user: u
													}),
													className: "cursor-pointer text-sm gap-2 rounded-md px-2 py-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "mr-2 h-4 w-4" }), " Change Password"]
												})
											] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, { className: "-mx-1 my-1 h-px bg-muted" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
												disabled: softDeleteMutation.isPending,
												onClick: () => {
													if (confirm(`Delete account for ${u.name}? They will not be able to log in.`)) softDeleteMutation.mutate(u.id);
												},
												className: "cursor-pointer text-destructive focus:text-destructive text-sm gap-2 rounded-md px-2 py-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 h-4 w-4 text-destructive" }), " Delete User"]
											})
										]
									})] })
								})
							]
						}, u.id)) })] })
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCreateUserModal, {
				open: createUserModalOpen,
				onOpenChange: setCreateUserModalOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBanUserModal, {
				open: banUserModal.open,
				onOpenChange: (open) => setBanUserModal((prev) => ({
					...prev,
					open
				})),
				user: banUserModal.user
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEditUserInfoModal, {
				open: editUserInfoModal.open,
				onOpenChange: (open) => setEditUserInfoModal((prev) => ({
					...prev,
					open
				})),
				user: editUserInfoModal.user
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSetAvatarModal, {
				open: setAvatarModal.open,
				onOpenChange: (open) => setSetAvatarModal((prev) => ({
					...prev,
					open
				})),
				user: setAvatarModal.user
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminResetPasswordModal, {
				open: resetPasswordModal.open,
				onOpenChange: (open) => setResetPasswordModal((prev) => ({
					...prev,
					open
				})),
				user: resetPasswordModal.user
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminChangeOwnPasswordModal, {
				open: changeOwnPasswordOpen,
				onOpenChange: setChangeOwnPasswordOpen
			})
		]
	});
}
//#endregion
export { AdminUsersPage as component };
