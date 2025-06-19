import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { getFullImageUrl, API_URL } from '../utils/api'

interface User {
  _id: string
  name: string
  email: string
  photo?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (data: FormData) => Promise<void>
  logout: () => void
  googleSignIn: (token: string) => Promise<void>
  setError: (msg: string | null) => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = localStorage.getItem('token')
    const u = localStorage.getItem('user')
    if (u === 'undefined' || u === null) {
      localStorage.removeItem('user');
    }
    if (t && u && u !== 'undefined') {
      setToken(t)
      setUser(JSON.parse(u))
    }
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password })
      setToken(res.data.token)
      setUser({ ...res.data.user, photo: getFullImageUrl(res.data.user.photo) })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
    } catch (e: any) {
      setError(e.response?.data?.message || 'Login failed')
      throw e
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: FormData) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post(`${API_URL}/auth/register`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setToken(res.data.token)
      setUser({ ...res.data.user, photo: getFullImageUrl(res.data.user.photo) })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
    } catch (e: any) {
      setError(e.response?.data?.message || 'Registration failed')
      throw e
    } finally {
      setLoading(false)
    }
  }

  const googleSignIn = async (googleToken: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post(`${API_URL}/auth/google`, { token: googleToken })
      setToken(res.data.token)
      setUser({ ...res.data.user, photo: getFullImageUrl(res.data.user.photo) })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
    } catch (e: any) {
      setError(e.response?.data?.message || 'Google sign-in failed')
      throw e
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      error, 
      login, 
      register, 
      logout, 
      googleSignIn, 
      setError,
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  )
} 