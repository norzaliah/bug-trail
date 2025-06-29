import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 10000, // 10 second timeout
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle different HTTP status codes
      switch (error.response.status) {
        case 401:
          // Handle unauthorized access (e.g., redirect to login)
          break;
        case 403:
          // Handle forbidden access
          break;
        case 404:
          // Handle not found errors
          break;
        case 500:
          // Handle server errors
          break;
        default:
          // Handle other errors
      }
    } else if (error.request) {
      // The request was made but no response was received
      error.message = 'No response from server. Please check your connection.';
    } else {
      // Something happened in setting up the request
      error.message = 'Request setup error.';
    }
    return Promise.reject(error);
  }
);

// Bug-related API methods
const bugService = {
  getAllBugs: () => api.get('/bugs'),
  getBugById: (id) => api.get(`/bugs/${id}`),
  createBug: (bugData) => api.post('/bugs', bugData),
  updateBug: (id, bugData) => api.patch(`/bugs/${id}`, bugData),
  deleteBug: (id) => api.delete(`/bugs/${id}`),
  updateBugStatus: (id, status) => api.patch(`/bugs/${id}/status`, { status }),
};

// User-related API methods
const userService = {
  getCurrentUser: () => api.get('/users/me'),
  getUsers: () => api.get('/users'),
};

// Export all services
export { bugService, userService };
export default api;