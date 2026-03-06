import React from 'react';

const Message = ({ message, isOwn }) => {
  const renderMedia = () => {
    if (!message.media) return null;

    switch (message.media.type) {
      case 'image':
        return (
          <img 
            src={`http://localhost:5000${message.media.url}`} 
            alt="media" 
            className="message-media"
            onClick={() => window.open(`http://localhost:5000${message.media.url}`, '_blank')}
          />
        );
      case 'video':
        return (
          <video controls className="message-media">
            <source src={`http://localhost:5000${message.media.url}`} />
          </video>
        );
      case 'audio':
        return (
          <audio controls className="message-audio">
            <source src={`http://localhost:5000${message.media.url}`} />
          </audio>
        );
      default:
        return null;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message-wrapper ${isOwn ? 'own' : ''}`}>
      {!isOwn && (
        <img 
          src={message.sender?.profilePic || 'https://via.placeholder.com/35'} 
          alt={message.sender?.name}
          className="message-avatar"
        />
      )}
      
      <div className="message-bubble">
        {message.text && <p className="message-text">{message.text}</p>}
        {renderMedia()}
        
        <div className="message-footer">
          <span className="message-time">{formatTime(message.createdAt)}</span>
          {isOwn && (
            <span className="message-status">
              {message.read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;