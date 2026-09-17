import { TriangleAlert } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type DeleteProspectDialogProps = {
  prospect: { id: string; name: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
};

export function DeleteProspectDialog({
  prospect,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteProspectDialogProps) {
  if (!prospect) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !isDeleting && onOpenChange(o)}>
      <DialogContent className="w-full max-w-lg bg-[#EEEFF2] dark:bg-slate-900 border border-[#E1E7EF] dark:border-slate-800 rounded-2xl p-6 shadow-lg gap-4 text-slate-900 dark:text-slate-100">
        <DialogHeader className="flex flex-col space-y-2 text-left sm:text-left">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2 text-[#0f1729] dark:text-slate-100">
            <TriangleAlert className="h-6 w-6 text-[#dc2626] shrink-0 stroke-2" />
            Are you absolutely sure?
          </DialogTitle>
          <DialogDescription className="text-sm text-[#94a3b8] dark:text-slate-400 text-left mt-2 leading-5">
            This action cannot be undone. This will permanently delete the lead for &quot;
            <span className="font-semibold text-[#94a3b8] dark:text-slate-300">
              {prospect.name}
            </span>
            &quot;.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors h-10 px-4 py-2 mt-2 sm:mt-0 bg-[#EEEFF2] dark:bg-slate-800 border border-[#E1E7EF] dark:border-slate-700 text-[#0f1729] dark:text-slate-200 hover:bg-[#E1E7EF]/80 dark:hover:bg-slate-700 rounded-[10px] shadow-none cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors h-10 px-4 py-2 bg-[#dc2626] hover:bg-[#dc2626]/90 text-[#fafafa] rounded-[10px] shadow-none cursor-pointer border-0"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Yes, delete lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
