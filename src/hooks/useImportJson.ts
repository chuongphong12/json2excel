import { useState, useRef, useCallback, useTransition } from "react";
import * as XLSX from "xlsx";

export type SpreadsheetData = {
  [sheetName: string]: string[][];
};

export const useImportJson = () => {
  const [json, setJson] = useState<unknown>(null);

  const [excelFile, setExcelFile] = useState<XLSX.WorkBook | null>(null);
  const [excelData, setExcelData] = useState<SpreadsheetData | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState("");

  const [searchTerm, setSearchTerm] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isPending, startTransition] = useTransition();

  const importJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Cancel previous import if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setFileName(file.name);
    setError(null);
    setLoading(true);
    setShowProgress(true);
    setProgress(0);
    setJson(null);

    try {
      // Use File stream API for memory-efficient reading
      const stream = file.stream();
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      let result = "";
      let receivedLength = 0;
      const totalLength = file.size;

      // Read the stream chunk by chunk
      while (true) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new DOMException("Import cancelled", "AbortError");
        }

        const { done, value } = await reader.read();

        if (done) break;

        // Decode chunk and append
        result += decoder.decode(value, { stream: true });
        receivedLength += value.length;

        // Update progress (0-70% for reading)
        const percentComplete = (receivedLength / totalLength) * 70;
        setProgress(Math.min(percentComplete, 70));
      }

      // Decode any remaining bytes
      result += decoder.decode();

      setProgress(75);

      // Parse JSON in chunks to prevent blocking
      await parseJsonChunked(result);
    } catch (err) {
      const error = err as Error;
      if (error.name === "AbortError") {
        setError("Import cancelled");
      } else {
        setError(error.message || "Error importing file");
      }
      setJson(null);
      setLoading(false);
      setShowProgress(false);
      setProgress(0);
    } finally {
      abortControllerRef.current = null;
      e.target.value = "";
    }
  };

  const parseJsonChunked = async (text: string) => {
    return new Promise<void>((resolve, reject) => {
      // Split parsing into smaller steps for very large files
      const textSizeInMB = text.length / (1024 * 1024);

      // For very large files, add extra delay
      const delay = textSizeInMB > 10 ? 200 : 50;

      setTimeout(() => {
        try {
          setProgress(85);

          // Parse the JSON
          const parsed = JSON.parse(text);

          // Add extra delay before state update for large objects
          const updateDelay = textSizeInMB > 10 ? 100 : 0;

          setTimeout(() => {
            // Use requestAnimationFrame to defer state update to next paint
            requestAnimationFrame(() => {
              setJson(parsed);
              setError(null);
              setProgress(100);
              setLoading(false);
              setShowProgress(false);
              resolve();
            });
          }, updateDelay);
        } catch (parseErr) {
          const error = parseErr as Error;
          setError("Invalid JSON format: " + error.message);
          setJson(null);
          setLoading(false);
          setShowProgress(false);
          setProgress(0);
          reject(new Error("Invalid JSON format: " + error.message));
        }
      }, delay);
    });
  };

  const cancelImport = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const convertWithSearchTerm = async (params: {
    searchTerm: string[];
    dataArray: any[];
  }) => {
    const { searchTerm, dataArray } = params;
    const totalItems = dataArray.length;

    setProgress(10);

    await new Promise((resolve) => setTimeout(resolve, 0));
    setProgress(20);

    // Normalize search terms once (lowercase for case-insensitive search)
    const normalizedSearchTerms = searchTerm.map((term) => term.toLowerCase());

    // Result map to store matches for each search term
    const resultMap = new Map<string, any[]>();
    normalizedSearchTerms.forEach((term) => resultMap.set(term, []));

    // Iterate through data once to filter
    for (let i = 0; i < totalItems; i++) {
      const record = dataArray[i];

      // Pre-normalize all searchable text fields once per record
      const searchableFields: string[] = [];

      // Add main fields
      if (record.id) searchableFields.push(String(record.id).toLowerCase());
      if (record.source)
        searchableFields.push(String(record.source).toLowerCase());
      if (record.target)
        searchableFields.push(String(record.target).toLowerCase());

      // Add revision fields
      if (record.revision) {
        if (record.revision.revision1) {
          searchableFields.push(
            String(record.revision.revision1).toLowerCase(),
          );
        }
        if (record.revision.revision2) {
          searchableFields.push(
            String(record.revision.revision2).toLowerCase(),
          );
        }
      }

      // Check each search term (add to all matching terms, not just first)
      for (let j = 0; j < normalizedSearchTerms.length; j++) {
        const searchKey = normalizedSearchTerms[j];

        // Check if search term has multiple words
        const words = searchKey.split(/\s+/).filter((w) => w.length > 0);

        let isMatch = false;

        if (words.length > 1) {
          // Multi-word search: check each field for consecutive word match in any order
          for (const fieldText of searchableFields) {
            // For 2-word search, check if words appear consecutively in either order
            if (words.length === 2) {
              // Create pattern with space between words
              const pattern1 = words[0] + " " + words[1];
              const pattern2 = words[1] + " " + words[0];

              if (
                fieldText.includes(pattern1) ||
                fieldText.includes(pattern2)
              ) {
                isMatch = true;
                break;
              }
            } else {
              // For 3+ words, check if they appear consecutively with spaces
              const pattern = words.join(" ");
              if (fieldText.includes(pattern)) {
                isMatch = true;
                break;
              }
            }
          }
        } else {
          // Single word search: check if it appears in any field
          for (const fieldText of searchableFields) {
            if (fieldText.includes(searchKey)) {
              isMatch = true;
              break;
            }
          }
        }

        if (isMatch) {
          resultMap.get(searchKey)!.push(record);
        }
      }

      // Update progress for filtering (20-60%)
      const filterProgress = 20 + ((i + 1) / totalItems) * 40;
      setProgress(filterProgress);

      // Yield to UI for large datasets
      if (i % 100 === 0 && i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    setProgress(70);

    // Create workbook with multiple sheets
    await new Promise((resolve) => setTimeout(resolve, 0));
    const workbook = XLSX.utils.book_new();

    let sheetIndex = 0;
    const totalSheets = searchTerm.length;

    // Create a worksheet for each search term
    for (const [searchKey, results] of resultMap.entries()) {
      // Flatten the results for this search term
      const flattenedData: Record<string, unknown>[] = results.map((item) => {
        const flattened: Record<string, unknown> = {};

        const flattenObject = (obj: Record<string, unknown>, prefix = "") => {
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              const value = obj[key];
              const newKey = prefix ? `${prefix}.${key}` : key;

              if (value && typeof value === "object" && !Array.isArray(value)) {
                flattenObject(value as Record<string, unknown>, newKey);
              } else {
                flattened[newKey] = value;
              }
            }
          }
        };

        flattenObject(item);
        return flattened;
      });

      // Create worksheet for this search term
      const worksheet = XLSX.utils.json_to_sheet(flattenedData);

      // Use search term as sheet name (limit to 31 chars for Excel)
      const sheetName = searchKey.substring(0, 31);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Update progress (70-95%)
      sheetIndex++;
      const sheetProgress = 70 + (sheetIndex / totalSheets) * 25;
      setProgress(sheetProgress);

      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    setProgress(95);

    // Set the data
    await new Promise((resolve) => setTimeout(resolve, 0));
    fileNormalized(workbook);
    setExcelFile(workbook);
    setProgress(100);

    await new Promise((resolve) => setTimeout(resolve, 100));
    setShowProgress(false);
  };

  const convertWithoutSearchTerm = async (dataArray: any[]) => {
    setProgress(10);

    // Handle both array and single object
    await new Promise((resolve) => setTimeout(resolve, 0));
    setProgress(20);

    // Flatten nested objects for Excel
    const flattenedData: Record<string, unknown>[] = [];
    const totalItems = dataArray.length;

    for (let i = 0; i < totalItems; i++) {
      const item = dataArray[i] as Record<string, unknown>;
      const flattened: Record<string, unknown> = {};

      const flattenObject = (obj: Record<string, unknown>, prefix = "") => {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (value && typeof value === "object" && !Array.isArray(value)) {
              // Recursively flatten nested objects
              flattenObject(value as Record<string, unknown>, newKey);
            } else {
              // Add primitive values or arrays as-is
              flattened[newKey] = value;
            }
          }
        }
      };

      flattenObject(item);
      flattenedData.push(flattened);

      // Update progress for flattening (20-60%)
      const flattenProgress = 20 + ((i + 1) / totalItems) * 40;
      setProgress(flattenProgress);

      // Yield to UI for large datasets
      if (i % 100 === 0 && i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    setProgress(70);
    // Create worksheet
    await new Promise((resolve) => setTimeout(resolve, 0));
    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    setProgress(85);

    // Create workbook
    await new Promise((resolve) => setTimeout(resolve, 0));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    setProgress(95);

    // Set the data
    await new Promise((resolve) => setTimeout(resolve, 0));
    fileNormalized(workbook);
    setExcelFile(workbook);
    setProgress(100);

    await new Promise((resolve) => setTimeout(resolve, 100));
    setShowProgress(false);
  };

  const convertJsonToExcelData = useCallback(async () => {
    if (json === null || json === undefined) {
      setExcelData(null);
      return;
    }

    setShowProgress(true);
    setProgress(0);
    setError(null);

    try {
      const { parallel } = json as { parallel: any[] };
      const dataArray = Array.isArray(parallel) ? parallel : [parallel];
      if (searchTerm.length > 0) {
        await convertWithSearchTerm({ searchTerm, dataArray });
      } else {
        await convertWithoutSearchTerm(dataArray);
      }
    } catch (err) {
      const error = err as Error;
      setError("Error converting to Excel format: " + error.message);
      setExcelData(null);
      setExcelFile(null);
      setProgress(0);
      setShowProgress(false);
    }
  }, [json, searchTerm]);

  const fileNormalized = (workbook: XLSX.WorkBook) => {
    const parsed: SpreadsheetData = {};
    for (const name of workbook.SheetNames) {
      const sheet = workbook.Sheets[name];
      const json: string[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
        rawNumbers: false,
      });
      const maxCols = json.reduce((max, row) => Math.max(max, row.length), 0);
      const normalized = json.map((row) => {
        const padded = [...row];
        while (padded.length < maxCols) padded.push("");
        return padded;
      });
      parsed[name] = normalized;
    }

    // Use startTransition to make state update non-blocking
    startTransition(() => {
      setExcelData(parsed);
      setSheetNames(workbook.SheetNames);
      setActiveSheet(workbook.SheetNames[0] ?? "");
    });
  };

  const saveExcelFile = () => {
    XLSX.writeFile(excelFile!, fileName.replace(/\.json$/i, ".xlsx"));
  };

  const handleSearchTermChange = (text: string) => {
    // Split by commas only, trim whitespace, and filter out empty strings
    const terms = text
      .split(/,/)
      .map((term) => term.trim())
      .filter((term) => term.length > 0);

    setSearchTerm(terms);
  };

  const handleClear = () => {
    setJson(null);
    setExcelFile(null);
    setExcelData(null);
    setFileName("");
    setSheetNames([]);
    setActiveSheet("");
    setSearchTerm([]);
    setError(null);
    setLoading(false);
    setShowProgress(false);
    setProgress(0);
  };

  return {
    json,
    fileName,
    error,
    loading,
    progress,
    showProgress,
    sheetNames,
    activeSheet,
    setActiveSheet,
    importJson,
    cancelImport,
    convertJsonToExcelData,
    saveExcelFile,
    excelData,
    excelFile,
    isPending,
    searchTerm,
    handleSearchTermChange,
    handleClear,
  };
};
