import { useState, useEffect } from 'react';
import DataTable, { filterStyle, btnStyle, bodyStyle } from '../components/DataTable';

interface Log {
  id: number;
  event_type: string;
  sender: string;
  receiver: string;
  success: boolean;
  timestamp: string;
}

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetch("/api/logs/", {
          credentials: "include", // include session cookies if needed
        });
        if (!response.ok) throw new Error("Failed to fetch logs");

        const data: Log[] = await response.json();
        setLogs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, []);

  // Filter logs based on searchTerm
  const filteredLogs = logs.filter(log =>
    log.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.receiver.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.event_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Loading logs...</p>;

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
      
      {/* Header */}
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

        <h2 style={{ margin: "0 0 15px 0" }}>Logs</h2>
        
        {/* Search Bar */}
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
              boxSizing: "border-box"
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          
          <select style={filterStyle}>
            <option value="Dates">Dates</option>
            <option value="hours24">Last 24 Hours</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>

          <select style={filterStyle}>
            <option value="Type">Type</option>
            <option value="SMS">SMS</option>
            <option value="login">Login</option>
          </select>

          <button style={{ ...btnStyle, backgroundColor: "#6c757d" }}>Reset</button>
          <button style={{ ...btnStyle, backgroundColor: "#075E54" }}>Apply Filters</button>
        </div>
      </div>

      {/* Table */}
      <DataTable headers={["Event Type", "To", "From", "Date/Time", "Status"]}>
        {logs.map((log) => (
          <tr key={log.id} style={{ borderBottom: "1px solid #eee" }}>
            <td style={bodyStyle}>{log.event_type}</td>
            <td style={bodyStyle}>{log.receiver}</td>
            <td style={bodyStyle}>{log.sender}</td>
            <td style={bodyStyle}>{new Date(log.timestamp).toLocaleString()}</td>
            <td style={bodyStyle}>{log.success ? "Success" : "Fail"}</td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
