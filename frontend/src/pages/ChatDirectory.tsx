import { useState, useEffect, useRef } from 'react';

/**
 * @name ChatDirectory
 * ## UserManagement Component
 * This requires an admin view and shows all of the chats
 * on the platform. It allows administrators to see conversation
 * names, participants, the last date the conversation was used, 
 * and delete conversations.
 * @category Admin Pages
 * @returns A full-width management dashboard for various chats with a scrollable user table.
 */

interface Conversation {
  id: string;
  name: string;
  is_group: boolean;
  participants: { id: number; username: string }[];
  time: string; 
}

export default function ChatDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [, setLoading] = useState(true);
  const conversationSocketRef = useRef<WebSocket | null>(null);

  const authHeaders = {
    "Content-Type": 'application/json',
  };

  useEffect(() => {
    const fetchAllChats = async () => {
      try {
          // Admin to get conversations
          const res = await fetch("http://localhost:8000/api/admin/all-conversations/", {
            headers: authHeaders,
            credentials: "include",
        });
        const data: Conversation[] = await res.json();
        setConversations(data);
      } 
      catch (err) {
        console.error("Failed to load directory:", err);
      } 
      finally {
        setLoading(false);
      }
    };
    fetchAllChats();
  }, []);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/conversations/");
    conversationSocketRef.current = ws;

    ws.onmessage = (e) => {
        const data = JSON.parse(e.data);

        if (data.type === "conversation_deleted") {
          setConversations(prev => prev.filter(c => c.id !== data.conversation_id));
        }
      };

      return () => ws.close();
    }, 
  []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this entire chat for everyone?")) {
      return;
    }

    if (conversationSocketRef.current && conversationSocketRef.current.readyState === WebSocket.OPEN) {
      conversationSocketRef.current.send(JSON.stringify({
      action: "delete_conversation",
      conversation_id: id
    }));
    } 
    else {
      console.error("WebSocket is not connected.");
      alert("Connection lost. Please refresh the page.");
    }
  };

    const filteredChats = conversations.filter(conv =>
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.participants.some(p => p.username.toLowerCase().includes(searchTerm.toLowerCase()))
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
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Table Header (Fixed) */}
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr style={{ backgroundColor: "#eee", textAlign: "left" }}>
              <th style={{ ...headerStyle, width: "25%"}}>Chat Name</th>
              <th style={{ ...headerStyle, width: "30%"}}>Participants</th>
              <th style={{ ...headerStyle, width: "30%"}}>Last Date Used</th>
              <th style={{ ...headerStyle, width: "15%"}}>Actions</th>
            </tr>
          </thead>
        </table>

        {/* Table Body (Scrollable) */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <tbody>
              {filteredChats.map(conv => (
                  <tr key={conv.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ ...bodyStyle, width: "25%"}}><strong>{conv.name || "Direct Message"}</strong></td>
                    <td style={{ ...bodyStyle, width: "30%"}}>
                      {conv.participants.map(p => p.username).join(", ")}
                    </td>
                    <td style={{ ...bodyStyle, width: "30%"}}>
                      {new Date(conv.time).toLocaleString()}
                    </td>
                    <td style={{ ...bodyStyle, width: '15%', textAlign: "center" }}>
                      <button 
                        onClick={() => handleDelete(conv.id)}
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
  borderBottom: "2px solid #ddd"
};

const bodyStyle: React.CSSProperties = {
  padding: "15px",
  verticalAlign: "top",
  wordBreak: "break-word",
  overflow: "hidden",
  textOverflow: "ellipsis",
};