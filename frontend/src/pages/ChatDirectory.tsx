import { useState } from 'react';
import DataTable, { filterStyle, btnStyle, deleteButtonStyle, bodyStyle } from '../components/DataTable';

export default function ChatDirectory() {
  const [searchTerm, setSearchTerm] = useState("");

  // TEMP DATA. Delete when actual implementation is put in.
  // Updated to useState so the 'Delete' action can modify the list.
  const [users, setUsers] = useState(
    Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      chatName: `User ${i + 1}`,
      participants: `Amy, Stacy, Tom`,
      dateCreated: `4/1/26`,
      lastDateUsed: "4/2/26",
      Actions: 'Delete',
    }))
  );

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const filteredUsers = users.filter(user =>
    user.chatName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100vh", 
      width: "100%", 
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

        <h2 style={{ margin: "0 0 15px 0" }}>Chat Directory</h2>
        
        {/* Line 1: Search Bar */}
        <div style={{ marginBottom: "12px" }}>
          <input 
            type="text" 
            placeholder="Search by name, participants..." 
            style={{ 
              width: "100%", 
              padding: "12px", 
              borderRadius: "6px", 
              border: "1px solid #ccc",
              fontSize: "1rem",
              boxSizing: "border-box"
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Line 2: Filters */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select style={filterStyle}>
            <option value="">Sort By</option>
            <option value="admin">Oldest Created</option>
            <option value="editor">Newest Created</option>
            <option value="viewer">Least Recent Update</option>
          </select>

          <button style={{ ...btnStyle, backgroundColor: "#6c757d" }} onClick={() => setSearchTerm("")}>Reset</button>
          <button style={{ ...btnStyle, backgroundColor: "#075E54" }}>Apply Filters</button>
        </div>
      </div>

      {/* --- Table Section --- */}
      <DataTable headers={["Chat Name", "Participants", "Date Created", "Last Date Used", "Actions"]}>
        {filteredUsers.map(user => (
          <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
            <td style={bodyStyle}>{user.chatName}</td>
            <td style={bodyStyle}>{user.participants}</td>
            <td style={bodyStyle}>{user.dateCreated}</td>
            <td style={bodyStyle}>{user.lastDateUsed}</td>
            <td style={{ ...bodyStyle, textAlign: "center" }}>
              <button 
                onClick={() => handleDelete(user.id)}
                style={deleteButtonStyle}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
