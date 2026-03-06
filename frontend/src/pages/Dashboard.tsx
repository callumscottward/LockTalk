import { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  chatId: string;
  sender: string;
  text: string;
  isMe: boolean;
}

export default function Messages() {
  const [activeChatId, setActiveChatId] = useState('1'); 
  const [messageInput, setMessageInput] = useState('');

  // Replacing the mock messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState("");
  
  // websocket reference
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
      // Local variable
      const socket = new WebSocket(`ws://localhost:8000/ws/chat/${activeChatId}/`);
      socketRef.current = socket;
      socket.onopen = () => console.log(`Connected to Room: ${activeChatId}`);


      socket.onmessage = (e) => {
          const data = JSON.parse(e.data);
          console.log("Raw Data from Server:", data);
          if (data.type === 'user_info') {
            setCurrentUser(data.username);
            console.log("username:", data.username);
            return
          }
          if (data.type === 'chat_message') {
            const newMessage: Message = {
                id: Date.now(),
                chatId: activeChatId,
                sender: data.sender,
                text: data.message,
                isMe: false
            };
            setMessages((prev) => [...prev, newMessage]);
          }
      };

      socket.onerror = (err) => console.error("WebSocket Error:", err);

      // Cleanup function
      return () => {
          // 0 is connecting, 1 is open
          if (socket.readyState === 1 || socket.readyState === 0) {
              console.log("Closing socket:", activeChatId);
              socket.close();
          }
      };
  }, [activeChatId]);

  const handleSendMessage = () => {
    if (messageInput.trim() && socketRef.current) {
      // Send the message to Django
      socketRef.current.send(JSON.stringify({
        'message': messageInput
      }));

      // Add the message to the UI (you can see your own chat)
      const myMsg: Message = {
        id: Date.now(),
        chatId: activeChatId,
        sender: 'Me',
        text: messageInput,
        isMe: true
      };
      setMessages((prev) => [...prev, myMsg]);
      setMessageInput('');
    }
  };

  // Filter messages based on the currently open chat
  const chatMessages = messages.filter(m => m.chatId === activeChatId);
  
  return (
    /* MAIN CONTAINER */
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden', 
      fontFamily: 'sans-serif', 
      color: 'black' ,
      // Needed to fix a boarder issue
      boxSizing: 'border-box', 
      margin: 0,
      padding: 0,
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      
      {/* SIDEBAR: Width is 30%, but we set a min/max to keep it readable on desktop */}
      <div style={{ 
        width: '30%', 
        minWidth: '10vw', 
        maxWidth: '20vw', 
        borderRight: '1px solid #ddd', 
        background: '#f0f0f0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '20px', background: '#075E54', color: 'black', flexShrink: 0 }}>
          <strong>Chats</strong>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {['1', '2', '3', '4'].map((id) => (
            <div 
              key={id}
              onClick={() => setActiveChatId(id)}
              style={{
                padding: '12px 15px',
                cursor: 'pointer',
                borderBottom: '1px solid #e9edef',
                background: activeChatId === id ? '#ebebeb' : 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              Chat Room {id}
            </div>
          ))}
        </div>
      </div>

      {/* chat window is flex bc 1 makes it take up all remaining space, attempt to deal with extra space issue */}
      {/* CHAT WINDOW */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#e5ddd5' }}>
        {/* Message Area */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {chatMessages.map(msg => (
            <div key={msg.id} style={{
              alignSelf: msg.isMe ? 'flex-end' : 'flex-start',
              background: msg.isMe ? '#dcf8c6' : 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              maxWidth: '70%',
              color: 'black'
            }}>
              {!msg.isMe && <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#075E54' }}>{msg.sender}</div>}
              <div>{msg.text}</div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '15px', background: '#f0f0f0', display: 'flex', gap: '10px', flexShrink: 0 }}>
          <input 
            style={{ flex: 1, padding: '12px', borderRadius: '20px', border: '1px solid #075E54', outline: 'none' }}
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            // Link the Enter key to the function
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <button 
            // Link the button click to the function
            onClick={handleSendMessage}
            style={{ background: '#075E54', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer' }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}