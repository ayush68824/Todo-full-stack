import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { getFullImageUrl, API_URL } from '../utils/api.js'

const AuthContext = createContext(undefined)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password })
      setToken(res.data.token)
      setUser({ ...res.data.user, photo: getFullImageUrl(res.data.user.photo) })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
    } catch (e) {
      setError(e.response?.data?.message || 'Login failed')
      throw e
    } finally {
      setLoading(false)
    }
  }

  const register = async (data) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post(`${API_URL}/auth/register`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setToken(res.data.token)
      setUser({ ...res.data.user, photo: getFullImageUrl(res.data.user.photo) })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed')
      throw e
    } finally {
      setLoading(false)
    }
  }

  const googleSignIn = async (googleToken) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post(`${API_URL}/auth/google`, { token: googleToken })
      setToken(res.data.token)
      setUser({ ...res.data.user, photo: getFullImageUrl(res.data.user.photo) })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
    } catch (e) {
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

  const updateUser = (updatedUser) => {
    setUser({ ...updatedUser, photo: getFullImageUrl(updatedUser.photo) })
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