import React from 'react';
import L from 'leaflet';

const MapIcon = ({ user, size = 40 }) => {
  const iconHtml = `
    <div class="map-icon-container" style="width: ${size}px; height: ${size}px;">
      <div class="map-icon-pulse"></div>
      <img 
        src="${user.profilePic || 'https://via.placeholder.com/40'}" 
        alt="${user.name}"
        class="map-icon-image"
        style="width: ${size - 5}px; height: ${size - 5}px;"
      />
    </div>
  `;

  return L.divIcon({
    className: 'custom-map-icon',
    html: iconHtml,
    iconSize: [size, size],
    iconAnchor: [size/2, size],
    popupAnchor: [0, -size]
  });
};

// CSS for the map icon (add to your main.css)
const iconStyles = `
  .map-icon-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .map-icon-pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(102, 126, 234, 0.4);
    animation: pulse 1.5s ease-out infinite;
    z-index: 1;
  }

  .map-icon-image {
    position: relative;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    object-fit: cover;
    z-index: 2;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.8);
      opacity: 0.8;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }

  .marker-pulse {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 rgba(102, 126, 234, 0.4);
    animation: marker-pulse 2s infinite;
  }

  .marker-pulse img {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    border: 2px solid white;
    object-fit: cover;
  }

  @keyframes marker-pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
    }
  }

  .user-popup .popup-content {
    text-align: center;
    padding: 10px;
    min-width: 200px;
  }

  .popup-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-bottom: 10px;
    border: 3px solid #667eea;
  }

  .popup-content h4 {
    margin: 5px 0;
    color: #333;
  }

  .popup-address,
  .popup-district {
    margin: 5px 0;
    font-size: 0.9rem;
    color: #666;
  }

  .popup-view-btn {
    margin-top: 10px;
    padding: 8px 16px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .popup-view-btn:hover {
    background: #5a67d8;
  }
`;

// Inject styles
const style = document.createElement('style');
style.textContent = iconStyles;
document.head.appendChild(style);

export default MapIcon;