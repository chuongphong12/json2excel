import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type SheetTabsProps = {
  sheetNames: string[];
  activeSheet: string;
  onSheetChange: (name: string) => void;
} & HTMLAttributes<HTMLDivElement>;

const SheetTabs = ({
  sheetNames,
  activeSheet,
  onSheetChange,
  ...props
}: SheetTabsProps) => {
  if (sheetNames.length <= 1) return null;

  return (
    <div
      {...props}
      role="tablist"
      aria-label="Spreadsheet sheets"
      className={cn(
        "flex items-center gap-1 overflow-x-auto border-b border-border bg-white px-2 rounded-md",
        props.className,
      )}
    >
      {sheetNames.map((name) => (
        <button
          key={name}
          role="tab"
          aria-selected={activeSheet === name}
          onClick={() => onSheetChange(name)}
          className={cn(
            "shrink-0 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
            activeSheet === name
              ? "border-primary text-primary bg-foreground/90"
              : "border-transparent text-secondary hover:text-foreground hover:border-border",
          )}
        >
          {name}
        </button>
      ))}
    </div>
  );
};

export default SheetTabs;
