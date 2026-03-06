import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreatePost from '../components/Posts/CreatePost';
import PostCard from '../components/Posts/PostCard';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/posts/feed');
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleLike = async (postId) => {
    try {
      await axios.put(`http://localhost:5000/api/posts/like/${postId}`);
      setPosts(posts.map(post => {
        if (post._id === postId) {
          const liked = post.likes.includes(localStorage.getItem('userId'));
          return {
            ...post,
            likes: liked 
              ? post.likes.filter(id => id !== localStorage.getItem('userId'))
              : [...post.likes, localStorage.getItem('userId')]
          };
        }
        return post;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (postId, text) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/comment/${postId}`, { text });
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return { ...post, comments: res.data };
        }
        return post;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  return (
    <div className="feed-page">
      <CreatePost onPostCreated={handleNewPost} />
      <div className="posts-feed">
        {posts.length === 0 ? (
          <p className="no-posts">No posts to show. Follow some users to see their posts!</p>
        ) : (
          posts.map(post => (
            <PostCard 
              key={post._id} 
              post={post} 
              onLike={handleLike}
              onComment={handleComment}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FeedPage;