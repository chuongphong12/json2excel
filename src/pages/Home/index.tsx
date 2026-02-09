import { lazy, Suspense } from "react";
import { useImportJson } from "../../hooks/useImportJson";
import JsonImport from "../../components/json-import";
import ActionButton from "../../components/action-button";

// Lazy load heavy components
const JsonEditor = lazy(() => import("../../components/json-viewer"));
const SpreadSheetViewer = lazy(() => import("../../components/sheet-view"));

const Home = () => {
  const hooks = useImportJson();
  return (
    <div className="flex flex-col w-full h-full overflow-hidden gap-4">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex justify-between items-center gap-4">
          <JsonImport {...hooks} />
          <ActionButton {...hooks} />
        </div>
        {hooks.showProgress && (
          <div className="w-full">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>Processing...</span>
              <span className="font-semibold">
                {Math.round(hooks.progress)}%
              </span>
            </div>
            <progress
              className="progress progress-primary w-full"
              value={hooks.progress}
              max="100"
            ></progress>
          </div>
        )}
      </div>

      <div className="relative w-full flex-1 flex gap-4 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex-1 rounded-md p-4 bg-[#2b2b2b] flex items-center justify-center text-gray-400">
              Loading...
            </div>
          }
        >
          <div className="flex-1 overflow-auto rounded-md p-4 bg-[#2b2b2b]">
            <JsonEditor {...hooks} />
          </div>
        </Suspense>
        <Suspense
          fallback={
            <div className="flex-1 rounded-md p-4 bg-[#2b2b2b] flex items-center justify-center text-gray-400">
              Loading...
            </div>
          }
        >
          <div className="flex-1 overflow-auto rounded-md p-4 bg-[#2b2b2b]">
            <SpreadSheetViewer {...hooks} />
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default Home;
