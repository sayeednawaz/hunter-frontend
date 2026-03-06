import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PostCard = ({ post, onLike, onComment, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLike = () => {
    onLike(post._id);
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post._id, commentText);
      setCommentText('');
    }
  };

  const handleUserClick = () => {
    navigate(`/profile/${post.user._id}`);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete(post._id);
    }
  };

  const handleMediaClick = (mediaUrl) => {
    window.open(`http://localhost:5000${mediaUrl}`, '_blank');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-user" onClick={handleUserClick}>
          <img 
            src={post.user.profilePic || 'https://via.placeholder.com/50'} 
            alt={post.user.name}
            className="post-avatar"
          />
          <div className="post-user-info">
            <h4>{post.user.name}</h4>
            <span className="post-time">{formatDate(post.createdAt)}</span>
          </div>
        </div>
        
        {post.user._id === user.id && (
          <div className="post-menu">
            <button className="post-menu-btn">⋮</button>
            <div className="post-menu-dropdown">
              <button onClick={handleDelete}>Delete Post</button>
            </div>
          </div>
        )}
      </div>

      <div className="post-content">
        {post.content && <p className="post-text">{post.content}</p>}
        
        {post.media && post.media.length > 0 && (
          <div className={`post-media-grid ${post.media.length > 1 ? 'multiple' : 'single'}`}>
            {post.media.map((media, index) => (
              <div 
                key={index} 
                className="post-media-item"
                onClick={() => handleMediaClick(media.url)}
              >
                {media.type === 'image' ? (
                  <img 
                    src={`http://localhost:5000${media.url}`} 
                    alt={`post-media-${index}`}
                    loading="lazy"
                  />
                ) : (
                  <video src={`http://localhost:5000${media.url}`} controls />
                )}
              </div>
            ))}
          </div>
        )}

        {post.audio && (
          <div className="post-audio">
            <audio src={`http://localhost:5000${post.audio.url}`} controls />
          </div>
        )}
      </div>

      <div className="post-stats">
        <span className="post-likes">
          ❤️ {post.likes?.length || 0} likes
        </span>
        <span className="post-comments-count">
          💬 {post.comments?.length || 0} comments
        </span>
      </div>

      <div className="post-actions">
        <button 
          className={`action-btn ${post.isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          ❤️ Like
        </button>
        <button 
          className="action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          💬 Comment
        </button>
      </div>

      {showComments && (
        <div className="post-comments-section">
          <div className="comments-list">
            {post.comments?.map(comment => (
              <div key={comment._id} className="comment">
                <img 
                  src={comment.user.profilePic || 'https://via.placeholder.com/35'} 
                  alt={comment.user.name}
                  className="comment-avatar"
                  onClick={() => navigate(`/profile/${comment.user._id}`)}
                />
                <div className="comment-content">
                  <strong onClick={() => navigate(`/profile/${comment.user._id}`)}>
                    {comment.user.name}
                  </strong>
                  <p>{comment.text}</p>
                  <span className="comment-time">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <form className="comment-form" onSubmit={handleComment}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" disabled={!commentText.trim()}>
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;