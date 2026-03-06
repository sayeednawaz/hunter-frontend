import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import MapIcon from './MapIcon';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom component to handle map view changes
const MapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const UserMap = ({ users, onUserClick, center, zoom = 5 }) => {
  const [mapUsers, setMapUsers] = useState(users || []);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (users) {
      setMapUsers(users);
    }
  }, [users]);

  const defaultCenter = center || [20.5937, 78.9629]; // India center

  const createCustomIcon = (user) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div class="marker-pulse">
              <img src="${user.profilePic || 'https://via.placeholder.com/40'}" 
                   alt="${user.name}" 
                   class="marker-image"/>
             </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
  };

  return (
    <div className="user-map-container">
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="user-map"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        <MapView center={defaultCenter} zoom={zoom} />

        {mapUsers.map((user) => (
          <Marker
            key={user._id}
            position={[user.location?.lat || user.permanentLocation?.lat, 
                      user.location?.lng || user.permanentLocation?.lng]}
            icon={createCustomIcon(user)}
            eventHandlers={{
              click: () => onUserClick && onUserClick(user._id)
            }}
          >
            <Popup className="user-popup">
              <div className="popup-content">
                <img 
                  src={user.profilePic || 'https://via.placeholder.com/60'} 
                  alt={user.name}
                  className="popup-avatar"
                />
                <h4>{user.name}</h4>
                <p className="popup-address">
                  📍 {user.location?.address || user.permanentLocation?.address}
                </p>
                <p className="popup-district">
                  🏘️ {user.location?.district || user.permanentLocation?.district}
                </p>
                <button 
                  className="popup-view-btn"
                  onClick={() => onUserClick && onUserClick(user._id)}
                >
                  View Profile
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default UserMap;