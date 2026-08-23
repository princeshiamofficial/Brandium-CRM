import * as React from "react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CRM_STAGE_ICONS, getIconDefaultColor } from "@/lib/icons";

export type IconPickerProps = {
  value?: string | null | undefined;
  onChange: (iconName: string, defaultColor?: string) => void;
  onSelectColor?: ((color: string) => void) | undefined;
  color?: string | undefined;
  className?: string | undefined;
};

export function IconPicker({ value, onChange, onSelectColor, color, className }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const currentIconName = value || "Circle";
  const currentDefaultColor = getIconDefaultColor(currentIconName);
  const activeColor = color || currentDefaultColor;

  const SelectedIconComponent =
    (Icons as unknown as Record<string, LucideIcon>)[currentIconName] || Icons.Circle;

  const filteredIcons = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return CRM_STAGE_ICONS;
    return CRM_STAGE_ICONS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full h-10 px-3 justify-between rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted/50 cursor-pointer",
            className,
          )}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="size-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs transition-transform hover:scale-105"
              style={{ backgroundColor: activeColor }}
            >
              <SelectedIconComponent className="size-4 text-white" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Select Icon</span>
          </div>
          <Icons.ChevronDown className="size-4 text-slate-400 shrink-0 ml-1 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-76 sm:w-84 p-3.5 rounded-2xl shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-card"
      >
        <div className="space-y-3">
          {/* Search Header */}
          <div className="relative">
            <Icons.Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8.5 pl-8 text-xs rounded-xl bg-slate-50 dark:bg-muted/40 border-slate-200 dark:border-slate-800"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Icons.X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Color-Rich Icons Grid */}
          <ScrollArea className="h-56 pr-1">
            {filteredIcons.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Icons.SearchX className="size-6 mx-auto mb-1.5 opacity-40" />
                <p className="text-xs font-medium">No matching icons</p>
              </div>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 p-1">
                {filteredIcons.map((item) => {
                  const IconComp =
                    (Icons as unknown as Record<string, LucideIcon>)[item.name] || Icons.Circle;
                  const isSelected = currentIconName === item.name;

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        onChange(item.name, item.defaultColor);
                        if (onSelectColor) onSelectColor(item.defaultColor);
                        setOpen(false);
                      }}
                      title={item.label}
                      className={cn(
                        "size-9.5 rounded-xl flex items-center justify-center transition-all cursor-pointer relative shadow-2xs",
                        isSelected
                          ? "ring-2 ring-offset-2 ring-primary scale-105 shadow-md"
                          : "hover:scale-110 hover:shadow-xs",
                      )}
                      style={{
                        backgroundColor: isSelected
                          ? color || item.defaultColor
                          : `${item.defaultColor}16`,
                        border: isSelected ? "none" : `1px solid ${item.defaultColor}35`,
                      }}
                    >
                      <IconComp
                        className="size-4.5 transition-transform"
                        style={{
                          color: isSelected ? "#FFFFFF" : item.defaultColor,
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
