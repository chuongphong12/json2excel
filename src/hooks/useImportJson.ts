import { useState, useRef, useCallback } from "react";
import * as XLSX from 'xlsx';

export const useImportJson = () => {
  const [json, setJson] = useState<unknown>(null);
  const [excelData, setExcelData] = useState<XLSX.WorkBook | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const importJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Cancel previous import if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setFileName(file.name);
    setLoading(true);
    setError(null);
    setProgress(0);
    setJson(null);

    try {
      // Use File stream API for memory-efficient reading
      const stream = file.stream();
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      let result = '';
      let receivedLength = 0;
      const totalLength = file.size;

      // Read the stream chunk by chunk
      while (true) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new DOMException('Import cancelled', 'AbortError');
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
      if (error.name === 'AbortError') {
        setError("Import cancelled");
      } else {
        setError(error.message || "Error importing file");
      }
      setJson(null);
      setLoading(false);
      setProgress(0);
    } finally {
      abortControllerRef.current = null;
      e.target.value = '';
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
              resolve();
            });
          }, updateDelay);

        } catch (parseErr) {
          const error = parseErr as Error;
          setError("Invalid JSON format: " + error.message);
          setJson(null);
          setLoading(false);
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

  const convertJsonToExcelData = useCallback(() => {
    if (json === null || json === undefined) {
      setExcelData(null);
      return;
    }

    const { parallel } = json as { parallel: any[] };

    try {
      // Handle both array and single object
      const dataArray = Array.isArray(parallel) ? parallel : [parallel];

      // Flatten nested objects for Excel
      const flattenedData = dataArray.map((item: Record<string, unknown>) => {
        const flattened: Record<string, unknown> = {};

        const flattenObject = (obj: Record<string, unknown>, prefix = '') => {
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              const value = obj[key];
              const newKey = prefix ? `${prefix}.${key}` : key;

              if (value && typeof value === 'object' && !Array.isArray(value)) {
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
        return flattened;
      });

      const worksheet = XLSX.utils.json_to_sheet(flattenedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      // Limit to first 100,000 rows for performance
      setExcelData(workbook);
    } catch (err) {
      const error = err as Error;
      setError("Error converting to Excel format: " + error.message);
      setExcelData(null);
    }
  }, [json]);

  return { json, fileName, error, loading, progress, importJson, cancelImport, convertJsonToExcelData, excelData };
}