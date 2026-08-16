import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface AccountSuspendedModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  userName?: string;
  userEmail?: string;
  status?: string;
}

export function AccountSuspendedModal({ open, onOpenChange }: AccountSuspendedModalProps) {
  const { signOut } = useAuth();

  if (!open) {
    return null;
  }

  const handleConfirmLogout = () => {
    void signOut();
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) {
          handleConfirmLogout();
        }
      }}
    >
      <AlertDialogContent className="sm:max-w-md bg-background border shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <AlertTriangle className="h-6 w-6 text-destructive shrink-0" />
            Account Suspended
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2 text-sm text-muted-foreground leading-relaxed">
            Your account has been suspended by an administrator. You will now be logged out. Please
            contact support if you believe this is an error.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end pt-4">
          <AlertDialogAction
            onClick={handleConfirmLogout}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold px-6 cursor-pointer"
          >
            OK
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
