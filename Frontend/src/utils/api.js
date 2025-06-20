import axios from 'axios'
import.meta.env.VITE_API_URL

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with a status other than 2xx
      return Promise.reject(error.response.data.message || error.response.data || error.message);
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject('No response from server. Please check your network connection.');
    } else {
      // Something else happened
      return Promise.reject(error.message);
    }
  }
)

// Task endpoints
export const getTasks = async () => {
  try {
    const response = await api.get('/tasks')
    return response.data
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch tasks')
  }
}

export const createTask = async (formData) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found. Please log in.')
    }

    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create task')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating task:', error)
    throw new Error(error.message || 'Failed to create task')
  }
}

export const updateTask = async (id, formData) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found. Please log in.')
    }

    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update task')
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating task:', error)
    throw new Error(error.message || 'Failed to update task')
  }
}

export const deleteTask = async (id) => {
  try {
    await api.delete(`/tasks/${id}`)
  } catch (error) {
    console.error('Error deleting task:', error)
    throw new Error(error.response?.data?.message || 'Failed to delete task')
  }
}

// Auth endpoints
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', response.data.token)
    return response.data
  } catch (error) {
    console.error('Error logging in:', error)
    throw new Error(error.response?.data?.message || 'Failed to login')
  }
}

export const register = async (formData) => {
  try {
    const response = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error registering:', error)
    throw new Error(error.response?.data?.message || 'Failed to register')
  }
}

export const logout = async () => {
  try {
    await api.post('/auth/logout')
    localStorage.removeItem('token')
  } catch (error) {
    console.error('Error logging out:', error)
    throw new Error(error.response?.data?.message || 'Failed to logout')
  }
}

export const getCurrentUser = async () => {
  try {
    const res = await api.get('/auth/me')
    return res.data
  } catch (error) {
    console.error('Get current user error:', error)
    throw error
  }
}

export const getFullImageUrl = (url) => {
  if (!url) return '/default-avatar.png'; // fallback image in public folder
  const base = API_URL.replace('/api','');
  const fullUrl = url.startsWith('http') ? url : `${base}${url}`;
  console.log('getFullImageUrl:', { url, fullUrl });
  return fullUrl;
}; 