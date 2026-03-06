import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import Message from './Message';

const ChatBox = ({ selectedUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const socket = useSocket();

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/messages/${selectedUser._id}`);
      setMessages(res.data.messages || res.data);
      await markAsRead();
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedUser]);

  const markAsRead = useCallback(async () => {
    try {
      await axios.put(`http://localhost:5000/api/messages/read/${selectedUser._id}`);
      socket?.emit('mark-read', {
        senderId: selectedUser._id,
        userId: user.id
      });
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, [selectedUser, socket, user.id]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser, fetchMessages]);

  useEffect(() => {
    if (socket) {
      socket.on('receive-message', (message) => {
        if (message.sender === selectedUser?._id || message.sender?._id === selectedUser?._id) {
          setMessages(prev => [...prev, message]);
          markAsRead();
        }
      });

      socket.on('user-typing', (data) => {
        if (data.userId === selectedUser?._id) {
          setIsTyping(data.isTyping);
        }
      });

      socket.on('messages-read', (data) => {
        if (data.userId === selectedUser?._id) {
          setMessages(prev => 
            prev.map(msg => ({
              ...msg,
              read: true
            }))
          );
        }
      });

      return () => {
        socket.off('receive-message');
        socket.off('user-typing');
        socket.off('messages-read');
      };
    }
  }, [socket, selectedUser, markAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      receiverId: selectedUser._id,
      text: newMessage
    };

    try {
      const res = await axios.post('http://localhost:5000/api/messages', messageData);
      const newMsg = res.data.data || res.data;
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      socket?.emit('send-message', {
        receiverId: selectedUser._id,
        ...newMsg
      });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('media', file);
    formData.append('receiverId', selectedUser._id);

    try {
      const res = await axios.post('http://localhost:5000/api/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newMsg = res.data.data || res.data;
      setMessages(prev => [...prev, newMsg]);
      
      socket?.emit('send-message', {
        receiverId: selectedUser._id,
        ...newMsg
      });
    } catch (err) {
      console.error('Error uploading file:', err);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socket?.emit('typing', {
      receiverId: selectedUser._id,
      userId: user.id,
      isTyping: e.target.value.length > 0
    });
  };

  if (loading) {
    return <div className="chatbox-loading">Loading messages...</div>;
  }

  return (
    <div className="chatbox">
      <div className="chatbox-header">
        <div className="chatbox-user">
          <img 
            src={selectedUser.profilePic || 'https://via.placeholder.com/40'} 
            alt={selectedUser.name}
          />
          <div>
            <h3>{selectedUser.name}</h3>
            {isTyping && <span className="typing-indicator">typing...</span>}
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="chatbox-messages">
        {messages.map((msg, index) => (
          <Message 
            key={msg._id || index} 
            message={msg} 
            isOwn={msg.sender === user.id || msg.sender?._id === user.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chatbox-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
        />
        <label className="file-upload-btn">
          📎
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,video/*,audio/*"
            style={{ display: 'none' }}
          />
        </label>
        <button type="submit" disabled={!newMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;