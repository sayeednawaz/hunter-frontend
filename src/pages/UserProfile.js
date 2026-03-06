import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PostList from '../components/Posts/PostList';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/users/${id}`);
      setUser(res.data.user || res.data);
      
      // Check if following
      if (currentUser) {
        const followCheck = await axios.get(`http://localhost:5000/api/follow/check/${id}`);
        setIsFollowing(followCheck.data.isFollowing);
      }

      // Get follow stats
      const statsRes = await axios.get(`http://localhost:5000/api/follow/stats/${id}`);
      setFollowersCount(statsRes.data.stats.followers);
      setFollowingCount(statsRes.data.stats.following);
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  }, [id, currentUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await axios.delete(`http://localhost:5000/api/follow/${id}`);
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        await axios.post(`http://localhost:5000/api/follow/${id}`);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const handleMessage = () => {
    navigate('/chat', { state: { selectedUser: user } });
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!user) {
    return <div className="error">User not found</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <img 
            src={user.profilePic || 'https://via.placeholder.com/150'} 
            alt={user.name}
            className="profile-avatar"
          />
        </div>
        
        <div className="profile-info">
          <h2>{user.name}</h2>
          <div className="profile-detail">
            <span className="detail-icon">📧</span>
            <span>{user.email}</span>
          </div>
          <div className="profile-detail">
            <span className="detail-icon">📍</span>
            <span>{user.permanentLocation?.address}, {user.permanentLocation?.district}</span>
          </div>
          <div className="profile-detail">
            <span className="detail-icon">🎂</span>
            <span>{new Date(user.dob).toLocaleDateString()}</span>
          </div>
          <div className="profile-detail">
            <span className="detail-icon">⚥</span>
            <span>{user.gender}</span>
          </div>
          
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{followersCount}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{followingCount}</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{user.postsCount || 0}</span>
              <span className="stat-label">Posts</span>
            </div>
          </div>

          {currentUser && currentUser.id !== id && (
            <div className="profile-actions">
              <button 
                className={`btn-follow ${isFollowing ? 'following' : ''}`}
                onClick={handleFollow}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              <button className="btn-message" onClick={handleMessage}>
                Message
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-tabs">
        <div className="tab-header">
          <button className="tab-btn active">Posts</button>
        </div>
        <div className="tab-content">
          <PostList userId={id} />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;