import React from "react";

interface DataTableProps {
  headers: string[];
  children: React.ReactNode;
}

export default function DataTable({ headers, children }: DataTableProps) {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "white",
        borderRadius: "8px",
        border: "1px solid #ddd",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead>
          <tr style={{ backgroundColor: "#eee", textAlign: "left" }}>
            {headers.map((header) => (
              <th key={header} style={headerStyle}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
      </table>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

// Reusable Styles for different components.
export const filterStyle: React.CSSProperties = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  minWidth: "150px",
  backgroundColor: "white"
};

export const btnStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: "6px",
  border: "none",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold"
};

export const deleteButtonStyle: React.CSSProperties = {
  padding: "6px 12px",
  backgroundColor: "#fff",
  border: "1px solid #dc3545",
  color: "#dc3545",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.85rem",
  fontWeight: "500",
  transition: "all 0.2s ease"
};

export const headerStyle: React.CSSProperties = {
  padding: "15px",
  fontWeight: "bold",
  borderBottom: "2px solid #ddd",
  textAlign: "center",
};

export const bodyStyle: React.CSSProperties = {
  padding: "15px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};
