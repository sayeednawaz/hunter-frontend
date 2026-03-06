import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import Message from '../components/Chat/Message';

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('receive-message', (message) => {
        if (selectedUser && (message.sender === selectedUser._id || message.sender?._id === selectedUser._id)) {
          setMessages(prev => [...prev, message]);
        }
        fetchConversations();
      });
    }

    return () => {
      if (socket) {
        socket.off('receive-message');
      }
    };
  }, [socket, selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/messages/conversations/list');
      setConversations(res.data.conversations || res.data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/messages/${userId}`);
      setMessages(res.data.messages || res.data);
      await markAsRead(userId);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const markAsRead = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/api/messages/read/${userId}`);
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const res = await axios.post('http://localhost:5000/api/messages', {
        receiverId: selectedUser._id,
        text: newMessage
      });

      const newMsg = res.data.data || res.data;
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      socket?.emit('send-message', {
        receiverId: selectedUser._id,
        ...newMsg
      });

      fetchConversations();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading conversations...</div>;
  }

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <h3>Conversations</h3>
        <div className="conversations-list">
          {conversations.map((conv) => (
            <div
              key={conv._id?._id || conv._id}
              className={`conversation-item ${selectedUser?._id === (conv._id?._id || conv._id) ? 'active' : ''}`}
              onClick={() => setSelectedUser(conv._id)}
            >
              <img 
                src={conv._id?.profilePic || 'https://via.placeholder.com/40'} 
                alt={conv._id?.name}
              />
              <div className="conversation-info">
                <h4>{conv._id?.name}</h4>
                <p>{conv.lastMessage?.text || 'Media message'}</p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="unread-badge">{conv.unreadCount}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <img 
                src={selectedUser.profilePic || 'https://via.placeholder.com/40'} 
                alt={selectedUser.name}
              />
              <div>
                <h3>{selectedUser.name}</h3>
                <p>{selectedUser.email}</p>
              </div>
            </div>

            <div className="messages-container">
              {messages.map((msg) => (
                <Message 
                  key={msg._id} 
                  message={msg} 
                  isOwn={msg.sender === user.id || msg.sender?._id === user.id}
                />
              ))}
            </div>

            <form className="chat-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit" disabled={!newMessage.trim()}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;