import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/map/all');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleMessageClick = (userId, e) => {
    e.stopPropagation();
    navigate(`/chat`, { state: { userId } });
  };

  if (loading) {
    return <div className="loading">Loading map...</div>;
  }

  return (
    <div className="map-page">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: 'calc(100vh - 60px)', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {users.map(user => (
          <Marker
            key={user._id}
            position={[user.permanentLocation.lat, user.permanentLocation.lng]}
            eventHandlers={{
              click: () => handleUserClick(user._id)
            }}
          >
            <Popup>
              <div className="map-popup">
                <img 
                  src={user.profilePic || 'https://via.placeholder.com/50'} 
                  alt={user.name}
                  className="popup-avatar"
                />
                <h4>{user.name}</h4>
                <p>{user.permanentLocation.address}</p>
                <p>{user.permanentLocation.district}</p>
                <button 
                  className="btn-message"
                  onClick={(e) => handleMessageClick(user._id, e)}
                >
                  Send Message
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPage;