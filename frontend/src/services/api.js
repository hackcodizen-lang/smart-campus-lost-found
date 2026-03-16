const API_BASE_URL = '/api';

/**
 * Get auth token from localStorage
 */
const getToken = () => localStorage.getItem('token');

/**
 * Create headers for API requests
 */
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Handle API response
 */
const handleResponse = async (response) => {
  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }
  
  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return { data, status: response.status };
};

/**
 * API methods
 */
export const api = {
  // GET request
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // POST request
  async post(endpoint, body) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },

  // PUT request
  async put(endpoint, body) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },

  // DELETE request
  async delete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // POST with multipart form data (for file uploads)
  async postFormData(endpoint, formData) {
    const headers = {};
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData
    });
    return handleResponse(response);
  }
};

/**
 * Auth API
 */
export const authApi = {
  studentLogin: (studentId, department) => api.post('/auth/student-login', { studentId, department }),
  adminLogin: (email, password) => api.post('/auth/admin-login', { email, password }),
  register: (name, email, password, phone) => api.post('/auth/register', { name, email, password, phone }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (currentPassword, newPassword) => api.put('/auth/password', { currentPassword, newPassword })
};

/**
 * Items API
 */
export const itemsApi = {
  // Lost items
  getLostItems: (params) => api.get(`/items/lost?${new URLSearchParams(params)}`),
  getLostItem: (id) => api.get(`/items/lost/${id}`),
  createLostItem: (formData) => api.postFormData('/items/lost', formData),
  updateLostItem: (id, data) => api.put(`/items/lost/${id}`, data),
  deleteLostItem: (id) => api.delete(`/items/lost/${id}`),

  // Found items
  getFoundItems: (params) => api.get(`/items/found?${new URLSearchParams(params)}`),
  getFoundItem: (id) => api.get(`/items/found/${id}`),
  createFoundItem: (formData) => api.postFormData('/items/found', formData),
  updateFoundItem: (id, data) => api.put(`/items/found/${id}`, data),
  deleteFoundItem: (id) => api.delete(`/items/found/${id}`),

  // User items
  getMyItems: () => api.get('/items/my')
};

/**
 * Matches API
 */
export const matchesApi = {
  getMatches: (params) => api.get(`/matches?${new URLSearchParams(params)}`),
  getPendingMatches: () => api.get('/matches/pending'),
  getMatch: (id) => api.get(`/matches/${id}`),
  claimMatch: (id) => api.post(`/matches/${id}/claim`, {}),
  confirmMatch: (id) => api.post(`/matches/${id}/confirm`, {}),
  rejectMatch: (id, reason) => api.post(`/matches/${id}/reject`, { reason }),
  getStats: () => api.get('/matches/stats/summary')
};

/**
 * Notifications API
 */
export const notificationsApi = {
  getNotifications: (limit = 10) => api.get(`/notifications?limit=${limit}`)
};

/**
 * Admin API
 */
export const adminApi = {
  getStudents: () => api.get('/admin/students'),
  addStudent: (data) => api.post('/admin/students', data),
  toggleStudent: (id, active) => api.put(`/admin/students/${id}/toggle`, { active }),
  getLoginActivity: (limit = 50) => api.get(`/admin/logins?limit=${limit}`),
  getItems: (type = 'all') => api.get(`/admin/items?type=${type}`),
  deleteItem: (type, id) => api.delete(`/admin/items/${type}/${id}`)
};

export default api;
