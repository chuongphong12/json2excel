import { useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { FileIcon } from "../../icons/FileIcon";
import { LoadingIcon } from "../../icons/LoadingIcon";
import type { useImportJson } from "../../hooks/useImportJson";

type JsonImportProps = ReturnType<typeof useImportJson>;

const JsonImport = ({ fileName, loading, importJson }: JsonImportProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Check if it's a JSON file
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        // Create a synthetic event to pass to onImport
        const syntheticEvent = {
          target: {
            files: files,
            value: "",
          },
        } as React.ChangeEvent<HTMLInputElement>;

        importJson?.(syntheticEvent);
      } else {
        alert("Please drop a valid JSON file");
      }
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-start justify-center p-4 border-2 border-dashed rounded-xl transition-colors",
        isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-slate-300 bg-slate-50 hover:border-blue-400",
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-start gap-2 text-left">
        <button className="btn" onClick={() => fileInputRef.current?.click()}>
          {loading ? (
            <span className="flex items-center">
              <LoadingIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Processing...
            </span>
          ) : (
            "Choose file"
          )}
        </button>

        <div className="flex items-center cursor-pointer">
          <FileIcon className="mx-auto h-10 w-10 text-slate-400" />
          <label className="block text-sm font-medium text-slate-700">
            {fileName ? (
              <span className="text-blue-600 font-semibold">{fileName}</span>
            ) : (
              "Drag and drop or select JSON file"
            )}
          </label>

          <input
            type="file"
            accept=".json"
            onChange={importJson}
            className="hidden"
            ref={fileInputRef}
          />
        </div>
      </div>
    </div>
  );
};

export default JsonImport;
