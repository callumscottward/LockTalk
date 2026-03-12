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
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);

  const authHeaders = {
    "Content-Type": "application/json",
  };

  //Whenever the page is loaded, get whoever the current user is
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
  });

  //This is to fetch all existing conversations and set it to the conversations variable
 useEffect(() => {
  const fetchConversations = async () => {
    try {
      const res = await fetch("http://localhost:8000/dashboard/", {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // for session auth
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch conversations: ${res.status}`);
      }

      const data: Conversation[] = await res.json();
      setConversations(data);
      if (data.length > 0) setActiveConversationId(data[0].id);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  };

  fetchConversations();
});

  //Fetch all the messages once a conversation is selected
  useEffect(() => {
    if (!activeConversationId) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(
          `http://localhost:8000/dashboard/${activeConversationId}/messages/`,
          {
            headers: authHeaders, // include token
            credentials: "include",

          },
        );

        const dataApi = await res.json();

        const mapped: Message[] = dataApi.map((msg: any) => {
          return {
            id: msg.id,
            sender: msg.sender,
            text: msg.content,
            is_me: msg.sender?.trim() === currentUserEmail?.trim(),
            timestamp: msg.created_at,
          };
        });

        setMessages(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeConversationId]);

  //Ability to send messages to the current chat selected
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversationId) return;

    try {
      const res = await fetch(
        `http://localhost:8000/dashboard/${activeConversationId}/messages/create/`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ content: messageInput }),
        }
      );

      const newMessageApi = await res.json();

      const newMessage: Message = {
        id: newMessageApi.id,
        sender: newMessageApi.sender,
        text: newMessageApi.content,
        is_me: true,
        timestamp: newMessageApi.created_at,
      };

      //Update the list of messages to include the newest one in the latest index
      setMessages((prev) => [
        ...prev,
        { ...newMessage, is_me: true },
      ]);

      setMessageInput("");
    } catch (err) {
      console.error(err);
      alert("Failed to send message. Try again.");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "250px", borderRight: "1px solid #ddd", background: "#f0f0f0" }}>
        <h3 style={{ padding: "15px" }}>Chats</h3>
        {loadingConversations ? (
          <p style={{ padding: "15px" }}>Loading...</p>
        ) : (
          conversations.map((conv) => (
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
            {/*Fix This */}
            {conversations.find((c) => c.id === activeConversationId)?.name || "Select a chat"}
          </strong>
        </div>

        <div style={{ flex: 1, padding: "15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          {loadingMessages ? (
            <p>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p>No messages yet!</p>
          ) : (
            messages.map((msg) => (
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
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
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
