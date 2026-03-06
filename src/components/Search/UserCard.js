import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserCard = ({ user }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/profile/${user._id}`);
  };

  const handleMessage = (e) => {
    e.stopPropagation();
    navigate('/chat', { state: { userId: user._id } });
  };

  return (
    <div className="user-card" onClick={handleViewProfile}>
      <img 
        src={user.profilePic || 'https://via.placeholder.com/60'} 
        alt={user.name}
        className="user-avatar"
      />
      
      <div className="user-info">
        <h3>{user.name}</h3>
        <p>📍 {user.permanentLocation.address}, {user.permanentLocation.district}</p>
        <p>📧 {user.email}</p>
      </div>

      <button className="btn-message" onClick={handleMessage}>
        Message
      </button>
    </div>
  );
};

export default UserCard;