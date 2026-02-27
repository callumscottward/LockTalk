import { useState } from 'react';

// Fake chats, only includes the most recent message and chat info
const MOCK_CHATS = [
  { id: '1', name: 'Dan, Alice, Greg, Mike, Tom, Henry, Sam, Amy, Barb', type: 'group', lastMsg: 'Hey guys!', time: '10:45 AM' },
  { id: '2', name: 'Alice', type: 'direct', lastMsg: 'I will later this week.', time: 'Yesterday' },
  { id: '3', name: 'Standup', type: 'group', lastMsg: 'Another group message', time: 'Wednesday' },
  { id: '4', name: 'Bob', type: 'direct', lastMsg: 'Another individual message', time: 'Wednesday' },
];

// Some fake messages, which are the other messages in the fake chats
const MOCK_MESSAGES = [
  // Chat 1 (Dan, Alice...)
  { id: 101, chatId: '1', sender: 'Alice', text: 'Good morning everyone.', isMe: false },
  { id: 102, chatId: '1', sender: 'Dan', text: 'Good morning', isMe: false },
  
  // Chat 2 (Alice Individual)
  { id: 103, chatId: '2', sender: 'Alice', text: 'Did you run the update?', isMe: false },
  { id: 104, chatId: '2', sender: 'Me', text: 'Working on it now.', isMe: true },

  // Chat 3 (Standup)
  { id: 105, chatId: '3', sender: 'Greg', text: 'Ready for the meeting?', isMe: false },
  { id: 106, chatId: '3', sender: 'Me', text: 'Give me 5 minutes.', isMe: true },

  // Chat 4 (Bob)
  { id: 107, chatId: '4', sender: 'Bob', text: 'Hey, do you have that log file?', isMe: false },
];

export default function Messages() {
  const [activeChatId, setActiveChatId] = useState('1'); 
  const [messageInput, setMessageInput] = useState('');

  const activeChat = MOCK_CHATS.find(c => c.id === activeChatId) || MOCK_CHATS[0];
  const chatMessages = MOCK_MESSAGES.filter(m => m.chatId === activeChatId);

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
          {MOCK_CHATS.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              style={{
                padding: '12px 15px',
                cursor: 'pointer',
                borderBottom: '1px solid #e9edef',
                background: activeChatId === chat.id ? '#ebebeb' : 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>
                {chat.type === 'group' ? '👥' : '👤'}
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <strong style={{ 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  fontSize: '0.95rem' 
                }}>
                  {chat.name}
                </strong>
                <small style={{ color: 'black', fontSize: '0.75rem', marginTop: '2px' }}>
                  {chat.time}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* chat window is flex bc 1 makes it take up all remaining space, attempt to deal with extra space issue */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f0f0f0' }}>
        
        {/* Header */}
        <div style={{ padding: '15px', background: '#ededed', borderBottom: '1px solid #ddd', flexShrink: 0 }}>
          <strong>{activeChat.name}</strong> 
          <span style={{ fontSize: '0.8rem', color: 'black', marginLeft: '10px' }}>
            ({activeChat.type})
          </span>
        </div>

        {/* Message Area */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {chatMessages.length > 0 ? (
            chatMessages.map(msg => (
              <div key={msg.id} style={{
                alignSelf: msg.isMe ? 'flex-end' : 'flex-start',
                background: msg.isMe ? '#075E54' : 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                maxWidth: '70%',
                boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                color: 'black'
              }}>
                {!msg.isMe && <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#075E54' }}>{msg.sender}</div>}
                <div style={{ wordBreak: 'break-word' }}>{msg.text}</div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: 'black', marginTop: '20px' }}>
              No messages yet!
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '15px', background: '#f0f0f0', display: 'flex', gap: '10px', flexShrink: 0 }}>
          <input 
            style={{ flex: 1, padding: '12px', borderRadius: '20px', border: '1px solid #075E54', outline: 'none' }}
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter'}
          />
          <button style={{ background: '#075E54', color: 'black', border: 'none', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer' }}>
          {/* Character found just searching google*/}
          ➤
          </button>
        </div>
      </div>
    </div>
  );
}