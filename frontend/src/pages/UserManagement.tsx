import { useState } from 'react';
import DataTable, { filterStyle, btnStyle, bodyStyle } from '../components/DataTable';

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  // TEMP DATA. Delete when actual implementation is put in.
  const users = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 2 === 0 ? "Admin" : "User",
    status: i % 2 === 0 ? "Active" : "Inactive",
    joined: "2026-03-21"
  }));

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100vh", 
      width: "100vw", 
      overflow: "hidden", 
      backgroundColor: "#f8f9fa",
      padding: "20px",
      boxSizing: "border-box"
    }}>
      
      {/* --- Header Section --- */}
      <div style={{ marginBottom: "20px", flexShrink: 0 }}>
        {/* Back Button */}
        <button 
          onClick={() => window.location.href = "/Dashboard"} 
          style={{
            background: "none",
            border: "none",
            color: "#000",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: "0",
            marginBottom: "1px",
            fontSize: "2rem",
            fontWeight: "500",
            marginTop: "-15px"
          }}>
          <span style={{ marginRight: "5px" }}>←</span>
        </button>

        <h2 style={{ margin: "0 0 15px 0" }}>User Management</h2>
        
        {/* Line 1: Search Bar */}
        <div style={{ marginBottom: "12px" }}>
          <input 
            type="text" 
            placeholder="Search by name, email, or ID..." 
            style={{ 
              width: "100%", 
              padding: "12px", 
              borderRadius: "6px", 
              border: "1px solid #ccc",
              fontSize: "1rem",
              boxSizing: "border-box",

            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Line 2: Filters */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select style={filterStyle}>
            <option value="">User Role</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>

          <select style={filterStyle}>
            <option value="">Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button style={{ ...btnStyle, backgroundColor: "#6c757d" }}>Reset</button>
          <button style={{ ...btnStyle, backgroundColor: "#075E54" }}>Apply Filters</button>
        </div>
      </div>

      {/* --- Table Section --- */}
      <DataTable headers={["Name", "Email", "Role", "Status", "Joined Date"]}>
        {users.map(user => (
          <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
            <td style={bodyStyle}>{user.name}</td>
            <td style={bodyStyle}>{user.email}</td>
            <td style={bodyStyle}>{user.role}</td>
            <td style={bodyStyle}>
              <span style={{ 
                padding: "4px 8px", 
                borderRadius: "12px", 
                fontSize: "0.85rem",
                backgroundColor: user.status === "Active" ? "#d4edda" : "#f8d7da",
                color: user.status === "Active" ? "#155724" : "#721c24"
              }}>
                {user.status}
              </span>
            </td>
            <td style={bodyStyle}>{user.joined}</td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
