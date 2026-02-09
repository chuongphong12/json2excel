import { useState, useMemo } from "react";
import { cn } from "../../lib/utils";
import CloseIcon from "../../icons/CloseIcon";
import type { useImportJson } from "../../hooks/useImportJson";

type Props = ReturnType<typeof useImportJson>;

const ROWS_PER_PAGE = 100;
const INITIAL_ROWS = 50;

const DataTable = (props: Props) => {
  const { excelData, activeSheet, isPending } = props;
  const [expandedCell, setExpandedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [visibleRowCount, setVisibleRowCount] = useState(INITIAL_ROWS);

  const headers = excelData?.[activeSheet]?.[0] ?? [];
  const allRows = useMemo(
    () => excelData?.[activeSheet]?.slice(1) ?? [],
    [excelData, activeSheet],
  );
  const rows = useMemo(
    () => allRows.slice(0, visibleRowCount),
    [allRows, visibleRowCount],
  );
  const totalRows = allRows.length;
  const hasMore = visibleRowCount < totalRows;

  const loadMore = () => {
    setVisibleRowCount((prev) => Math.min(prev + ROWS_PER_PAGE, totalRows));
  };

  const colToLetter = (index: number): string => {
    let letter = "";
    let i = index;
    while (i >= 0) {
      letter = String.fromCharCode((i % 26) + 65) + letter;
      i = Math.floor(i / 26) - 1;
    }
    return letter;
  };

  return (
    <div className="relative h-full overflow-auto">
      {isPending && (
        <div className="mb-3 rounded-md bg-blue-500/10 px-3 py-2 text-sm text-gray-400">
          Loading table data...
        </div>
      )}
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 shadow-md">
          <tr className="bg-gray-700 backdrop-blur-sm">
            <th className="sticky left-0 z-20 min-w-[52px] border-b-2 border-r border-gray-600 bg-gray-700 px-3 py-3 text-center text-sm font-bold text-gray-100 shadow-sm">
              #
            </th>
            {headers.map((header, i) => (
              <th
                key={i}
                className="min-w-[140px] cursor-pointer select-none border-b-2 border-r border-gray-600 bg-gray-700 px-3 py-3 text-left text-sm font-bold text-gray-100 transition-colors hover:bg-gray-600/70"
                title={`Sort by ${header || colToLetter(i)}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="mr-1 text-xs font-semibold text-blue-400">
                    {colToLetter(i)}
                  </span>
                  <span className="truncate">
                    {header || `Column ${colToLetter(i)}`}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length + 1}
                className="px-4 py-12 text-center text-gray-400"
              >
                "This sheet has no data rows"
              </td>
            </tr>
          ) : (
            rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="group transition-colors hover:bg-blue-500/5"
              >
                <td className="sticky left-0 z-10 border-b border-r-2 border-gray-600 bg-gray-700 px-3 py-2 text-center text-sm font-bold tabular-nums text-gray-100 align-top shadow-sm group-hover:bg-blue-500/10">
                  {rIdx + 1}
                </td>
                {headers.map((_, cIdx) => {
                  const cellValue = row[cIdx] ?? "";
                  const isLong = cellValue.length > 80;
                  const isExpanded =
                    expandedCell?.row === rIdx && expandedCell?.col === cIdx;

                  return (
                    <td
                      key={cIdx}
                      className={cn(
                        "border-b border-r border-gray-600 bg-gray-800 px-3 py-2 text-gray-100 align-top group-hover:bg-blue-500/5",
                        isLong && !isExpanded && "max-w-[360px]",
                        isExpanded && "bg-blue-500/5 max-w-[500px]",
                      )}
                    >
                      {isLong && !isExpanded ? (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCell({ row: rIdx, col: cIdx })
                          }
                          className="w-full text-left"
                          title="Click to expand"
                        >
                          <span className="line-clamp-2">{cellValue}</span>
                          <span className="mt-0.5 inline-block text-xs text-blue-400">
                            Show more
                          </span>
                        </button>
                      ) : isLong && isExpanded ? (
                        <div>
                          <div className="whitespace-pre-wrap break-words leading-relaxed">
                            {cellValue}
                          </div>
                          <button
                            type="button"
                            onClick={() => setExpandedCell(null)}
                            className="mt-1.5 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                          >
                            <CloseIcon className="h-3 w-3" />
                            Collapse
                          </button>
                        </div>
                      ) : (
                        <span className="whitespace-pre-wrap break-words">
                          {cellValue}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {hasMore && (
        <div className="mt-4 flex items-center justify-center gap-3 border-t border-gray-600 pt-4">
          <p className="text-sm text-gray-400">
            Showing {rows.length} of {totalRows} rows
          </p>
          <button
            type="button"
            onClick={loadMore}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Load {Math.min(ROWS_PER_PAGE, totalRows - visibleRowCount)} more
            rows
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
