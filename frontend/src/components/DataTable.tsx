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

const headerStyle: React.CSSProperties = {
  padding: "15px",
  fontWeight: "bold",
  borderBottom: "2px solid #ddd",
  textAlign: "center",
};