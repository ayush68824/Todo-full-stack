import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Box, Typography, Paper, Button, TextField, Avatar, IconButton, Divider, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { PhotoCamera } from '@mui/icons-material'
import axios from 'axios'
import { API_URL, getFullImageUrl } from '../utils/api'

const Settings: React.FC = () => {
  const { user, token, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name || '')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.photo || null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file')
        return
      }
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = ev => {
        if (ev.target?.result) {
          setPhotoPreview(ev.target.result as string)
        }
      }
      reader.onerror = () => {
        setError('Failed to read image file')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProfile = async () => {
    if (!token || !user) return
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      if (name !== user.name) {
        formData.append('name', name)
      }
      if (photo) {
        formData.append('photo', photo)
      }

      // Don't make the request if nothing has changed
      if (formData.entries().next().done) {
        setSuccess('No changes to update')
        setLoading(false)
        return
      }

      console.log('Sending profile update request...')
      const response = await axios.put(`${API_URL}/auth/profile`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log('Upload progress:', percentCompleted)
        }
      })

      if (!response.data.user) {
        throw new Error('Invalid response from server')
      }

      // Update the user context with the new data
      updateUser(response.data.user)
      setSuccess('Profile updated successfully')
      setPhoto(null) // Clear the photo state after successful upload
    } catch (err: any) {
      console.error('Profile update error:', err)
      const errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || 'Failed to update profile'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Typography variant="h6" gutterBottom>
          Profile Settings
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar
            src={getFullImageUrl(photoPreview)}
            sx={{ width: 100, height: 100, mr: 2 }}
          />
          <Box>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="photo-upload"
              type="file"
              onChange={handlePhotoChange}
            />
            <label htmlFor="photo-upload">
              <IconButton
                color="primary"
                component="span"
                disabled={loading}
              >
                <PhotoCamera />
              </IconButton>
            </label>
            <Typography variant="caption" display="block">
              Click to change photo
            </Typography>
          </Box>
        </Box>
        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          disabled={loading}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdateProfile}
          disabled={loading || (!photo && name === user?.name)}
          sx={{ mt: 2 }}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </Button>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>
          Account Settings
        </Typography>
        <Button 
          variant="contained" 
          color="error" 
          onClick={handleLogout}
          sx={{ mt: 2 }}
        >
          Logout
        </Button>
      </Paper>
    </Box>
  )
}

export default Settings 