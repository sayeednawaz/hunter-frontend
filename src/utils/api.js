import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle specific error status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Server error');
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - please check your connection');
    } else {
      // Something else
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ========== AUTH API ==========
export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  getMe: () => API.get('/auth/me'),
  updateProfile: (userData) => API.put('/auth/update', userData),
  uploadProfilePic: (formData) => 
    API.put('/auth/profile-pic', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  changePassword: (passwordData) => API.put('/auth/change-password', passwordData),
};

// ========== USER API ==========
export const userAPI = {
  getUserById: (userId) => API.get(`/users/${userId}`),
  searchUsers: (params) => API.get('/users/search', { params }),
  getMapUsers: () => API.get('/users/map/all'),
  getUserSuggestions: () => API.get('/users/suggestions'),
  getUsersByDistrict: (district, page = 1, limit = 20) => 
    API.get(`/users/district/${district}?page=${page}&limit=${limit}`),
  followUser: (userId) => API.post(`/follow/${userId}`),
  unfollowUser: (userId) => API.delete(`/follow/${userId}`),
  getFollowers: (userId, page = 1, limit = 20) => 
    API.get(`/follow/followers/${userId}?page=${page}&limit=${limit}`),
  getFollowing: (userId, page = 1, limit = 20) => 
    API.get(`/follow/following/${userId}?page=${page}&limit=${limit}`),
  checkFollowing: (userId) => API.get(`/follow/check/${userId}`),
  getMutualFollowers: (userId) => API.get(`/follow/mutual/${userId}`),
  getFollowSuggestions: () => API.get('/follow/suggestions'),
  getFollowStats: (userId) => API.get(`/follow/stats/${userId}`),
};

// ========== POST API ==========
export const postAPI = {
  createPost: (formData) => 
    API.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getFeedPosts: (page = 1, limit = 10) => 
    API.get(`/posts/feed?page=${page}&limit=${limit}`),
  getUserPosts: (userId, page = 1, limit = 10) => 
    API.get(`/posts/user/${userId}?page=${page}&limit=${limit}`),
  getPostById: (postId) => API.get(`/posts/${postId}`),
  likePost: (postId) => API.put(`/posts/like/${postId}`),
  addComment: (postId, text) => API.post(`/posts/comment/${postId}`, { text }),
  deleteComment: (postId, commentId) => 
    API.delete(`/posts/comment/${postId}/${commentId}`),
  deletePost: (postId) => API.delete(`/posts/${postId}`),
};

// ========== MESSAGE API ==========
export const messageAPI = {
  sendMessage: (messageData) => API.post('/messages', messageData),
  sendMediaMessage: (formData) => 
    API.post('/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getConversation: (userId, page = 1, limit = 50) => 
    API.get(`/messages/${userId}?page=${page}&limit=${limit}`),
  getConversations: () => API.get('/messages/conversations/list'),
  markAsRead: (userId) => API.put(`/messages/read/${userId}`),
  deleteMessage: (messageId) => API.delete(`/messages/${messageId}`),
  getUnreadCount: () => API.get('/messages/unread/count'),
};

// Helper function to handle API errors
export const handleAPIError = (error) => {
  if (error.response) {
    return error.response.data.message || 'An error occurred';
  } else if (error.request) {
    return 'Network error - please check your connection';
  } else {
    return 'An unexpected error occurred';
  }
};

// Helper function to create FormData for file uploads
export const createFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      if (Array.isArray(data[key])) {
        data[key].forEach(item => formData.append(key, item));
      } else {
        formData.append(key, data[key]);
      }
    }
  });
  return formData;
};

export default API;