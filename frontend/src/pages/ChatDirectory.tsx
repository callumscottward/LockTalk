import { useState } from 'react';

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
      <div style={{ 
        flex: 1, 
        backgroundColor: "white", 
        borderRadius: "8px", 
        border: "1px solid #ddd", 
        overflow: "hidden", // Important for contained scrolling
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Table Header (Fixed) */}
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr style={{ backgroundColor: "#eee", textAlign: "left" }}>
              <th style={headerStyle}>Chat Name</th>
              <th style={headerStyle}>Participants</th>
              <th style={headerStyle}>Date Created</th>
              <th style={headerStyle}>Last Date Used</th>
              <th style={{ ...headerStyle, textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
        </table>

        {/* Table Body (Scrollable) */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <tbody>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* Reusable Styles for different components*/
const filterStyle: React.CSSProperties = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  minWidth: "150px",
  backgroundColor: "white"
};

const btnStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: "6px",
  border: "none",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold"
};

const deleteButtonStyle: React.CSSProperties = {
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

const headerStyle: React.CSSProperties = {
  padding: "15px",
  fontWeight: "bold",
  borderBottom: "2px solid #ddd",
  textAlign: "center",
};

const bodyStyle: React.CSSProperties = {
  padding: "15px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};