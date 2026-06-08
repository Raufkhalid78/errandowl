/**
 * Utility to export an array of objects to a CSV file in the browser.
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headersMap?: Record<keyof T | string, string>
) {
  if (!data || data.length === 0) {
    return false;
  }

  // 1. Get the keys to export
  const keys = Object.keys(data[0]) as Array<keyof T>;
  
  // 2. Build the CSV headers row
  const headersRow = keys
    .map((key) => {
      const headerText = headersMap ? headersMap[key as string] || String(key) : String(key);
      // Escape double quotes by doubling them
      return `"${headerText.replace(/"/g, '""')}"`;
    })
    .join(",");

  // 3. Build data rows
  const rows = data.map((item) => {
    return keys
      .map((key) => {
        let value = item[key] as any;
        
        // Handle null/undefined values
        if (value === null || value === undefined) {
          value = "";
        }
        // Handle object values (e.g., joined profiles) by flattening or stringifying
        else if (typeof value === "object") {
          value = JSON.stringify(value);
        }
        else {
          value = String(value);
        }

        // Escape double quotes and wrap in quotes
        return `"${value.replace(/"/g, '""')}"`;
      })
      .join(",");
  });

  // 4. Combine headers and rows
  const csvContent = [headersRow, ...rows].join("\n");

  // 5. Create Blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return true;
}
