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

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

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
      if (data.type === "chat_message") {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(), // temporary id
            sender: data.sender,
            text: data.content,
            is_me: false
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

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),            // temporary ID
        sender: currentUserEmail!, // your email/username
        text: messageInput,
        is_me: true,               // ensure it aligns to the right
      }
    ]);

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
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "250px", borderRight: "1px solid #ddd", background: "#f0f0f0" }}>
        <h3 style={{ padding: "15px" }}>Chats</h3>
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
    </div>
  );
}
