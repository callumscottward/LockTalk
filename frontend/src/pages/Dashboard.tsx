import { useState, useEffect, useRef } from 'react';

interface Conversation {
  id: string;
  name: string;
  is_group: boolean;
  participants: User[];
  last_msg?: string;
  time: string;
}

interface Message {
  id: number;
  sender: string;
  encrypted_content: { iv: Array<number>, data: Array<number> };
  is_me: boolean;
  timestamp?: string;
}

/* Can be used for searching */
interface User {
  id: number;
  username: string;
}

function getCookie(name: string) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + "=")) {
        cookieValue = cookie.substring(name.length + 1);
        break;
      }
    }
  }
  return cookieValue;
}

function MessageBubbleText({
  msg,
  decryptMessage,
}: Readonly<{
  msg: Message;
  decryptMessage: (m: Message["encrypted_content"]) => Promise<string>;
}>) {
  const [decrypted, setDecrypted] = useState("");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const text = await decryptMessage(msg.encrypted_content);
      if (!cancelled) setDecrypted(text);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [msg.encrypted_content]);

  return (
    <div>{decrypted}</div>
  );
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
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [newConversationName, setConversationName] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [hoveredConvId, setHoveredConvId] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const conversationsSocketRef = useRef<WebSocket | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const authHeaders = {
    "Content-Type": "application/json",
  };


  // Fetch current user once you reach the dashboard website
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me/", {
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

  // Fetch conversations once you reach the dashboard website
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("http://localhost:8000/dashboard/", {
          headers: authHeaders,
          credentials: "include",
        });
        const data: Conversation[] = await res.json();
        //Sort the conversations by the most recent time (The time variable is affected by the data of creation and last message)
        let sortedConversations = [...data].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        setConversations(sortedConversations);
        setActiveConversationId(sortedConversations[0].id);
      } catch (err) {
        //console.error(err);
        console.log("No Conversation Exists Yet")
      } finally {
        setLoadingConversations(false);
      }
    };
    fetchConversations();
  }, []);

  // Web Socket Effect that is used when adding a new conversation
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/conversations/");
    conversationsSocketRef.current = ws;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      console.log(data)

      if (data.type === "new_conversation") {
        setConversations(prev => {
          const newConv = data.conversation;

          const existingIndex = prev.findIndex(conv => {
            if (conv.participants.length !== newConv.participants.length) return false;

            const set = new Set(conv.participants.map(p => p.username));
            return newConv.participants.every((p: { username: string; }) => set.has(p.username));
          });

          // CASE 1: Conversation already exists → move to top
          if (existingIndex !== -1) {
            const updated = [...prev];
            const existing = updated.splice(existingIndex, 1)[0];

            setActiveConversationId(existing.id);
            return [existing, ...updated];
          }

          // CASE 2: New conversation → add to top
          setActiveConversationId(newConv.id);
          return [newConv, ...prev];
        });
      }

      if (data.type === "conversation_deleted") {
        setConversations(prev =>
          prev.filter(c => c.id !== data.conversation_id)
        );

        setActiveConversationId(prev =>
          prev === data.conversation_id ? null : prev
        );
      }
    };

    return () => ws.close();
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

    ws.onmessage = async (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "chat_message") {
        setMessages(prev => [
          ...prev,
          {
            id: data.message_id,
            sender: data.sender_email,
            encrypted_content: data.content,
            // the .trim().toLowerCase() ensures they are identical
            is_me: data.sender_email.trim().toLowerCase() === currentUserEmail?.trim().toLowerCase(),
            timestamp: data.timestamp || new Date().toISOString(),
          }
        ]);

        setConversations(prev => {
          const index = prev.findIndex(c => c.id === activeConversationId);
          if (index === -1) return prev;

          const newList = [...prev];
          let latestConversation = newList.splice(index, 1)[0];
          return [latestConversation, ...newList];
        })
      }

      if (data.type === "message_deleted") {
        setMessages(prev =>
          prev.filter(m => m.id !== data.message_id)
        );
      }
    };

    // Cleanup on unmount
    return () => {
      if (ws.readyState === 1) ws.close();
    };
  }, [activeConversationId, currentUserEmail]);

  // Get the key message encryption will use (hardcoded for now)
  const getKey = async () => {
    const enc = new TextEncoder();
    return crypto.subtle.importKey(
      "raw",
      enc.encode("temporary_test_key_1234567891011"),
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
  };
  
  // Encrypt messages before sending them
  const encryptMessage = async (message: string) => {
    const key = await getKey();
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      enc.encode(message)
    );

    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(ciphertext)),
    };
  };

  // Decrypt received messages to be displayed in plaintext
  const decryptMessage = async ( message: { iv: Array<number>, data: Array<number> } ) => {
    const key = await getKey();
    const decoder = new TextDecoder();

    const { iv, data } = message;

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      key,
      new Uint8Array(data)
    );

    return decoder.decode(decrypted);
  };
  
  // Send message via WebSocket
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !socketRef.current) return;

    const encryptedMessage = await encryptMessage(messageInput);

    socketRef.current.send(JSON.stringify({ message: encryptedMessage }));
    setMessageInput("");
  };

  const handleDeleteMessage = (messageId: number) => {
    if (!window.confirm("Delete this message?")) return;

    socketRef.current?.send(JSON.stringify({
      action: "delete_message",
      message_id: messageId
    }));
  };

  const handleDeleteConversation = (convId: string) => {
    if (!window.confirm("Delete this entire conversation?")) return;

    conversationsSocketRef.current?.send(JSON.stringify({
      action: "delete_conversation",
      conversation_id: convId
    }));
  };

  const handleLogout = async () => {
    try {
      const csrfToken = getCookie("csrftoken");

      const res = await fetch("/api/logout/", {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRFToken": csrfToken || "",
        },
      });

      if (!res.ok) {
        throw new Error("Logout failed");
      }

      window.location.href = "/Login";
    } catch (err) {
      console.error("Logout error:", err);
    }
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

        const mapped: Message[] = dataApi.map((msg: any) => {
          // Ensure message content is JSON and not string from API fetch
          let content = msg.content
          
          if (typeof content === 'string') {
            try {
              const validJsonString = content.replaceAll('\'', '"');
              content = JSON.parse(validJsonString);
            } catch (e) {
              console.error("Failed to parse content for msg", msg.id, e);
              content = undefined;
            }
          }
          
          return {
            id: msg.id,
            sender: msg.sender,
            encrypted_content: content,
            is_me: msg.sender.trim() === currentUserEmail.trim(),
            timestamp: msg.created_at,
          };
        });

        setMessages(mapped); // populate chat window
      } catch (err) {
        console.error("Error fetching messages:", err);
        setMessages([]); // fallback to empty
      }
    };

    fetchMessages();
  }, [activeConversationId, currentUserEmail]); // runs whenever conversation or user changes

  //Searches for the user data when creating a conversation
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setUsers([]);
      return;
    }
    fetch(`/api/users/?search=${encodeURIComponent(searchQuery)}`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setUsers(data));
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Menu options (3 dots)
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //The logic for actually selecting the user when creating a conversation
  const toggleUser = (username: string) => {
    setSelectedUsers(prev =>
      prev.includes(username)
        ? prev.filter(u => u !== username)
        : [...prev, username]
    );
  };

  //Logic for cerating the chat when the button is pressed
  const handleCreateChat = () => {
    if (!selectedUsers.length || !conversationsSocketRef.current) return;

    conversationsSocketRef.current.send(JSON.stringify({
      action: "create_group",
      name: newConversationName, // optional
      participants: selectedUsers,
    }));

    setSelectedUsers([]);
    setSearchQuery("");
    setConversationName("");
    setIsModalOpen(false);
  };

  return (
    <div style={{
      display: "flex", height: "100vh", width: "100vw", maxWidth: "100%",
      maxHeight: "100%", overflow: "hidden", position: "fixed", top: 0, left: 0,
      margin: 0, padding: 0, boxSizing: "border-box"
    }}>
      {/* Sidebar */}
      <div style={{ width: "250px", borderRight: "1px solid #ddd", background: "#f0f0f0", display: "flex", flexDirection: "column", overflowY: "auto" }}>
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
              // Mouse hovering
              onMouseEnter={() => setHoveredConvId(conv.id)}
              onMouseLeave={() => setHoveredConvId(null)}
              onClick={() => setActiveConversationId(conv.id)}
              style={{
                padding: "12px",
                cursor: "pointer",
                background: activeConversationId === conv.id ? "#ddd" : "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #eee"
              }}
            >
              {/* LEFT SIDE (column) */}
              <div
                style={{
                  margin: "0 auto",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}
              >
                <strong>{conv.name}</strong>

                <span style={{ fontSize: "12px", color: "#555" }}>
                  {(() => {
                    const others = conv.participants
                      .filter(p => p.username !== currentUserEmail) || [];
                    const maxDisplay = 3;
                    const displayed = others.slice(0, maxDisplay);
                    const remaining = others.length - displayed.length;

                    return (
                      <>
                        {displayed.map((p, idx) => (
                          <span key={p.id}>
                            {p.username}{idx < displayed.length - 1 ? ", " : ""}
                          </span>
                        ))}
                        {remaining > 0 ? `, ...` : ""}
                      </>
                    );
                  })()}
                </span>
              </div>

              {/* RIGHT SIDE (delete button) */}
              {hoveredConvId === conv.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents clicking the chat when deleting it
                    handleDeleteConversation(conv.id);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ff4d4d",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            padding: "15px",
            borderBottom: "1px solid #ddd",
            background: "#eee",
            display: "flex",
            alignItems: "center",
            position: "relative"
          }}
        >
          {/* CENTERED CONTENT */}
          <div
            style={{
              margin: "0 auto",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <strong>
              {conversations.find(c => c.id === activeConversationId)?.name || "Select a chat"}
            </strong>
            {/* List participants */}
            <div style={{ fontSize: "14px", color: "#555" }}>
              {conversations.find(c => c.id === activeConversationId)?.participants
                ?.filter(p => p.username !== currentUserEmail)
                .map((p, idx, arr) => (
                  <span key={p.id}>
                    {p.username}{idx < arr.length - 1 ? ", " : ""}
                  </span>
                ))
              }
            </div>
          </div>

          {/* 3-Dot Menu Container */}
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              right: "10px"
            }}
          >
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                padding: "5px"
              }}
            >
              ⋮
            </button>

            {isMenuOpen && (
              <div style={{
                position: "absolute",
                top: "40px",
                right: "0",
                background: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                borderRadius: "8px",
                zIndex: 2000,
                width: "180px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}
              >
                <button style={menuItemStyle} onClick={() => window.location.href = "/UserProfile"}>User Profile</button>
                <button style={menuItemStyle} onClick={() => window.location.href = "/UserManagement"}>User Management</button>
                <button style={menuItemStyle} onClick={() => window.location.href = "/Logs"}>Logs</button>

                <hr style={{ margin: 0, border: "none", borderTop: "1px solid #eee" }} />

                <button
                  style={{ ...menuItemStyle, color: "red" }}
                  onClick={handleLogout}>Log Out</button>
              </div>
            )}
          </div>
        </div>


        <div style={{ flex: 1, padding: "15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          {messages.length === 0 ? (
            <p>No messages yet!</p>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                // Logic for hovering
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignSelf: msg.is_me ? "flex-end" : "flex-start",
                  maxWidth: "70%",
                }}
              >
                {/* Name ABOVE the bubble */}
                {!msg.is_me && (
                  <div style={{ fontWeight: "bold", fontSize: "12px", marginBottom: "3px" }}>
                    {msg.sender}
                  </div>
                )}

                {/* Message bubble */}
                <div
                  style={{
                    background: msg.is_me ? "#075E54" : "#d0d0d0ff",
                    color: msg.is_me ? "#fff" : "#000",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    position: "relative"
                  }}
                >

                  {/* Function to decrypt and display text to avoid storing plaintext */}
                  <MessageBubbleText msg={msg} decryptMessage={decryptMessage} />
        
                  <div style={{fontSize: "10px", opacity:0.7}}>
                      {new Date(msg.timestamp || "").toLocaleTimeString()}
                  </div>

                  {/* Delete Button */}
                  {hoveredMessageId === msg.id && msg.is_me && (
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        background: "none",
                        border: "none",
                        color: "#ff4d4d",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "bold"
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
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
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", // Dims the background behind the popup 
          display: "flex", justifyContent: "center",
          alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            background: "white", padding: "20px", borderRadius: "8px",
            width: "300px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}>
            <h3>New Chat</h3>
            <div style={{ position: "relative", width: "90%" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "10px" }}>
                {selectedUsers.map((username) => (
                  <div
                    key={username}
                    onClick={() => toggleUser(username)}
                    style={{
                      padding: "5px 10px",
                      background: "#075E54",
                      color: "white",
                      borderRadius: "15px",
                      cursor: "pointer",
                    }}
                  >
                    {username} ✕
                  </div>
                ))}
              </div>
              <input
                placeholder="Conversationname"
                value={newConversationName}
                onChange={(e) => setConversationName(e.target.value)}
                style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
              />
              {newConversationName && (<input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
              />
              )}

              {/* Dropdown */}
              {searchQuery && users.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "white",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    maxHeight: "150px",
                    overflowY: "auto",
                    zIndex: 1001,
                  }}
                >
                  {users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => {
                        toggleUser(user.username);
                        setSearchQuery(""); // clear after select
                      }}
                      style={{
                        padding: "8px",
                        cursor: "pointer",
                        background: selectedUsers.includes(user.username)
                          ? "#ddd"
                          : "white",
                      }}
                    >
                      {user.username}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: "8px", color: "#000000", background: "#ddd" }}>Cancel</button>
              <button onClick={handleCreateChat} style={{ padding: "8px", background: "#075E54", color: "white", borderRadius: "4px" }}>Create</button>
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

const menuItemStyle: React.CSSProperties = {
  padding: "12px 16px",
  background: "none",
  border: "none",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "14px",
  width: "100%",
  transition: "background 0.2s",
  color: "#333"
};