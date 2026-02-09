import type { useImportJson } from "../../hooks/useImportJson";
import DataTable from "../data-table";
import SheetTabs from "../sheet-tab";

type Props = ReturnType<typeof useImportJson>;

const SpreadSheetViewer = (props: Props) => {
  const { sheetNames, activeSheet, setActiveSheet } = props;
  return (
    <div className="relative flex flex-col">
      <SheetTabs
        sheetNames={sheetNames}
        activeSheet={activeSheet}
        onSheetChange={setActiveSheet}
        className="sticky top-0 left-0 right-0 z-20"
      />
      <DataTable {...props} />
    </div>
  );
};

export default SpreadSheetViewer;
