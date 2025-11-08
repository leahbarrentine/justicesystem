import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Cases API
export const casesApi = {
  getAll: (params?: any) => api.get('/cases', { params }),
  getById: (id: number) => api.get(`/cases/${id}`),
  claim: (id: number, data: { organizationId: number; userId: number }) =>
    api.post(`/cases/${id}/claim`, data),
  updateStatus: (id: number, status: string) =>
    api.patch(`/cases/${id}/status`, { status }),
  getIndicators: (id: number) => api.get(`/cases/${id}/indicators`),
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

// Organizations API
export const organizationsApi = {
  getAll: () => api.get('/organizations'),
  getById: (id: number) => api.get(`/organizations/${id}`),
  getCases: (id: number) => api.get(`/organizations/${id}/cases`),
  getUsers: (id: number) => api.get(`/organizations/${id}/users`),
  create: (data: any) => api.post('/organizations', data),
}

// Indicators API
export const indicatorsApi = {
  getAll: (params?: any) => api.get('/indicators', { params }),
  getById: (id: number) => api.get(`/indicators/${id}`),
  getCategories: () => api.get('/indicators/categories'),
}

export default api