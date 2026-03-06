import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const BottomNav = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav className="bottom-nav">
      <NavLink to="/chat" className={({ isActive }) => isActive ? 'active' : ''}>
        <span className="nav-icon">💬</span>
        <span className="nav-label">Chat</span>
      </NavLink>
      
      <NavLink to="/feed" className={({ isActive }) => isActive ? 'active' : ''}>
        <span className="nav-icon">📱</span>
        <span className="nav-label">Feed</span>
      </NavLink>
      
      <NavLink to="/map" className={({ isActive }) => isActive ? 'active' : ''}>
        <span className="nav-icon">🗺️</span>
        <span className="nav-label">Map</span>
      </NavLink>
      
      <NavLink to="/search" className={({ isActive }) => isActive ? 'active' : ''}>
        <span className="nav-icon">🔍</span>
        <span className="nav-label">Search</span>
      </NavLink>

      <NavLink to={`/profile/${user.id}`} className={({ isActive }) => isActive ? 'active' : ''}>
        <span className="nav-icon">👤</span>
        <span className="nav-label">Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;