import { useState, useEffect } from 'react';
/**
 * @name UserManagement
 * ## UserManagement Component
 * This requires an admin view and shows all users registered 
 * on the platform. It allows administrators to search for users, 
 * verify account status, and view roles and join dates.
 * @category Admin Pages
 * @returns A full-width management dashboard for users with a scrollable user table.
 */

interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [, setLoading] = useState(true);

  // All the users since it is admin view
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/admin/all-users/", {
          credentials: "include",
        });
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          onClick={() => globalThis.location.href = "/Dashboard"} 
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
      <div style={{ 
        flex: 1, 
        backgroundColor: "white", 
        borderRadius: "8px", 
        border: "1px solid #ddd", 
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Table Header (Fixed) */}
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr style={{ backgroundColor: "#eee", textAlign: "left" }}>
              <th style={{ ...headerStyle, width: "25%" }}>Name</th>
              <th style={{ ...headerStyle, width: "25%" }}>Email</th>
              <th style={{ ...headerStyle, width: "10%" }}>Role</th>
              <th style={{ ...headerStyle, width: "10%" }}>Status</th>
              <th style={{ ...headerStyle, width: "30%" }}>Joined Date</th>
            </tr>
          </thead>
        </table>

        {/* Table Body (Scrollable) */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ ...bodyStyle, width: "25%" }}>{user.username}</td>
                  <td style={{ ...bodyStyle, width: "25%" }}>{user.email}</td>
                  <td style={{ ...bodyStyle, width: "10%" }}>{user.is_staff ? "Admin" : "User"}</td>
                  <td style={{ ...bodyStyle, width: "10%" }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "12px", 
                      fontSize: "0.85rem",
                      backgroundColor: user.is_active ? "#d4edda" : "#f8d7da",
                      color: user.is_active ? "#155724" : "#721c24"
                    }}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                    <td style={{ ...bodyStyle, width: "30%"}}>
                      {new Date(user.date_joined).toLocaleString()}
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

const headerStyle: React.CSSProperties = {
  padding: "15px",
  fontWeight: "bold",
  borderBottom: "2px solid #ddd", 
  textAlign: "center",
};

const bodyStyle: React.CSSProperties = {
  padding: "15px",
  verticalAlign: "top",
  wordBreak: "break-word",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
