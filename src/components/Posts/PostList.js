import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from './PostCard';
import { useAuth } from '../../context/AuthContext';

const PostList = ({ userId, feed = false, onPostUpdate }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, [userId, feed, page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = feed 
        ? `http://localhost:5000/api/posts/feed?page=${page}&limit=10`
        : `http://localhost:5000/api/posts/user/${userId}?page=${page}&limit=10`;
      
      const res = await axios.get(url);
      
      if (page === 1) {
        setPosts(res.data.posts);
      } else {
        setPosts(prev => [...prev, ...res.data.posts]);
      }
      
      setHasMore(res.data.pagination.page < res.data.pagination.pages);
      setError('');
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.put(`http://localhost:5000/api/posts/like/${postId}`);
      
      setPosts(posts.map(post => {
        if (post._id === postId) {
          const isLiked = post.likes.includes(user.id);
          return {
            ...post,
            likes: isLiked 
              ? post.likes.filter(id => id !== user.id)
              : [...post.likes, user.id],
            isLiked: !isLiked
          };
        }
        return post;
      }));
      
      if (onPostUpdate) onPostUpdate();
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleComment = async (postId, text) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/comment/${postId}`, { text });
      
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            comments: [...post.comments, res.data.comment]
          };
        }
        return post;
      }));
      
      if (onPostUpdate) onPostUpdate();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`);
      setPosts(posts.filter(post => post._id !== postId));
      if (onPostUpdate) onPostUpdate();
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (loading && page === 1) {
    return (
      <div className="posts-loading">
        <div className="loading-spinner"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  if (posts.length === 0 && !loading) {
    return (
      <div className="no-posts">
        <p>No posts to show</p>
        {feed && (
          <p>Follow some users to see their posts in your feed!</p>
        )}
      </div>
    );
  }

  return (
    <div className="post-list">
      {posts.map(post => (
        <PostCard
          key={post._id}
          post={post}
          onLike={handleLike}
          onComment={handleComment}
          onDelete={handleDeletePost}
        />
      ))}
      
      {hasMore && (
        <div className="load-more-container">
          <button 
            className="load-more-btn"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Posts'}
          </button>
        </div>
      )}
      
      {loading && page > 1 && (
        <div className="loading-more">
          <div className="loading-spinner small"></div>
        </div>
      )}
    </div>
  );
};

export default PostList;