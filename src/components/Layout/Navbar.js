import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/feed" className="navbar-brand">
          <span className="brand-icon">📱</span>
          <span className="brand-name">Hunter</span>
        </Link>

        <div className="navbar-search">
          <input 
            type="text" 
            placeholder="Search users..." 
            onFocus={() => navigate('/search')}
          />
          <button className="search-btn">🔍</button>
        </div>

        <div className="navbar-menu">
          <Link to="/feed" className="nav-item">
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Home</span>
          </Link>

          <Link to="/chat" className="nav-item">
            <span className="nav-icon">💬</span>
            <span className="nav-label">Messages</span>
          </Link>

          <Link to="/map" className="nav-item">
            <span className="nav-icon">🗺️</span>
            <span className="nav-label">Map</span>
          </Link>

          <div className="nav-item profile-dropdown">
            <img 
              src={user.profilePic || 'https://via.placeholder.com/35'} 
              alt={user.name}
              className="nav-avatar"
            />
            <div className="dropdown-content">
              <Link to={`/profile/${user.id}`}>My Profile</Link>
              <Link to="/settings">Settings</Link>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;