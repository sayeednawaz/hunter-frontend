import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [audio, setAudio] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleMediaChange = (e) => {
    setMedia([...e.target.files]);
  };

  const handleAudioChange = (e) => {
    setAudio(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('content', content);
    
    media.forEach(file => {
      formData.append('media', file);
    });

    if (audio) {
      formData.append('audio', JSON.stringify({
        url: URL.createObjectURL(audio),
        duration: 0 // You would calculate actual duration
      }));
    }

    try {
      const res = await axios.post('http://localhost:5000/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onPostCreated(res.data);
      setContent('');
      setMedia([]);
      setAudio(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post">
      <div className="post-user-info">
        <img 
          src={user?.profilePic || 'https://via.placeholder.com/40'} 
          alt={user?.name}
        />
        <span>{user?.name}</span>
      </div>
      
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="3"
        />

        <div className="post-options">
          <label className="option-btn">
            📷 Images
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMediaChange}
              style={{ display: 'none' }}
            />
          </label>

          <label className="option-btn">
            🎥 Video
            <input
              type="file"
              accept="video/*"
              onChange={handleMediaChange}
              style={{ display: 'none' }}
            />
          </label>

          <label className="option-btn">
            🎵 Audio
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              style={{ display: 'none' }}
            />
          </label>

          <label className="option-btn">
            📝 Text
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {media.length > 0 && (
          <div className="media-preview">
            {Array.from(media).map((file, index) => (
              <div key={index} className="media-item">
                {file.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(file)} alt="preview" />
                ) : (
                  <video src={URL.createObjectURL(file)} controls />
                )}
              </div>
            ))}
          </div>
        )}

        {audio && (
          <div className="audio-preview">
            <audio src={URL.createObjectURL(audio)} controls />
          </div>
        )}

        <button type="submit" disabled={loading || (!content && media.length === 0 && !audio)}>
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;