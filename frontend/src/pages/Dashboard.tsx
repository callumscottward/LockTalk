import { useState, useEffect, useRef } from 'react';

interface Conversation {
  id: string;
  name: string;
  is_group: boolean;
  last_msg?: string;
  time?: string;
}

interface Message {
  id: number;
  sender: string;
  text: string;
  is_me: boolean;
  timestamp?: string;
}

/* Can be used for searching */
interface User {
  id: number;
  username: string;
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const socketRef = useRef<WebSocket | null>(null);

  const authHeaders = {
    "Content-Type": "application/json",
  };

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/me/", {
          headers: authHeaders,
          credentials: "include"
        });
        const data = await res.json();
        setCurrentUserEmail(data.username);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("http://localhost:8000/dashboard/", {
          headers: authHeaders,
          credentials: "include",
        });
        const data: Conversation[] = await res.json();
        setConversations(data);
        if (data.length > 0) setActiveConversationId(data[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingConversations(false);
      }
    };
    fetchConversations();
  }, []);

  // Setup WebSocket for active conversation
  useEffect(() => {
    if (!activeConversationId || !currentUserEmail) return;

    // Close previous socket if switching conversations
    if (socketRef.current) {
      socketRef.current.close();
    }

    const ws = new WebSocket(`ws://localhost:8000/ws/conversation/${activeConversationId}/`);
    socketRef.current = ws;

    ws.onopen = () => console.log("Connected to conversation", activeConversationId);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log(data)
      console.log(currentUserEmail)
      if (data.type === "chat_message") {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(), // temporary id
            sender: data.sender_email,
            text: data.content,
            is_me: data.sender_email === currentUserEmail
          }
        ]);
      }
    };

    ws.onclose = () => console.log("Disconnected from conversation", activeConversationId);

    // Cleanup on unmount
    return () => ws.close();
  }, [activeConversationId, currentUserEmail]);

  // Send message via WebSocket
  const handleSendMessage = () => {
    if (!messageInput.trim() || !socketRef.current) return;

    socketRef.current.send(JSON.stringify({ message: messageInput }));
    setMessageInput("");
  };

  // Fetch existing messages whenever a conversation is selected
useEffect(() => {
  if (!activeConversationId || !currentUserEmail) return;

  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/dashboard/${activeConversationId}/messages/`,
        {
          headers: authHeaders,
          credentials: "include", // important if using session auth
        }
      );

      if (!res.ok) throw new Error("Failed to fetch messages");

      const dataApi = await res.json();

      const mapped: Message[] = dataApi.map((msg: any) => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.content,
        is_me: msg.sender.trim() === currentUserEmail.trim(),
        timestamp: msg.created_at,
      }));

      setMessages(mapped); // populate chat window
    } catch (err) {
      console.error("Error fetching messages:", err);
      setMessages([]); // fallback to empty
    }
  };

  fetchMessages();
}, [activeConversationId, currentUserEmail]); // runs whenever conversation or user changes

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", maxWidth: "100%", 
      maxHeight: "100%", overflow: "hidden", position: "fixed", top: 0, left: 0, 
      margin: 0, padding: 0, boxSizing: "border-box" }}>
      {/* Sidebar */}
      <div style={{ width: "250px", borderRight: "1px solid #ddd", background: "#f0f0f0", display: "flex", flexDirection: "column", overflowY: "auto"}}>
        <h3 style={{ padding: "15px" }}>Chats</h3>
        <button 
          onClick={() => setIsModalOpen(true)} 
          style={{ ...btnStyle, backgroundColor: "#ddd", margin: "10px" }}
        >+</button>
        {loadingConversations ? (
          <p style={{ padding: "15px" }}>Loading...</p>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              style={{
                padding: "12px",
                cursor: "pointer",
                background: activeConversationId === conv.id ? "#ddd" : "white",
              }}
            >
              {conv.name} {conv.is_group ? "(Group)" : "(Direct)"}
            </div>
          ))
        )}
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "15px", borderBottom: "1px solid #ddd", background: "#eee" }}>
          <strong>
            {conversations.find(c => c.id === activeConversationId)?.name || "Select a chat"}
          </strong>
        </div>

        <div style={{ flex: 1, padding: "15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          {messages.length === 0 ? (
            <p>No messages yet!</p>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.is_me ? "flex-end" : "flex-start",
                  background: msg.is_me ? "#075E54" : "#fff",
                  color: msg.is_me ? "#fff" : "#000",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  maxWidth: "70%",
                }}
              >
                {!msg.is_me && <div style={{ fontWeight: "bold" }}>{msg.sender}</div>}
                <div>{msg.text}</div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div style={{ padding: "10px", borderTop: "1px solid #ddd", display: "flex", gap: "10px" }}>
          <input
            style={{ flex: 1, padding: "10px", borderRadius: "20px", border: "1px solid #075E54" }}
            placeholder="Type a message..."
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSendMessage(); }}
          />
          <button
            onClick={handleSendMessage}
            style={{ padding: "10px 15px", borderRadius: "50%", background: "#075E54", color: "white" }}
          >
            ➤
          </button>
        </div>
      </div>
      {isModalOpen && (
      <div style={{position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    background: "rgba(0,0,0,0.5)", // Dims the background behind the popup 
                    display: "flex", justifyContent: "center", 
                    alignItems: "center", zIndex: 1000}}>
        <div style={{background: "white", padding: "20px", borderRadius: "8px", 
                  width: "300px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)"}}>
          <h3>New Chat</h3>
          <input 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "90%", padding: "8px", marginBottom: "10px" }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button onClick={() => setIsModalOpen(false)} style={{ padding: "8px", color: "#000000", background: "#ddd" }}>Cancel</button>
            {/* Temp button with no functionality. Can be replaced to actually create a new chat once backend is sync. */}
            <button type="button" style={{ ...btnStyle, backgroundColor: "#075E54", cursor: "default" }}>Create</button>
            {/* <button onClick={handleCreateChat} style={{ padding: "8px", background: "#075E54", color: "white", borderRadius: "4px" }}>Create</button> */}
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

/* Repeatable code to create buttons for the dashboard.*/
const btnStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: "6px",
  border: "none",
  color: "#f0f0f0",
  cursor: "pointer",
  fontWeight: "bold",
};
