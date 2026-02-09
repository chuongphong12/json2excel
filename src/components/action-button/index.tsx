import { useCallback, useState } from "react";
import type { useImportJson } from "../../hooks/useImportJson";
import { cn } from "../../lib/utils";

type Props = ReturnType<typeof useImportJson>;

const ActionButton = (props: Props) => {
  const {
    convertJsonToExcelData,
    saveExcelFile,
    handleSearchTermChange,
    handleClear,
  } = props;

  const [displayValue, setDisplayValue] = useState("");

  // Search term: 게 되, 게 됐, 게 될, 지, 졌, 질
  const handleChangeValue = useCallback(
    (text: string) => {
      setDisplayValue(text);
      handleSearchTermChange(text);
    },
    [handleSearchTermChange],
  );

  return (
    <div
      className={cn(
        "flex gap-2 items-center justify-center p-4 border-2 border-dashed rounded-xl transition-colors border-slate-300 bg-slate-50 hover:border-blue-400",
      )}
    >
      <label className="input min-w-[300px]">
        <svg
          className="h-[1em] opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2.5"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </g>
        </svg>
        <input
          type="search"
          className="grow"
          placeholder="Search terms (comma-separated, 2-word phrases match in any order)"
          value={displayValue}
          onChange={(e) => handleChangeValue(e.target.value)}
        />
      </label>
      <button className="btn" onClick={convertJsonToExcelData}>
        Convert to Excel
      </button>
      <button className="btn" onClick={saveExcelFile}>
        Save Excel File
      </button>
      <button className="btn" onClick={handleClear}>
        Clear
      </button>
    </div>
  );
};

export default ActionButton;
