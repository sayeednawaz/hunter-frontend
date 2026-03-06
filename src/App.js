import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ChatPage from './pages/ChatPage';
import FeedPage from './pages/FeedPage';
import MapPage from './pages/MapPage';
import SearchPage from './pages/SearchPage';
import UserProfile from './pages/UserProfile';
import Navbar from './components/Layout/Navbar';
import BottomNav from './components/Layout/BottomNav';
import './styles/main.css';

// Separate component that uses AuthProvider inside Router
const AppContent = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />}>
              <Route index element={<Navigate to="/feed" />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="feed" element={<FeedPage />} />
              <Route path="map" element={<MapPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="profile/:id" element={<UserProfile />} />
            </Route>
          </Routes>
          <BottomNav />
        </div>
      </SocketProvider>
    </AuthProvider>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;